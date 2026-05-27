import request from './';
import settings from './settings';
import base64 from 'react-native-base64';
const Auth= base64.encode(`${settings.user}:${settings.password}`);
const Authorization = 'Basic '.concat(Auth);
const postUrl = 'cash?_format=json';

function manageCash({
  token, 
  uid,
  value,
  type,
  nid
}) {
	return request({
		url: postUrl,
		method: 'POST',
		headers: {
      'Content-Type': 'application/json',
      'x-CSRF-Token': token,
      Authorization: Authorization,
			Accept: 'application/json'
		},
		data: { 
      uid,
      value,
      type,
      nid
    }
	});
}

function checkBalance({
  token, 
  uid,
  nid
}) {
	return request({
		url: postUrl,
		method: 'POST',
		headers: {
      'Content-Type': 'application/json',
      'x-CSRF-Token': token,
      Authorization: Authorization,
			Accept: 'application/json'
		},
		data:{ 
      type:'check_balance',
      nid,
      uid,
    }
	});
}

function getCashStatus({
  token,
  uid,
}) {
  // Pasamos uid como query param para que el back filtre por usuario.
  // El `t` rompe el cache HTTP de okhttp: el back devuelve 304 Not Modified
  // si el etag coincide y el cliente sirve el body cacheado, pero ese body
  // puede ser de antes que el turno se reflejara (p.ej. estado stale tras
  // abrir caja desde la web). Forzamos miss-cache con un timestamp único.
  const params = [`t=${Date.now()}`];
  if (uid != null) params.push(`uid=${encodeURIComponent(uid)}`);
  return request({
    url: `api/v2/cash/status?${params.join('&')}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-CSRF-Token': token,
      Authorization: Authorization,
      Accept: 'application/json',
      // Defensa adicional contra cualquier caché intermedio (proxies, etc.).
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    }
  });
}

const cashManagement = {
  manageCash,
  checkBalance,
  getCashStatus
};

export default cashManagement;