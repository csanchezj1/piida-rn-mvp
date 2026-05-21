import {Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import TokenAPI from '../../api/token'
import DeviceAPI from '../../api/firebaseToken';
import NotificationsAPI from '../../api/notifications';

import {
  NOTIFICATION_RECEIVED,
  COMMON_FIREBASE_TOKEN_ID,
  NOTIFICATION_INIT_ROUTE
} from '../../utils/constants.js';

// Registra el FCM token contra:
// - Endpoint legacy Drupal (firebase_token) por compat.
// - Endpoint nuevo NestJS (POST /api/v2/devices) que es lo que F5 usa
//   para despachar push desde el back NestJS.
export const registerToken = (userID) => {
  return (dispatch, getState) => {
    messaging().getToken()
      .then(fcmToken => {
        if (!fcmToken) return;

        // 1. Legacy Drupal (compat — eliminar después del cutover total).
        TokenAPI.getToken()
          .then(token => {
            DeviceAPI.saveFCM(token, userID, fcmToken, Platform.OS)
              .then(firebaseId => {
                dispatch({type: COMMON_FIREBASE_TOKEN_ID, payload: firebaseId.id});
              })
              .catch(() => undefined);
          })
          .catch(() => undefined);

        // 2. NestJS /api/v2/devices — necesita email+password del state.
        const {user, password} = getState().userData || {};
        if (user?.email && password) {
          const platform =
            Platform.OS === 'ios' ? 'IOS' : Platform.OS === 'web' ? 'WEB' : 'ANDROID';
          NotificationsAPI.registerDevice({
            email: user.email,
            password,
            token: fcmToken,
            platform,
          }).catch((err) => {
            console.log('[FCM] registerDevice err:', err?.data?.error || err?.message || err);
          });
        }
      });
  };
};

export const getNotification = (notification) => {
  return(dispatch) => {
    dispatch({type: NOTIFICATION_RECEIVED, payload: notification});
  }
} 

export const setInitialRoute = (notification) => {
  return(dispatch) => {
    switch(notification.data.id){
      case 'enlist':
      case 'inwalking':
      case 'deliver':
      case 'cancel':
        dispatch({type: NOTIFICATION_INIT_ROUTE, payload: 'Orders'});
        break;
    }
  }
} 