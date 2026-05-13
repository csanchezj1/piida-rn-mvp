import { 
    SPLASHSCREEN_IS_LOADING,
  } from '../../../utils/constants';
  
  const initialState = {
    isLoading : true,
  };
  
  const splashscreenData = (state = initialState, action) => {
    switch (action.type) {
      case SPLASHSCREEN_IS_LOADING:
        return { ...state, isLoading: action.payload};
      default:
        return state;
    }
  };
  
  export default splashscreenData;