import {Platform, PermissionsAndroid} from 'react-native';
import {getPrinterPrefs} from './preferences';
import {buildReceiptCommands} from './buildReceiptCommands';

// La lib `tp-react-native-bluetooth-printer` es Android-only. Importamos
// los módulos perezosamente desde dentro de cada función y, en iOS,
// rechazamos con un mensaje claro en lugar de cargar el bridge.
export const PRINTING_IS_AVAILABLE = Platform.OS === 'android';

const requireBluetoothModule = () => {
  if (!PRINTING_IS_AVAILABLE) {
    throw new Error('La impresión de recibos solo está disponible en Android por ahora.');
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('tp-react-native-bluetooth-printer');
};

// Comando ESC/POS de apertura del cajón: ESC p m t1 t2
// 0x1B 0x70 0x00 0x19 0xFA → pin 2, on=50ms, off=500ms.
// Pre-computado en base64 para evitar depender del manejo de null bytes
// al codear en runtime.
const DRAWER_BYTES_B64 = 'G3AAGfo=';

const requestBluetoothPermissions = async () => {
  if (Platform.OS !== 'android') return true;

  const apiLevel = Platform.Version;
  const perms = [];
  if (apiLevel >= 31) {
    perms.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
    perms.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
  } else {
    perms.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  }

  const result = await PermissionsAndroid.requestMultiple(perms);
  return Object.values(result).every(v => v === PermissionsAndroid.RESULTS.GRANTED);
};

export const ensureBluetoothReady = async () => {
  const {BluetoothManager} = requireBluetoothModule();
  const granted = await requestBluetoothPermissions();
  if (!granted) {
    throw new Error('Permisos de Bluetooth denegados.');
  }
  const enabled = await BluetoothManager.isBluetoothEnabled();
  if (!enabled) {
    await BluetoothManager.enableBluetooth();
  }
};

const parseDeviceList = (raw) => {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .map((item) => {
      try {
        return typeof item === 'string' ? JSON.parse(item) : item;
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);
};

export const listPairedDevices = async () => {
  const {BluetoothManager} = requireBluetoothModule();
  await ensureBluetoothReady();
  const raw = await BluetoothManager.enableBluetooth();
  return parseDeviceList(raw);
};

export const scanDevices = async (onFound) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const {DeviceEventEmitter} = require('react-native');
  const {BluetoothManager} = requireBluetoothModule();
  await ensureBluetoothReady();

  const sub = onFound
    ? DeviceEventEmitter.addListener(BluetoothManager.EVENT_DEVICE_FOUND, (rsp) => {
        try {
          const dev = rsp?.device
            ? JSON.parse(rsp.device)
            : rsp?.devices
            ? JSON.parse(rsp.devices)
            : null;
          if (dev) onFound(dev);
        } catch (e) {
          // ignore parse errors — los devices a veces vienen incompletos.
        }
      })
    : null;

  try {
    const raw = await BluetoothManager.scanDevices();
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return {
      paired: parseDeviceList(parsed?.paired),
      found: parseDeviceList(parsed?.found),
    };
  } finally {
    if (sub) sub.remove();
  }
};

// Pairing flow:
// 1) Llamamos al método nativo `pair()` (parche piida): si el device ya está
//    bonded resuelve "BONDED"; si no, llama device.createBond() que dispara
//    el diálogo nativo de Android para PIN/confirm y resuelve "BONDING".
// 2) Tras "BONDING" hacemos polling de la lista de emparejados durante un
//    máximo de ~30s. Cuando el device aparece, asumimos pairing exitoso.
// 3) Devolvemos true cuando quedó bonded, false en caso contrario (el caller
//    decide qué mensaje mostrar).
export const pairDevice = async (address) => {
  if (!address) throw new Error('Sin dirección de impresora.');
  const {BluetoothManager} = requireBluetoothModule();
  await ensureBluetoothReady();

  const result = await BluetoothManager.pair(address);
  if (result === 'BONDED') return true;
  if (result === 'FAILED') {
    throw new Error('Android rechazó iniciar el emparejamiento. Verificá Bluetooth activo y permisos.');
  }

  // BONDING — esperamos a que el sistema complete (el user acepta el PIN).
  const start = Date.now();
  const TIMEOUT_MS = 30000;
  while (Date.now() - start < TIMEOUT_MS) {
    await new Promise((r) => setTimeout(r, 1500));
    const paired = await listPairedDevices();
    if (paired.some((p) => p.address === address)) return true;
  }
  throw new Error('Emparejamiento no completado. ¿Aceptaste el PIN en el diálogo de Android?');
};

export const unpairDevice = async (address) => {
  if (!address) return;
  const {BluetoothManager} = requireBluetoothModule();
  // Primero cerrar el socket SPP en el lado del cliente — si la lib tiene
  // un socket en cache de la sesión anterior, lo libera. El próximo connect
  // arranca limpio. (No siempre alcanza: si el firmware de la impresora
  // mantiene su propio socket, el user debe apagar/prender el device.)
  try {
    if (typeof BluetoothManager.disconnect === 'function') {
      await BluetoothManager.disconnect();
    }
  } catch (e) {
    // ignorar
  }
  if (typeof BluetoothManager.unpair === 'function') {
    await BluetoothManager.unpair(address);
  }
};

// Helper exportado: cierra el socket SPP en cache de la lib. Útil tras
// errores transitorios para reset del cliente.
export const disconnectSocket = async () => {
  try {
    const {BluetoothManager} = requireBluetoothModule();
    if (typeof BluetoothManager.disconnect === 'function') {
      await BluetoothManager.disconnect();
    }
  } catch (e) {
    // ignore
  }
};

export const connectToPrinter = async (address) => {
  if (!address) throw new Error('Sin impresora seleccionada.');
  const {BluetoothManager} = requireBluetoothModule();
  await ensureBluetoothReady();

  // Si ya hay un device conectado y es el que queremos, evitamos reconectar.
  try {
    const raw = await BluetoothManager.getConnectedDevice();
    const list = parseDeviceList(raw);
    if (list.some((d) => d.address === address)) {
      return; // ya conectado, no reabrir socket
    }
  } catch (e) {
    // si getConnectedDevice falla, seguimos al connect normal.
  }

  // Las impresoras clones suelen rechazar el primer SPP connect tras un bond
  // reciente, idle largo o si la lib tiene state stale. Reintentamos hasta 5
  // veces con delays incrementales (total ~13s peor caso). Entre cada retry
  // forzamos un disconnect() para limpiar el socket en cache del lado lib.
  const delays = [0, 1000, 2000, 3500, 5000];
  let lastErr = null;
  for (let attempt = 0; attempt < delays.length; attempt++) {
    const delay = delays[attempt];
    if (delay > 0) {
      // Antes de re-intentar, cerrar el socket viejo si quedó stale.
      try {
        if (typeof BluetoothManager.disconnect === 'function') {
          await BluetoothManager.disconnect();
        }
      } catch (e) {
        // ignore
      }
      await new Promise((r) => setTimeout(r, delay));
    }
    try {
      await BluetoothManager.connect(address);
      // Pequeña espera tras connect para que el socket SPP del clone se
      // estabilice antes del primer write — algunas iSH58 rechazan el
      // primer byte si llega inmediato al socket abierto.
      await new Promise((r) => setTimeout(r, 300));
      return;
    } catch (e) {
      lastErr = e;
    }
  }
  // Si tras 5 intentos sigue fallando, agregamos hint al mensaje para que
  // el user sepa que probablemente la impresora necesita reset físico.
  const baseMsg = (lastErr && (lastErr.message || lastErr.code || String(lastErr))) || 'Unable to connect device';
  throw new Error(
    baseMsg +
      ' — Si persiste, apagá y volvé a prender la impresora, después intentá de nuevo.',
  );
};

// Reconectamos siempre. La optimización de "skip si getConnectedDevice
// matchea" se removió porque la lib no verifica el socket real — solo el
// estado interno, que puede quedar stale tras un timeout/idle y hace que
// los siguientes prints fallen con "Unable to connect device".
// El retry interno de connectToPrinter es suficiente para los casos comunes.
const ensureConnected = async () => {
  const {address} = await getPrinterPrefs();
  if (!address) {
    throw new Error('No hay impresora configurada. Vé a "Configurar impresora" en el menú.');
  }
  await connectToPrinter(address);
  return address;
};

export const openCashDrawer = async () => {
  const {BluetoothEscposPrinter} = requireBluetoothModule();
  await ensureConnected();
  // writeRawBase64 está parcheado nativamente — manda bytes raw vía el socket
  // SPP abierto, único camino para el comando ESC p (no expuesto por la lib).
  await BluetoothEscposPrinter.writeRawBase64(DRAWER_BYTES_B64);
};

// Colapsa segmentos consecutivos de texto/separator/feed SIN options en un
// solo printText con el contenido concatenado. Reduce las llamadas al bridge
// nativo de ~25 a ~3-5 por recibo. Los segmentos con options (header bold)
// quedan separados. align/columns/init siempre son segmentos propios.
const collapseSegments = (segments) => {
  const out = [];
  let buf = '';
  const flush = () => {
    if (buf) {
      out.push({kind: 'text', value: buf, options: {}});
      buf = '';
    }
  };
  for (const seg of segments) {
    if (seg.kind === 'text' && (!seg.options || Object.keys(seg.options).length === 0)) {
      buf += seg.value;
    } else if (seg.kind === 'separator') {
      buf += '-'.repeat(32) + '\n\r';
    } else if (seg.kind === 'feed') {
      buf += '\n\r'.repeat(seg.lines || 1);
    } else {
      flush();
      out.push(seg);
    }
  }
  flush();
  return out;
};

export const printReceipt = async (saleData, {openDrawer = false} = {}) => {
  const {BluetoothEscposPrinter} = requireBluetoothModule();
  await ensureConnected();

  // Cajón primero, aislado: si después el papel falla, el pulso ya salió.
  if (openDrawer) {
    try {
      await BluetoothEscposPrinter.writeRawBase64(DRAWER_BYTES_B64);
    } catch (e) {
      console.log('[printer] openDrawer falló:', e?.message || e);
    }
  }

  const segments = collapseSegments(buildReceiptCommands(saleData));
  for (const seg of segments) {
    await runSegment(BluetoothEscposPrinter, seg);
  }
};

export const printTestPage = async () => {
  const {BluetoothEscposPrinter, ALIGN} = requireBluetoothModule();
  await ensureConnected();
  await BluetoothEscposPrinter.printerInit();
  await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER);
  await BluetoothEscposPrinter.printText('PIIDA\n\r', {
    encoding: 'GBK',
    codepage: 0,
    widthtimes: 1,
    heigthtimes: 1,
    fonttype: 1,
  });
  await BluetoothEscposPrinter.printText('Pagina de prueba\n\r', {});
  await BluetoothEscposPrinter.printText(`${new Date().toLocaleString()}\n\r`, {});
  await BluetoothEscposPrinter.printText('\n\r\n\r\n\r', {});
};

const runSegment = async (BluetoothEscposPrinter, seg) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const {ALIGN} = require('tp-react-native-bluetooth-printer');
  switch (seg.kind) {
    case 'init':
      await BluetoothEscposPrinter.printerInit();
      break;
    case 'align':
      await BluetoothEscposPrinter.printerAlign(ALIGN[seg.value]);
      break;
    case 'text':
      await BluetoothEscposPrinter.printText(seg.value, seg.options || {});
      break;
    case 'columns':
      // Nota: la lib expone `printColumn` (singular), firma:
      //   (columnWidths, columnAligns, columnTexts, options)
      // Native side hace `columnTexts.getString(i)` — si algún elemento es
      // objeto/null el bridge revienta. Coercemos cada texto a string
      // defensivamente acá.
      await BluetoothEscposPrinter.printColumn(
        seg.columnWidths,
        seg.columnAligns,
        seg.columnTexts.map((t) => (typeof t === 'string' ? t : t == null ? '' : String(t))),
        seg.options && !Array.isArray(seg.options) ? seg.options : {},
      );
      break;
    case 'separator':
      await BluetoothEscposPrinter.printText(`${'-'.repeat(32)}\n\r`, {});
      break;
    case 'feed':
      await BluetoothEscposPrinter.printText('\n\r'.repeat(seg.lines || 1), {});
      break;
    default:
      break;
  }
};
