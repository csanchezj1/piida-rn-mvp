import validate from 'validate.js';
import Token from '../../../api/token';
import Login from '../../../api/login';
import Product from '../../../api/product';

import {
  NEW_SALE_LIST,
  NEW_SALE_LIST_OFFSET,
  NEW_SALE_REQUEST_MADE,
  NEW_SALE_SHOW_LOADER,
  NEW_SALE_TEXT_CHANGE,
  NEW_SALE_SEARCH_BTN,
  NEW_SALE_CLEAR,
  NEW_SALE_FORM_FAIL,
  NEW_SALE_PRODUCT_CHANGE,
  NEW_SALE_TOTAL_CHANGE,
  NEW_SALE_CUSTOMER_VISIBLE,
  NEW_SALE_CUSTOMER_CHANGE,
  DIALOG_SHOW,
  COMMON_LOGIN,
  PROGRESS_VISIBLE_CHANGE,
  NEW_SALE_PRODUCT_SELECTED
} from '../../../utils/constants';

import { Vibration } from 'react-native';

validate.options = {
  fullMessages: false
};

export const clear = () => {
  return(dispatch) =>{
    dispatch({ type: NEW_SALE_CLEAR});
    dispatch({type: NEW_SALE_SEARCH_BTN, payload: []});
    dispatch({type: NEW_SALE_PRODUCT_CHANGE, payload: []});
  }
};

export const textChange = (word) => {
  return (dispatch) => {
    dispatch({type: NEW_SALE_TEXT_CHANGE, payload: word});
    if(word != null && word != ''){
      dispatch({type: NEW_SALE_SEARCH_BTN, payload: [{Name: 'Buscar "' + word + '"'}]});
    }
    else{
      dispatch({type: NEW_SALE_SEARCH_BTN, payload: []});
    }
  };
};

export const clearSearch = () => {
  return (dispatch) => {
    dispatch({type: NEW_SALE_SEARCH_BTN, payload: []});
  };
};

export const getProducts = (keyword, resetOffset) => {
  return(dispatch, getState) => {
    const { user } = getState().userData;
     dispatch({type: NEW_SALE_TEXT_CHANGE, payload: keyword});
    if(user.features.includes('product_extra_fields_production_date')){
      dispatch(getProductCategories(keyword, resetOffset))
    }
    else{
      dispatch(getProductsKits(keyword, resetOffset))
    }
  }
}

export const getProductsKits = (keyword, resetOffset) => {
  console.log('getProductsKits')
  return(dispatch, getState) =>{
    const { offset,  list, requestMade} = getState().newSaleData;
    const { user } = getState().userData;
    if(resetOffset){
      dispatch({type: NEW_SALE_LIST, payload: null});
      //dispatch({type: PROVIDER_SEARCH_BTN, payload: []}); 
    }
    let page = resetOffset ? 0 : offset;
    if(!requestMade || resetOffset){
      dispatch({type: NEW_SALE_REQUEST_MADE, payload: true});
      dispatch({type: NEW_SALE_SHOW_LOADER, payload: true});
      
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
          dispatch({type: NEW_SALE_SHOW_LOADER, payload: false});
          let currentList = resetOffset ? null : list;
          if(currentList != null){
            if(response.length > 0){
              var nextPage = page + 1;
              dispatch({type: NEW_SALE_LIST_OFFSET, payload: nextPage});
              dispatch({type: NEW_SALE_REQUEST_MADE, payload: false});
              var presentList_ = currentList.concat(response);
              dispatch({type: NEW_SALE_LIST, payload: presentList_});
            }
          }
          else{
            var nextPage = page + 1;
            dispatch({type: NEW_SALE_LIST_OFFSET, payload: nextPage});
            dispatch({type: NEW_SALE_LIST, payload: response});
            dispatch({type: NEW_SALE_REQUEST_MADE, payload: false});
          }
        })
      })
    }
  }
};

export const getProductCategories = (keyword, resetOffset) => {
  console.log('getProductCategories')
  return(dispatch, getState) =>{
    const { offset,  list, requestMade} = getState().newSaleData;
    const { user } = getState().userData;
    if(resetOffset){
      dispatch({type: NEW_SALE_LIST, payload: null});
      //dispatch({type: PRODUCT_CATEGORIES_SEARCH_BTN, payload: []}); 
    }
    let page = resetOffset ? 0 : offset;
    if(!requestMade || resetOffset){
      dispatch({type: NEW_SALE_REQUEST_MADE, payload: true});
      dispatch({type: NEW_SALE_SHOW_LOADER, payload: true});
      
      Token.getToken()
      .then(token => {
        Product.getProductCategories({
          token,
          page,
          uid:user.uid,
          keyword
        })
        .then(response => {
          dispatch({type: NEW_SALE_SHOW_LOADER, payload: false});
          let currentList = resetOffset ? null : list;
          if(currentList != null){
            if(response.length > 0){
              var nextPage = page + 1;
              dispatch({type: NEW_SALE_LIST_OFFSET, payload: nextPage});
              dispatch({type: NEW_SALE_REQUEST_MADE, payload: false});
              var presentList_ = currentList.concat(response);
              dispatch({type: NEW_SALE_LIST, payload: presentList_});
            }
          }
          else{
            var nextPage = page + 1;
            dispatch({type: NEW_SALE_LIST_OFFSET, payload: nextPage});
            dispatch({type: NEW_SALE_LIST, payload: response});
            dispatch({type: NEW_SALE_REQUEST_MADE, payload: false});
          }
        })
      })
    }
  }
};

