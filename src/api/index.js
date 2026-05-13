import axios from 'axios';
import settings from './settings';

const client = axios.create({
  baseURL: settings.baseUrl
});

/**
 * Bloque 4 multi-sucursal: el wrapper inyecta X-Branch-Id automáticamente
 * desde el store en cada request. Acoplamos vía un setter (`setStore`)
 * que el bootstrapping llama antes de la primera request — evita import
 * circular store→api→store.
 */
let _store = null;
export function setStore(store) {
  _store = store;
}

const request = function (options) {
  const headers = options.headers || {};
  // Solo inyectamos si NO viene seteado explícitamente por el caller (algunas
  // llamadas como /app_login intencionalmente no llevan branch).
  if (_store && !headers['X-Branch-Id'] && !headers['x-branch-id']) {
    try {
      const state = _store.getState();
      const id = state?.activeBranchData?.activeBranchId;
      if (id != null) {
        headers['X-Branch-Id'] = String(id);
      }
    } catch (_) {
      // si el store no está listo (pre-bootstrap), seguimos sin header.
    }
  }
  const finalOptions = { ...options, headers };

  const onSuccess = function (response) {
    return response.data;
  };

  const onError = function (error) {
    if (error.response) {

    } else {

    }
    return Promise.reject(error.response || error.message);
  };

  return client(finalOptions)
    .then(onSuccess)
    .catch(onError);
};

export default request;
