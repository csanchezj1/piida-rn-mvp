import request from './';
import settings from './settings';
import base64 from 'react-native-base64';
const Auth= base64.encode(`${settings.user}:${settings.password}`);
const Authorization = 'Basic '.concat(Auth);
const postUrl = 'customer?_format=json';

function createCustomer({
  token, 
  uid,
  name,
  phone,
  idNumber,
  address,
  email,
  city,
  cityName,
  code,
  digit,
  idType,
  birthday
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
      name,
      phone,
      id_number:idNumber,
      address,
      email,
      city:cityName,
      city_id:city,
      code,
      digit,
      id_type:idType,
      birthday
    }
	});
}

const customer = {
  createCustomer,
};

export default customer;