import {
  BUY_QTY_CHANGE,
  BUY_CLEAR,
  BUY_FORM_FAIL,
  BUY_VALUE_CHANGE,
  BUY_OBS_CHANGE,
  BUY_PRODUCT_CHANGE,
  BUY_PAYMENT_CHANGE,
  BUY_EXPENSE_CHANGE,
  BUY_PROVIDER_CHANGE
} from '../../../utils/constants';

const initialState = {
  qty: null,
  errors:null,
  value:null,
  obs:null,
  product:[],
  payment:null,
  provider:null,
  expense:null,
  changed:null
};

const buyData = (state = initialState, action) => {
  switch (action.type) {
    case BUY_QTY_CHANGE:
      return { ...state, qty: action.payload };
    case BUY_FORM_FAIL:
      return { ...state, errors: action.payload };
    case BUY_VALUE_CHANGE:
      return { ...state, value: action.payload };
    case BUY_OBS_CHANGE:
      return { ...state, obs: action.payload };
    case BUY_PRODUCT_CHANGE:
      return { ...state, product: action.payload, changed: new Date() };
    case BUY_PAYMENT_CHANGE:
      return { ...state, payment: action.payload };
    case BUY_PROVIDER_CHANGE:
      return { ...state, provider: action.payload };
    case BUY_EXPENSE_CHANGE:
      return { ...state, expense: action.payload };
    case BUY_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default buyData;