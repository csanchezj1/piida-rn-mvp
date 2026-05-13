import Token from '../../../api/token';
import Login from '../../../api/login';
import Api from '../../../api/api';
import { NativeModules, Linking, PermissionsAndroid} from 'react-native';

import { 
  SPLASHSCREEN_IS_LOADING,
  COMMON_LOGIN,
  COMMON_LOGOUT,
  COMMON_OPERATION_TIME,
  COMMON_BUSINESS_TYPE,
  COMMON_APP_GOALS,
  COMMON_FINANCE_MANAGEMENT
} from '../../../utils/constants';

const { Piida } = NativeModules;

export const isLoading = () => {
  return(dispatch) => {
    dispatch({ type: SPLASHSCREEN_IS_LOADING, payload: false });
  }
}

export const init = (param) => {
  return(dispatch) => {
    Piida.initSDK();
  }
}

export const login = (email, password) => { 
  return (dispatch) => {
    Token.getToken()
    .then(token => {
      Login.appLogin(token, email, password)
      .then(response =>{
        if(response.logged){
          dispatch({ type: COMMON_LOGIN, payload: response });
          dispatch({ type: SPLASHSCREEN_IS_LOADING, payload: false });
        }
        else{
          dispatch({ type: COMMON_LOGOUT, payload: response });
          dispatch({ type: SPLASHSCREEN_IS_LOADING, payload: false });
          dispatch(getOperation());
          dispatch(getBusinessType());
          dispatch(getAppGoals());
          dispatch(getFinanceManagement());
        } 
      })
      .catch(() =>{
        dispatch({ type: COMMON_LOGOUT, payload: response });
        dispatch({ type: SPLASHSCREEN_IS_LOADING, payload: false });
      })
    })
    .catch(() => {
      dispatch({ type: COMMON_LOGOUT, payload: response });
      dispatch({ type: SPLASHSCREEN_IS_LOADING, payload: false });
    })
  }
};

export const getOperation = () => {
  return(dispatch) => {
    Api.getOperationTime()
    .then(res => {
      dispatch({ type: COMMON_OPERATION_TIME, payload: res });
    })
  }
}

export const getBusinessType = () => {
  return(dispatch) => {
    Api.getBusinessType()
    .then(res => {
      dispatch({ type: COMMON_BUSINESS_TYPE, payload: res });
    })
  }
}

export const getAppGoals = () => {
  return(dispatch) => {
    Api.getAppGoals()
    .then(res => {
      dispatch({ type: COMMON_APP_GOALS, payload: res });
    })
  }
}

export const getFinanceManagement = () => {
  return(dispatch) => {
    Api.getFinanceManagement()
    .then(res => {
      dispatch({ type: COMMON_FINANCE_MANAGEMENT, payload: res });
    })
  }
}