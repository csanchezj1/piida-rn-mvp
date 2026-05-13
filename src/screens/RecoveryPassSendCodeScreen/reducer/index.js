import {
  RECOVER_PASS_SEND_CODE_CHANGE,
  RECOVER_PASS_SEND_CLEAR,
  RECOVER_PASS_SEND_FORM_FAIL,
} from '../../../utils/constants';

const initialState = {
  code: null,
  errors:null
};

const recoveryPassSendCodeData = (state = initialState, action) => {
  switch (action.type) {
    case RECOVER_PASS_SEND_CODE_CHANGE:
      return { ...state, code: action.payload };
    case RECOVER_PASS_SEND_FORM_FAIL:
      return { ...state, errors: action.payload };
    case RECOVER_PASS_SEND_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default recoveryPassSendCodeData;