import request from './';
import settings from './settings';
import base64 from 'react-native-base64';
const Auth = base64.encode(`${settings.user}:${settings.password}`);
const Authorization = 'Basic '.concat(Auth);
const postUrl = 'movements?_format=json';

function createSale({
  token,
  uid,
  orderPayment,
  customerId,
  product,
  observations,
  paymentMethods,
  value,
  invoice
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
      type: 'sale',
      uid,
      order_payment_type: orderPayment,
      customer_id: customerId,
      products_added: product,
      observations,
      payment_methods: paymentMethods,
      value_paid: value,
      invoice
    }
  });
}

function createExpense({
  token,
  uid,
  qty,
  observations,
  payment_type,
  expense_type,
  product,
  products,
  provider,
  value,
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
      type: 'expense',
      qty,
      observations,
      payment_type,
      expense_type,
      product,
      products,
      provider,
      value,
    }
  });
}

function createPay({
  token,
  uid,
  order,
  paymentMethods,
  value
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
      type: 'pay',
      uid,
      order,
      payment_methods: paymentMethods,
      value,
    }
  });
}

function getBalance(uid) {
  return request({
    url: `movements/${uid}/balance`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
      Accept: 'application/json'
    },
  });
}

function getInventory(uid) {
  return request({
    url: `movements/${uid}/inventory`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
      Accept: 'application/json'
    },
  });
}

function inventoryByCategory(uid) {
  return request({
    url: `movements/${uid}/inventory_by_category`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
      Accept: 'application/json'
    },
  });
}

function getTotals(uid, type) {
  return request({
    url: `movements/${uid}/${type}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
      Accept: 'application/json'
    },
  });
}

// Próximo consecutivo de venta — para el badge "VENTA #N" de Venta Libre.
function getNextConsecutive(branch) {
  return request({
    url: `api/v2/sales/next-consecutive?branch=${branch}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
      Accept: 'application/json'
    },
  });
}

function transferInventory({
  token,
  uid,
  branch,
  product,
  products,
  qty,
  observations,
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
      type: 'transfer',
      uid,
      branch,
      product,
      products,
      qty,
      observations,
    }
  });
}

function getPayments({
  token,
  nid,
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
      type: 'payments',
      nid,
    }
  });
}

function deleteMovement({ nid, reason, uid }) {
  // ?uid es obligatorio en compat-mode (Basic Auth magic creds): el back
  // no puede resolver el usuario que cancela desde el header sólo.
  const qs = uid != null ? `?uid=${uid}` : '';
  return request({
    url: `api/v2/movements/${nid}${qs}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
      Accept: 'application/json'
    },
    data: { reason }
  });
}

const provider = {
  getBalance,
  getInventory,
  getTotals,
  getNextConsecutive,
  createSale,
  createExpense,
  createPay,
  transferInventory,
  getPayments,
  inventoryByCategory,
  deleteMovement
};

export default provider;