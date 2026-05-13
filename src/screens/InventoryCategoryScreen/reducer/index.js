import {
  INVENTORY_CATEGORY_SHOW_REFRESH,
  INVENTORY_CATEGORY_LIST,
  INVENTORY_CATEGORY_REQUEST_MADE,
  INVENTORY_CATEGORY_SHOW_LOADER,
  INVENTORY_CATEGORY_LIST_OFFSET,
  INVENTORY_CATEGORY_TEXT,
  INVENTORY_CATEGORY_SEARCH
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
};

const inventoryCategoryData = (state = initialState, action) => {
  switch (action.type) {
    case INVENTORY_CATEGORY_LIST:
      return { ...state, list: action.payload, listChanged: new Date().getMilliseconds()};
    case INVENTORY_CATEGORY_REQUEST_MADE:
      return { ...state, requestMade: action.payload};
    case INVENTORY_CATEGORY_SHOW_LOADER:
      return { ...state, showLoader: action.payload};
    case INVENTORY_CATEGORY_SHOW_REFRESH:
      return { ...state, showRrefresh: action.payload};
    case INVENTORY_CATEGORY_LIST_OFFSET:
      return { ...state, offset: action.payload};
    case INVENTORY_CATEGORY_TEXT:
      return { ...state, text: action.payload};
    case INVENTORY_CATEGORY_SEARCH:
      return { ...state, searchButton: action.payload};
    default:
      return state;
  }
};

export default inventoryCategoryData;