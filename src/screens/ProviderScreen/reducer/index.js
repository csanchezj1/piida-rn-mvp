import { 
  PROVIDER_LIST,
  PROVIDER_LIST_OFFSET,
  PROVIDER_REQUEST_MADE,
  PROVIDER_SHOW_LOADER,
  PROVIDER_TEXT_CHANGE,
  PROVIDER_SEARCH_BTN,
  PROVIDER_CLEAR
} from '../../../utils/constants';

const initialState = {
  list: null,
  requestMade: false,
  offset:0,
  showLoader:false,
  text:null,
  searchButton:[],
};

const providerData = (state = initialState, action) => {
  switch (action.type) {
    case PROVIDER_LIST:
      return { ...state, list: action.payload};
    case PROVIDER_REQUEST_MADE:
      return { ...state, requestMade: action.payload};
    case PROVIDER_LIST_OFFSET:
      return { ...state, offset: action.payload};
    case PROVIDER_SHOW_LOADER:
      return { ...state, showLoader: action.payload};
    case PROVIDER_TEXT_CHANGE:
      return { ...state, text: action.payload};
    case PROVIDER_SEARCH_BTN:
      return { ...state, searchButton: action.payload};
    case PROVIDER_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
};

export default providerData;