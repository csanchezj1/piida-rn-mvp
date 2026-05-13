import { 
    NOTIFICATIONS_LIST
  } from '../../../utils/constants';
  
  const initialState = {
    list: null,
  };
  
  const notificationsListData = (state = initialState, action) => {
    switch (action.type) {
      case NOTIFICATIONS_LIST:
        return { ...state, list: action.payload};
      default:
        return state;
    }
  };
  
  export default notificationsListData;