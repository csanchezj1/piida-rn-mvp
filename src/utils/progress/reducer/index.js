import {
  PROGRESS_VISIBLE_CHANGE,
  PROGRESS_MESSAGE_CHANGE,
  PROGRESS_SIZE_CHANGE,
  PROGRESS_CLEAR,
  COMMON_LOGOUT,
} from '../../constants';

const initialState = {
  visible: false,
  message: 'Por favor espera...',
  size: 'large',
};

const progressData = (state = initialState, action) => {
  switch (action.type) {
    case PROGRESS_VISIBLE_CHANGE:
      return { ...state, visible: action.payload  };
    case PROGRESS_MESSAGE_CHANGE:
      return { ...state, message: action.payload };
    case PROGRESS_SIZE_CHANGE:
      return { ...state, size: action.payload };
    case COMMON_LOGOUT:
      return { ...initialState };
    case PROGRESS_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
};

export default progressData;