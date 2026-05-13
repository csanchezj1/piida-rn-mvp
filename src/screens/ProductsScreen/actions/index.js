import Token from '../../../api/token';
import Product from '../../../api/product';

import {
  PRODUCTS_LIST,
  PRODUCTS_REQUEST_MADE,
  PRODUCTS_SHOW_LOADER,
  PRODUCTS_SHOW_REFRESH,
  PRODUCTS_LIST_OFFSET,
  PRODUCTS_CLEAR,
  PRODUCTS_SEARCH_BTN,
  PRODUCTS_TEXT_CHANGE
} from '../../../utils/constants';


export const getProducts = (keyword, resetOffset) => {
  return(dispatch, getState) =>{
    const { offset,  list, requestMade} = getState().newSaleData;
    const { user } = getState().userData;
    if(resetOffset){
      dispatch({type: PRODUCTS_LIST, payload: null});
      //dispatch({type: PRODUCTS_SEARCH_BTN, payload: []}); 
    }
    let page = resetOffset ? 0 : offset;
    if(!requestMade || resetOffset){
      dispatch({type: PRODUCTS_REQUEST_MADE, payload: true});
      dispatch({type: PRODUCTS_SHOW_LOADER, payload: true});
      
      Token.getToken()
      .then(token => {
        Product.getProductsKits({
          token,
          page,
          company:user.company,
          branchOffice:user.branch_office,
          keyword
        })
        .then(response => {
          dispatch({type: PRODUCTS_SHOW_LOADER, payload: false});
          let currentList = resetOffset ? null : list;
          if(currentList != null){
            if(response.length > 0){
              var nextPage = page + 1;
              dispatch({type: PRODUCTS_LIST_OFFSET, payload: nextPage});
              dispatch({type: PRODUCTS_REQUEST_MADE, payload: false});
              var presentList_ = currentList.concat(response);
              dispatch({type: PRODUCTS_LIST, payload: presentList_});
            }
          }
          else{
            var nextPage = page + 1;
            dispatch({type: PRODUCTS_LIST_OFFSET, payload: nextPage});
            dispatch({type: PRODUCTS_LIST, payload: response});
            dispatch({type: PRODUCTS_REQUEST_MADE, payload: false});
          }
        })
      })
    }
  }
};

export const clear = () => {
  return(dispatch) =>{
    dispatch({type: PRODUCTS_CLEAR});
    dispatch({type: PRODUCTS_SEARCH_BTN, payload: []});
  }
};

export const textChange = (word) => {
  return (dispatch) => {
    dispatch({type: PRODUCTS_TEXT_CHANGE, payload: word});
    if(word != null && word != ''){
      dispatch({type: PRODUCTS_SEARCH_BTN, payload: [{Name: 'Buscar "' + word + '"'}]});
    }
    else{
      dispatch({type: PRODUCTS_SEARCH_BTN, payload: []});
    }
  };
};

export const clearSearch = () => {
  return (dispatch) => {
    dispatch({type: PRODUCTS_SEARCH_BTN, payload: []});
  };
};
