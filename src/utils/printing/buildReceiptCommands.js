// Construye una lista de "segmentos" que printerService.runSegment
// ejecuta secuencialmente contra la impresora. Mantener este módulo
// libre de imports de la lib nativa para poder testearlo en Node.

// Ancho objetivo: 58 mm → 32 columnas con fuente estándar ESC/POS.
const COLS = 32;

const formatMoney = (value) => {
  const n = Number(value) || 0;
  const fixed = Math.round(n).toString();
  // separador de miles con punto (formato CO)
  return '$' + fixed.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Coerciona a string SIEMPRE. Si llega un objeto (cosa que pasa cuando el
// caller arma payment.type = {label: ..., value: ...} y otra capa lo
// re-envuelve), preferimos extraer .label o caer a un placeholder antes que
// dejar pasar el objeto al native bridge (que revienta con "ReadableNativeMap
// cannot be cast to java.lang.String").
const asString = (v) => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object') {
    if (typeof v.label === 'string') return v.label;
    if (typeof v.name === 'string') return v.name;
    if (typeof v.title === 'string') return v.title;
    return '';
  }
  return String(v);
};

const truncate = (str, max) => {
  const s = asString(str);
  if (!s) return '';
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
};

export const buildReceiptCommands = ({
  companyName,
  branchName,
  branchPhone,
  branchAddress,
  consecutive,
  movementType,
  date,
  items = [],
  total,
  paid,
  change,
  paymentMethods = [],
  customer,
  observations,
  footer = '¡Gracias por tu compra!',
}) => {
  const segs = [];
  segs.push({kind: 'init'});

  // Header empresa
  segs.push({kind: 'align', value: 'CENTER'});
  segs.push({
    kind: 'text',
    value: `${truncate(companyName || 'PIIDA', COLS)}\n\r`,
    options: {widthtimes: 1, heigthtimes: 1, fonttype: 1, encoding: 'GBK', codepage: 0},
  });
  if (branchName) {
    segs.push({kind: 'text', value: `${truncate(branchName, COLS)}\n\r`});
  }
  if (branchAddress) {
    segs.push({kind: 'text', value: `${truncate(branchAddress, COLS)}\n\r`});
  }
  if (branchPhone) {
    segs.push({kind: 'text', value: `Tel: ${truncate(branchPhone, COLS - 5)}\n\r`});
  }

  segs.push({kind: 'separator'});

  // Datos de la transacción
  segs.push({kind: 'align', value: 'LEFT'});
  if (movementType) {
    segs.push({kind: 'text', value: `Tipo: ${truncate(movementType, COLS - 6)}\n\r`});
  }
  if (consecutive) {
    segs.push({kind: 'text', value: `Recibo: ${consecutive}\n\r`});
  }
  if (date) {
    segs.push({kind: 'text', value: `Fecha: ${date}\n\r`});
  }
  if (customer) {
    segs.push({kind: 'text', value: `Cliente: ${truncate(customer, COLS - 9)}\n\r`});
  }

  segs.push({kind: 'separator'});

  // Ítems — formato: nombre + (cant x precio) en dos líneas si hace falta
  // Columnas: descripción 22, total 10 (alineado derecha)
  items.forEach((it) => {
    const name = it.name || it.product || it.label || 'Item';
    const qty = Number(it.qty || it.quantity || 1);
    const price = Number(
      it.price ?? it.unit_price ?? (it.subtotal && qty ? it.subtotal / qty : 0)
    );
    const subtotal = Number(it.subtotal ?? it.value ?? qty * price);

    segs.push({
      kind: 'columns',
      columnWidths: [22, 10],
      columnTexts: [truncate(name, 22), formatMoney(subtotal)],
      columnAligns: [
        0, // BluetoothEscposPrinter.ALIGN.LEFT
        2, // BluetoothEscposPrinter.ALIGN.RIGHT
      ],
      options: {},
    });
    segs.push({
      kind: 'text',
      value: `  ${qty} x ${formatMoney(price)}\n\r`,
    });
  });

  segs.push({kind: 'separator'});

  // Totales
  if (total != null) {
    segs.push({
      kind: 'columns',
      columnWidths: [22, 10],
      columnTexts: ['TOTAL', formatMoney(total)],
      columnAligns: [0, 2],
      options: {widthtimes: 1, heigthtimes: 1, fonttype: 1},
    });
  }
  if (paid != null) {
    segs.push({
      kind: 'columns',
      columnWidths: [22, 10],
      columnTexts: ['Pagado', formatMoney(paid)],
      columnAligns: [0, 2],
      options: {},
    });
  }
  if (change != null && change > 0) {
    segs.push({
      kind: 'columns',
      columnWidths: [22, 10],
      columnTexts: ['Cambio', formatMoney(change)],
      columnAligns: [0, 2],
      options: {},
    });
  }

  // Medios de pago si hay más de uno
  if (paymentMethods && paymentMethods.length > 0) {
    segs.push({kind: 'separator'});
    segs.push({kind: 'text', value: 'Medios de pago:\n\r'});
    paymentMethods.forEach((pm) => {
      const label = asString(pm?.type?.label || pm?.label || pm?.type) || 'Pago';
      const value = pm?.value ?? pm?.amount ?? 0;
      segs.push({
        kind: 'columns',
        columnWidths: [22, 10],
        columnTexts: [truncate(label, 22), formatMoney(value)],
        columnAligns: [0, 2],
        options: {},
      });
    });
  }

  if (observations) {
    segs.push({kind: 'separator'});
    segs.push({kind: 'text', value: `Obs: ${truncate(observations, COLS - 5)}\n\r`});
  }

  segs.push({kind: 'separator'});
  segs.push({kind: 'align', value: 'CENTER'});
  segs.push({kind: 'text', value: `${footer}\n\r`});
  segs.push({kind: 'feed', lines: 3});

  return segs;
};
