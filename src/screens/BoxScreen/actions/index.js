import validate from 'validate.js';
import Token from '../../../api/token';
import Login from '../../../api/login';
import CashManagement from '../../../api/cashManagement';

import {
  BOX_CLEAR,
  BOX_MONEY_CHANGE,
  BOX_FORM_FAIL,
  BOX_SELECT_CHANGE,
  BOX_BALANCE,
  BOX_BALANCE_SHOW,
  BOX_BALANCE_TYPE_SELECTED,
  BOX_HISTORY,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_SHOW,
  COMMON_LOGIN,
  CASH_SHIFT_SET,
} from '../../../utils/constants';
import { createTillEvent } from '../../../utils/analytics';
import { refreshCashStatus } from '../../../navigation/actions';

validate.options = {
  fullMessages: false
};

export const clearScreen = () => {
  return(dispatch) =>{
    dispatch({type: BOX_CLEAR});
  }
};


export const moneyChange = (code) => {
  return(dispatch) =>{
    if(code == ''){
      dispatch({ type: BOX_MONEY_CHANGE, payload: null });
    }
    else{
      dispatch({ type: BOX_MONEY_CHANGE, payload:'$' + code.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".")});
    }
    dispatch({ type: BOX_FORM_FAIL, payload: null });
  }
};

export const selectChange = (value) => {
  return(dispatch) => {
    dispatch({ type: BOX_SELECT_CHANGE, payload: value });
    if(value.value == 'close'){
      dispatch(getBalance())
    }
    else{
      dispatch({ type: BOX_BALANCE, payload: null });
      dispatch({type: BOX_BALANCE_SHOW, payload:null});
    }
  }
}

export const getBalance = () => {
  return(dispatch, getState) => {
    const { user } = getState().userData;
    // Tomamos el shift activo del slice cashShiftData (branch-aware) en
    // lugar de user.cash_id (global, stale).
    const nid = getState().cashShiftData?.activeShiftId ?? user?.cash_id ?? 0;
    if (!nid) return;
    Token.getToken()
    .then(token => {
      CashManagement.checkBalance({
        token,
        uid:user.uid,
        nid
      })
      .then(response => {
        dispatch({ type: BOX_BALANCE, payload: response });
        dispatch({type: BOX_BALANCE_SHOW, payload:response.cash});
        dispatch({type: BOX_BALANCE_TYPE_SELECTED, payload:'cash'});
      })
    })
  }
}

export const getHistory = () => {
  return(dispatch) => {
    Token.getToken()
    .then(token => {
      CashManagement.getCashStatus({ token })
      .then(response => {
        if(response && response.history) {
          dispatch({ type: BOX_HISTORY, payload: response.history })
        } else {
          dispatch({ type: BOX_HISTORY, payload: [] })
        }
      })
      .catch((e)=>{
        console.log(e)
        dispatch({ type: BOX_HISTORY, payload: [] })
      })
    })
  }
}

export const showMoneyBalance = (item) => {
  return(dispatch) => {
    dispatch({type: BOX_BALANCE_SHOW, payload:item});
    dispatch({type: BOX_BALANCE_TYPE_SELECTED, payload:'cash'});
  }
}

export const showOtherBalance = (array, id) => {
  return(dispatch) => {
    dispatch({type: BOX_BALANCE_SHOW, payload:array.find(item => item.id === id)});
    dispatch({type: BOX_BALANCE_TYPE_SELECTED, payload:id});
  }
}

export const submit = ({money, type, uid, nid, navigation}) => {
  return(dispatch, getState) => {
    const {
      user
    } = getState().userData;
    const constraints = {
      money: {
        presence: {
          allowEmpty: false,
        },
      },
    };

    const errors = validate({ money }, constraints);
    if (errors) {
      dispatch({ type: BOX_FORM_FAIL, payload: errors });
    }
    else{
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
      Token.getToken()
      .then(token => {
        CashManagement.manageCash({
          token,
          uid,
          value:money.split('.').join('').split('$').join(''),
          type,
          nid
        })
        .then(response => {
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          if(response.success){
            dispatch(login())
            // Refresca cashShiftData para que el FAB y BoxScreen reflejen el
            // nuevo estado del turno (open lo crea, close lo limpia).
            dispatch(refreshCashStatus());
            navigation.goBack()
          }
          dispatch({
            type: DIALOG_SHOW,
            payload: {
              title: type == 'open' ? 'Abrir caja' : type == 'loan' ? 'Prestar caja' : 'Cerrar caja',
              message:response.message,
            }
          });
        })
        .catch(() =>{
          createTillEvent(user, type)
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
        })
      })
    }
  }
}

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