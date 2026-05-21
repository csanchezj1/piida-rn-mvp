import request from './';
import base64 from 'react-native-base64';

// Cliente REST para /api/v2/notifications/* y /api/v2/devices/* del back
// NestJS. Auth: Basic con credenciales reales del user (igual que billing).
// Los endpoints requieren req.user (no aceptan magic auth) porque el inbox
// es por user.

const basicAuth = (email, password) =>
  'Basic ' + base64.encode(`${email}:${password}`);

const headers = (email, password) => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: basicAuth(email, password),
});

const Notifications = {
  list: ({email, password, offset = 0, limit = 20, onlyUnread = false}) =>
    request({
      url: `api/v2/notifications?offset=${offset}&limit=${limit}${onlyUnread ? '&unread=1' : ''}`,
      method: 'GET',
      headers: headers(email, password),
    }),

  unreadCount: ({email, password}) =>
    request({
      url: 'api/v2/notifications/unread-count',
      method: 'GET',
      headers: headers(email, password),
    }),

  markRead: ({email, password, id}) =>
    request({
      url: `api/v2/notifications/${id}/read`,
      method: 'PATCH',
      headers: headers(email, password),
    }),

  markAllRead: ({email, password}) =>
    request({
      url: 'api/v2/notifications/read-all',
      method: 'PATCH',
      headers: headers(email, password),
    }),

  // ─── Devices (push tokens) ────────────────────────────
  registerDevice: ({email, password, token, platform}) =>
    request({
      url: 'api/v2/devices',
      method: 'POST',
      headers: headers(email, password),
      data: {token, platform},
    }),

  unregisterDevice: ({email, password, token}) =>
    request({
      url: `api/v2/devices/token/${encodeURIComponent(token)}`,
      method: 'DELETE',
      headers: headers(email, password),
    }),
};

// Compat con el código legacy que importaba default — ahora exponemos el
// objeto completo (sin getNotifications viejo).
export default Notifications;
