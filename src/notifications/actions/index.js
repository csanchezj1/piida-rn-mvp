import {Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import TokenAPI from '../../api/token'
import DeviceAPI from '../../api/firebaseToken';

import {
  NOTIFICATION_RECEIVED,
  COMMON_FIREBASE_TOKEN_ID,
  NOTIFICATION_INIT_ROUTE
} from '../../utils/constants.js';

export const registerToken = (userID) => {
  return (dispatch) => {
    messaging().getToken()
      .then(fcmToken => {
        if (fcmToken) {
          TokenAPI.getToken()
          .then(token => {
            DeviceAPI.saveFCM(token, userID, fcmToken, Platform.OS)
            .then(firebaseId =>{
              dispatch({type: COMMON_FIREBASE_TOKEN_ID, payload: firebaseId.id});
            })
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