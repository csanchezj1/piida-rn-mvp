import { 
  NAVIGATION_SHOW_DRAWER,
  NAVIGATION_DIALOG_VISILE
} from '../../utils/constants';

const initialState = {
  showDrawer: false,
  visible:false,
};

const navigationData = (state = initialState, action) => {
  switch (action.type) {
    case NAVIGATION_SHOW_DRAWER:
      return { ...state, showDrawer: action.payload};
    case NAVIGATION_DIALOG_VISILE:
      return { ...state, visible: action.payload};
    default:
      return state;
  }
};

export default navigationData;