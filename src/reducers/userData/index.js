import { 
  COMMON_LOGOUT,
  COMMON_LOGIN,
  COMMON_PASSWORD,
  COMMON_FIREBASE_TOKEN_ID,
} from '../../utils/constants';

const initialState = {
  user:null,
  password:null,
  firebaseToken:null
};

const userData = (state = initialState, action) => {
  switch (action.type) {
    case COMMON_LOGIN:
      return { ...state, user: action.payload};
    case COMMON_PASSWORD:
      return { ...state, password: action.payload};
    case COMMON_FIREBASE_TOKEN_ID:
      return { ...state, firebaseToken: action.payload};
    case COMMON_LOGOUT:
      return { ...initialState };
    default:
      return state;
  }
};

export default userData;