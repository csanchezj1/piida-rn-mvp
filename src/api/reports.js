import request from './';
import base64 from 'react-native-base64';

// Cliente para reportes. Usa Basic con las credenciales reales del user —
// el back resuelve req.user para scoping por empresa/sucursal (igual patrón
// que api/billing.js). Mismos endpoints que consume la web.

const basicAuth = (email, password) =>
  'Basic ' + base64.encode(`${email}:${password}`);

const headers = (email, password) => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: basicAuth(email, password),
});

const withDates = (base, dateFrom, dateTo) => {
  const qs = [];
  if (dateFrom) qs.push(`date_from=${dateFrom}`);
  if (dateTo) qs.push(`date_to=${dateTo}`);
  return qs.length ? `${base}?${qs.join('&')}` : base;
};

const Reports = {
  // GET /api/v2/reports/summary — KPIs comparativos, ventas por día,
  // ventas por método de pago y gastos por tipo. dateFrom/dateTo YYYY-MM-DD.
  getSummary: ({email, password, dateFrom, dateTo}) =>
    request({
      url: withDates('api/v2/reports/summary', dateFrom, dateTo),
      method: 'GET',
      headers: headers(email, password),
    }),

  // GET /api/v2/inventory/top-sellers — top 10 productos más vendidos.
  getTopSellers: ({email, password}) =>
    request({
      url: 'api/v2/inventory/top-sellers',
      method: 'GET',
      headers: headers(email, password),
    }),

  // GET /api/v2/inventory/low-stock — productos por debajo del umbral.
  getLowStock: ({email, password, threshold}) =>
    request({
      url: threshold
        ? `api/v2/inventory/low-stock?threshold=${threshold}`
        : 'api/v2/inventory/low-stock',
      method: 'GET',
      headers: headers(email, password),
    }),

  // GET /api/v2/cash/status — estado actual + historial de cierres de caja.
  getCashStatus: ({email, password}) =>
    request({
      url: 'api/v2/cash/status',
      method: 'GET',
      headers: headers(email, password),
    }),
};

export default Reports;
