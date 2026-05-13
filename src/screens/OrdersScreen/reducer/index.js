import { 
  ORDERS_LIST,
  ORDERS_REQUEST_MADE,
  ORDERS_SHOW_LOADER,
  ORDERS_SHOW_REFRESH,
  ORDERS_LIST_OFFSET,
  ORDERS_TAB_ACTIVE,
  ORDERS_AUTO_VALUE
} from '../../../utils/constants';

const initialState = {
  list: null,
  requestMade: false,
  offset:0,
  showLoader:false,
  showRrefresh:false,
  tabActive:'history',
  listChanged:0,
  autoValue:null,
};

const ordersData = (state = initialState, action) => {
  switch (action.type) {
    case ORDERS_LIST:
      return { ...state, list: action.payload, listChanged:new Date()};
    case ORDERS_REQUEST_MADE:
      return { ...state, requestMade: action.payload};
    case ORDERS_SHOW_LOADER:
      return { ...state, showLoader: action.payload};
    case ORDERS_SHOW_REFRESH:
      return { ...state, showRrefresh: action.payload};
    case ORDERS_LIST_OFFSET:
      return { ...state, offset: action.payload};
    case ORDERS_TAB_ACTIVE:
      return { ...state, tabActive: action.payload};
    case ORDERS_AUTO_VALUE:
      return { ...state, autoValue: action.payload};
    default:
      return state;
  }
};

export default ordersData;