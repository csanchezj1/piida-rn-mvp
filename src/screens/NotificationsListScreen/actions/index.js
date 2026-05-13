import Notifications from '../../../api/notifications';

import {
  NOTIFICATIONS_LIST
} from '../../../utils/constants';

export const getNotifications = (uid) => {
  return(dispatch) =>{
    Notifications.getNotifications(uid)
    .then(respose => {
      dispatch({type: NOTIFICATIONS_LIST, payload:respose});
    })
  }
};

export const clear = () => {
  return(dispatch) =>{
    dispatch({type: NOTIFICATIONS_LIST, payload:null});
  }
};