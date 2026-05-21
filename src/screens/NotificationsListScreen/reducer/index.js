import {
  NOTIFICATIONS_LIST,
  NOTIFICATIONS_UNREAD_COUNT,
} from '../../../utils/constants';

const initialState = {
  list: null,
  unreadCount: 0,
};

const notificationsListData = (state = initialState, action) => {
  switch (action.type) {
    case NOTIFICATIONS_LIST:
      return {...state, list: action.payload};
    case NOTIFICATIONS_UNREAD_COUNT:
      return {...state, unreadCount: action.payload};
    default:
      return state;
  }
};

export default notificationsListData;
