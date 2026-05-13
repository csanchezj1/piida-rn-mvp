import {
  PAY_ORDER_FORM_FAIL,
  PAY_ORDER_VALUE_CHANGE,
  PAY_ORDER_PAYMENT_CHANGE,
  PAY_ORDER_CLEAR,
  PAY_ORDER_ITEMS,
  PAY_ORDER_QTY_CHANGE,
  PAY_ORDER_PAYMENT_METHOD_FAIL
} from '../../../utils/constants';

const initialState = {
  errors:null,
  value:null,
  payment:[],
  errorArr:[],
  items:null,
  paymentsQty:null,
  change:0
};

const payOrderData = (state = initialState, action) => {
  switch (action.type) {
    case PAY_ORDER_FORM_FAIL:
      return { ...state, errors: action.payload };
    case PAY_ORDER_VALUE_CHANGE:
      return { ...state, value: action.payload };
    case PAY_ORDER_PAYMENT_CHANGE:
      return { ...state, payment: action.payload, change: new Date()  };
    case PAY_ORDER_ITEMS:
      return { ...state, items: action.payload };
    case PAY_ORDER_QTY_CHANGE:
      return { ...state, paymentsQty: action.payload};
    case PAY_ORDER_PAYMENT_METHOD_FAIL:
      return { ...state, errorArr: action.payload, change: new Date() };
    case PAY_ORDER_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default payOrderData;