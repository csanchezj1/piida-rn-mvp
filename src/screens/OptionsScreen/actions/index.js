import {
  REGISTER_APP_GOAL_CHANGE,
  REGISTER_APP_GOAL_TEXT_CHANGE
} from '../../../utils/constants';

export const selectOption = (item) => {
  return(dispatch, getState) =>{
    const { appGoal } = getState().registerData;
    const index = appGoal.findIndex(e => e.value == item.value);
    if(index === -1){
      appGoal.push(item);
    }
    else{
      appGoal.splice(index, 1)
    }
    dispatch({type: REGISTER_APP_GOAL_CHANGE, payload:appGoal});
    dispatch({ type: REGISTER_APP_GOAL_TEXT_CHANGE, payload: null });
  }
};