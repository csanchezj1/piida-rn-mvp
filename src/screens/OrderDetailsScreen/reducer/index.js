import { 
    ORDER_DETAILS_ITEMS
  } from '../../../utils/constants';
  
  const initialState = {
    items: null,
  };
  
  const orderDetailsData = (state = initialState, action) => {
    switch (action.type) {
      case ORDER_DETAILS_ITEMS:
        return { ...state, items: action.payload};
      default:
        return state;
    }
  };
  
  export default orderDetailsData;