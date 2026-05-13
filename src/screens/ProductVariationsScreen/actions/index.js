import Token from '../../../api/token';
import Product from '../../../api/product';

import {
  PRODUCT_VARIATIONS_LIST,
  PRODUCT_VARIATIONS_LIST_OFFSET,
  PRODUCT_VARIATIONS_REQUEST_MADE,
  PRODUCT_VARIATIONS_SHOW_LOADER,
  REMISSION_PRODUCT_CHANGE,
  REMISSION_TOTAL_CHANGE,
  REMISSION_FORM_FAIL,
  PRODUCT_VARIATIONS_TEXT_CHANGE,
  PRODUCT_VARIATIONS_SEARCH_BTN,
  PRODUCT_VARIATIONS_CLEAR,
  DIALOG_SHOW,
  NEW_SALE_TOTAL_CHANGE,
  NEW_SALE_PRODUCT_CHANGE,
  NEW_SALE_FORM_FAIL,
  ADD_INVENTORY_PRODUCT_SELECTED,
  ADD_INVENTORY_PRODUCT_CHANGE
} from '../../../utils/constants';

import { Vibration } from 'react-native';

export const clear = () => {
  return(dispatch) =>{
    dispatch({ type: PRODUCT_VARIATIONS_CLEAR});
    dispatch({type: PRODUCT_VARIATIONS_SEARCH_BTN, payload: []});
  }
};

export const getProduct = (keyword, resetOffset, cat) => {
  return(dispatch, getState) =>{
    const { offset,  list, requestMade} = getState().providerData;
    const { user } = getState().userData;
    if(resetOffset){
      dispatch({type: PRODUCT_VARIATIONS_LIST, payload: null});
      //dispatch({type: PRODUCT_VARIATIONS_SEARCH_BTN, payload: []}); 
    }
    let page = resetOffset ? 0 : offset;
    if(!requestMade || resetOffset){
      dispatch({type: PRODUCT_VARIATIONS_REQUEST_MADE, payload: true});
      dispatch({type: PRODUCT_VARIATIONS_SHOW_LOADER, payload: true});
      
      Token.getToken()
      .then(token => {
        Product.getProductsKits({
          token,
          page,
          company:user.company,
          branchOffice:user.branch_office,
          keyword,
          cat
        })
        .then(response => {
          dispatch({type: PRODUCT_VARIATIONS_SHOW_LOADER, payload: false});
          let currentList = resetOffset ? null : list;
          if(currentList != null){
            if(response.length > 0){
              var nextPage = page + 1;
              dispatch({type: PRODUCT_VARIATIONS_LIST_OFFSET, payload: nextPage});
              dispatch({type: PRODUCT_VARIATIONS_REQUEST_MADE, payload: false});
              var presentList_ = currentList.concat(response);
              dispatch({type: PRODUCT_VARIATIONS_LIST, payload: presentList_});
            }
          }
          else{
            var nextPage = page + 1;
            dispatch({type: PRODUCT_VARIATIONS_LIST_OFFSET, payload: nextPage});
            dispatch({type: PRODUCT_VARIATIONS_LIST, payload: response});
            dispatch({type: PRODUCT_VARIATIONS_REQUEST_MADE, payload: false});
          }
        })
      })
    }
  }
};

export const selectProvider = (item, navigation) => {
  return(dispatch, getState) =>{
    //const { product, total } = getState().remissionData;
    const { product, total } = getState().newSaleData;
    const index = product.findIndex(e => e.nid == item.nid);
    let newtotal = total;
    if(index !== -1){
      if(product[index].qty < item.available){
        product[index].qty ++;
        newtotal = total + parseInt(item.price)
      }
      else{
        dispatch({
          type: DIALOG_SHOW,
          payload: { 
            title:'No puedes agregar el producto',
            message:'Ya has agregado a la orden la cantidad de producto disponible en inventario.',
          }
        });

        return;
      }
    }
    else{
      if(item.available > 0){
        item.qty = 1;
        product.push(item)
        newtotal = total + parseInt(item.price)
      }
      else{
        dispatch({
          type: DIALOG_SHOW,
          payload: { 
            title:'No puedes agregar el producto',
            message:'El producto seleccionado no posee cantidades disponibles en inventario.',
          }
        });

        return;
      }
    }
    /*dispatch({ type: REMISSION_TOTAL_CHANGE, payload: newtotal });
    dispatch({ type: REMISSION_PRODUCT_CHANGE, payload: product });
    dispatch({ type: REMISSION_FORM_FAIL, payload: null });*/
    //navigation.navigate('Remission')
    navigation.goBack()
    dispatch({ type: NEW_SALE_TOTAL_CHANGE, payload: newtotal });
    dispatch({ type: NEW_SALE_PRODUCT_CHANGE, payload: product });
    dispatch({ type: NEW_SALE_FORM_FAIL, payload: null });
  }
};

export const selectProduct = (item, navigation) => {
  return(dispatch, getState) =>{
    const { product } = getState().addInventoryData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      product[index].qty ++;
      Vibration.vibrate();
      dispatch({type: ADD_INVENTORY_PRODUCT_SELECTED, payload:item.nid});
    }
    else{
      item.qty = 1;
      product.push(item)
      Vibration.vibrate();
      dispatch({type: ADD_INVENTORY_PRODUCT_SELECTED, payload:item.nid});
    }
    dispatch({ type: ADD_INVENTORY_PRODUCT_CHANGE, payload: product });
    navigation.goBack();
  }
};

export const textChange = (word) => {
  return (dispatch) => {
    dispatch({type: PRODUCT_VARIATIONS_TEXT_CHANGE, payload: word});
    if(word != null && word != ''){
      dispatch({type: PRODUCT_VARIATIONS_SEARCH_BTN, payload: [{Name: 'Buscar "' + word + '"'}]});
    }
    else{
      dispatch({type: PRODUCT_VARIATIONS_SEARCH_BTN, payload: []});
      //dispatch(getStores('', true))
    }
  };
};

export const clearSearch = () => {
  return (dispatch) => {
    dispatch({type: PRODUCT_VARIATIONS_SEARCH_BTN, payload: []});
  };
};