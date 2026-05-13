import request from './';
import base64 from 'react-native-base64';

/**
 * GET /api/v2/branches — devuelve las sucursales del user actual.
 *
 * El backend HybridAuthGuard rechaza magic credential en este endpoint
 * (no tiene userId), así que mandamos `Basic <b64(email:password)>` con
 * las credenciales reales del user logueado.
 */
export function getMyBranches(email, password) {
  const userAuth = `Basic ${base64.encode(`${email}:${password}`)}`;
  return request({
    url: 'api/v2/branches',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: userAuth,
      Accept: 'application/json',
    },
  });
}

/**
 * GET /api/v2/branches?scope=company — todas las sucursales activas de
 * la empresa del user. Útil para flujos como Trasladar inventario donde
 * el cajero debe poder elegir cualquier sucursal hermana como destino
 * (no solo las que tiene asignadas via UserBranch).
 */
export function getCompanyBranches(email, password) {
  const userAuth = `Basic ${base64.encode(`${email}:${password}`)}`;
  return request({
    url: 'api/v2/branches?scope=company',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: userAuth,
      Accept: 'application/json',
    },
  });
}

const branchApi = { getMyBranches, getCompanyBranches };
export default branchApi;
