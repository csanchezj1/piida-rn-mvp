/**
 * Helpers para resolver IDs de métodos de pago desde el state Redux.
 *
 * El backend NestJS retorna `payment_methods: [{id, name}]` en la respuesta
 * de /app_login. Antes la app hardcodeaba IDs de Drupal (Efectivo era 7),
 * que en NestJS son distintos (Efectivo es 1). Este helper resuelve por
 * nombre — case-insensitive y tolerante a tildes.
 */

const normalize = (s) =>
  (s || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export const getPaymentMethods = (state) =>
  (state && state.userData && state.userData.user && state.userData.user.payment_methods) || [];

export const getPaymentMethodIdByName = (state, name) => {
  const target = normalize(name);
  const found = getPaymentMethods(state).find((m) => normalize(m.name) === target);
  return found ? found.id : null;
};

export const getCashPaymentMethodId = (state) =>
  getPaymentMethodIdByName(state, 'Efectivo');
