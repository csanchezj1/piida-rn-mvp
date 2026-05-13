import {
  PLAN_PRICE,
  PLAN_INFO,
  PLAN_ERROR,
  PLAN_CLEAR,
  PLAN_PLAN,
  PLAN_PLAN_SELECTED
} from '../../../utils/constants';

const initialState = {
  price:null,
  plan:null,
  error:false,
  info:null,
  planSelected:null
};

const planData = (state = initialState, action) => {
  switch (action.type) {
    case PLAN_INFO:
      return { ...state, info: action.payload };
    case PLAN_PRICE:
      return { ...state, price: action.payload };
    case PLAN_PLAN:
      return { ...state, plan: action.payload };
    case PLAN_PLAN_SELECTED:
      return { ...state, planSelected: action.payload };
    case PLAN_ERROR:
      return { ...state, error: action.payload };
    case PLAN_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default planData;