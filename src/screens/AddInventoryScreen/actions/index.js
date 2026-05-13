import Token from '../../../api/token';
import Product from '../../../api/product';
import Movements from '../../../api/movements';

import {
  ADD_INVENTORY_LIST,
  ADD_INVENTORY_LIST_OFFSET,
  ADD_INVENTORY_REQUEST_MADE,
  ADD_INVENTORY_SHOW_LOADER,
  ADD_INVENTORY_TEXT_CHANGE,
  ADD_INVENTORY_SEARCH_BTN,
  ADD_INVENTORY_CLEAR,
  ADD_INVENTORY_PRODUCT_CHANGE,
  ADD_INVENTORY_CUSTOMER_VISIBLE,
  ADD_INVENTORY_CUSTOMER_CHANGE,
  ADD_INVENTORY_PRODUCT_SELECTED,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_SHOW,
  NEW_SALE_LIST_OFFSET,
  NEW_SALE_LIST
} from '../../../utils/constants';

import { Vibration } from 'react-native';

export const clear = () => {
  return(dispatch) =>{
    dispatch({ type: ADD_INVENTORY_CLEAR});
    dispatch({type: ADD_INVENTORY_SEARCH_BTN, payload: []});
    dispatch({type: ADD_INVENTORY_PRODUCT_CHANGE, payload: []});
  }
};

export const textChange = (word) => {
  return (dispatch) => {
    dispatch({type: ADD_INVENTORY_TEXT_CHANGE, payload: word});
    if(word != null && word != ''){
      dispatch({type: ADD_INVENTORY_SEARCH_BTN, payload: [{Name: 'Buscar "' + word + '"'}]});
    }
    else{
      dispatch({type: ADD_INVENTORY_SEARCH_BTN, payload: []});
    }
  };
};

export const clearSearch = () => {
  return (dispatch) => {
    dispatch({type: ADD_INVENTORY_SEARCH_BTN, payload: []});
  };
};

export const getProducts = (keyword, resetOffset) => {
  return(dispatch, getState) => {
    const { user } = getState().userData;
    if(user.features.includes('product_extra_fields_production_date')){
      dispatch(getProductCategories(keyword, resetOffset))
    }
    else{
      dispatch(getProductsKits(keyword, resetOffset))
    }
  }
}

export const getProductsKits = (keyword, resetOffset) => {
  return(dispatch, getState) =>{
    const { offset,  list, requestMade} = getState().addInventoryData;
    const { user } = getState().userData;
    if(resetOffset){
      dispatch({type: ADD_INVENTORY_LIST, payload: null});
      //dispatch({type: PROVIDER_SEARCH_BTN, payload: []}); 
    }
    let page = resetOffset ? 0 : offset;
    if(!requestMade || resetOffset){
      dispatch({type: ADD_INVENTORY_REQUEST_MADE, payload: true});
      dispatch({type: ADD_INVENTORY_SHOW_LOADER, payload: true});
      
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
          dispatch({type: ADD_INVENTORY_SHOW_LOADER, payload: false});
          let currentList = resetOffset ? null : list;
          if(currentList != null){
            if(response.length > 0){
              var nextPage = page + 1;
              dispatch({type: ADD_INVENTORY_LIST_OFFSET, payload: nextPage});
              dispatch({type: ADD_INVENTORY_REQUEST_MADE, payload: false});
              var presentList_ = currentList.concat(response);
              dispatch({type: ADD_INVENTORY_LIST, payload: presentList_});
            }
          }
          else{
            var nextPage = page + 1;
            dispatch({type: ADD_INVENTORY_LIST_OFFSET, payload: nextPage});
            dispatch({type: ADD_INVENTORY_LIST, payload: response});
            dispatch({type: ADD_INVENTORY_REQUEST_MADE, payload: false});
          }
        })
      })
    }
  }
};

