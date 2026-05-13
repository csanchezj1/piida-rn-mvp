import { 
  PRODUCT_CATEGORIES_LIST,
  PRODUCT_CATEGORIES_LIST_OFFSET,
  PRODUCT_CATEGORIES_REQUEST_MADE,
  PRODUCT_CATEGORIES_SHOW_LOADER,
  PRODUCT_CATEGORIES_TEXT_CHANGE,
  PRODUCT_CATEGORIES_SEARCH_BTN,
  PRODUCT_CATEGORIES_CLEAR
} from '../../../utils/constants';

const initialState = {
  list: null,
  requestMade: false,
  offset:0,
  showLoader:false,
  text:null,
  searchButton:[],
};

const productCategoriesData = (state = initialState, action) => {
  switch (action.type) {
    case PRODUCT_CATEGORIES_LIST:
      return { ...state, list: action.payload};
    case PRODUCT_CATEGORIES_REQUEST_MADE:
      return { ...state, requestMade: action.payload};
    case PRODUCT_CATEGORIES_LIST_OFFSET:
      return { ...state, offset: action.payload};
    case PRODUCT_CATEGORIES_SHOW_LOADER:
      return { ...state, showLoader: action.payload};
    case PRODUCT_CATEGORIES_TEXT_CHANGE:
      return { ...state, text: action.payload};
    case PRODUCT_CATEGORIES_SEARCH_BTN:
      return { ...state, searchButton: action.payload};
    case PRODUCT_CATEGORIES_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
};

export default productCategoriesData;