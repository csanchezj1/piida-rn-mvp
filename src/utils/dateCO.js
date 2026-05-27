// Helpers de fecha en zona horaria Colombia (America/Bogota, UTC-5 fijo).
//
// La app no debe depender del TZ del dispositivo para mostrar fechas — un
// cajero con la tablet en otro huso vería horas equivocadas. Estos helpers
// fuerzan la zona Colombia con Intl.DateTimeFormat (nativo, sin libs extra).
//
// Acepta:
//   - ISO string ("2026-05-20T21:43:31.294Z")
//   - Date
//   - Numérico (timestamp ms)
//   - String pre-formateado "DD/MM/YYYY" → lo devuelve tal cual (sin parsear)
//   - null/undefined → ''

const TZ = 'America/Bogota';
const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') {
    // "DD/MM/YYYY" → ya está formateada, devolvemos null para que el caller
    // decida si imprimirla tal cual (helpers la conservan).
    if (/^\d{2}\/\d{2}\/\d{4}/.test(value)) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

// Parts de Intl en TZ Colombia. Devuelve {year, month, day, hour, minute,
// second} (todos números). Si no se puede parsear devuelve null.
const partsCO = (value) => {
  const d = toDate(value);
  if (!d) return null;
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  const map = {};
  for (const p of fmt.formatToParts(d)) {
    if (p.type !== 'literal') map[p.type] = parseInt(p.value, 10);
  }
  // Intl 'en-US' hour:'2-digit'+hour12:false devuelve "24" para midnight.
  if (map.hour === 24) map.hour = 0;
  return map;
};

// "DD/MM/YYYY" — formato típico del back legacy. Si recibe un string que ya
// luce así, lo devuelve sin modificar.
export const fmtDateCO = (value) => {
  if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}/.test(value)) {
    return value.replace(/\n/g, '').trim();
  }
  const p = partsCO(value);
  if (!p) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(p.day)}/${pad(p.month)}/${p.year}`;
};

// "HH:MM" 24h.
export const fmtHourCO = (value) => {
  const p = partsCO(value);
  if (!p) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(p.hour)}:${pad(p.minute)}`;
};

// "DD/MM/YYYY HH:MM".
export const fmtDateTimeCO = (value) => {
  const d = fmtDateCO(value);
  const h = fmtHourCO(value);
  if (!d) return '';
  return h ? `${d} ${h}` : d;
};

// "D mes" — "20 may" (corto).
export const fmtDayMonthCO = (value) => {
  const p = partsCO(value);
  if (!p) return '';
  return `${p.day} ${MONTHS_ES[p.month - 1]}`;
};

// "D mes HH:MM" — "20 may 16:43" (corto + hora).
export const fmtDayMonthHourCO = (value) => {
  const p = partsCO(value);
  if (!p) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${p.day} ${MONTHS_ES[p.month - 1]} ${pad(p.hour)}:${pad(p.minute)}`;
};

// "D mes YYYY".
export const fmtFullDateCO = (value) => {
  const p = partsCO(value);
  if (!p) return '';
  return `${p.day} ${MONTHS_ES[p.month - 1]} ${p.year}`;
};

// Calcula diferencia en días entre la fecha y "hoy" en zona Colombia.
// 0 = hoy, 1 = ayer, etc.
export const daysFromToday = (value) => {
  const pNow = partsCO(new Date());
  const p = partsCO(value);
  if (!p || !pNow) return null;
  const a = Date.UTC(pNow.year, pNow.month - 1, pNow.day);
  const b = Date.UTC(p.year, p.month - 1, p.day);
  return Math.round((a - b) / 86400000);
};

// Header tipo "HOY", "AYER · 20 MAY", "20 MAY". Para listas agrupadas.
export const fmtDayHeaderCO = (value) => {
  const diff = daysFromToday(value);
  if (diff == null) return typeof value === 'string' ? value.toUpperCase() : '';
  const p = partsCO(value);
  if (!p) return '';
  const label = `${p.day} ${MONTHS_ES[p.month - 1]}`.toUpperCase();
  if (diff === 0) return 'HOY';
  if (diff === 1) return `AYER · ${label}`;
  return label;
};
