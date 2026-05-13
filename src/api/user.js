import request from './';
import settings from './settings';
import base64 from 'react-native-base64';
const Auth= base64.encode(`${settings.user}:${settings.password}`);
const Authorization = 'Basic '.concat(Auth);
const postUrl = 'app_user?_format=json';

function changePass(token, email, password) {
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
      type: 'change_pass',
      email,
      password,
    }
  });
}

function createAccount({
  token,
  name,
  lastName,
  email,
  idNumber,
  phone,
  company,
  password,
  operation,
  business,
  web,
  finance,
  appGoal,
  role,
  businessText,
  financeText,
  appGoalText,
  position
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
      type: 'create',
      name,
      last_name:lastName,
      email,
      id_number:idNumber,
      phone,
      company,
      password,
      operation,
      business,
      web,
      finance,
      app_goal:appGoal,
      role,
      business_text:businessText,
      finance_text:financeText,
      goal_text:appGoalText,
      position
    }
  });
}

function verifyEmail({
  token,
  email,
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
      type: 'verify_email',
      email,
    }
  });
}

const user = {
  changePass,
  createAccount,
  verifyEmail
};

export default user;