import request from './';
import settings from './settings';
import base64 from 'react-native-base64';
const Auth= base64.encode(`${settings.user}:${settings.password}`);
const Authorization = 'Basic '.concat(Auth);

function saveFCM(tokenServer, uid, token, os) {
  return request({
    url: 'firebase_token?_format=json',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-CSRF-Token': tokenServer,
      Authorization: Authorization,
      Accept: 'application/json'
    },
    data: { 
      uid,
      token,
      os
    }
  });
}

function deleteFCM(token, fcmId) {
  return request({
    url: `firebase_token/${fcmId}?_format=json`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-CSRF-Token': token,
      Accept: 'application/json',
      Authorization: Authorization
    }
  });
}

const firebaseToken = {
  saveFCM,
  deleteFCM
};

export default firebaseToken;