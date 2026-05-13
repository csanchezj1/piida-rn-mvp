import validate from 'validate.js';
import Token from '../../../api/token';
import User from '../../../api/user';

import {
  CHANGE_PASS_PASSWORD_CHANGE,
  CHANGE_PASS_CONFIRM_PASSWORD_CHANGE,
  CHANGE_PASS_SEND_CLEAR,
  CHANGE_PASS_FORM_FAIL,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_SHOW,
  COMMON_LOGIN,
  COMMON_PASSWORD
} from '../../../utils/constants';

validate.options = {
  fullMessages: false
};

export const clearScreen = () => {
  return(dispatch) =>{
    dispatch({type: CHANGE_PASS_SEND_CLEAR});
  }
};

export const passChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CHANGE_PASS_PASSWORD_CHANGE, payload: code });
    dispatch({ type: CHANGE_PASS_FORM_FAIL, payload: null });
  }
};

export const passConfirmChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CHANGE_PASS_CONFIRM_PASSWORD_CHANGE, payload: code });
    dispatch({ type: CHANGE_PASS_FORM_FAIL, payload: null });
  }
};

export const changePass = ({pass, confirmPass, mail}) => { 
  return (dispatch) => { 
    const message = 'Este campo es requerido';
    const constraints = {
      pass: {
        presence: {
          allowEmpty: false,
          message: message,
        },
      },
      confirmPass: {
        presence: {
          allowEmpty: false,
          message: message,
        },
        equality: {
          attribute: 'pass',
          message: 'Las contraseñas no coinciden',
        },
      },
    };

    const errors = validate({ pass, confirmPass }, constraints);
    if (errors) {
      dispatch({ type: CHANGE_PASS_FORM_FAIL, payload: errors });
    }
    else{
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
      Token.getToken()
      .then(token => {
        User.changePass(token, mail, pass)
        .then(response =>{
         
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          if(response.updated){
            dispatch({ type: COMMON_LOGIN, payload: response });
            dispatch({ type: COMMON_PASSWORD, payload: pass });
          }
          else{
            dispatch({
              type: DIALOG_SHOW,
              payload: { 
                title:'Recuperar contraseña',
                message:response.message,
              }
            });
          }
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

export const changeUserPass = ({pass, confirmPass, uid, navigation}) => { 
  return (dispatch) => { 
    const message = 'Este campo es requerido';
    const constraints = {
      pass: {
        presence: {
          allowEmpty: false,
          message: message,
        },
      },
      confirmPass: {
        presence: {
          allowEmpty: false,
          message: message,
        },
        equality: {
          attribute: 'pass',
          message: 'Las contraseñas no coinciden',
        },
      },
    };

    const errors = validate({ pass, confirmPass }, constraints);
    if (errors) {
      dispatch({ type: CHANGE_PASS_FORM_FAIL, payload: errors });
    }
    else{
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
      Token.getToken()
      .then(token => {
        User.editAccount(token, pass, uid)
        .then(response =>{
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          if(response.updated){
            dispatch({ type: COMMON_LOGIN, payload: response });
            dispatch({ type: COMMON_PASSWORD, payload: pass });
            dispatch({
              type: DIALOG_SHOW,
              payload: { 
                title:'Cambio de contraseña',
                message:'Contraseña cambiada exitosamente',
              }
            });
            navigation.goBack();
          }
          else{
            dispatch({
              type: DIALOG_SHOW,
              payload: { 
                title:'Recuperar contraseña',
                message:response.message,
              }
            });
          }
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