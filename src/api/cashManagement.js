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
  token
}) {
  return request({
    url: 'api/v2/cash/status',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-CSRF-Token': token,
      Authorization: Authorization,
      Accept: 'application/json'
    }
  });
}

const cashManagement = {
  manageCash,
  checkBalance,
  getCashStatus
};

export default cashManagement;