import { 
  ADD_PRODUCT_KIT_LIST,
  ADD_PRODUCT_KIT_LIST_OFFSET,
  ADD_PRODUCT_KIT_REQUEST_MADE,
  ADD_PRODUCT_KIT_SHOW_LOADER,
  ADD_PRODUCT_KIT_TEXT_CHANGE,
  ADD_PRODUCT_KIT_SEARCH_BTN,
  ADD_PRODUCT_KIT_CLEAR
} from '../../../utils/constants';

const initialState = {
  list: null,
  requestMade: false,
  offset:0,
  showLoader:false,
  text:null,
  searchButton:[],
};

const addProductKitData = (state = initialState, action) => {
  switch (action.type) {
    case ADD_PRODUCT_KIT_LIST:
      return { ...state, list: action.payload};
    case ADD_PRODUCT_KIT_REQUEST_MADE:
      return { ...state, requestMade: action.payload};
    case ADD_PRODUCT_KIT_LIST_OFFSET:
      return { ...state, offset: action.payload};
    case ADD_PRODUCT_KIT_SHOW_LOADER:
      return { ...state, showLoader: action.payload};
    case ADD_PRODUCT_KIT_TEXT_CHANGE:
      return { ...state, text: action.payload};
    case ADD_PRODUCT_KIT_SEARCH_BTN:
      return { ...state, searchButton: action.payload};
    case ADD_PRODUCT_KIT_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
};

export default addProductKitData;