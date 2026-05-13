import Movements from '../../../api/movements';

import {
  HOME_TOTAL,
  HOME_PERIOD,
} from '../../../utils/constants';

export const getBalance = () => {
  return(dispatch, getState) =>{
    const { period } = getState().homeData;
    const { user } = getState().userData;

    Movements.getTotals(user.uid, period.value)
    .then((res) => {
      dispatch({ type: HOME_TOTAL, payload: res });
    });
  }
};

export const clear = () => {
  return(dispatch) =>{
    dispatch({ type: HOME_TOTAL, payload: null });
  }
};

export const changePeriod = (period) => {
  return(dispatch) =>{
    dispatch({ type: HOME_PERIOD, payload: period });
    dispatch(getBalance());
  }
};