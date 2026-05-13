import validate from 'validate.js';
import Token from '../../../api/token';
import Recovery from '../../../api/recovery';

import {
  RECOVER_PASS_GET_MAIL_CHANGE,
  RECOVER_PASS_GET_CLEAR,
  RECOVER_PASS_GET_FORM_FAIL,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_SHOW
} from '../../../utils/constants';

validate.options = {
  fullMessages: false
};

export const clearScreen = () => {
  return(dispatch) =>{
    dispatch({type: RECOVER_PASS_GET_CLEAR});
  }
};

export const mailChange = (mail) => {
  return(dispatch) =>{
    dispatch({ type: RECOVER_PASS_GET_MAIL_CHANGE, payload: mail });
    dispatch({ type: RECOVER_PASS_GET_FORM_FAIL, payload: null });
  }
};

export const validateCode = ({mail, navigation}) => { 
  return (dispatch) => { 
    const message = 'Este campo es requerido';
    const constraints = {
     
      mail: {
        presence: {
          allowEmpty: false,
          message: message,
        },
        email: {
          message: 'Formato inválido.'
        }
      },
    };

    const errors = validate({ mail }, constraints);
    if (errors) {
      dispatch({ type: RECOVER_PASS_GET_FORM_FAIL, payload: errors });
    }
    else{
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
      Token.getToken()
      .then(token => {
        Recovery.recoveryPass(token, mail)
        .then(response =>{
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          if(response.created){
            navigation.navigate('RecoveryPassSendCode')
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