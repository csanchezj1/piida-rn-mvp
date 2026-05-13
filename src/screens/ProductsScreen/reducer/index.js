import { 
  PRODUCTS_LIST,
  PRODUCTS_REQUEST_MADE,
  PRODUCTS_SHOW_LOADER,
  PRODUCTS_SHOW_REFRESH,
  PRODUCTS_LIST_OFFSET,
  PRODUCTS_CLEAR,
  PRODUCTS_SEARCH_BTN,
  PRODUCTS_TEXT_CHANGE
} from '../../../utils/constants';
  
  const initialState = {
    list: null,
    requestMade: false,
    offset:0,
    showLoader:false,
    showRrefresh:false,
    listChanged:0,
    text:null,
    searchButton:[],
    changed:null
  };
  
  const productsData = (state = initialState, action) => {
    switch (action.type) {
      case PRODUCTS_LIST:
        return { ...state, list: action.payload};
      case PRODUCTS_REQUEST_MADE:
        return { ...state, requestMade: action.payload};
      case PRODUCTS_SHOW_LOADER:
        return { ...state, showLoader: action.payload};
      case PRODUCTS_SHOW_REFRESH:
        return { ...state, showRrefresh: action.payload};
      case PRODUCTS_LIST_OFFSET:
        return { ...state, offset: action.payload};
      case PRODUCTS_TEXT_CHANGE:
        return { ...state, text: action.payload};
      case PRODUCTS_SEARCH_BTN:
        return { ...state, searchButton: action.payload, changed:new Date()};
      case PRODUCTS_CLEAR:
        return { ...initialState };
      default:
        return state;
    }
  };
  
  export default productsData;