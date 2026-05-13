import { 
  LOGIN_MAIL_CHANGE,
  LOGIN_PASSWORD_CHANGE,
  LOGIN_CLEAR_ERRORS,
  LOGIN_FORM_FAIL,
  LOGIN_CLEAR,
} from '../../../utils/constants';

const initialState = {
  email: null,
  password: null,
  errors: null,
};

const loginData = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_MAIL_CHANGE:
      return { ...state, email: action.payload };
    case LOGIN_PASSWORD_CHANGE:
      return { ...state, password: action.payload };
    case LOGIN_FORM_FAIL:
      return { ...state, errors: action.payload };
    case LOGIN_CLEAR_ERRORS:
      return { ...state, errors: null};
    case LOGIN_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
};

export default loginData;