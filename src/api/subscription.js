import request from './';
import settings from './settings';
import base64 from 'react-native-base64';
const Auth= base64.encode(`${settings.user}:${settings.password}`);
const Authorization = 'Basic '.concat(Auth);
const postUrl = 'subscription?_format=json';

function createCreditCard({
  token, 
  uid,
  number,
  ccv,
  expiration,
  name,
  dni,
  franchise
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
      'card-name':name, 
      'card-dni':dni, 
      'card-franchise':franchise, 
      'card-number':number, 
      'card-exp':expiration,
      'card-cvc':ccv,
      'type':'create_credit_card'
    }
	});
}

function createSubscription({
  token, 
  uid,
  planID,
  subscriptionID,
  cardID
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
      'plan_id':planID, 
      'subscription_id':subscriptionID, 
      'card_id':cardID, 
      'type':'create_subscription', 
    }
	});
}

function cancelSubscription({
  token, 
  subscriptionID,
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
      subscription_id:subscriptionID, 
      type:'cancel_subscription', 
    }
	});
}

function continueSubscription({
  token, 
  subscriptionID,
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
      subscription_id:subscriptionID, 
      type:'continue_suscription', 
    }
	});
}

function getPlans(uid) {
	return request({
    url:`subscription/${uid}`,
		method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization,
			Accept: 'application/json'
		},
	});
}

const subscription = {
  createCreditCard,
  createSubscription,
  getPlans,
  cancelSubscription,
  continueSubscription
};

export default subscription;