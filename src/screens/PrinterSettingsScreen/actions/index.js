import {
  PRINTER_SETTINGS_LOAD,
  PRINTER_SETTINGS_PAIRED,
  PRINTER_SETTINGS_SELECTED,
  PRINTER_SETTINGS_AUTO_PRINT,
  PRINTER_SETTINGS_OPEN_DRAWER,
  PRINTER_SETTINGS_LOADING,
  PRINTER_SETTINGS_CLEAR,
  PRINTER_SETTINGS_FOUND,
  PRINTER_SETTINGS_SCANNING,
  PRINTER_SETTINGS_PAIRING,
  DIALOG_SHOW,
} from '../../../utils/constants';
import {
  getPrinterPrefs,
  setPrinter,
  setAutoPrintAfterSale,
  setOpenDrawerOnCashSale,
} from '../../../utils/printing/preferences';
import {
  listPairedDevices,
  scanDevices,
  pairDevice,
  unpairDevice,
  printTestPage,
  openCashDrawer,
} from '../../../utils/printing/printerService';

export const loadPrefs = () => async (dispatch) => {
  const prefs = await getPrinterPrefs();
  dispatch({type: PRINTER_SETTINGS_LOAD, payload: prefs});
};

export const clear = () => (dispatch) => {
  dispatch({type: PRINTER_SETTINGS_CLEAR});
};

export const scanPaired = () => async (dispatch, getState) => {
  dispatch({type: PRINTER_SETTINGS_LOADING, payload: true});
  try {
    const devices = await listPairedDevices();
    dispatch({type: PRINTER_SETTINGS_PAIRED, payload: devices});

    // Auto-cleanup: si el MAC guardado en prefs ya no está en la lista de
    // paired (el user olvidó la impresora desde Android Settings), limpiamos
    // las prefs locales para que el resto del app no intente conectar a un
    // device fantasma que ya no existe.
    const {address: savedAddress} = getState().printerSettingsData;
    if (savedAddress && !devices.some((d) => d.address === savedAddress)) {
      await setPrinter({address: null, name: null});
      dispatch({type: PRINTER_SETTINGS_SELECTED, payload: {address: null, name: null}});
    }
  } catch (e) {
    dispatch({
      type: DIALOG_SHOW,
      payload: {
        title: 'Bluetooth',
        message: e?.message || 'No fue posible listar las impresoras emparejadas.',
      },
    });
  } finally {
    dispatch({type: PRINTER_SETTINGS_LOADING, payload: false});
  }
};

export const selectPrinter = ({address, name}) => async (dispatch) => {
  await setPrinter({address, name});
  dispatch({type: PRINTER_SETTINGS_SELECTED, payload: {address, name}});
};

export const scanNearby = () => async (dispatch, getState) => {
  dispatch({type: PRINTER_SETTINGS_SCANNING, payload: true});
  dispatch({type: PRINTER_SETTINGS_FOUND, payload: []});
  try {
    const {paired, found} = await scanDevices((dev) => {
      const {found: foundNow} = getState().printerSettingsData;
      if (!(foundNow || []).some((p) => p.address === dev.address)) {
        dispatch({
          type: PRINTER_SETTINGS_FOUND,
          payload: [...(foundNow || []), {...dev, isPaired: false}],
        });
      }
    });
    // Lista única: emparejados primero (más confiables), luego no emparejados.
    const seen = new Set();
    const merged = [];
    for (const d of [...(paired || []), ...(found || [])]) {
      if (!seen.has(d.address)) {
        seen.add(d.address);
        merged.push({...d, isPaired: (paired || []).some((p) => p.address === d.address)});
      }
    }
    dispatch({type: PRINTER_SETTINGS_FOUND, payload: merged});
    dispatch({type: PRINTER_SETTINGS_PAIRED, payload: paired || []});
  } catch (e) {
    dispatch({
      type: DIALOG_SHOW,
      payload: {
        title: 'Búsqueda Bluetooth',
        message:
          e?.message ||
          'No se pudo escanear. Verificá que el Bluetooth esté activo y los permisos otorgados.',
      },
    });
  } finally {
    dispatch({type: PRINTER_SETTINGS_SCANNING, payload: false});
  }
};

// Acción unificada: tap en device de la lista. Si está emparejado, solo lo
// selecciona; si no, dispara el pairing OS dialog y luego lo selecciona.
export const tapDevice = ({address, name, isPaired}) => async (dispatch) => {
  if (isPaired) {
    await dispatch(selectPrinter({address, name}));
  } else {
    await dispatch(pairAndSelect({address, name}));
  }
};

