import {
  INVENTORY_LIST_SHOW_REFRESH,
  INVENTORY_LIST_LIST,
  INVENTORY_LIST_REQUEST_MADE,
  INVENTORY_LIST_SHOW_LOADER,
  INVENTORY_LIST_LIST_OFFSET,
  INVENTORY_LIST_TEXT,
  INVENTORY_LIST_SEARCH
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

const inventroyListData = (state = initialState, action) => {
  switch (action.type) {
    case INVENTORY_LIST_LIST:
      return { ...state, list: action.payload, listChanged: new Date().getMilliseconds()};
    case INVENTORY_LIST_REQUEST_MADE:
      return { ...state, requestMade: action.payload};
    case INVENTORY_LIST_SHOW_LOADER:
      return { ...state, showLoader: action.payload};
    case INVENTORY_LIST_SHOW_REFRESH:
      return { ...state, showRrefresh: action.payload};
    case INVENTORY_LIST_LIST_OFFSET:
      return { ...state, offset: action.payload};
    case INVENTORY_LIST_TEXT:
      return { ...state, text: action.payload};
    case INVENTORY_LIST_SEARCH:
      return { ...state, searchButton: action.payload};
    default:
      return state;
  }
};

export default inventroyListData;