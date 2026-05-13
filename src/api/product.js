import request from './';
import settings from './settings';
import base64 from 'react-native-base64';
const Auth= base64.encode(`${settings.user}:${settings.password}`);
const Authorization = 'Basic '.concat(Auth);
const postUrl = 'product?_format=json';

function createProductCategory({
  token, 
  uid,
  name,
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
      type:'create_product_category',
      uid,
      name,
    }
	});
}

function createProduct({
  token, 
  uid,
  code,
  name,
  price,
  cost,
  codeAunap,
  englishName,
  scientistName,
  size,
  aquarium,
  status,
  qty,
  color,
  ref,
  brand,
  type,
  date,
  cat
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
      type:'create_product',
      uid,
      code,
      name,
      price,
      cost,
      code_aunap:codeAunap,
      english_name:englishName,
      scientist_name:scientistName,
      size,
      aquarium,
      status,
      qty,
      color,
      ref,
      brand,
      product_type:type,
      date,
      cat,
    }
	});
}

function editProduct({
  uid,
  token, 
  code,
  name,
  price,
  cost,
  codeAunap,
  englishName,
  scientistName,
  size,
  aquarium,
  status,
  color,
  ref,
  brand,
  type,
  date,
  productId
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
      type:'edit_product',
      code,
      name,
      price,
      cost,
      code_aunap:codeAunap,
      english_name:englishName,
      scientist_name:scientistName,
      size,
      aquarium,
      status,
      color,
      ref,
      brand,
      product_type:type,
      date,
      nid:productId,
      uid
    }
	});
}

function createKit({
  token, 
  uid,
  products,
  name,
  price
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
      type:'create_kit',
      uid,
      name,
      price,
      products
    }
	});
}

function getProductsKits({
  token, 
  page,
  company,
  keyword,
  branchOffice,
  cat
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
      type:'getProductsKit',
      page,
      company,
      keyword,
      branch_office:branchOffice,
      cat
    }
	});
}

function getProductCategories({
  token, 
  page,
  uid,
  keyword
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
      type:'get_product_categories',
      page,
      keyword,
      uid
    }
	});
}

function getProduct({
  token, 
  company,
  branchOffice,
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
      type:'getProduct',
      company,
      branch_office:branchOffice,
      nid
    }
	});
}

const product = {
  createProduct,
  createKit,
  getProductsKits,
  getProduct,
  createProductCategory,
  getProductCategories,
  editProduct
};

export default product;