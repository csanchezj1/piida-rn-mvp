import { 
  COMMON_GENDER,
  COMMON_PRODUCTS,
  COMMON_PAYMENT_TYPES,
  COMMON_ORDER_PAYMENT_TYPES,
  COMMON_EXPENSE_TYPE,
  COMMON_OPERATION_TIME,
  COMMON_BUSINESS_TYPE,
  COMMON_APP_GOALS,
  COMMON_FINANCE_MANAGEMENT,
  COMMON_ID_TYPES
} from '../../utils/constants';

const initialState = {
  genders:[],
  products:[],
  paymentsType:[],
  orderPaymentsType:[],
  expenseType:[],
  businessType:[],
  operationTime:[],
  appGoals:[],
  financeManagement:[],
  idTypes:[],
  fieldChange:0
};

const fieldsData = (state = initialState, action) => {
  switch (action.type) {
    case COMMON_GENDER:
      return { ...state, genders: action.payload, fieldChange:new Date()};
    case COMMON_EXPENSE_TYPE:
      return { ...state, expenseType: action.payload, fieldChange:new Date()};
    case COMMON_PRODUCTS:
      return { ...state, products: action.payload, fieldChange:new Date()};
    case COMMON_PAYMENT_TYPES:
      return { ...state, paymentsType: action.payload, fieldChange:new Date()};
    case COMMON_ORDER_PAYMENT_TYPES:
      return { ...state, orderPaymentsType: action.payload, fieldChange:new Date()};
    case COMMON_OPERATION_TIME:
      return { ...state, operationTime: action.payload, fieldChange:new Date()};
    case COMMON_BUSINESS_TYPE:
      return { ...state, businessType: action.payload, fieldChange:new Date()};
    case COMMON_APP_GOALS:
      return { ...state, appGoals: action.payload, fieldChange:new Date()};
    case COMMON_FINANCE_MANAGEMENT:
      return { ...state, financeManagement: action.payload, fieldChange:new Date()};
    case COMMON_ID_TYPES:
      return { ...state, idTypes: action.payload, fieldChange:new Date()};
    default:
      return state;
  }
};

export default fieldsData;