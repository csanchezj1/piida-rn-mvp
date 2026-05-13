import {
  CONFIRM_CASH_ORDER_CONFIRM_VALUE_CHANGE,
  CONFIRM_CASH_ORDER_CLEAR,
  CONFIRM_CASH_ORDER_FORM_FAIL,
  CONFIRM_CASH_ORDER_RETURN,
  CONFIRM_CASH_INVOICE
} from '../../../utils/constants';

const initialState = {
  value:null,
  errors:null,
  returnValue:0,
  invoice:false
};

const confirmCahsOrderData = (state = initialState, action) => {
  switch (action.type) {
    case CONFIRM_CASH_INVOICE:
      return { ...state, invoice: action.payload };
    case CONFIRM_CASH_ORDER_CONFIRM_VALUE_CHANGE:
      return { ...state, value: action.payload };
    case CONFIRM_CASH_ORDER_RETURN:
      return { ...state, returnValue: action.payload };
    case CONFIRM_CASH_ORDER_FORM_FAIL:
      return { ...state, errors: action.payload };
    case CONFIRM_CASH_ORDER_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default confirmCahsOrderData;