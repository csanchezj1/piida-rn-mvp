import {ToastAndroid} from 'react-native';
import validate from 'validate.js';
import Token from '../../../api/token';
import API from '../../../api/api';
import Movements from '../../../api/movements';
import Login from '../../../api/login';

import {registerSale} from '../../../utils/analytics';
import {triggerAutoPrintAfterSale} from '../../../utils/printing/triggerAutoPrint';
import {buildReceiptFromOrderSale} from './receipt';
import {postSaleNavReset} from '../../../utils/postSaleNav';

import {
  COMMON_PAYMENT_TYPES,
  COMMON_ORDER_PAYMENT_TYPES,
  REMISSION_PAYMENT_CHANGE,
  REMISSION_FORM_FAIL,
  REMISSION_ORDER_PAYMENT_CHANGE,
  REMISSION_OBSERVATIONS,
  REMISSION_PAYMENTS_QTY_CHANGE,
  REMISSION_PAYMENT_METHOD_FAIL,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_SHOW,
  INVENTORY_LIST,
  INVENTORY_TOTAL,
  HOME_TOTAL,
  COMMON_LOGIN,
  REMISSION_INVOICE_CHANGE,
  NEW_SALE_CLEAR
} from '../../../utils/constants';

validate.options = {
  fullMessages: false
};

// Aviso especial cuando el usuario eligió Fiado pero no hay cliente seleccionado.
// El CTA principal lleva a la pantalla de selección de cliente (Clients).
export const requireCustomerForFiado = (navigation) => {
  return (dispatch) => {
    dispatch({
      type: DIALOG_SHOW,
      payload: {
        title: 'Cliente requerido',
        message: 'Para pago fiado el cliente es obligatorio.',
        acceptTitle: 'Agregar cliente',
        acceptAction: () => navigation.navigate('Clients', {from: 'customer'}),
      },
    });
  };
};

export const clearScreen = () => {
  return(dispatch) =>{
    dispatch({type: REMISSION_PAYMENT_CHANGE, payload:[]});
    dispatch({type: REMISSION_PAYMENT_METHOD_FAIL, payload:[]});
    dispatch({type: REMISSION_ORDER_PAYMENT_CHANGE, payload:null});
    dispatch({type: REMISSION_PAYMENTS_QTY_CHANGE, payload:null});
  }
};

export const getFieldsInfo = () => {
  return(dispatch) =>{
    API.getOrderPaymentType()
    .then(res => {
      dispatch({ type: COMMON_ORDER_PAYMENT_TYPES, payload: res });
    });
    API.getPaymentType()
    .then(res => {
      dispatch({ type: COMMON_PAYMENT_TYPES, payload: res });
    })
  }
};

export const paymentChange = (pay, position) => {
  return(dispatch, getState) =>{
    //const { payment, orderPayment, paymentsQty, total } = getState().remissionData;
    const { payment, orderPayment, paymentsQty } = getState().remissionData;
    const { total } = getState().newSaleData;

    if(payment[position]){
      payment[position].type = pay;
      payment[position].value = paymentsQty.value == 1 && orderPayment.value == 44 ? '$' + total.toString().replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".") : payment[position].value;
    }
    else{
      payment.length = payment.length > position + 1 ? payment.length : position + 1;
      payment[position] = {
        type:pay,
        value:paymentsQty.value == 1 && orderPayment.value == 44 ? '$' + total.toString().replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".") : null
      };
    }

    dispatch({type: REMISSION_PAYMENT_CHANGE, payload: payment});
    dispatch({ type: REMISSION_FORM_FAIL, payload: null });
  }
};

export const valueChange = (code, position) => {
  return(dispatch, getState) =>{
    //const { payment, orderPayment, paymentsQty, total } = getState().remissionData;
    const { payment, orderPayment, paymentsQty } = getState().remissionData;
    const { total } = getState().newSaleData;

    if(payment[position]){
      payment[position].value = paymentsQty.value == 1 && orderPayment.value == 44 ? total : '$' + code.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".");
    }
    else{
      payment.length = payment.length > position + 1 ? payment.length : position + 1;
      payment[position] = {
        value:paymentsQty.value == 1 && orderPayment.value == 44 ? total : '$' + code.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".")
      };
    }

    dispatch({type: REMISSION_PAYMENT_CHANGE, payload: payment});
    dispatch({ type: REMISSION_FORM_FAIL, payload: null });
  }
};

