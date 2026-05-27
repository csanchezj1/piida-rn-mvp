import {
  COMMON_LOGOUT,
  COMMON_LOGIN,
  COMMON_PASSWORD,
  COMMON_FIREBASE_TOKEN_ID,
  USER_BRANCH_PATCH,
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
    case USER_BRANCH_PATCH:
      // Parche menor del user.branch_office* sin pasar por login. Lo usa
      // `setActiveBranch` para que las pantallas que muestran el nombre de
      // la sucursal lo vean actualizado al instante (sin esperar relogin).
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          branch_office: action.payload?.id ?? state.user.branch_office,
          branch_office_name: action.payload?.name ?? state.user.branch_office_name,
          branch_office_phone: action.payload?.phone ?? state.user.branch_office_phone,
          branch_office_address: action.payload?.address ?? state.user.branch_office_address,
        },
      };
    case COMMON_LOGOUT:
      return { ...initialState };
    default:
      return state;
  }
};

export default userData;