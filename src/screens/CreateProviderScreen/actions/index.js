import validate from 'validate.js';
import Token from '../../../api/token';
import API from '../../../api/api';
import Provider from '../../../api/provider';
import Login from '../../../api/login';

import {
  CREATE_PROVIDER_NAMES_CHANGE,
  CREATE_PROVIDER_LAST_NAMES_CHANGE,
  CREATE_PROVIDER_GENDER_CHANGE,
  CREATE_PROVIDER_PHONE_CHANGE,
  CREATE_PROVIDER_CITY_CHANGE,
  CREATE_PROVIDER_VEREDA_CHANGE,
  CREATE_PROVIDER_SECTOR_CHANGE,
  CREATE_PROVIDER_FARM_CHANGE,
  CREATE_PROVIDER_TYPE_CHANGE,
  CREATE_PROVIDER_CLEAR,
  CREATE_PROVIDER_FORM_FAIL,
  CREATE_PROVIDER_ID_NUMBER_CHANGE,
  CREATE_PROVIDER_CODE_CHANGE,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_SHOW,
  COMMON_GENDER,
  PROVIDER_LIST,
  PROVIDER_REQUEST_MADE,
  PROVIDER_SHOW_LOADER,
  PROVIDER_LIST_OFFSET,
  COMMON_LOGIN
} from '../../../utils/constants';

validate.options = {
  fullMessages: false
};

export const getFieldsData = () => {
  return(dispatch) =>{
    API.getGender()
    .then((res) => {
      dispatch({ type: COMMON_GENDER, payload: res });
    });
  }
};

export const clearScreen = () => {
  return(dispatch) =>{
    dispatch({type: CREATE_PROVIDER_CLEAR});
  }
};

export const namesChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PROVIDER_NAMES_CHANGE, payload: code });
    dispatch({ type: CREATE_PROVIDER_FORM_FAIL, payload: null });
  }
};

export const idNumberChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PROVIDER_ID_NUMBER_CHANGE, payload: code });
    dispatch({ type: CREATE_PROVIDER_FORM_FAIL, payload: null });
  }
};

export const lastNamesChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PROVIDER_LAST_NAMES_CHANGE, payload: code });
    dispatch({ type: CREATE_PROVIDER_FORM_FAIL, payload: null });
  }
};

export const genderChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PROVIDER_GENDER_CHANGE, payload: code });
    dispatch({ type: CREATE_PROVIDER_FORM_FAIL, payload: null });
  }
};

export const phoneChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PROVIDER_PHONE_CHANGE, payload: code });
    dispatch({ type: CREATE_PROVIDER_FORM_FAIL, payload: null });
  }
};

export const cityChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PROVIDER_CITY_CHANGE, payload: code });
    dispatch({ type: CREATE_PROVIDER_FORM_FAIL, payload: null });
  }
};

export const codeChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PROVIDER_CODE_CHANGE, payload: code });
    dispatch({ type: CREATE_PROVIDER_FORM_FAIL, payload: null });
  }
};

export const veredaChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PROVIDER_VEREDA_CHANGE, payload: code });
    dispatch({ type: CREATE_PROVIDER_FORM_FAIL, payload: null });
  }
};

export const sectorChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PROVIDER_SECTOR_CHANGE, payload: code });
    dispatch({ type: CREATE_PROVIDER_FORM_FAIL, payload: null });
  }
};

export const farmChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PROVIDER_FARM_CHANGE, payload: code });
    dispatch({ type: CREATE_PROVIDER_FORM_FAIL, payload: null });
  }
};

export const typeChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PROVIDER_TYPE_CHANGE, payload: code });
    dispatch({ type: CREATE_PROVIDER_FORM_FAIL, payload: null });
  }
};

export const createProvider = ({
  names,
  lastNames,
  gender,
  idNumber,
  phone,
  navigation,
  city,
  code,
}) => { 
  return (dispatch, getState) => { 
    const { user } = getState().userData;
    const message = 'Este campo es requerido';
    const constraints = {
      names: {
        presence: {
          allowEmpty: false,
          message: message,
        },
      },
      lastNames: {
        presence: {
          allowEmpty: false,
          message: message,
        },
      },
      idNumber: {
        presence: {
          allowEmpty: false,
          message: message,
        },
      },
    };

    const errors = validate({ names, lastNames, idNumber}, constraints);
    if (errors) {
      dispatch({ type: CREATE_PROVIDER_FORM_FAIL, payload: errors });
    }
    else{
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
      const { password } = getState().userData;
      // Endpoint v2 requiere auth real (no magic). Usamos las creds del
      // user logueado. lastNames/gender/finca/etc no existen en el schema
      // backend — los descartamos. Si necesitás algunos, agregalos al
      // schema y al DTO del controller.
      Provider.createProvider({
        email: user.email,
        password,
        names,
        idNumber,
        phone,
        city,
        code,
      })
      .then((res) =>{
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
        if (!res || res.error) {
          throw res?.error || new Error('respuesta inválida');
        }
        dispatch({
          type: DIALOG_SHOW,
          payload: {
            // El CommonDialog (utils/dialog/component) detecta el título y
            // pinta icon + color según el caso: "creado" → chulo verde.
            title:'Proveedor creado',
            message:'El proveedor quedó listo para que lo uses al surtir inventario.',
          }
        });
        dispatch(getProviders(user.company))
        navigation.goBack();
      })
      .catch((e) =>{
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
        const msg =
          e?.data?.message ||
          (Array.isArray(e?.data?.errors) ? e.data.errors.join('. ') : null) ||
          e?.data?.error ||
          'Hubo un error de comunicación con el servidor, por favor revisa tu conexión y/o intenta más tarde.';
        dispatch({
          type: DIALOG_SHOW,
          payload: { title:'Error', message: msg }
        });
      })
    }
  }
};

export const getProviders = () => {
  // Refresca la lista tras crear un proveedor — pasa por el endpoint v2.
  return(dispatch, getState) =>{
    const { user, password } = getState().userData;
    if (!user?.email || !password) return;
    dispatch({type: PROVIDER_LIST, payload: null});
    dispatch({type: PROVIDER_REQUEST_MADE, payload: true});
    dispatch({type: PROVIDER_SHOW_LOADER, payload: true});
    Provider.getProviders(user.email, password, '', 0)
    .then(response =>{
      dispatch({type: PROVIDER_SHOW_LOADER, payload: false});
      dispatch({type: PROVIDER_REQUEST_MADE, payload: false});
      dispatch({type: PROVIDER_LIST_OFFSET, payload: 20});
      dispatch({type: PROVIDER_LIST, payload: response});
    })
    .catch(() => {
      dispatch({type: PROVIDER_SHOW_LOADER, payload: false});
      dispatch({type: PROVIDER_REQUEST_MADE, payload: false});
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