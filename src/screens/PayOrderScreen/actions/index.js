import validate from 'validate.js';
import Token from '../../../api/token';
import API from '../../../api/api';
import Order from '../../../api/order';
import Movements from '../../../api/movements';

import {
  COMMON_PAYMENT_TYPES,
  PAY_ORDER_PAYMENT_CHANGE,
  PAY_ORDER_QTY_CHANGE,
  PAY_ORDER_FORM_FAIL,
  PAY_ORDER_ITEMS,
  PAY_ORDER_CLEAR,
  PROGRESS_VISIBLE_CHANGE,
  PAY_ORDER_PAYMENT_METHOD_FAIL,
  DIALOG_SHOW,
  HOME_TOTAL
} from '../../../utils/constants';

validate.options = {
  fullMessages: false
};

export const clearScreen = () => {
  return(dispatch) =>{
    dispatch({type: PAY_ORDER_CLEAR});
    dispatch({type: PAY_ORDER_PAYMENT_METHOD_FAIL, payload:[]});
    dispatch({type: PAY_ORDER_PAYMENT_CHANGE, payload:[]});
  }
};

export const getItems = (order) => {
  return(dispatch) =>{
    Order.getItems(order)
    .then(res => {
      dispatch({ type: PAY_ORDER_ITEMS, payload: res });
    })
  }
};

export const getFieldsInfo = () => {
  return(dispatch) =>{
    API.getPaymentType()
    .then(res => {
      dispatch({ type: COMMON_PAYMENT_TYPES, payload: res });
    })
  }
};

export const paymentChange = (pay, position) => {
  return(dispatch, getState) =>{
    const { payment } = getState().payOrderData;

    if(payment[position]){
      payment[position].type = pay;
    }
    else{
      payment.length = payment.length > position + 1 ? payment.length : position + 1;
      payment[position] = {
        type:pay
      };
    }

    dispatch({type: PAY_ORDER_PAYMENT_CHANGE, payload: payment});
    dispatch({ type: PAY_ORDER_FORM_FAIL, payload: null });
  }
};

export const valueChange = (code, position) => {
  return(dispatch, getState) =>{
    const { payment } = getState().payOrderData;

    if(payment[position]){
      payment[position].value = '$' + code.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".");
    }
    else{
      payment.length = payment.length > position + 1 ? payment.length : position + 1;
      payment[position] = {
        value:'$' + code.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".")
      };
    }

    dispatch({type: PAY_ORDER_PAYMENT_CHANGE, payload: payment});
    dispatch({ type: PAY_ORDER_FORM_FAIL, payload: null });
  }
};

export const paymentsQtyChange = (item) => {
  return(dispatch, getState) =>{
    const { payment } = getState().payOrderData;
    let payments = payment;

    if(payment.length > item.value){
      const x = payment.length - item.value;
      payments = payment.slice(0, - x);
    }
    
    dispatch({type: PAY_ORDER_PAYMENT_CHANGE, payload:payments});
    dispatch({type: PAY_ORDER_QTY_CHANGE, payload:item});
    dispatch({ type: PAY_ORDER_FORM_FAIL, payload: null });
  }
};

export const confirmOrder = ({
  uid,
  navigation,
  total,
  order,
  orderTotal,
  paid
}) => { 
  return (dispatch, getState) => { 
    const {user} = getState().userData;
    const {payment, paymentsQty} = getState().payOrderData;
    let errArray = [];
    let sumTotal = 0;
    let constraints = {
      paymentsQty: {
        presence: {
          allowEmpty: false,
        },
      },
      payment: {
        presence: {
          allowEmpty: false,
        },
      }
    };

    if(payment.length > 0){
      for (let index = 0; index < paymentsQty.value; index++) {
        if(payment[index]){
          if(!payment[index].type || !payment[index].value){
            errArray.push({
              index,
              type:payment[index].type ? true : false,
              value:payment[index].value ? payment[index].value != '$' ? true : false : false,
            });
          }
          else{
            if(payment[index].value){
              if(payment[index].value == '$'){
                errArray.push({
                  index,
                  type:payment[index].type ? true : false,
                  value:false,
                });
              }
              else{
                sumTotal += parseInt(payment[index].value.split('.').join('').split('$').join(''))
              }
            }
          }
        }
        else{
          errArray.push({
            index,
            type:false,
            value:false,
          });
        }
      }
    }
   
    const errors = validate({ paymentsQty, payment }, constraints);
    dispatch({ type: PAY_ORDER_PAYMENT_METHOD_FAIL, payload: errArray });
    if (errors || errArray.length > 0) {
      if(errors){
        dispatch({ type: PAY_ORDER_FORM_FAIL, payload: errors });
      }
    }
    else{
      let sumError = false;
      if(sumTotal > total){
        sumError = true;
        dispatch({
          type: DIALOG_SHOW,
          payload: { 
            title:'No puedes hacer el pago de la orden',
            message: 'Revisa la cantidad ingresada en cada medio de pago, la suma supera el valor pendiente por pagar',
          }
        });
      }
      else if(sumTotal == 0){
        sumError = true;
        dispatch({
          type: DIALOG_SHOW,
          payload: { 
            title:'No puedes hacer el pago de la orden',
            message: 'Debes ingresar un valor a pagar mayor a $0',
          }
        });
      }  
      if(!sumError){
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
        Token.getToken()
        .then(token => {
          Movements.createPay({
            token,
            uid,
            order:order.nid,
            paymentMethods:payment,
            value:sumTotal
          })
          .then((response) =>{
            dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
            dispatch({
              type: DIALOG_SHOW,
              payload: { 
                title:'Pago registrado',
                message:'El pago quedó registrado correctamente.',
              }
            });
            dispatch(getBalance(user.uid));
            
            navigation.reset({
              index: 0,
              routes: [
                {name: 'BottomMenu'},
                {name: 'BuyDetails', params:{
                  details:{
                    customer:order.customer,
                    movementType:response.title,
                    value:sumTotal,
                    paid:Number(paid) + Number(sumTotal),
                    total:orderTotal,
                    order:response.order,
                    orderConsecutive:response.consecutive,
                    movement:response.movement,
                    movement_id:response.movement_id,
                    date:response.date,              
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
  }
};

export const getBalance = (uid) => {
  return(dispatch, getState) =>{
    const { period } = getState().homeData;
    Movements.getTotals(uid, period.value)
    .then((res) => {
      dispatch({ type: HOME_TOTAL, payload: res });
    });
  }
};