export const paymentsQtyChange = (item) => {
  return(dispatch, getState) =>{
    //const { payment, orderPayment, total } = getState().remissionData;
    const { payment, orderPayment } = getState().remissionData;
    const { total } = getState().newSaleData;
    let payments = payment;

    if(payment.length > item.value){
      const x = payment.length - item.value;
      payments = payment.slice(0, - x);
    }
    if(orderPayment.value == 44){
      if(payments[0]){
        payments[0].value = item.value == 1 ? '$' + total.toString().replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".") : payments[0].value
      }
      else{
        payments=[
          {value: item.value == 1 ? '$' + total.toString().replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".") : null}
        ]
      }
    }

    dispatch({type: REMISSION_PAYMENT_CHANGE, payload:payments});
    dispatch({type: REMISSION_PAYMENTS_QTY_CHANGE, payload:item});
    dispatch({ type: REMISSION_FORM_FAIL, payload: null });
  }
};

export const orderPaymentChange = (pay) => {
  return(dispatch, getState) =>{
    //const { paymentsQty, total, payment } = getState().remissionData;
    const { paymentsQty, payment } = getState().remissionData;
    const { total } = getState().newSaleData;

    dispatch({type: REMISSION_ORDER_PAYMENT_CHANGE, payload:pay});
    dispatch({ type: REMISSION_FORM_FAIL, payload: null });
    if(pay.value == 46){
      dispatch({type: REMISSION_PAYMENTS_QTY_CHANGE, payload:null});
      dispatch({type: REMISSION_PAYMENT_CHANGE, payload:[]});
    }
    else{
      if(paymentsQty){
        if(paymentsQty.value == 1){
          if(payment[0]){
            if(pay.value == 44){
              payment[0].value = '$' + total.toString().replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".")
            }
            else{
              payment[0].value = null
            }
          }
        }
      }
    }
  }
};

export const obsChange = (value) => {
  return(dispatch) =>{
    dispatch({ type: REMISSION_OBSERVATIONS, payload:value});
    dispatch({ type: REMISSION_FORM_FAIL, payload: null });
  }
};

