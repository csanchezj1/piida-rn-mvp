import request from './';
import base64 from 'react-native-base64';

// Cliente para reportes avanzados (Plan Estándar). Usa Basic con las
// credenciales reales del user — el back resuelve req.user para scoping
// por empresa (igual patrón que api/billing.js).

const basicAuth = (email, password) =>
  'Basic ' + base64.encode(`${email}:${password}`);

const headers = (email, password) => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: basicAuth(email, password),
});

const Reports = {
  // GET /api/v2/reports/advanced — KPIs comparativos + top productos +
  // margen por categoría + cohortes. dateFrom/dateTo opcionales (YYYY-MM-DD).
  getAdvanced: ({email, password, dateFrom, dateTo}) => {
    let url = 'api/v2/reports/advanced';
    const qs = [];
    if (dateFrom) qs.push(`date_from=${dateFrom}`);
    if (dateTo) qs.push(`date_to=${dateTo}`);
    if (qs.length) url += '?' + qs.join('&');
    return request({url, method: 'GET', headers: headers(email, password)});
  },

  // GET /api/v2/reports/ai-tips — resumen del período generado por Claude.
  getAiTips: ({email, password}) =>
    request({
      url: 'api/v2/reports/ai-tips',
      method: 'GET',
      headers: headers(email, password),
    }),
};

export default Reports;
