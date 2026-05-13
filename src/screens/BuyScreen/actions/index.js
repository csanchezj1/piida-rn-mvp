import validate from 'validate.js';
import Token from '../../../api/token';
import API from '../../../api/api';
import Movements from '../../../api/movements';
import Login from '../../../api/login';

import {
  BUY_QTY_CHANGE,
  BUY_CLEAR,
  BUY_FORM_FAIL,
  BUY_VALUE_CHANGE,
  BUY_OBS_CHANGE,
  BUY_PRODUCT_CHANGE,
  BUY_PAYMENT_CHANGE,
  BUY_EXPENSE_CHANGE,
  BUY_PROVIDER_CHANGE,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_SHOW,
  COMMON_EXPENSE_TYPE,
  COMMON_PAYMENT_TYPES,
  COMMON_LOGIN
} from '../../../utils/constants';

validate.options = {
  fullMessages: false
};

export const clearScreen = () => {
  return(dispatch) =>{
    dispatch({type: BUY_CLEAR});
  }
};

export const getFieldsInfo = () => {
  return(dispatch) =>{
    API.getExpenseType()
    .then(res => {
      dispatch({ type: COMMON_EXPENSE_TYPE, payload: res });
    })
    API.getPaymentType()
    .then(res => {
      dispatch({ type: COMMON_PAYMENT_TYPES, payload: res });
    })
  }
};

/*export const qtyChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: BUY_QTY_CHANGE, payload: code.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".") });
    dispatch({ type: BUY_FORM_FAIL, payload: null });
  }
};*/

export const valueChange = (code) => {
  return(dispatch) =>{
    if(code == ''){
      dispatch({ type: BUY_VALUE_CHANGE, payload: null });
    }
    else{
      dispatch({ type: BUY_VALUE_CHANGE, payload:'$' + code.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".")});
    }
    dispatch({ type: BUY_FORM_FAIL, payload: null });
  }
};

export const obsChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: BUY_OBS_CHANGE, payload: code });
    dispatch({ type: BUY_FORM_FAIL, payload: null });
  }
};

export const expenseTypeChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: BUY_EXPENSE_CHANGE, payload: code });
    dispatch({ type: BUY_FORM_FAIL, payload: null });
    dispatch({ type: BUY_PRODUCT_CHANGE, payload: [] });
    dispatch({ type: BUY_QTY_CHANGE, payload: null });
    dispatch({ type: BUY_PROVIDER_CHANGE, payload: null });
  }
};

export const paymentChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: BUY_PAYMENT_CHANGE, payload: code });
    dispatch({ type: BUY_FORM_FAIL, payload: null });
  }
};

export const addProduct = (item) => {
  return(dispatch, getState) =>{
    const { product } = getState().buyData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      product[index].qty ++;     
      dispatch({ type: BUY_PRODUCT_CHANGE, payload: product });
    }
  }
};

export const removeProduct = (item) => {
  return(dispatch, getState) =>{
    const { product } = getState().buyData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      product[index].qty --;
   
      if(product[index].qty == 0){
        product.splice(index, 1)
        dispatch({ type: BUY_PRODUCT_CHANGE, payload: product });
      }
      else{
        dispatch({ type: BUY_PRODUCT_CHANGE, payload: product });
      }
    }
  }
};

export const deleteProduct = (item) => {
  return(dispatch, getState) =>{
    const { product } = getState().buyData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      product.splice(index, 1);
      dispatch({ type: BUY_PRODUCT_CHANGE, payload: product });
    }
  }
};

export const qtyChange = (qty, item) =>{
  return(dispatch, getState) => {
    const { product } = getState().buyData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      product[index].qty = qty.replace(/[^0-9]/g, '');
      dispatch({ type: BUY_PRODUCT_CHANGE, payload: product });  
    }
  }
}

export const priceChange = (price, item) => {
  return(dispatch, getState) =>{
    let newPrice = price.replace(/[^0-9]/g, '');
    if(price == '' || price == null || newPrice === '' || newPrice == null){
      newPrice = 0;
    }
    const { product } = getState().buyData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      product[index].price = newPrice;
      dispatch({ type: BUY_PRODUCT_CHANGE, payload: product });
    }
  }
};

export const createPurchase = ({
  uid,
  navigation
}) => { 
  return (dispatch, getState) => { 
    const { 
      expense,
      value,
      payment,
      obs,
      product,
      provider,
    } = getState().buyData;
    let constraints = {
      expense: {
        presence: {
          allowEmpty: false,
        },
      },
      
      payment: {
        presence: {
          allowEmpty: false,
        },
      },
    };

    if(expense){
      if(expense.value == 50){//compra productos
        constraints.product = {
          presence: {
            allowEmpty: false,
          },
        };
        
        constraints.provider = {
          presence: {
            allowEmpty: false,
          },
        };
      }
      else{
        constraints.value = {
          presence: {
            allowEmpty: false,
          },
        }
      }
    }
    const errors = validate({ expense, value, payment, product, provider }, constraints);
    if (errors) {
      dispatch({ type: BUY_FORM_FAIL, payload: errors });
    }
    else{
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
      Token.getToken()
      .then(token => {
        const val = value ? value.split('.').join('').split('$').join('') : null;
    
        Movements.createExpense({
          token,
          uid,
          expense_type:expense.value,
          value: val,
          payment_type:payment.value,
          observations:obs,
          products: product,
          provider: provider ? provider.nid : null,
        })
        .then((res) =>{
          dispatch(login());
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          dispatch({
            type: DIALOG_SHOW,
            payload: { 
              title:'Gasto registrado',
              message:'Los datos del gasto fueron guardados.',
            }
          });
          let total = val;
          
          navigation.reset({
            index: 0,
            routes: [
              {name: 'BottomMenu'},
              {name: 'BuyDetails', params:{
                details:{
                  provider:provider ? provider.label : null,
                  movementType:expense.label,
                  paymentType:payment.label,
                  value:total,
                  observations:obs,
                  total,
                  movement:res.movement,
                  date:res.date,
                  product:product ? product : null
                }}
              },
            ],
          })
         
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
  }
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