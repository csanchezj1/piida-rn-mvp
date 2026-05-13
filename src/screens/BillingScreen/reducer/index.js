import {
  BILLING_LOAD,
  BILLING_LOADING,
  BILLING_ERROR,
  BILLING_CLEAR,
  BILLING_BUSY,
} from '../../../utils/constants';

const initialState = {
  plans: [],
  cards: [],
  subscription: null,
  loading: false,
  busy: false,
  error: null,
};

const billingData = (state = initialState, action) => {
  switch (action.type) {
    case BILLING_LOAD:
      return {...state, ...action.payload};
    case BILLING_LOADING:
      return {...state, loading: action.payload};
    case BILLING_BUSY:
      return {...state, busy: action.payload};
    case BILLING_ERROR:
      return {...state, error: action.payload};
    case BILLING_CLEAR:
      return {...initialState};
    default:
      return state;
  }
};

export default billingData;
