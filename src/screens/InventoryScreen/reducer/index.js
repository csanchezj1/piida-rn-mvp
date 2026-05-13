import { 
  INVENTORY_LIST,
  INVENTORY_TOTAL,
  INVENTORY_REQUEST_MADE,
  INVENTORY_SHOW_LOADER,
  INVENTORY_LIST_OFFSET,
  INVENTORY_SHOW_REFRESH
} from '../../../utils/constants';

const initialState = {
  list: null,
  total: [],
  changeTotal:0,
  requestMade: false,
  offset:0,
  showLoader:false,
  showRrefresh:false,
};

const inventoryData = (state = initialState, action) => {
  switch (action.type) {
    case INVENTORY_LIST:
      return { ...state, list: action.payload, changeTotal:new Date()};
    case INVENTORY_TOTAL:
      return { ...state, total: action.payload, changeTotal:new Date()};
    case INVENTORY_REQUEST_MADE:
      return { ...state, requestMade: action.payload};
    case INVENTORY_SHOW_LOADER:
      return { ...state, showLoader: action.payload};
    case INVENTORY_SHOW_REFRESH:
      return { ...state, showRrefresh: action.payload};
    case INVENTORY_LIST_OFFSET:
      return { ...state, offset: action.payload};
    default:
      return state;
  }
};

export default inventoryData;