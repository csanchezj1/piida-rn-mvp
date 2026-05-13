import { 
  HOME_TOTAL,
  HOME_BUTTON_STATE,
  HOME_PERIOD
} from '../../../utils/constants';

const initialState = {
  total:null,
  showRrefresh:false,
  buttonState:true,
  period:{
    label:'Mes actual',
    value:'month'
  },
};

const homeData = (state = initialState, action) => {
  switch (action.type) {
    case HOME_TOTAL:
      return { ...state, total: action.payload};
    case HOME_BUTTON_STATE:
      return { ...state, buttonState: action.payload};
    case HOME_PERIOD:
      return { ...state, period: action.payload};
    default:
      return state;
  }
};

export default homeData;