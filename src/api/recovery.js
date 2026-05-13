import request from './';
import settings from './settings';
import base64 from 'react-native-base64';
const Auth= base64.encode(`${settings.user}:${settings.password}`);
const Authorization = 'Basic '.concat(Auth);
const postUrl = 'recovery_pass?_format=json';

function recoveryPass(token, email) {
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
      email,
    }
	});
}


function validateCode(token, code) {
  return request({
    url: `recovery_pass/${code}?_format=json`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-CSRF-Token': token,
      Accept: 'application/json',
      Authorization: Authorization
    }
  });
}

const recovery = {
  recoveryPass,
	validateCode,
};

export default recovery;