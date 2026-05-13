import {
  BOX_MONEY_CHANGE,
  BOX_FORM_FAIL,
  BOX_CLEAR,
  BOX_SELECT_CHANGE,
  BOX_BALANCE,
  BOX_BALANCE_SHOW,
  BOX_BALANCE_TYPE_SELECTED,
  BOX_HISTORY
} from '../../../utils/constants';

const initialState = {
  money: null,
  errors:null,
  select:null,
  balance:null,
  balance_show:null,
  balance_type:null,
  history: null,
};

const boxData = (state = initialState, action) => {
  switch (action.type) {
    case BOX_MONEY_CHANGE:
      return { ...state, money: action.payload };
    case BOX_FORM_FAIL:
      return { ...state, errors: action.payload };
    case BOX_SELECT_CHANGE:
      return { ...state, select: action.payload };
    case BOX_BALANCE:
      return { ...state, balance: action.payload };
    case BOX_BALANCE_SHOW:
      return { ...state, balance_show: action.payload };
    case BOX_BALANCE_TYPE_SELECTED:
      return { ...state, balance_type: action.payload };
    case BOX_HISTORY:
      return { ...state, history: action.payload };
    case BOX_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default boxData;