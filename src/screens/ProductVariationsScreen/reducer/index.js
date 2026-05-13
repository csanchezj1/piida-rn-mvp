import { 
  PRODUCT_VARIATIONS_LIST,
  PRODUCT_VARIATIONS_LIST_OFFSET,
  PRODUCT_VARIATIONS_REQUEST_MADE,
  PRODUCT_VARIATIONS_SHOW_LOADER,
  PRODUCT_VARIATIONS_TEXT_CHANGE,
  PRODUCT_VARIATIONS_SEARCH_BTN,
  PRODUCT_VARIATIONS_CLEAR
} from '../../../utils/constants';

const initialState = {
  list: null,
  requestMade: false,
  offset:0,
  showLoader:false,
  text:null,
  searchButton:[],
};

const productVariationsData = (state = initialState, action) => {
  switch (action.type) {
    case PRODUCT_VARIATIONS_LIST:
      return { ...state, list: action.payload};
    case PRODUCT_VARIATIONS_REQUEST_MADE:
      return { ...state, requestMade: action.payload};
    case PRODUCT_VARIATIONS_LIST_OFFSET:
      return { ...state, offset: action.payload};
    case PRODUCT_VARIATIONS_SHOW_LOADER:
      return { ...state, showLoader: action.payload};
    case PRODUCT_VARIATIONS_TEXT_CHANGE:
      return { ...state, text: action.payload};
    case PRODUCT_VARIATIONS_SEARCH_BTN:
      return { ...state, searchButton: action.payload};
    case PRODUCT_VARIATIONS_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
};

export default productVariationsData;