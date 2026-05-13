import {
  KIT_CLEAR,
  KIT_FORM_FAIL,
  KIT_PRODUCT_CHANGE,
  KIT_TOTAL_CHANGE,
  KIT_NAME_CHANGE
} from '../../../utils/constants';

const initialState = {
  errors:null,
  pro:[],
  tot:0,
  changed:0,
  name:null
};

const kitData = (state = initialState, action) => {
  switch (action.type) {
    case KIT_FORM_FAIL:
      return { ...state, errors: action.payload };
    case KIT_PRODUCT_CHANGE:
      return { ...state, pro: action.payload, changed: new Date() };
    case KIT_TOTAL_CHANGE:
      return { ...state, tot: action.payload };
    case KIT_NAME_CHANGE:
      return { ...state, name: action.payload };
    case KIT_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default kitData;