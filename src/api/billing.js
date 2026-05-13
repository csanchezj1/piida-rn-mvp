import request from './';
import base64 from 'react-native-base64';

// Cliente REST para /billing/* del back NestJS.
//
// Auth: usamos Basic con CREDENCIALES REALES del user (email:password), no
// el magic global. El HybridAuthGuard del back resuelve `req.user` desde el
// email y los endpoints F6 dependen de @CurrentUser() — sin user real no
// hay forma de saber a qué company aplicar.
//
// Esto NO es ideal a largo plazo (R05 del plan: password plaintext en
// Redux Persist). En F7 (cutover RN) se reemplaza por JWT con refresh
// rotation. Por ahora aprovechamos lo que ya está storeado.

const basicAuth = (email, password) =>
  'Basic ' + base64.encode(`${email}:${password}`);

const headers = (email, password) => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: basicAuth(email, password),
});

const Billing = {
  getPlans: ({ email, password }) =>
    request({ url: 'billing/plans', method: 'GET', headers: headers(email, password) }),

  getSubscription: ({ email, password }) =>
    request({
      url: 'billing/subscriptions/me',
      method: 'GET',
      headers: headers(email, password),
    }),

  getPayments: ({ email, password }) =>
    request({
      url: 'billing/subscriptions/me/payments',
      method: 'GET',
      headers: headers(email, password),
    }),

  subscribe: ({ email, password, planId, planDiscountId, creditCardId, cvv }) =>
    request({
      url: 'billing/subscriptions/me',
      method: 'POST',
      headers: headers(email, password),
      data: { planId, planDiscountId, creditCardId, cvv },
    }),

  cancel: ({ email, password }) =>
    request({
      url: 'billing/subscriptions/me/cancel',
      method: 'POST',
      headers: headers(email, password),
      data: {},
    }),

  resume: ({ email, password }) =>
    request({
      url: 'billing/subscriptions/me/resume',
      method: 'POST',
      headers: headers(email, password),
      data: {},
    }),

  listCards: ({ email, password }) =>
    request({
      url: 'billing/cards/me',
      method: 'GET',
      headers: headers(email, password),
    }),

  tokenizeCard: ({
    email,
    password,
    name,
    identificationNumber,
    paymentMethod,
    number,
    expirationDate,
  }) =>
    request({
      url: 'billing/cards',
      method: 'POST',
      headers: headers(email, password),
      data: { name, identificationNumber, paymentMethod, number, expirationDate },
    }),

  removeCard: ({ email, password, id }) =>
    request({
      url: `billing/cards/${id}`,
      method: 'DELETE',
      headers: headers(email, password),
    }),
};

export default Billing;
