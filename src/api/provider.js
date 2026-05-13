import request from './';
import base64 from 'react-native-base64';

/**
 * Auth real (Basic email:password). Los endpoints v2 rechazan magic auth —
 * necesitan req.user para hacer scope por companyId.
 */
function userAuthHeader(email, password) {
  return `Basic ${base64.encode(`${email}:${password}`)}`;
}

/**
 * GET /api/v2/providers — lista paginada (v2 usa page/limit, traducimos
 * desde offset por compat con el flujo antiguo).
 *
 * Devuelve un array [{nid, name, id_number, phone, email, city, ...}]
 * (extraemos `.providers` del response v2) para que el caller no tenga
 * que cambiar su lógica de concatenación.
 */
export function getProviders(email, password, keyword, offset) {
  const limit = 20;
  const page = Math.floor((offset ?? 0) / limit);
  const qs = `page=${page}&limit=${limit}${
    keyword ? `&q=${encodeURIComponent(keyword)}` : ''
  }`;
  return request({
    url: `api/v2/providers?${qs}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: userAuthHeader(email, password),
      Accept: 'application/json',
    },
  }).then((res) => (Array.isArray(res?.providers) ? res.providers : []));
}

/**
 * POST /api/v2/providers — { name, id_number?, phone?, email?, city?, code? }
 * El endpoint legacy /provider?_format=json ya no existe.
 */
export function createProvider({
  email,
  password,
  names,
  idNumber,
  phone,
  city,
  code,
  emailContact,
}) {
  return request({
    url: 'api/v2/providers',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: userAuthHeader(email, password),
      Accept: 'application/json',
    },
    data: {
      name: names,
      id_number: idNumber || null,
      phone: phone || null,
      email: emailContact || null,
      city: city || null,
      code: code || null,
    },
  });
}

const provider = {
  createProvider,
  getProviders,
};

export default provider;
