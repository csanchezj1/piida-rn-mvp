import API from '../../../api/api';

import {
  ADD_PRODUCT_KIT_LIST,
  ADD_PRODUCT_KIT_LIST_OFFSET,
  ADD_PRODUCT_KIT_REQUEST_MADE,
  ADD_PRODUCT_KIT_SHOW_LOADER,
  ADD_PRODUCT_KIT_TEXT_CHANGE,
  ADD_PRODUCT_KIT_SEARCH_BTN,
  KIT_FORM_FAIL,
  KIT_PRODUCT_CHANGE,
  KIT_TOTAL_CHANGE
} from '../../../utils/constants';

export const getProduct = (company, keyword, resetOffset) => {
  return(dispatch, getState) =>{
    const { offset,  list, requestMade} = getState().providerData;
    if(resetOffset){
      dispatch({type: ADD_PRODUCT_KIT_LIST, payload: null});
      //dispatch({type: ADD_PRODUCT_KIT_SEARCH_BTN, payload: []}); 
    }
    let currentOffset = resetOffset ? 0 : offset;
    if(!requestMade || resetOffset){
      dispatch({type: ADD_PRODUCT_KIT_REQUEST_MADE, payload: true});
      dispatch({type: ADD_PRODUCT_KIT_SHOW_LOADER, payload: true});
      API.getProducts(company, keyword, currentOffset)
      .then(response =>{
        dispatch({type: ADD_PRODUCT_KIT_SHOW_LOADER, payload: false});
        let currentList = resetOffset ? null : list;
        if(currentList != null){
          if(response.length > 0){
            var nextOffset = currentOffset + 20;
            dispatch({type: ADD_PRODUCT_KIT_LIST_OFFSET, payload: nextOffset});
            dispatch({type: ADD_PRODUCT_KIT_REQUEST_MADE, payload: false});
            var presentList_ = currentList.concat(response);
            dispatch({type: ADD_PRODUCT_KIT_LIST, payload: presentList_});
          }
        }
        else{
          var nextOffset = currentOffset + 20;
          dispatch({type: ADD_PRODUCT_KIT_LIST_OFFSET, payload: nextOffset});
          dispatch({type: ADD_PRODUCT_KIT_LIST, payload: response});
          dispatch({type: ADD_PRODUCT_KIT_REQUEST_MADE, payload: false});
        }
      })
      .catch(() => {

      })
    }
  }
};

export const clear = () => {
  return(dispatch) =>{
    dispatch({type: ADD_PRODUCT_KIT_SEARCH_BTN, payload: []});
  }
};

export const selectProvider = (item) => {
  return(dispatch, getState) =>{
    const { pro, tot } = getState().kitData;
    const i = pro.findIndex(e => e.nid == item.nid);
    if(i !== -1){
      pro[i].qty ++;
    }
    else{
      item.qty = 1;
      pro.push(item)
    }
    //let ntotal = tot + parseInt(item.price);
    //dispatch({ type: KIT_TOTAL_CHANGE, payload: ntotal });
    dispatch({ type: KIT_PRODUCT_CHANGE, payload: pro });
    dispatch({ type: KIT_FORM_FAIL, payload: null });
  }
};

export const textChange = (word) => {
  return (dispatch) => {
    dispatch({type: ADD_PRODUCT_KIT_TEXT_CHANGE, payload: word});
    if(word != null && word != ''){
      dispatch({type: ADD_PRODUCT_KIT_SEARCH_BTN, payload: [{Name: 'Buscar "' + word + '"'}]});
    }
    else{
      dispatch({type: ADD_PRODUCT_KIT_SEARCH_BTN, payload: []});
      //dispatch(getStores('', true))
    }
  };
};