export const pairAndSelect = ({address, name}) => async (dispatch) => {
  dispatch({type: PRINTER_SETTINGS_PAIRING, payload: address});
  try {
    // pairDevice usa BluetoothManager.connect(): si el device no está
    // emparejado, Android dispara el diálogo de pairing (PIN/confirm).
    // Al volver, el device queda emparejado y conectado.
    await pairDevice(address);
    await setPrinter({address, name});
    dispatch({type: PRINTER_SETTINGS_SELECTED, payload: {address, name}});

    // Refrescar la lista de emparejadas + sacar el device de "found".
    const paired = await listPairedDevices();
    dispatch({type: PRINTER_SETTINGS_PAIRED, payload: paired});
  } catch (e) {
    dispatch({
      type: DIALOG_SHOW,
      payload: {
        title: 'Emparejamiento',
        message:
          e?.message ||
          'No se pudo emparejar. Si la impresora pide PIN, suele ser 0000 o 1234.',
      },
    });
  } finally {
    dispatch({type: PRINTER_SETTINGS_PAIRING, payload: null});
  }
};

// Forget completo: intenta unpair en Android (puede fallar — muchas ROMs
// no exponen unpair programático), pero SIEMPRE limpia las prefs locales
// para que el resto del app no intente conectar a un device fantasma.
// Si el unpair native falla, el user puede completarlo manualmente desde
// Android Settings — pero las prefs ya quedan limpias.
export const forgetPrinter = ({address}) => async (dispatch, getState) => {
  try {
    await unpairDevice(address);
  } catch (e) {
    // ignore — algunas roms no permiten unpair programático.
  }

  // Si la impresora a olvidar era la seleccionada, limpiar prefs SIEMPRE.
  const {address: currentAddress} = getState().printerSettingsData;
  if (currentAddress === address) {
    await setPrinter({address: null, name: null});
    dispatch({type: PRINTER_SETTINGS_SELECTED, payload: {address: null, name: null}});
  }

  // Refrescar lista paired. Si el device ya no está paired (unpair OK), la
  // UI lo refleja inmediatamente.
  try {
    const paired = await listPairedDevices();
    dispatch({type: PRINTER_SETTINGS_PAIRED, payload: paired});

    // Auto-cleanup extra: si por alguna razón la lista paired ya no contiene
    // el address guardado (race condition con el unpair), limpiar prefs.
    const {address: postUnpairAddress} = getState().printerSettingsData;
    if (postUnpairAddress && !paired.some((d) => d.address === postUnpairAddress)) {
      await setPrinter({address: null, name: null});
      dispatch({type: PRINTER_SETTINGS_SELECTED, payload: {address: null, name: null}});
    }
  } catch (e) {
    // si scan falla, igual mantenemos las prefs limpias arriba.
  }
};

export const toggleAutoPrint = (enabled) => async (dispatch) => {
  await setAutoPrintAfterSale(enabled);
  dispatch({type: PRINTER_SETTINGS_AUTO_PRINT, payload: enabled});
};

export const toggleOpenDrawer = (enabled) => async (dispatch) => {
  await setOpenDrawerOnCashSale(enabled);
  dispatch({type: PRINTER_SETTINGS_OPEN_DRAWER, payload: enabled});
};

export const testPrint = () => async (dispatch) => {
  dispatch({type: PRINTER_SETTINGS_LOADING, payload: true});
  try {
    await printTestPage();
  } catch (e) {
    dispatch({
      type: DIALOG_SHOW,
      payload: {
        title: 'Error de impresión',
        message: e?.message || 'No se pudo imprimir la página de prueba.',
      },
    });
  } finally {
    dispatch({type: PRINTER_SETTINGS_LOADING, payload: false});
  }
};

export const testDrawer = () => async (dispatch) => {
  dispatch({type: PRINTER_SETTINGS_LOADING, payload: true});
  try {
    await openCashDrawer();
  } catch (e) {
    dispatch({
      type: DIALOG_SHOW,
      payload: {
        title: 'Error al abrir cajón',
        message: e?.message || 'No se pudo abrir el cajón de dinero.',
      },
    });
  } finally {
    dispatch({type: PRINTER_SETTINGS_LOADING, payload: false});
  }
};
