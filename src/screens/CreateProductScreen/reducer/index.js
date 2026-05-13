import {
  CREATE_PRODUCT_NAME_CHANGE,
  CREATE_PRODUCT_CODE_CHANGE,
  CREATE_PRODUCT_PRICE_CHANGE,
  CREATE_PRODUCT_FORM_FAIL,
  CREATE_PRODUCT_CLEAR,
  CREATE_PRODUCT_AUNAP_CHANGE,
  CREATE_PRODUCT_ENGLISH_CHANGE,
  CREATE_PRODUCT_SCIENTIST_CHANGE,
  CREATE_PRODUCT_SIZE_CHANGE,
  CREATE_PRODUCT_AQUARIUM_CHANGE,
  CREATE_PRODUCT_STATUS_CHANGE,
  CREATE_PRODUCT_QTY_CHANGE,
  CREATE_PRODUCT_COLOR_CHANGE,
  CREATE_PRODUCT_REF_CHANGE,
  CREATE_PRODUCT_BRAND_CHANGE,
  CREATE_PRODUCT_TYPE_CHANGE, 
  CREATE_PRODUCT_DATE_CHANGE, 
  CREATE_PRODUCT_COST_CHANGE,
} from '../../../utils/constants';

const initialState = {
  name: null,
  code:null,
  price:null,
  errors:null,
  codeAunap:null,
  englishName:null,
  scientistName:null,
  size:null,
  aquarium:null,
  status:null,
  qty:null,
  color:null,
  ref:null,
  brand:null,
  type:null,
  date:null,
  cost:null
};

const createProductData = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_PRODUCT_NAME_CHANGE:
      return { ...state, name: action.payload };
    case CREATE_PRODUCT_CODE_CHANGE:
      return { ...state, code: action.payload };
    case CREATE_PRODUCT_PRICE_CHANGE:
      return { ...state, price: action.payload };
    case CREATE_PRODUCT_AUNAP_CHANGE:
      return { ...state, codeAunap: action.payload };
    case CREATE_PRODUCT_ENGLISH_CHANGE:
      return { ...state, englishName: action.payload };
    case CREATE_PRODUCT_SCIENTIST_CHANGE:
      return { ...state, scientistName: action.payload };
    case CREATE_PRODUCT_SIZE_CHANGE:
      return { ...state, size: action.payload };
    case CREATE_PRODUCT_AQUARIUM_CHANGE:
      return { ...state, aquarium: action.payload };
    case CREATE_PRODUCT_STATUS_CHANGE:
      return { ...state, status: action.payload };
    case CREATE_PRODUCT_QTY_CHANGE:
      return { ...state, qty: action.payload };
    case CREATE_PRODUCT_COLOR_CHANGE:
      return { ...state, color: action.payload };
    case CREATE_PRODUCT_REF_CHANGE:
      return { ...state, ref: action.payload };
    case CREATE_PRODUCT_QTY_CHANGE:
      return { ...state, qty: action.payload };
    case CREATE_PRODUCT_TYPE_CHANGE:
      return { ...state, type: action.payload };
    case CREATE_PRODUCT_BRAND_CHANGE:
      return { ...state, brand: action.payload };
    case CREATE_PRODUCT_DATE_CHANGE:
      return { ...state, date: action.payload };
    case CREATE_PRODUCT_COST_CHANGE:
        return { ...state, cost: action.payload };
    case CREATE_PRODUCT_FORM_FAIL:
      return { ...state, errors: action.payload };
    case CREATE_PRODUCT_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default createProductData;