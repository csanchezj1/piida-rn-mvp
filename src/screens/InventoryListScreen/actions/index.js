import validate from 'validate.js';
import Token from '../../../api/token';
import Inventory from '../../../api/inventory';

import {
  INVENTORY_LIST_SHOW_REFRESH,
  INVENTORY_LIST_LIST,
  INVENTORY_LIST_REQUEST_MADE,
  INVENTORY_LIST_SHOW_LOADER,
  INVENTORY_LIST_LIST_OFFSET,
  INVENTORY_LIST_TEXT,
  INVENTORY_LIST_SEARCH
} from '../../../utils/constants';

validate.options = {
  fullMessages: false
};

export const getProducts = (resetOffset) => {
  return(dispatch, getState) =>{
    const { offset,  list, requestMade, text} = getState().inventroyListData;
    const { user } = getState().userData;
    dispatch({type: INVENTORY_LIST_SHOW_REFRESH, payload: false}); 
    if(resetOffset){
      dispatch({type: INVENTORY_LIST_LIST, payload: null}); 
    }
    let currentOffset = resetOffset ? 0 : offset;
    if(!requestMade || resetOffset){
      dispatch({type: INVENTORY_LIST_REQUEST_MADE, payload: true});
      dispatch({type: INVENTORY_LIST_SHOW_LOADER, payload: true});
      Token.getToken()
      .then(token => {
        Inventory.getInventory({
          token,
          page:currentOffset,
          uid:user.uid,
          keyword:text
        })
        .then(response =>{
          dispatch({type: INVENTORY_LIST_SHOW_LOADER, payload: false});
          let currentList = resetOffset ? null : list;
          if(currentList != null){
            if(response.length > 0){
              var nextOffset = currentOffset + 1;
              dispatch({type: INVENTORY_LIST_LIST_OFFSET, payload: nextOffset});
              dispatch({type: INVENTORY_LIST_REQUEST_MADE, payload: false});
              dispatch({type: INVENTORY_LIST_LIST, payload: currentList.concat(response)});
            }
          }
          else{
            var nextOffset = currentOffset + 1;
            dispatch({type: INVENTORY_LIST_LIST_OFFSET, payload: nextOffset});
            dispatch({type: INVENTORY_LIST_REQUEST_MADE, payload: false});
            dispatch({type: INVENTORY_LIST_LIST, payload: response});
          }
        })
      })
    }
  }
};

export const textChange = (word) => {
  return (dispatch) => {
    dispatch({type: INVENTORY_LIST_TEXT, payload: word});
    if(word != null && word != ''){
      dispatch({type: INVENTORY_LIST_SEARCH, payload: [{Name: 'Buscar "' + word + '"'}]});
    }
    else{
      dispatch({type: INVENTORY_LIST_SEARCH, payload: []});
      //dispatch(getStores('', true))
    }
  };
};

export const clearSearch = () => {
  return (dispatch) => {
    dispatch({type: INVENTORY_LIST_SEARCH, payload: []});
  };
};