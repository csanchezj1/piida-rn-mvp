import validate from 'validate.js';
import Token from '../../../api/token';
import Recovery from '../../../api/recovery';

import {
  RECOVER_PASS_SEND_CODE_CHANGE,
  RECOVER_PASS_SEND_CLEAR,
  RECOVER_PASS_SEND_FORM_FAIL,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_SHOW
} from '../../../utils/constants';

validate.options = {
  fullMessages: false
};

export const clearScreen = () => {
  return(dispatch) =>{
    dispatch({type: RECOVER_PASS_SEND_CLEAR});
  }
};

export const codeChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: RECOVER_PASS_SEND_CODE_CHANGE, payload: code });
    dispatch({ type: RECOVER_PASS_SEND_FORM_FAIL, payload: null });
  }
};

export const validateCode = ({code, navigation}) => { 
  return (dispatch) => { 
    const message = 'Este campo es requerido';
    const constraints = {
     
      code: {
        presence: {
          allowEmpty: false,
          message: message,
        },
        length: {
          minimum: 5,
          maximum: 5,
          message: 'El código debe tener 5 caracteres',
        }
      },
    };

    const errors = validate({ code }, constraints);
    if (errors) {
      dispatch({ type: RECOVER_PASS_SEND_FORM_FAIL, payload: errors });
    }
    else{
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
      Token.getToken()
      .then(token => {
        Recovery.validateCode(token, code)
        .then(response =>{
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          if(response.is_valid){
            navigation.navigate('ChangePass', {
              mail:response.mail
            })
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