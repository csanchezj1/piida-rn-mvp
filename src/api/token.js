import request from './';

function getToken() {
  return request({
    url:  'session/token',
    method: 'GET',
    headers: {
      'User-Agent': 'Piida/1.0 (Android/iOS)',
      'Content-Type': 'application/json',
			Accept: 'application/json'
		},
  });
}

const token = {
  getToken
};

export default token;