import validate from 'validate.js';
import Token from '../../../api/token';
import API from '../../../api/api';
import Customer from '../../../api/customer';
import Login from '../../../api/login';
import moment from 'moment';

import {
  CREATE_CUSTOMER_NAME_CHANGE,
  CREATE_CUSTOMER_PHONE_CHANGE,
  CREATE_CUSTOMER_ID_NUMBER_CHANGE,
  CREATE_CUSTOMER_ADDRESS_CHANGE,
  CREATE_CUSTOMER_EMAIL_CHANGE,
  CREATE_CUSTOMER_FORM_FAIL,
  CREATE_CUSTOMER_CLEAR,
  CREATE_CUSTOMER_CITY_CHANGE,
  CREATE_CUSTOMER_CODE_CHANGE,
  CREATE_CUSTOMER_CITY_NAME_CHANGE,
  CREATE_CUSTOMER_ID_TYPE_CHANGE,
  CREATE_CUSTOMER_DIGIT_CHANGE,
  CREATE_CUSTOMER_BIRTHDAY_CHANGE,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_SHOW,
  PROVIDER_LIST,
  PROVIDER_REQUEST_MADE,
  PROVIDER_SHOW_LOADER,
  PROVIDER_LIST_OFFSET,
  COMMON_ID_TYPES,
  COMMON_LOGIN
} from '../../../utils/constants';

validate.options = {
  fullMessages: false
};

export const clearScreen = () => {
  return(dispatch) =>{
    dispatch({type: CREATE_CUSTOMER_CLEAR});
  }
};

export const getIdTypes = () => {
  return(dispatch) =>{
    API.getIdType()
    .then(response => {
      dispatch({ type: COMMON_ID_TYPES, payload: response });
    })
  }
};

export const nameChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_CUSTOMER_NAME_CHANGE, payload: code });
    dispatch({ type: CREATE_CUSTOMER_FORM_FAIL, payload: null });
  }
};

export const phoneChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_CUSTOMER_PHONE_CHANGE, payload: code });
    dispatch({ type: CREATE_CUSTOMER_FORM_FAIL, payload: null });
  }
};

export const idTypeChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_CUSTOMER_DIGIT_CHANGE, payload: null});
    dispatch({ type: CREATE_CUSTOMER_ID_TYPE_CHANGE, payload:code });
    dispatch({ type: CREATE_CUSTOMER_FORM_FAIL, payload: null });
  }
};

export const idNumberChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_CUSTOMER_ID_NUMBER_CHANGE, payload:code });
    dispatch({ type: CREATE_CUSTOMER_FORM_FAIL, payload: null });
  }
};

export const addressChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_CUSTOMER_ADDRESS_CHANGE, payload: code});
    dispatch({ type: CREATE_CUSTOMER_FORM_FAIL, payload: null });
  }
};

export const emailChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_CUSTOMER_EMAIL_CHANGE, payload: code});
    dispatch({ type: CREATE_CUSTOMER_FORM_FAIL, payload: null });
  }
};

export const cityChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_CUSTOMER_CITY_CHANGE, payload: code});
    dispatch({ type: CREATE_CUSTOMER_FORM_FAIL, payload: null });
  }
};

export const cityNameChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_CUSTOMER_CITY_NAME_CHANGE, payload: code});
    dispatch({ type: CREATE_CUSTOMER_FORM_FAIL, payload: null });
  }
};

export const codeChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_CUSTOMER_CODE_CHANGE, payload: code});
    dispatch({ type: CREATE_CUSTOMER_FORM_FAIL, payload: null });
  }
};

export const digitChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_CUSTOMER_DIGIT_CHANGE, payload: code});
    dispatch({ type: CREATE_CUSTOMER_FORM_FAIL, payload: null });
  }
};

export const birthdayChange = (value) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_CUSTOMER_BIRTHDAY_CHANGE, payload: value});
    dispatch({ type: CREATE_CUSTOMER_FORM_FAIL, payload: null });
  }
};

export const createCustomer = ({navigation}) => { 
  return (dispatch, getState) => { 
    const { user } = getState().userData;
    const { 
      name,
      phone,
      idNumber,
      address,
      email,
      city,
      cityName,
      code,
      idType,
      digit, 
      birthday
    } = getState().createCustomerData;
    const message = 'Este campo es requerido';
    let constraints = {
      name: {
        presence: {
          allowEmpty: false,
          message: message,
        },
      },
      phone: {
        presence: {
          allowEmpty: false,
          message: message,
        },
      },
    };

    if(idType){
      if(idType.label == 'NIT'){
        constraints.digit={
          presence: {
            allowEmpty: false,
            message: message,
          },
        }
      }
    }
    if(user.features.includes('clients_birthday')){
      constraints.birthday={
        presence: {
          allowEmpty: false,
          message: message,
        },
      }
    }

    const errors = validate({ name, phone, digit, birthday }, constraints);
    if (errors) {
      dispatch({ type: CREATE_CUSTOMER_FORM_FAIL, payload: errors });
    }
    else{
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
      Token.getToken()
      .then(token => {
        Customer.createCustomer({
          token, 
          uid:user.uid, 
          name, 
          phone,
          idNumber,
          address,
          email,
          city:city ? city.value : null,
          cityName,
          code,
          digit,
          idType:idType ? idType.value : null,
          birthday:birthday ? moment(birthday).format('YYYY-MM-DD') : null,
        })
        .then(() =>{
          dispatch(login());
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          dispatch({
            type: DIALOG_SHOW,
            payload: { 
              title:'Nuevo cliente',
              message:'Cliente creado exitosamente.',
            }
          });
          dispatch(getCustomer(user.company))
          navigation.goBack();
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

export const getCustomer = (pp_id) => {
  return(dispatch) =>{
    dispatch({type: PROVIDER_LIST, payload: null});
    dispatch({type: PROVIDER_REQUEST_MADE, payload: true});
    dispatch({type: PROVIDER_SHOW_LOADER, payload: true});
    API.getCustomer(pp_id, '', 0)
    .then(response =>{
      dispatch({type: PROVIDER_SHOW_LOADER, payload: false});
      dispatch({type: PROVIDER_REQUEST_MADE, payload: false});
      dispatch({type: PROVIDER_LIST_OFFSET, payload: 20});
      dispatch({type: PROVIDER_LIST, payload: response});
    })
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