import API from '../../../api/api';
import Movements from '../../../api/movements';

import {
  INVENTORY_LIST,
  INVENTORY_TOTAL,
  INVENTORY_REQUEST_MADE,
  INVENTORY_SHOW_LOADER,
  INVENTORY_LIST_OFFSET,
  INVENTORY_SHOW_REFRESH,
  HOME_BUTTON_STATE,
} from '../../../utils/constants';

export const getInventory = (uid) => {
  return(dispatch) =>{
    Movements.getInventory(uid)
    .then((res) => {
      dispatch({ type: INVENTORY_TOTAL, payload: res });
    });
  }
};

export const inventoryByCategory = (uid) => {
  return(dispatch) =>{
    Movements.inventoryByCategory(uid)
    .then((res) => {
      dispatch({ type: INVENTORY_TOTAL, payload: res });
    });
  }
};

export const changeState = (state) => {
  return(dispatch) =>{
    dispatch({ type: HOME_BUTTON_STATE, payload: state });
  }
};

export const getMovements = (pp_id, resetOffset) => {
  return(dispatch, getState) =>{
    const { offset,  list, requestMade} = getState().inventoryData;
    dispatch({type: INVENTORY_SHOW_REFRESH, payload: false});
    if(resetOffset){
      dispatch({type: INVENTORY_LIST, payload: null}); 
    }
    let currentOffset = resetOffset ? 0 : offset;
    if(!requestMade || resetOffset){
      dispatch({type: INVENTORY_REQUEST_MADE, payload: true});
      dispatch({type: INVENTORY_SHOW_LOADER, payload: true});
      API.getMovementsWarehouse(pp_id, currentOffset)
      .then(response =>{
        dispatch({type: INVENTORY_SHOW_LOADER, payload: false});
        let currentList = resetOffset ? null : list;
        if(currentList != null){
          if(response.length > 0){
            var nextOffset = currentOffset + 10;
            dispatch({type: INVENTORY_LIST_OFFSET, payload: nextOffset});
            dispatch({type: INVENTORY_REQUEST_MADE, payload: false});

            response.map(item => {
              const index = currentList.findIndex(e => e.date == item.created);
              if(index !== -1){
                currentList[index].children.push(item)
              }
              else{
                currentList.push({
                  date:item.created,
                  children:[item]
                })
              }
            })

            dispatch({type: INVENTORY_LIST, payload: currentList});
          }
        }
        else{
          var nextOffset = currentOffset + 10;
          dispatch({type: INVENTORY_LIST_OFFSET, payload: nextOffset});
          dispatch({type: INVENTORY_REQUEST_MADE, payload: false});
          let element = [];
          response.map(item => {
            const index = element.findIndex(e => e.date == item.created);
            if(index !== -1){
              element[index].children.push(item)
            }
            else{
              element.push({
                date:item.created,
                children:[item]
              })
            }
          })
          dispatch({type: INVENTORY_LIST, payload: element});
        }
      })
      .catch(() => {

      })
    }
  }
};

export const clear = () => {
  return(dispatch) =>{
    dispatch({ type: INVENTORY_LIST, payload: null });
    dispatch({ type: INVENTORY_TOTAL, payload: [] });
  }
};