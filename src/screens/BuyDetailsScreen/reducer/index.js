import { 
  BUY_DETAILS_ITEMS,
  BUY_DETAILS_PAYMENTS
} from '../../../utils/constants';

const initialState = {
  items:null,
  payments:[],
  paymentsChange:0,
};

const buyDetailsData = (state = initialState, action) => {
  switch (action.type) {
    case BUY_DETAILS_ITEMS:
      return { ...state, items: action.payload};
    case BUY_DETAILS_PAYMENTS:
      return { ...state, payments: action.payload, paymentsChange: new Date()};
    default:
      return state;
  }
};

export default buyDetailsData;