import API from '../../../api/api';

import {
  ORDERS_LIST,
  ORDERS_REQUEST_MADE,
  ORDERS_SHOW_LOADER,
  ORDERS_LIST_OFFSET,
  ORDERS_SHOW_REFRESH,
  HOME_BUTTON_STATE,
  ORDERS_TAB_ACTIVE,
  ORDERS_AUTO_VALUE,
} from '../../../utils/constants';

export const changeState = (state) => {
  return(dispatch) =>{
    dispatch({ type: HOME_BUTTON_STATE, payload: state });
  }
};

export const changeTab = (state) => {
  return(dispatch) =>{
    dispatch({ type: ORDERS_AUTO_VALUE, payload: null });
    dispatch({ type: ORDERS_TAB_ACTIVE, payload: state });
    dispatch(getMovements(true))
  }
};

export const autocompleteChange = (value) => {
  return(dispatch, getState) =>{
    const { tabActive } = getState().ordersData;
    dispatch({ type: ORDERS_AUTO_VALUE, payload: value });
    if(tabActive == 'history'){
      dispatch(getOrders(true))
    }
    else{
      dispatch(getPending(true))
    }
  }
}

export const getMovements = (resetOffset) => {
  return(dispatch, getState) =>{
    const { tabActive } = getState().ordersData;
    if(tabActive == 'history'){
      dispatch(getOrders(resetOffset))
    }
    else{
      dispatch(getPending(resetOffset))
    }
  }
};

export const getOrders = (resetOffset) => {
  return(dispatch, getState) =>{
    const { offset,  list, requestMade, autoValue} = getState().ordersData;
    const { user } = getState().userData;
    dispatch({type: ORDERS_SHOW_REFRESH, payload: false}); 
    if(resetOffset){
      dispatch({type: ORDERS_LIST, payload: null}); 
    }
    let currentOffset = resetOffset ? 0 : offset;
    if(!requestMade || resetOffset){
      dispatch({type: ORDERS_REQUEST_MADE, payload: true});
      dispatch({type: ORDERS_SHOW_LOADER, payload: true});
      API.getOrders(
        user.branch_office,
        currentOffset,
        autoValue
      )
      .then(response =>{
        dispatch({type: ORDERS_SHOW_LOADER, payload: false});
        // Defensive: si la API responde algo que no es array (error/HTML), lo
        // tratamos como vacío y dejamos el estado consistente.
        if (!Array.isArray(response)) response = [];
        let currentList = resetOffset ? null : list;
        if(currentList != null){
          if(response.length > 0){
            var nextOffset = currentOffset + 10;
            dispatch({type: ORDERS_LIST_OFFSET, payload: nextOffset});
            dispatch({type: ORDERS_REQUEST_MADE, payload: false});

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

            dispatch({type: ORDERS_LIST, payload: currentList});
          }
        }
        else{
          var nextOffset = currentOffset + 10;
          dispatch({type: ORDERS_LIST_OFFSET, payload: nextOffset});
          dispatch({type: ORDERS_REQUEST_MADE, payload: false});
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
          dispatch({type: ORDERS_LIST, payload: element});
        }
      })
      .catch((err) => {
        // Sin catch, si la API rechaza, list quedaba null → shimmer infinito.
        // Forzamos lista vacía para mostrar el estado "no hay ordenes".
        console.log('[OrdersScreen] getOrders error:', err?.data?.error || err?.message || err);
        dispatch({type: ORDERS_SHOW_LOADER, payload: false});
        dispatch({type: ORDERS_REQUEST_MADE, payload: false});
        if (resetOffset) dispatch({type: ORDERS_LIST, payload: []});
      });
    }
  }
};

export const getPending = (resetOffset) => {
  return(dispatch, getState) =>{
    const { offset,  list, requestMade, autoValue} = getState().ordersData;
    const { user } = getState().userData;
    dispatch({type: ORDERS_SHOW_REFRESH, payload: false}); 
    if(resetOffset){
      dispatch({type: ORDERS_LIST, payload: null}); 
    }
    let currentOffset = resetOffset ? 0 : offset;
    if(!requestMade || resetOffset){
      dispatch({type: ORDERS_REQUEST_MADE, payload: true});
      dispatch({type: ORDERS_SHOW_LOADER, payload: true});
      API.getPending(
        user.branch_office,
        currentOffset,
        autoValue
      )
      .then(response =>{
        dispatch({type: ORDERS_SHOW_LOADER, payload: false});
        if (!Array.isArray(response)) response = [];
        let currentList = resetOffset ? null : list;
        if(currentList != null){
          if(response.length > 0){
            var nextOffset = currentOffset + 10;
            dispatch({type: ORDERS_LIST_OFFSET, payload: nextOffset});
            dispatch({type: ORDERS_REQUEST_MADE, payload: false});
            
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
            
            dispatch({type: ORDERS_LIST, payload: currentList});
          }
        }
        else{
          var nextOffset = currentOffset + 10;
          dispatch({type: ORDERS_LIST_OFFSET, payload: nextOffset});
          dispatch({type: ORDERS_REQUEST_MADE, payload: false});
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
          dispatch({type: ORDERS_LIST, payload: element});
        }
      })
      .catch((err) => {
        console.log('[OrdersScreen] getPending error:', err?.data?.error || err?.message || err);
        dispatch({type: ORDERS_SHOW_LOADER, payload: false});
        dispatch({type: ORDERS_REQUEST_MADE, payload: false});
        if (resetOffset) dispatch({type: ORDERS_LIST, payload: []});
      });
    }
  }
};