export const selectProduct = (item) => {
  return(dispatch, getState) =>{
    const { product, total } = getState().newSaleData;
    const index = product.findIndex(e => e.nid == item.nid);
    let newtotal = total;
    if(index !== -1){
      if(product[index].qty < item.available){
        product[index].qty ++;
        newtotal = total + parseInt(item.price);
        Vibration.vibrate();
        dispatch({type: NEW_SALE_PRODUCT_SELECTED, payload:item.nid});
      }
      else{
        dispatch({
          type: DIALOG_SHOW,
          payload: { 
            title:'No puedes agregar el producto',
            message:'Ya has agregado a la orden la cantidad de producto disponible en inventario.',
          }
        });
      }
    }
    else{
      if(item.available > 0){
        item.qty = 1;
        product.push(item)
        newtotal = total + parseInt(item.price);
        Vibration.vibrate();
        dispatch({type: NEW_SALE_PRODUCT_SELECTED, payload:item.nid});
      }
      else{
        dispatch({
          type: DIALOG_SHOW,
          payload: { 
            title:'No puedes agregar el producto',
            message:'El producto seleccionado no posee cantidades disponibles en inventario.',
          }
        });
      }
    }
    dispatch({ type: NEW_SALE_TOTAL_CHANGE, payload: newtotal });
    dispatch({ type: NEW_SALE_PRODUCT_CHANGE, payload: product });
    dispatch({ type: NEW_SALE_FORM_FAIL, payload: null });
  }
};

export const clearProduct = () => {
  return(dispatch) => {
    dispatch({type: NEW_SALE_PRODUCT_SELECTED, payload:null});
  }
}

export const customerVisible = (visible) => {
  return (dispatch) => {
    dispatch({type: NEW_SALE_CUSTOMER_VISIBLE, payload: visible});
  };
};

export const removeCustomer = () => {
  return (dispatch) => {
    dispatch({type: NEW_SALE_CUSTOMER_VISIBLE, payload: false});
    dispatch({type: NEW_SALE_CUSTOMER_CHANGE, payload: null});
  };
};

export const login = () => { 
  return (dispatch, getState) => {
    const { user, password } = getState().userData;
    dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
    Token.getToken()
    .then(token => {
      Login.appLogin(token, user.email, password)
      .then(response =>{
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
        if(response.logged){
          dispatch({ type: COMMON_LOGIN, payload: response });
        }
      })
      .catch(() => {
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
      })
    })
    .catch(() => {
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
    })
  }
};

export const qtyChange = (qty, item) =>{
  return(dispatch, getState) => {
    const { product, total } = getState().newSaleData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      let newQty = qty.replace(/[^0-9]/g, '');
      if(newQty <= item.available){
        const itemPrice = product[index].qty * product[index].price;
        const newtotal = total - itemPrice + parseInt(item.price * newQty);
        product[index].qty = newQty;
        dispatch({ type: NEW_SALE_TOTAL_CHANGE, payload: newtotal });
        dispatch({ type: NEW_SALE_PRODUCT_CHANGE, payload: product });
      }
    }
  }
}
export const checkChange = (item) => {
  return (dispatch, getState) => {
    const { product } = getState().newSaleData;

    const newProducts = product.map(p => {
      if (p.nid === item.nid) {
        return {
          ...p,
          edit_product: !p.edit_product
        };
      }
      return p;
    });

    dispatch({
      type: NEW_SALE_PRODUCT_CHANGE,
      payload: newProducts
    });
  };
};

export const priceChange = (price, item) => {
  return(dispatch, getState) =>{
    let newPrice = price.replace(/[^0-9]/g, '');
    if(price == '' || price == null || newPrice === '' || newPrice == null){
      newPrice = 0;
    }
    const { product, total } = getState().newSaleData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      const oldItemPrice = product[index].price * product[index].qty;
      const newItemPrice = parseInt(newPrice) * product[index].qty;
      const newtotal = total - oldItemPrice + newItemPrice;
      
      product[index].price = newPrice;
      dispatch({ type: NEW_SALE_TOTAL_CHANGE, payload: newtotal });
      dispatch({ type: NEW_SALE_PRODUCT_CHANGE, payload: product });
    }
  }
};

export const addProduct = (item) => {
  return(dispatch, getState) =>{
    const { product, total } = getState().newSaleData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      if(product[index].qty < item.available){
        product[index].qty ++;
        let newtotal = total + parseInt(item.price);
        dispatch({ type: NEW_SALE_TOTAL_CHANGE, payload: newtotal });
        dispatch({ type: NEW_SALE_PRODUCT_CHANGE, payload: product });
      }
    }
  }
};

export const removeProduct = (item) => {
  return(dispatch, getState) =>{
    const { product, total } = getState().newSaleData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      product[index].qty --;
      let newtotal = total - parseInt(item.price);
      dispatch({ type: NEW_SALE_TOTAL_CHANGE, payload: newtotal });
      if(product[index].qty == 0){
        product.splice(index, 1)
        dispatch({ type: NEW_SALE_PRODUCT_CHANGE, payload: product });
      }
      else{
        dispatch({ type: NEW_SALE_PRODUCT_CHANGE, payload: product });
      }
    }
  }
};

export const deleteProduct = (item) => {
  return(dispatch, getState) =>{
    const { product, total } = getState().newSaleData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      let newtotal = total - (parseInt(item.price) * product[index].qty);
      dispatch({ type: NEW_SALE_TOTAL_CHANGE, payload: newtotal });
      product.splice(index, 1);
      dispatch({ type: NEW_SALE_PRODUCT_CHANGE, payload: product });
    }
  }
};