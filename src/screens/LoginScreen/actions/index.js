import validate from 'validate.js';
import Token from '../../../api/token';
import Login from '../../../api/login';
import branchApi from '../../../api/branch';

import {
  LOGIN_MAIL_CHANGE,
  LOGIN_PASSWORD_CHANGE,
  LOGIN_CLEAR_ERRORS,
  LOGIN_FORM_FAIL,
  LOGIN_CLEAR,
  COMMON_LOGIN,
  COMMON_PASSWORD,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_SHOW,
  BRANCH_SET_LIST,
  BRANCH_SET_ACTIVE,
} from '../../../utils/constants';

validate.options = {
  fullMessages: false
};

export const clearScreen = () => {
  return(dispatch) =>{
    dispatch({type: LOGIN_CLEAR});
  }
};

export const mailChange = (password) => {
  return(dispatch) =>{
    dispatch({ type: LOGIN_MAIL_CHANGE, payload: password });
    dispatch({ type: LOGIN_CLEAR_ERRORS });
  }
};

export const passChange = (password) => {
  return(dispatch) =>{
    dispatch({ type: LOGIN_PASSWORD_CHANGE, payload: password });
    dispatch({ type: LOGIN_CLEAR_ERRORS});
  }
};

export const login = ({email, password}) => { 
  return (dispatch) => {
    const message = 'Este campo es requerido';
    const constraints = {
      password: {
        presence: {
          allowEmpty: false,
          message: message,
        },
        /*length: {
          minimum: 5,
          message: 'Debe tener mínimo 5 caracteres',
        }*/
      },
      email: {
        presence: {
          allowEmpty: false,
          message: message,
        },
        email: {
          message: 'Formato inválido'
        }
      }
    };

    const errors = validate({ email, password }, constraints);
    if (errors) {
      dispatch({ type: LOGIN_FORM_FAIL, payload: errors });
    }
    else{
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
      Token.getToken()
      .then(token => {
        Login.appLogin(token, email, password)
        .then(response =>{
          if(response.logged){
            dispatch({ type: COMMON_LOGIN, payload: response });
            dispatch({ type: COMMON_PASSWORD, payload: password });
            // Bloque 4 multi-sucursal: cargo la lista de branches del user
            // y seteo la activa al branch_office del login (default del back).
            // El switcher (drawer) las usa para listar opciones.
            branchApi.getMyBranches(email, password)
              .then(branches => {
                const list = Array.isArray(branches) ? branches : [];
                dispatch({ type: BRANCH_SET_LIST, payload: list });
                const initial = response.branch_office ?? list[0]?.id ?? null;
                if (initial != null) {
                  dispatch({ type: BRANCH_SET_ACTIVE, payload: initial });
                }
              })
              .catch(() => {
                // Sin branches no rompemos login — el back hace fallback a la
                // primera UserBranch. Solo el switcher se queda sin opciones.
                dispatch({ type: BRANCH_SET_LIST, payload: [] });
              });
          }
          else{
            dispatch({
              type: DIALOG_SHOW,
              payload: { 
                title:'Inicio de sesión',
                message:response.message,
              }
            });
          } 
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
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