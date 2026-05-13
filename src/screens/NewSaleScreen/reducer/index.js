import customer from '../../../api/customer';
import {
  NEW_SALE_LIST,
  NEW_SALE_LIST_OFFSET,
  NEW_SALE_REQUEST_MADE,
  NEW_SALE_SHOW_LOADER,
  NEW_SALE_TEXT_CHANGE,
  NEW_SALE_SEARCH_BTN,
  NEW_SALE_CLEAR,
  NEW_SALE_FORM_FAIL,
  NEW_SALE_PRODUCT_CHANGE,
  NEW_SALE_TOTAL_CHANGE,
  NEW_SALE_CUSTOMER_CHANGE,
  NEW_SALE_CUSTOMER_VISIBLE,
  NEW_SALE_PRODUCT_SELECTED
} from '../../../utils/constants';

const initialState = {
  list: null,
  requestMade: false,
  offset:0,
  showLoader:false,
  text:null,
  searchButton:[],
  errors:null,
  product:[],
  total:0,
  customer:null,
  customerVisible:false,
  productSelected:null
};

const newSaleData = (state = initialState, action) => {
  switch (action.type) {
    case NEW_SALE_LIST:
      return { ...state, list: action.payload};
    case NEW_SALE_REQUEST_MADE:
      return { ...state, requestMade: action.payload};
    case NEW_SALE_LIST_OFFSET:
      return { ...state, offset: action.payload};
    case NEW_SALE_SHOW_LOADER:
      return { ...state, showLoader: action.payload};
    case NEW_SALE_TEXT_CHANGE:
      return { ...state, text: action.payload};
    case NEW_SALE_SEARCH_BTN:
      return { ...state, searchButton: action.payload};
    case NEW_SALE_FORM_FAIL:
      return { ...state, errors: action.payload };
    case NEW_SALE_PRODUCT_CHANGE:
      return { ...state, product: action.payload, changed: new Date() };
    case NEW_SALE_TOTAL_CHANGE:
      return { ...state, total: action.payload };
    case NEW_SALE_CUSTOMER_CHANGE:
      return { ...state, customer: action.payload };
    case NEW_SALE_CUSTOMER_VISIBLE:
      return { ...state, customerVisible: action.payload };
    case NEW_SALE_PRODUCT_SELECTED:
      return { ...state, productSelected: action.payload };
    case NEW_SALE_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default newSaleData;