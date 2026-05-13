import {
  RECOVER_PASS_GET_MAIL_CHANGE,
  RECOVER_PASS_GET_CLEAR,
  RECOVER_PASS_GET_FORM_FAIL,
} from '../../../utils/constants';

const initialState = {
  mail: null,
  errors:null
};

const recoveryPassGetCodeData = (state = initialState, action) => {
  switch (action.type) {
    case RECOVER_PASS_GET_MAIL_CHANGE:
      return { ...state, mail: action.payload };
    case RECOVER_PASS_GET_FORM_FAIL:
      return { ...state, errors: action.payload };
    case RECOVER_PASS_GET_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default recoveryPassGetCodeData;