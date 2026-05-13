import Order from '../../../api/order';

import {
  ORDER_DETAILS_ITEMS
} from '../../../utils/constants';


export const getItems = (order) => {
  return(dispatch) =>{
    Order.getItems(order)
    .then(res => {
      dispatch({ type: ORDER_DETAILS_ITEMS, payload: res });
    })
  }
};

export const clear = () => {
  return(dispatch) =>{
    dispatch({ type: ORDER_DETAILS_ITEMS, payload: null });
  }
};