export const getProductCategories = (keyword, resetOffset) => {
  return(dispatch, getState) =>{
    const { offset,  list, requestMade} = getState().addInventoryData;
    const { user } = getState().userData;
    if(resetOffset){
      dispatch({type: ADD_INVENTORY_LIST, payload: null});
      //dispatch({type: PRODUCT_CATEGORIES_SEARCH_BTN, payload: []}); 
    }
    let page = resetOffset ? 0 : offset;
    if(!requestMade || resetOffset){
      dispatch({type: ADD_INVENTORY_REQUEST_MADE, payload: true});
      dispatch({type: ADD_INVENTORY_SHOW_LOADER, payload: true});
      
      Token.getToken()
      .then(token => {
        Product.getProductCategories({
          token,
          page,
          uid:user.uid,
          keyword
        })
        .then(response => {
          dispatch({type: ADD_INVENTORY_SHOW_LOADER, payload: false});
          let currentList = resetOffset ? null : list;
          if(currentList != null){
            if(response.length > 0){
              var nextPage = page + 1;
              dispatch({type: ADD_INVENTORY_LIST_OFFSET, payload: nextPage});
              dispatch({type: ADD_INVENTORY_REQUEST_MADE, payload: false});
              var presentList_ = currentList.concat(response);
              dispatch({type: ADD_INVENTORY_LIST, payload: presentList_});
            }
          }
          else{
            var nextPage = page + 1;
            dispatch({type: ADD_INVENTORY_LIST_OFFSET, payload: nextPage});
            dispatch({type: ADD_INVENTORY_LIST, payload: response});
            dispatch({type: ADD_INVENTORY_REQUEST_MADE, payload: false});
          }
        })
      })
    }
  }
};

export const selectProduct = (item) => {
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
  }
};

export const clearProduct = () => {
  return(dispatch) => {
    dispatch({type: ADD_INVENTORY_PRODUCT_SELECTED, payload:null});
  }
}

export const customerVisible = (visible) => {
  return (dispatch) => {
    dispatch({type: ADD_INVENTORY_CUSTOMER_VISIBLE, payload: visible});
  };
};

export const removeCustomer = () => {
  return (dispatch) => {
    dispatch({type: ADD_INVENTORY_CUSTOMER_VISIBLE, payload: false});
    dispatch({type: ADD_INVENTORY_CUSTOMER_CHANGE, payload: null});
  };
};

export const qtyChange = (qty, item) =>{
  return(dispatch, getState) => {
    const { product } = getState().addInventoryData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      let newQty = qty.replace(/[^0-9]/g, '');
      product[index].qty = newQty;
      dispatch({ type: ADD_INVENTORY_PRODUCT_CHANGE, payload: product });
    }
  }
}

export const addProduct = (item) => {
  return(dispatch, getState) =>{
    const { product } = getState().addInventoryData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      product[index].qty ++;
      dispatch({ type: ADD_INVENTORY_PRODUCT_CHANGE, payload: product });
    }
  }
};

export const removeProduct = (item) => {
  return(dispatch, getState) =>{
    const { product } = getState().addInventoryData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      product[index].qty --;
      if(product[index].qty == 0){
        product.splice(index, 1)
        dispatch({ type: ADD_INVENTORY_PRODUCT_CHANGE, payload: product });
      }
      else{
        dispatch({ type: ADD_INVENTORY_PRODUCT_CHANGE, payload: product });
      }
    }
  }
};

export const deleteProduct = (item) => {
  return(dispatch, getState) =>{
    const { product } = getState().addInventoryData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){ 
      product.splice(index, 1);
      dispatch({ type: ADD_INVENTORY_PRODUCT_CHANGE, payload: product });
    }
  }
};

export const createPurchase = () => { 
  return (dispatch, getState) => { 
    const { 
      product,
      customer,
    } = getState().addInventoryData;
    const { 
      user,
    } = getState().userData;
    console.log(product)
    dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
    Token.getToken()
    .then(token => {  
      Movements.createExpense({
        token,
        uid:user.uid,
        expense_type:50,
        products: product,
        provider: customer ? customer.nid : null,
      })
      .then((res) =>{
        dispatch(getHomeProducts());
        dispatch(clear());
        dispatch(getProducts('', true));
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
        dispatch({
          type: DIALOG_SHOW,
          payload: { 
            title:'Inventario surtido',
            message:'Felicidades, tu inventario fue surtido sin problemas.',
          }
        });
      })
      .catch(() =>{
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
        dispatch({
          type: DIALOG_SHOW,
          payload: { 
            title:'Error',
            message: 'Hubo un error de comunicación con el servidor, por favor revisa tu conexión y/o intenta más tarde.',
          }
        });
      })
    })
    .catch(() => {
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
      dispatch({
        type: DIALOG_SHOW,
        payload: { 
          title:'Error',
          message: 'Hubo un error de comunicación con el servidor, por favor revisa tu conexión y/o intenta más tarde.',
        }
      });
    })
  }
};

export const getHomeProducts = () => {
  return(dispatch, getState) =>{
    const { user } = getState().userData;
    dispatch({type: NEW_SALE_LIST, payload: null}); 
    Token.getToken()
    .then(token => {
      Product.getProductsKits({
        token,
        page:0,
        company:user.company,
        branchOffice:user.branch_office,
      })
      .then(response => {
        dispatch({type: NEW_SALE_LIST_OFFSET, payload: 1});
        dispatch({type: NEW_SALE_LIST, payload: response});
      })
    })
  }
};