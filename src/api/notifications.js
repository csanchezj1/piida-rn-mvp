import request from './';
import settings from './settings';
import base64 from 'react-native-base64';
const Auth= base64.encode(`${settings.user}:${settings.password}`);
const Authorization = 'Basic '.concat(Auth);

function getNotifications(uid) {
	return request({
    url:`notifications/${uid}`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

const notifications = {
  getNotifications,
};

export default notifications;