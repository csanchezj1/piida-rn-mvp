import {
  CHANGE_PASS_PASSWORD_CHANGE,
  CHANGE_PASS_CONFIRM_PASSWORD_CHANGE,
  CHANGE_PASS_SEND_CLEAR,
  CHANGE_PASS_FORM_FAIL,
} from '../../../utils/constants';

const initialState = {
  pass: null,
  confirmPass: null,
  errors:null
};

const changePassData = (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_PASS_PASSWORD_CHANGE:
      return { ...state, pass: action.payload };
    case CHANGE_PASS_CONFIRM_PASSWORD_CHANGE:
      return { ...state, confirmPass: action.payload };
    case CHANGE_PASS_FORM_FAIL:
      return { ...state, errors: action.payload };
    case CHANGE_PASS_SEND_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default changePassData;