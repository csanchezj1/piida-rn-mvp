import {
  REMISSION_QTY_CHANGE,
  REMISSION_CLEAR,
  REMISSION_FORM_FAIL,
  REMISSION_PAYMENT_CHANGE,
  REMISSION_VALUE_CHANGE,
  REMISSION_OBS_CHANGE,
  REMISSION_PRODUCT_CHANGE,
  REMISSION_HUMIDITY_CHANGE,
  REMISSION_WAYBILL_CHANGE,
  REMISSION_WAREHOUSE_CHANGE,
  REMISSION_TRANSPORTER_CHANGE,
  REMISSION_CUSTOMER_CHANGE,
  REMISSION_TOTAL_CHANGE,
  REMISSION_ORDER_PAYMENT_CHANGE,
  REMISSION_OBSERVATIONS,
  REMISSION_PAYMENTS_QTY_CHANGE,
  REMISSION_PAYMENT_METHOD_FAIL,
  REMISSION_INVOICE_CHANGE,
} from '../../../utils/constants';

const initialState = {
  qty: null,
  errors:null,
  errorArr:[],
  value:null,
  obs:null,
  product:[],
  humidity:null,
  waybill:null,
  warehouse:null,
  transporter:null,
  customer:null,
  payment:[],
  paymentsQty:null,
  orderPayment:null,
  observations:null,
  total:0,
  changed:0,
  invoice:false
};

const remissionData = (state = initialState, action) => {
  switch (action.type) {
    case REMISSION_INVOICE_CHANGE:
      return { ...state, invoice: action.payload };
    case REMISSION_OBSERVATIONS:
      return { ...state, observations: action.payload };
    case REMISSION_QTY_CHANGE:
      return { ...state, qty: action.payload };
    case REMISSION_FORM_FAIL:
      return { ...state, errors: action.payload };
    case REMISSION_PAYMENT_METHOD_FAIL:
      return { ...state, errorArr: action.payload, changed: new Date() };
    case REMISSION_PAYMENT_CHANGE:
      return { ...state, payment: action.payload, changed: new Date() };
    case REMISSION_VALUE_CHANGE:
      return { ...state, value: action.payload };
    case REMISSION_OBS_CHANGE:
      return { ...state, obs: action.payload };
    case REMISSION_PRODUCT_CHANGE:
      return { ...state, product: action.payload, changed: new Date() };
    case REMISSION_HUMIDITY_CHANGE:
      return { ...state, humidity: action.payload };
    case REMISSION_WAYBILL_CHANGE:
      return { ...state, waybill: action.payload };
    case REMISSION_WAREHOUSE_CHANGE:
      return { ...state, warehouse: action.payload };
    case REMISSION_TRANSPORTER_CHANGE:
      return { ...state, transporter: action.payload };
    case REMISSION_CUSTOMER_CHANGE:
      return { ...state, customer: action.payload };
    case REMISSION_TOTAL_CHANGE:
      return { ...state, total: action.payload };
    case REMISSION_PAYMENTS_QTY_CHANGE:
      return { ...state, paymentsQty: action.payload };
    case REMISSION_ORDER_PAYMENT_CHANGE:
      return { ...state, orderPayment: action.payload };
    case REMISSION_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default remissionData;