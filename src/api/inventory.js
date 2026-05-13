import request from './';
import settings from './settings';
import base64 from 'react-native-base64';
const Auth= base64.encode(`${settings.user}:${settings.password}`);
const Authorization = 'Basic '.concat(Auth);
const postUrl = 'inventory?_format=json';

function getInventory({
  token, 
  page,
  uid,
  keyword,
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
      type:'get_inventory',
      uid,
      page,
      product_name:keyword,
      cat
    }
	});
}

const inventory = {
  getInventory,
};

export default inventory;