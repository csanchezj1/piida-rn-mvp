import { 
  TERMS_TEXT,
} from '../../../utils/constants';

const initialState = {
  text : false,
};

const termsData = (state = initialState, action) => {
  switch (action.type) {
    case TERMS_TEXT:
      return { ...state, text: action.payload};
    default:
      return state;
  }
};

export default termsData;