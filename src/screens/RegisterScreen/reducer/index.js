import { 
  REGISTER_MAIL_CHANGE,
  REGISTER_PASSWORD_CHANGE,
  REGISTER_CLEAR_ERRORS,
  REGISTER_FORM_FAIL,
  REGISTER_CLEAR,
  REGISTER_NAME_CHANGE,
  REGISTER_LAST_NAME_CHANGE,
  REGISTER_ID_CHANGE,
  REGISTER_PHONE_CHANGE,
  REGISTER_COMPANY_CHANGE,
  REGISTER_OPERATION_CHANGE,
  REGISTER_BUSINESS_CHANGE,
  REGISTER_WEB_CHANGE,
  REGISTER_FINANCE_CHANGE,
  REGISTER_APP_GOAL_CHANGE,
  REGISTER_ROLE_CHANGE,
  REGISTER_BUSINESS_TEXT_CHANGE,
  REGISTER_FINANCE_TEXT_CHANGE,
  REGISTER_APP_GOAL_TEXT_CHANGE,
  REGISTER_POSITION_CHANGE
} from '../../../utils/constants';

const initialState = {
  name:null,
  lastName:null,
  email:null,
  idNumber:null,
  phone:null,
  company:null,
  password: null,
  errors: null,
  operation:null,
  business:null,
  businessText:null,
  web:null,
  finance:null,
  financeText:null,
  appGoal:[],
  appGoalText:null,
  changeOpt:0,
  role:null,
  position:null
};

const registerData = (state = initialState, action) => {
  switch (action.type) {
    case REGISTER_NAME_CHANGE:
      return { ...state, name: action.payload };
    case REGISTER_LAST_NAME_CHANGE:
      return { ...state, lastName: action.payload };
    case REGISTER_MAIL_CHANGE:
      return { ...state, email: action.payload };
    case REGISTER_ID_CHANGE:
      return { ...state, idNumber: action.payload };
    case REGISTER_PHONE_CHANGE:
      return { ...state, phone: action.payload };
    case REGISTER_COMPANY_CHANGE:
      return { ...state, company: action.payload };
    case REGISTER_PASSWORD_CHANGE:
      return { ...state, password: action.payload };
    case REGISTER_OPERATION_CHANGE:
      return { ...state, operation: action.payload };
    case REGISTER_BUSINESS_CHANGE:
      return { ...state, business: action.payload };
    case REGISTER_BUSINESS_TEXT_CHANGE:
      return { ...state, businessText: action.payload };
    case REGISTER_WEB_CHANGE:
      return { ...state, web: action.payload };
    case REGISTER_FINANCE_CHANGE:
      return { ...state, finance: action.payload };
    case REGISTER_FINANCE_TEXT_CHANGE:
      return { ...state, financeText: action.payload };
    case REGISTER_APP_GOAL_CHANGE:
      return { ...state, appGoal: action.payload, changeOpt:new Date() };
    case REGISTER_APP_GOAL_TEXT_CHANGE:
      return { ...state, appGoalText: action.payload };
    case REGISTER_ROLE_CHANGE:
      return { ...state, role: action.payload };
    case REGISTER_POSITION_CHANGE:
      return { ...state, position: action.payload };
    case REGISTER_FORM_FAIL:
      return { ...state, errors: action.payload };
    case REGISTER_CLEAR_ERRORS:
      return { ...state, errors: null};
    case REGISTER_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
};

export default registerData;