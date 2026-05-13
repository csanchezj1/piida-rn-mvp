import validate from 'validate.js';
import Token from '../../../api/token';
import User from '../../../api/user';

import {
  REGISTER_CLEAR_ERRORS,
  REGISTER_FORM_FAIL,
  REGISTER_COMPANY_CHANGE,
  COMMON_LOGIN,
  COMMON_PASSWORD,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_SHOW,
  REGISTER_OPERATION_CHANGE,
  REGISTER_BUSINESS_CHANGE,
  REGISTER_WEB_CHANGE,
  REGISTER_FINANCE_CHANGE,
  REGISTER_ROLE_CHANGE,
  REGISTER_APP_GOAL_CHANGE,
  REGISTER_BUSINESS_TEXT_CHANGE,
  REGISTER_FINANCE_TEXT_CHANGE,
  REGISTER_APP_GOAL_TEXT_CHANGE,
  REGISTER_POSITION_CHANGE
} from '../../../utils/constants';

validate.options = {
  fullMessages: false
};

export const clearScreen = () => {
  return(dispatch) =>{
    dispatch({ type: REGISTER_COMPANY_CHANGE, payload: null });
    dispatch({ type: REGISTER_OPERATION_CHANGE, payload: null });
    dispatch({ type: REGISTER_BUSINESS_CHANGE, payload: null });
    dispatch({ type: REGISTER_BUSINESS_TEXT_CHANGE, payload: null });
    dispatch({ type: REGISTER_WEB_CHANGE, payload: null });
    dispatch({ type: REGISTER_FINANCE_CHANGE, payload: null });
    dispatch({ type: REGISTER_FINANCE_TEXT_CHANGE, payload: null });
    dispatch({ type: REGISTER_ROLE_CHANGE, payload: null });
    dispatch({ type: REGISTER_APP_GOAL_TEXT_CHANGE, payload: null });
    dispatch({ type: REGISTER_APP_GOAL_CHANGE, payload:[]});
    dispatch({ type: REGISTER_CLEAR_ERRORS});
  }
};

export const companyChange = (password) => {
  return(dispatch) =>{
    dispatch({ type: REGISTER_COMPANY_CHANGE, payload: password });
    dispatch({ type: REGISTER_CLEAR_ERRORS });
  }
};

export const operationChange = (password) => {
  return(dispatch) =>{
    dispatch({ type: REGISTER_OPERATION_CHANGE, payload: password });
    dispatch({ type: REGISTER_CLEAR_ERRORS});
  }
};

export const businessChange = (password) => {
  return(dispatch) =>{
    dispatch({ type: REGISTER_BUSINESS_CHANGE, payload: password });
    dispatch({ type: REGISTER_BUSINESS_TEXT_CHANGE, payload: null });
    dispatch({ type: REGISTER_CLEAR_ERRORS});
  }
};

export const businessTextChange = (password) => {
  return(dispatch) =>{
    dispatch({ type: REGISTER_BUSINESS_TEXT_CHANGE, payload: password });
    dispatch({ type: REGISTER_CLEAR_ERRORS});
  }
};

export const webChange = (password) => {
  return(dispatch) =>{
    dispatch({ type: REGISTER_WEB_CHANGE, payload: password });
    dispatch({ type: REGISTER_CLEAR_ERRORS});
  }
};

export const financeChange = (password) => {
  return(dispatch) =>{
    dispatch({ type: REGISTER_FINANCE_CHANGE, payload: password });
    dispatch({ type: REGISTER_FINANCE_TEXT_CHANGE, payload: null });
    dispatch({ type: REGISTER_CLEAR_ERRORS});
  }
};

export const financeTextChange = (password) => {
  return(dispatch) =>{
    dispatch({ type: REGISTER_FINANCE_TEXT_CHANGE, payload: password });
    dispatch({ type: REGISTER_CLEAR_ERRORS});
  }
};

export const roleChange = (password) => {
  return(dispatch) =>{
    dispatch({ type: REGISTER_ROLE_CHANGE, payload: password });
    dispatch({ type: REGISTER_CLEAR_ERRORS});
  }
};

export const appGoalTextChange = (password) => {
  return(dispatch) =>{
    dispatch({ type: REGISTER_APP_GOAL_TEXT_CHANGE, payload: password });
    dispatch({ type: REGISTER_CLEAR_ERRORS});
  }
};

export const positionChange = (password) => {
  return(dispatch) =>{
    dispatch({ type: REGISTER_POSITION_CHANGE, payload: password });
    dispatch({ type: REGISTER_CLEAR_ERRORS});
  }
};

export const register = () => { 
  return (dispatch, getState) => {
    const { 
      name,
      lastName,
      email,
      idNumber,
      phone,
      company,
      password,
      operation,
      business,
      web,
      finance,
      appGoal,
      role,
      businessText,
      financeText,
      appGoalText,
      position
    } = getState().registerData;
    let constraints = {
      company: {
        presence: {
          allowEmpty: false,
        }
      },
      operation: {
        presence: {
          allowEmpty: false,
        },
      },
      business: {
        presence: {
          allowEmpty: false,
        },
      },
      finance: {
        presence: {
          allowEmpty: false,
        },
      },
      appGoal: {
        presence: {
          allowEmpty: false,
        },
      },
      role: {
        presence: {
          allowEmpty: false,
        },
      },
    };

    if(business){
      if(business.label == 'Otro'){
        constraints.businessText = {
          presence: {
            allowEmpty: false,
          }
        }
      }
    }
    if(finance){
      if(finance.label == 'Otro'){
        constraints.financeText = {
          presence: {
            allowEmpty: false,
          }
        }
      }
    }
    if(appGoal.length > 0){
      const index = appGoal.findIndex(e => e.label == 'Otro');
      if(index !== -1){
        constraints.appGoalText = {
          presence: {
            allowEmpty: false,
          }
        }
      }
    }
    if(role){
      if(role.label == 'Colaborador'){
        constraints.position = {
          presence: {
            allowEmpty: false,
          }
        }
      }
    }

    const errors = validate({ company, operation, business, finance, appGoal, role, businessText, financeText, appGoalText, position}, constraints);
    if (errors) {
      dispatch({ type: REGISTER_FORM_FAIL, payload: errors });
    }
    else{
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
      Token.getToken()
      .then(token => {
        User.createAccount({
          token,
          name,
          lastName,
          email,
          idNumber,
          phone,
          company,
          password,
          operation: operation.value,
          business: business.value,
          web,
          finance: finance.value,
          appGoal: appGoal,
          role: role.value,
          businessText,
          financeText,
          appGoalText,
          position
        })
        .then(response =>{
          if(response.registered){
            dispatch({ type: COMMON_LOGIN, payload: response });
            dispatch({ type: COMMON_PASSWORD, payload: password });
          }
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          dispatch({
            type: DIALOG_SHOW,
            payload: { 
              title:'Nueva cuenta',
              message:response.message,
            }
          });
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