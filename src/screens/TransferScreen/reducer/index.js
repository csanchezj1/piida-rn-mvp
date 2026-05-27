import {
  TRANSFER_BRANCH_CHANGE,
  TRANSFER_PRODUCT_CHANGE,
  TRANSFER_QTY_CHANGE,
  TRANSFER_CLEAR,
  TRANSFER_FORM_FAIL,
  TRANSFER_OBS_CHANGE,
  TRANSFER_ORIGIN_INVENTORY,
  TRANSFER_ORIGIN_LOADING,
} from '../../../utils/constants';

const initialState = {
  branch:null,
  product:[],
  qty: null,
  obs:null,
  errors:null,
  changed:null,
  originInventory: null,
  originLoading: false,
};

const transferData = (state = initialState, action) => {
  switch (action.type) {
    case TRANSFER_BRANCH_CHANGE:
      return { ...state, branch: action.payload };
    case TRANSFER_PRODUCT_CHANGE:
      return { ...state, product: action.payload, changed: new Date() };
    case TRANSFER_QTY_CHANGE:
      return { ...state, qty: action.payload };
    case TRANSFER_OBS_CHANGE:
      return { ...state, obs: action.payload };
    case TRANSFER_FORM_FAIL:
      return { ...state, errors: action.payload };
    case TRANSFER_ORIGIN_INVENTORY:
      return { ...state, originInventory: action.payload };
    case TRANSFER_ORIGIN_LOADING:
      return { ...state, originLoading: action.payload };
    case TRANSFER_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default transferData;