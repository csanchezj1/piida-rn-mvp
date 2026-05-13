import {
  NOTIFICATION_RECEIVED,
  NOTIFICATION_CLEAR,
  NOTIFICATION_INIT_ROUTE
} from '../../utils/constants.js';
  
const initialState = {
  notificationData: null,
  notificationInitRoute: 'Home',
};

const notificationsData = (state = initialState, action) => {
  switch (action.type) {
    case NOTIFICATION_RECEIVED:
      return { ...state, notificationData: action.payload};
    case NOTIFICATION_INIT_ROUTE:
      return { ...state, notificationInitRoute: action.payload};
    case NOTIFICATION_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default notificationsData;