import {
  ADD_INVENTORY_LIST,
  ADD_INVENTORY_LIST_OFFSET,
  ADD_INVENTORY_REQUEST_MADE,
  ADD_INVENTORY_SHOW_LOADER,
  ADD_INVENTORY_TEXT_CHANGE,
  ADD_INVENTORY_SEARCH_BTN,
  ADD_INVENTORY_CLEAR,
  ADD_INVENTORY_PRODUCT_CHANGE,
  ADD_INVENTORY_CUSTOMER_CHANGE,
  ADD_INVENTORY_CUSTOMER_VISIBLE,
  ADD_INVENTORY_PRODUCT_SELECTED
} from '../../../utils/constants';

const initialState = {
  list: null,
  requestMade: false,
  offset:0,
  showLoader:false,
  text:null,
  searchButton:[],
  product:[],
  customer:null,
  customerVisible:false,
  productSelected:null
};

const addInventoryData = (state = initialState, action) => {
  switch (action.type) {
    case ADD_INVENTORY_LIST:
      return { ...state, list: action.payload};
    case ADD_INVENTORY_REQUEST_MADE:
      return { ...state, requestMade: action.payload};
    case ADD_INVENTORY_LIST_OFFSET:
      return { ...state, offset: action.payload};
    case ADD_INVENTORY_SHOW_LOADER:
      return { ...state, showLoader: action.payload};
    case ADD_INVENTORY_TEXT_CHANGE:
      return { ...state, text: action.payload};
    case ADD_INVENTORY_SEARCH_BTN:
      return { ...state, searchButton: action.payload};
    case ADD_INVENTORY_PRODUCT_CHANGE:
      return { ...state, product: action.payload, changed: new Date() };
    case ADD_INVENTORY_CUSTOMER_CHANGE:
      return { ...state, customer: action.payload };
    case ADD_INVENTORY_CUSTOMER_VISIBLE:
      return { ...state, customerVisible: action.payload };
    case ADD_INVENTORY_PRODUCT_SELECTED:
      return { ...state, productSelected: action.payload };
    case ADD_INVENTORY_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default addInventoryData;