import Token from '../../../api/token';
import Product from '../../../api/product';

import {
  PRODUCT_CATEGORIES_LIST,
  PRODUCT_CATEGORIES_LIST_OFFSET,
  PRODUCT_CATEGORIES_REQUEST_MADE,
  PRODUCT_CATEGORIES_SHOW_LOADER,
  PRODUCT_CATEGORIES_TEXT_CHANGE,
  PRODUCT_CATEGORIES_SEARCH_BTN,
  PRODUCT_CATEGORIES_CLEAR,
} from '../../../utils/constants';

export const clear = () => {
  return(dispatch) =>{
    dispatch({ type: PRODUCT_CATEGORIES_CLEAR});
    dispatch({type: PRODUCT_CATEGORIES_SEARCH_BTN, payload: []});
  }
};

export const textChange = (word) => {
  return (dispatch) => {
    dispatch({type: PRODUCT_CATEGORIES_TEXT_CHANGE, payload: word});
    if(word != null && word != ''){
      dispatch({type: PRODUCT_CATEGORIES_SEARCH_BTN, payload: [{Name: 'Buscar "' + word + '"'}]});
    }
    else{
      dispatch({type: PRODUCT_CATEGORIES_SEARCH_BTN, payload: []});
      //dispatch(getStores('', true))
    }
  };
};

export const clearSearch = () => {
  return (dispatch) => {
    dispatch({type: PRODUCT_CATEGORIES_SEARCH_BTN, payload: []});
  };
};

export const getProducts = (keyword, resetOffset) => {
  return(dispatch, getState) =>{
    const { offset,  list, requestMade} = getState().productCategoriesData;
    const { user } = getState().userData;
    if(resetOffset){
      dispatch({type: PRODUCT_CATEGORIES_LIST, payload: null});
      //dispatch({type: PRODUCT_CATEGORIES_SEARCH_BTN, payload: []}); 
    }
    let page = resetOffset ? 0 : offset;
    if(!requestMade || resetOffset){
      dispatch({type: PRODUCT_CATEGORIES_REQUEST_MADE, payload: true});
      dispatch({type: PRODUCT_CATEGORIES_SHOW_LOADER, payload: true});
      
      Token.getToken()
      .then(token => {
        Product.getProductCategories({
          token,
          page,
          uid:user.uid,
          keyword
        })
        .then(response => {
          dispatch({type: PRODUCT_CATEGORIES_SHOW_LOADER, payload: false});
          let currentList = resetOffset ? null : list;
          if(currentList != null){
            if(response.length > 0){
              var nextPage = page + 1;
              dispatch({type: PRODUCT_CATEGORIES_LIST_OFFSET, payload: nextPage});
              dispatch({type: PRODUCT_CATEGORIES_REQUEST_MADE, payload: false});
              var presentList_ = currentList.concat(response);
              dispatch({type: PRODUCT_CATEGORIES_LIST, payload: presentList_});
            }
          }
          else{
            var nextPage = page + 1;
            dispatch({type: PRODUCT_CATEGORIES_LIST_OFFSET, payload: nextPage});
            dispatch({type: PRODUCT_CATEGORIES_LIST, payload: response});
            dispatch({type: PRODUCT_CATEGORIES_REQUEST_MADE, payload: false});
          }
        })
      })
    }
  }
};