import request from './';
import settings from './settings';
import base64 from 'react-native-base64';
const Auth=base64.encode(`${settings.user}:${settings.password}`);
const Authorization = 'Basic '.concat(Auth);

function getOperationTime() {
	return request({
    url:`api/operation-time`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getBusinessType() {
	return request({
    url:`api/business-type`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getFinanceManagement() {
	return request({
    url:`api/finance-management`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getAppGoals() {
	return request({
    url:`api/app-goals`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getGender() {
	return request({
    url:`api/gender`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getProviders(pp_id, title, offset) {
	return request({
    url:`api/providers/${pp_id}?offset=${offset}&title=${title}`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getProducts(company, title, offset) {
	return request({
    url:`api/products/${company}?type_1[]=product&offset=${offset}&title=${title}&field_code_value=${title}`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getProductCategories(company, name, offset) {
	return request({
    url:`api/product-categories/${company}?offset=${offset}&name=${name}`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getProductsKit(company, title, offset) {
	return request({
    url:`api/products/${company}?type_1[]=kit&type_1[]=product&offset=${offset}&title=${title}&field_code_value=${title}`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getBranch(company, branch, title, offset) {
	return request({
    url:`api/branch/${company}?offset=${offset}&title=${title}&nid=${branch}`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getPaymentType() {
	return request({
    url:`api/payment-type`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getIdType() {
	return request({
    url:`api/id-type`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getOrderPaymentType() {
	return request({
    url:`api/order-payment-type`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getMovementsPurchase(pp_id, offset) {
	return request({
    url:`api/movements-purchase/${pp_id}?offset=${offset}`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getMovementsWarehouse(pp_id, offset, opts) {
  // opts opcional: {from: 'YYYY-MM-DD', to: 'YYYY-MM-DD', type: 'in'|'out'|enum, limit: number}
  const params = [`offset=${offset}`];
  if (opts) {
    if (opts.from) params.push(`from=${encodeURIComponent(opts.from)}`);
    if (opts.to) params.push(`to=${encodeURIComponent(opts.to)}`);
    if (opts.type && opts.type !== 'all') params.push(`type=${encodeURIComponent(opts.type)}`);
    if (opts.limit) params.push(`limit=${opts.limit}`);
  }
  return request({
    url:`api/movements-warehouse/${pp_id}?${params.join('&')}`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getCustomer(company, title, offset) {
	return request({
    url:`api/customer/${company}?offset=${offset}&title=${title}&field_phone_value=${title}&field_id_number_value=${title}`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getTerms(company) {
	return request({
    url:`api/terms/${company}`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getPolicy(company) {
	return request({
    url:`api/policy/${company}`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getExpenseType() {
	return request({
    url:`api/expense-type`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getOrders(company, offset, word) {
  const consecutive = word ? word : '';
  const title = word ? word : '';
	return request({
    url:`api/orders/${company}?offset=${offset}&field_order_consecutive_value=${consecutive}&title=${title}`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getPending(company, offset, word) {
  const consecutive = word ? word : '';
  const title = word ? word : '';
	return request({
    url:`api/pending/${company}?offset=${offset}&field_order_consecutive_value=${consecutive}&title=${title}`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getItems(order) {
	return request({
    url:`api/line-item/${order}`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

function getProductsInventory(company, offset, text) {
  let url = `api/product-inventory/${company}?offset=${offset}`;
  if(text != null && text != ''){
    url = `api/product-inventory/${company}?offset=${offset}&title_1=${text}`;
  }
	return request({
    url,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

const api = {
  getTerms,
  getPolicy,
  getGender,
  getProviders,
  getProducts,
  getPaymentType,
  getMovementsPurchase,
  getMovementsWarehouse,
  getCustomer,
  getOrderPaymentType,
  getExpenseType,
  getOrders,
  getPending,
  getItems,
  getOperationTime,
  getBusinessType,
  getFinanceManagement,
  getAppGoals,
  getBranch,
  getProductsKit,
  getProductsInventory,
  getIdType,
  getProductCategories
};

export default api;