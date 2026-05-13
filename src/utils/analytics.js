import analytics from '@react-native-firebase/analytics';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import {
  SCREEN_SHOWED,
  SALE,
  SIGN_UP,
  CREATE_PRODUCT,
  CASH_MANAGEMENT
} from './constants';
import {Platform} from 'react-native';

export const registerEventScreenMounted = async (props, screenName, className) => {
  AppEventsLogger.logEvent('fb_mobile_content_view');
  await analytics().logEvent(SCREEN_SHOWED, {
    userName: props.user != null ? (props.user.names + ' ' + props.user.last_names) : 'Usuario anónimo',
    userEmail: props.user != null ? props.user.email : '',
    userId: props.user != null ? props.user.uid : '0',
    screenName,
    className,
    platform: Platform.OS,
    date: new Date().toLocaleString(),
  });
}

export const registerSale = async (user, orderId, total) => {
  AppEventsLogger.logPurchase(total, 'COP', {
    content_id: orderId,
    content_type: 'product'
  });
  await analytics().logEvent(SALE, {
    userName: user != null ? (user.names + ' ' + user.last_names) : 'Usuario anónimo',
    userEmail: user != null ? user.email : '',
    userId: user != null ? user.uid : '0',
    orderId,
    platform: Platform.OS,
    date: new Date().toLocaleString(),
  });
}

export const registerSignUp = async (user) => {
  AppEventsLogger.logEvent('CompleteRegistration', {
    registration_method: 'email'
  });
  await analytics().logEvent(SIGN_UP, {
    userName: user != null ? (user.names + ' ' + user.last_names) : 'Usuario anónimo',
    userEmail: user != null ? user.email : '',
    userId: user != null ? user.uid : '0',
    platform: Platform.OS,
    date: new Date().toLocaleString(),
  });
}

export const createProductEvent = async (user, pid) => {
  AppEventsLogger.logEvent(CREATE_PRODUCT);
  await analytics().logEvent(CREATE_PRODUCT, {
    userName: user != null ? (user.names + ' ' + user.last_names) : 'Usuario anónimo',
    userEmail: user != null ? user.email : '',
    userId: user != null ? user.uid : '0',
    productId: pid,
    platform: Platform.OS,
    date: new Date().toLocaleString(),
  });
}

export const createTillEvent = async (user, type) => {
  AppEventsLogger.logEvent(CASH_MANAGEMENT);
  await analytics().logEvent(CASH_MANAGEMENT, {
    userName: user != null ? (user.names + ' ' + user.last_names) : 'Usuario anónimo',
    userEmail: user != null ? user.email : '',
    userId: user != null ? user.uid : '0',
    type,
    platform: Platform.OS,
    date: new Date().toLocaleString(),
  });
}