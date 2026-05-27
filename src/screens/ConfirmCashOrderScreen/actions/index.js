import {ToastAndroid} from 'react-native';
import validate from 'validate.js';
import Token from '../../../api/token';
import API from '../../../api/api';
import Movements from '../../../api/movements';
import Login from '../../../api/login';

import {registerSale} from '../../../utils/analytics';
import {triggerAutoPrintAfterSale} from '../../../utils/printing/triggerAutoPrint';
import {buildReceiptFromCashSale} from './receipt';
import {getCashPaymentMethodId} from '../../../utils/paymentMethods';
import {buildErrorDialog} from '../../../utils/planLimitDialog';
import {postSaleNavReset} from '../../../utils/postSaleNav';

import {
  CONFIRM_CASH_ORDER_CONFIRM_VALUE_CHANGE,
  CONFIRM_CASH_ORDER_CLEAR,
  CONFIRM_CASH_ORDER_FORM_FAIL,
  CONFIRM_CASH_ORDER_RETURN,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_SHOW,
  INVENTORY_LIST,
  INVENTORY_TOTAL,
  HOME_TOTAL,
  COMMON_LOGIN,
  CONFIRM_CASH_INVOICE,
  NEW_SALE_CLEAR
} from '../../../utils/constants';

validate.options = {
  fullMessages: false
};

export const clearScreen = () => {
  return(dispatch) =>{
    dispatch({type: CONFIRM_CASH_ORDER_CLEAR});
  }
};

export const valueChange = (code) => {
  return (dispatch, getState) => {
    const { total } = getState().newSaleData;
    
    
    let numericOnly = null;
    if(code != ''){
      numericOnly = code.replace(/[^0-9]/g, '');
    }
    dispatch({type:CONFIRM_CASH_ORDER_CONFIRM_VALUE_CHANGE,payload: numericOnly});

    const cleaned = code.replace(/[$.]/g, '');
    const numericValue = parseInt(cleaned, 10);
    if(isNaN(numericValue)) {
      return;
    }

    const difference = numericValue - total;
    if (difference >= 0) {
      dispatch({type: CONFIRM_CASH_ORDER_RETURN, payload:difference});
    }
    else{
      dispatch({type: CONFIRM_CASH_ORDER_RETURN, payload:0});
    }
  };
};

export const confirmOrder = ({
  navigation,
  from
}) => {
  return (dispatch, getState) => {
    const {user} = getState().userData;
    const {value, invoice} = getState().confirmCahsOrderData;
    const {product, total, customer} = getState().newSaleData;
    const constraints = {
      value: {
        presence: {
          allowEmpty: false,
          message:'Este campo es requerido',
        },
        numericality: {
          greaterThanOrEqualTo: total,
          message: `Debe ser mayor o igual a $${total}`,
        },
      },
    };

    const errors = validate({ value }, constraints);
    if (errors) {
      dispatch({ type: CONFIRM_CASH_ORDER_FORM_FAIL, payload: errors });
    }
    else{
      const cashMethodId = getCashPaymentMethodId(getState());
      if (cashMethodId == null) {
        dispatch({
          type: DIALOG_SHOW,
          payload: {
            title: 'Error',
            message: 'No se pudo identificar el método de pago "Efectivo". Cierra sesión y vuelve a entrar.',
          },
        });
        return;
      }
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
      Token.getToken()
      .then(token => {
        Movements.createSale({
          token,
          uid:user.uid,
          orderPayment:44,
          customerId:customer ? customer.nid : null,
          product,
          observations:'',
          invoice:invoice ? invoice == true ? '1':'0' : '0',
          paymentMethods:[{
            type:{
              label:'Efectivo',
              value:cashMethodId
            },
            value:total
          }],
          value:total
        })
        .then((response) =>{
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          // Toast no-bloqueante (no requiere tocar Aceptar). Replica el patrón
          // que la web ya usa para finalizar venta.
          ToastAndroid.show('Venta finalizada', ToastAndroid.SHORT);
          registerSale(user, response.order, total);
          dispatch(login());
          dispatch(getMovements(user.branch_office));
          dispatch(getInventory(user.uid));
          dispatch(getBalance(user.uid));

          triggerAutoPrintAfterSale({
            receipt: buildReceiptFromCashSale({user, response, product, total, paid: value, customer}),
            isCashSale: true,
          });

          // Tras finalizar volvemos al origen del checkout: si entró desde
          // VentaLibre (teclado libre), reset a VentaLibre. Si entró desde
          // el catálogo (NewSale dentro del BottomMenu), reset a BottomMenu.
          dispatch({type: NEW_SALE_CLEAR});
          postSaleNavReset(navigation, from);
        })
        .catch((e) =>{
          console.log(e)
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          dispatch(buildErrorDialog(e, navigation));
        })
      })
      .catch((e) => {
        console.log(e)
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
        dispatch(buildErrorDialog(e, navigation));
      })
    }
  }
};

export const completePayment = ({
  navigation,
  from
}) => {
  return (dispatch, getState) => {
    const {user} = getState().userData;
    const {invoice} = getState().confirmCahsOrderData;
    const {product, total, customer} = getState().newSaleData;
    const cashMethodId = getCashPaymentMethodId(getState());
    if (cashMethodId == null) {
      dispatch({
        type: DIALOG_SHOW,
        payload: {
          title: 'Error',
          message: 'No se pudo identificar el método de pago "Efectivo". Cierra sesión y vuelve a entrar.',
        },
      });
      return;
    }
    dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
    Token.getToken()
    .then(token => {
      Movements.createSale({
        token,
        uid:user.uid,
        orderPayment:44,
        customerId:customer ? customer.nid : null,
        product,
        observations:'',
        invoice:invoice ? invoice == true ? '1':'0' : '0',
        paymentMethods:[{
          type:{
            label:'Efectivo',
            value:cashMethodId
          },
          value:total
        }],
        value:total
      })
      .then((response) =>{
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
        ToastAndroid.show('Venta finalizada', ToastAndroid.SHORT);
        registerSale(user, response.order, total);
        dispatch(login());
        dispatch(getMovements(user.branch_office));
        dispatch(getInventory(user.uid));
        dispatch(getBalance(user.uid));

        triggerAutoPrintAfterSale({
          receipt: buildReceiptFromCashSale({user, response, product, total, paid: total, customer}),
          isCashSale: true,
        });

        // Mismo patrón que confirmOrder: vaciar carrito y respetar origen.
        dispatch({type: NEW_SALE_CLEAR});
        postSaleNavReset(navigation, from);
      })
      .catch((e) =>{
        console.log(e)
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
        dispatch(buildErrorDialog(e, navigation));
      })
    })
    .catch((e) => {
      console.log(e)
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
      dispatch(buildErrorDialog(e, navigation));
    })

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
     const { invoice } = getState().confirmCahsOrderData;
    dispatch({ type: CONFIRM_CASH_INVOICE, payload: !invoice });
  }
}