export const confirmOrder = ({
  uid,
  navigation,
  from
}) => {
  return (dispatch, getState) => {
    const {user} = getState().userData;
    //const {orderPayment, paymentsQty, payment, product, total, customer, observations} = getState().remissionData;
    const {orderPayment, paymentsQty, payment, observations, invoice} = getState().remissionData;
    const {product, total, customer} = getState().newSaleData;
    let errors = undefined;
    let errArray = [];
    let sumTotal = 0;
    let constraints = {
      orderPayment: {
        presence: {
          allowEmpty: false,
        },
      },
    };
    if(orderPayment){
      if(orderPayment.value != 46){
        constraints.paymentsQty = {
          presence: {
            allowEmpty: false,
          },
        }
      }
    }

    errors = validate({ orderPayment, paymentsQty}, constraints);
    if(paymentsQty){
      if(payment.length == 0){
        errors = {
          payment:['cant be empty']
        }
      }
      else{
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
    }
    dispatch({ type: REMISSION_PAYMENT_METHOD_FAIL, payload: errArray });
    if (errors || errArray.length > 0) {
      if(errors){
        dispatch({ type: REMISSION_FORM_FAIL, payload: errors });
      }
    }
    else{
      let sumError = false;
      if(orderPayment.value == 44){
        if(sumTotal != total){
          sumError = true;
          dispatch({
            type: DIALOG_SHOW,
            payload: { 
              title:'No puedes confirmar la orden',
              message: 'Revisa la cantidad ingresada en cada medio de pago, la suma no es igual al valor total a pagar',
            }
          });
        }
      }
      else if(orderPayment.value == 45){
        if(sumTotal > total){
          sumError = true;
          dispatch({
            type: DIALOG_SHOW,
            payload: { 
              title:'No puedes confirmar la orden',
              message: 'Revisa la cantidad ingresada en cada medio de pago, la suma supera el valor total a pagar',
            }
          });
        }
        else if(sumTotal == 0){
          sumError = true;
          dispatch({
            type: DIALOG_SHOW,
            payload: { 
              title:'No puedes confirmar la orden',
              message: 'Revisa la cantidad ingresada en cada medio de pago. Debes ingresar un valor a pagar mayor a $0 o pudes cambiar a "Pagar después"',
            }
          });
        }
      }
      if(!sumError){  
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
        Token.getToken()
        .then(token => {
          Movements.createSale({
            token,
            uid,
            orderPayment:orderPayment.value,
            customerId:customer ? customer.nid : null,
            product,
            observations,
            paymentMethods:payment,
            value:sumTotal,
            invoice:invoice ? invoice == true ? '1':'0' : '0' 
          })
          .then((response) =>{
            dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
            ToastAndroid.show('Venta finalizada', ToastAndroid.SHORT);
            registerSale(user, response.order, sumTotal);
            dispatch(login());
            dispatch(getMovements(user.branch_office));
            dispatch(getInventory(user.uid));
            dispatch(getBalance(user.uid));

            // Detectar si alguno de los métodos de pago seleccionados es
            // efectivo. PaymentMethod.value=7 era el id del seed Drupal para
            // "Efectivo"; también chequeamos por label para robustez.
            const hasCashPayment = (payment || []).some((p) => {
              if (!p || !p.type) return false;
              if (p.type.value === 7) return true;
              const label = String(p.type.label || '').toLowerCase();
              return label.includes('efectivo');
            });

            triggerAutoPrintAfterSale({
              receipt: buildReceiptFromOrderSale({
                user, response, product, payment, total, sumTotal, orderPayment, customer, observations,
              }),
              isCashSale: hasCashPayment,
            });

            // Reset condicional según el origen del checkout (VentaLibre o catálogo).
            dispatch({type: NEW_SALE_CLEAR});
            postSaleNavReset(navigation, from);
          })
          .catch((e) =>{
            console.log(e)
            dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
            dispatch({
              type: DIALOG_SHOW,
              payload: {
                title:'Error',
                // Si el back devolvió un mensaje específico, mostrarlo en lugar
                // del genérico (mucho más útil para debug y para el usuario).
                message:
                  e?.data?.message ||
                  (Array.isArray(e?.data?.errors) ? e.data.errors.join('. ') : null) ||
                  e?.data?.error ||
                  'Hubo un error de comunicación con el servidor, por favor revisa tu conexión y/o intenta más tarde.',
              }
            });
          })
        })
        .catch((e) => {
          console.log(e)
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          dispatch({
            type: DIALOG_SHOW,
            payload: {
              title:'Error',
              message:
                e?.data?.message ||
                (Array.isArray(e?.data?.errors) ? e.data.errors.join('. ') : null) ||
                e?.data?.error ||
                'Hubo un error de comunicación con el servidor, por favor revisa tu conexión y/o intenta más tarde.',
            }
          });
        })
      }
    }
  }
};

export const getMovements = (pp_id) => {
  return(dispatch) =>{
    dispatch({ type: INVENTORY_LIST, payload: null });
    API.getMovementsWarehouse(pp_id, 0)
    .then((response) => {
      let element = [];
      response.map(item => {
        const index = element.findIndex(e => e.date == item.created);
        if(index !== -1){
          element[index].children.push(item)
        }
        else{
          element.push({
            date:item.created,
            children:[item]
          })
        }
      })
      dispatch({type: INVENTORY_LIST, payload: element});
    })
  }
};

export const getInventory = (uid) => {
  return(dispatch) =>{
    dispatch({ type: INVENTORY_TOTAL, payload: [] });
    Movements.getInventory(uid)
    .then((res) => {
      dispatch({ type: INVENTORY_TOTAL, payload: res });
    });
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

export const login = () => { 
  return (dispatch, getState) => {
    const { user, password } = getState().userData;
    Token.getToken()
    .then(token => {
      Login.appLogin(token, user.email, password)
      .then(response =>{
        if(response.logged){
          dispatch({ type: COMMON_LOGIN, payload: response });
         
        }
      })
    })
  }
};

export const hasInvoice = () => {
  return(dispatch, getState) => {
     const { invoice } = getState().remissionData;
    dispatch({ type: REMISSION_INVOICE_CHANGE, payload: !invoice });
  }
}