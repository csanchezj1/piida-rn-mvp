import validate from 'validate.js';
import Token from '../../../api/token';
import Login from '../../../api/login';

import {
  REMISSION_CLEAR,
  REMISSION_FORM_FAIL,
  REMISSION_PRODUCT_CHANGE,
  REMISSION_TOTAL_CHANGE,
  COMMON_LOGIN,
  PROGRESS_VISIBLE_CHANGE
} from '../../../utils/constants';

validate.options = {
  fullMessages: false
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

export const clearScreen = () => {
  return(dispatch) =>{
    dispatch({type: REMISSION_CLEAR});
    dispatch({type: REMISSION_PRODUCT_CHANGE, payload:[]});
  }
};

export const qtyChange = (qty, item) =>{
  return(dispatch, getState) => {
    const { product, total } = getState().remissionData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      let newQty = qty.replace(/[^0-9]/g, '');
      if(newQty <= item.available){
        const itemPrice = product[index].qty * product[index].price;
        const newtotal = total - itemPrice + parseInt(item.price * newQty);
        product[index].qty = newQty;
        dispatch({ type: REMISSION_TOTAL_CHANGE, payload: newtotal });
        dispatch({ type: REMISSION_PRODUCT_CHANGE, payload: product });
      }
    }
  }
}

export const priceChange = (price, item) => {
  return(dispatch, getState) =>{
    let newPrice = price.replace(/[^0-9]/g, '');
    if(price == '' || price == null || newPrice === '' || newPrice == null){
      newPrice = 0;
    }
    const { product, total } = getState().remissionData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      const oldItemPrice = product[index].price * product[index].qty;
      const newItemPrice = parseInt(newPrice) * product[index].qty;
      const newtotal = total - oldItemPrice + newItemPrice;
      
      product[index].price = newPrice;
      dispatch({ type: REMISSION_TOTAL_CHANGE, payload: newtotal });
      dispatch({ type: REMISSION_PRODUCT_CHANGE, payload: product });
    }
  }
};

export const addProduct = (item) => {
  return(dispatch, getState) =>{
    const { product, total } = getState().remissionData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      if(product[index].qty < item.available){
        product[index].qty ++;
        let newtotal = total + parseInt(item.price);
        dispatch({ type: REMISSION_TOTAL_CHANGE, payload: newtotal });
        dispatch({ type: REMISSION_PRODUCT_CHANGE, payload: product });
      }
    }
  }
};

export const removeProduct = (item) => {
  return(dispatch, getState) =>{
    const { product, total } = getState().remissionData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      product[index].qty --;
      let newtotal = total - parseInt(item.price);
      dispatch({ type: REMISSION_TOTAL_CHANGE, payload: newtotal });
      if(product[index].qty == 0){
        product.splice(index, 1)
        dispatch({ type: REMISSION_PRODUCT_CHANGE, payload: product });
      }
      else{
        dispatch({ type: REMISSION_PRODUCT_CHANGE, payload: product });
      }
    }
  }
};

export const deleteProduct = (item) => {
  return(dispatch, getState) =>{
    const { product, total } = getState().remissionData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      let newtotal = total - (parseInt(item.price) * product[index].qty);
      dispatch({ type: REMISSION_TOTAL_CHANGE, payload: newtotal });
      product.splice(index, 1);
      dispatch({ type: REMISSION_PRODUCT_CHANGE, payload: product });
    }
  }
};

export const confirmOrder = ({
  navigation,
  product, 
  customer,
}) => { 
  return (dispatch) => { 
    const constraints = {
      customer: {
        presence: {
          allowEmpty: false,
          message: 'Selecciona un cliente.',
        },
      },
      product: {
        presence: {
          allowEmpty: false,
          message: 'Agrega por lo menos un producto o servicio a la orden.',
        },
      },
    };

    const errors = validate({ product, customer}, constraints);
    if (errors) {
      dispatch({ type: REMISSION_FORM_FAIL, payload: errors });
    }
    else{
      navigation.navigate('ConfirmOrder')
    }
  }
};