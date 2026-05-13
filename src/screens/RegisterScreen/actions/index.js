import validate from 'validate.js';
import Token from '../../../api/token';
import User from '../../../api/user';


import {
  REGISTER_MAIL_CHANGE,
  REGISTER_PASSWORD_CHANGE,
  REGISTER_CLEAR_ERRORS,
  REGISTER_FORM_FAIL,
  REGISTER_CLEAR,
  REGISTER_NAME_CHANGE,
  REGISTER_LAST_NAME_CHANGE,
  REGISTER_ID_CHANGE,
  REGISTER_PHONE_CHANGE,
  PROGRESS_VISIBLE_CHANGE,
  REGISTER_APP_GOAL_CHANGE,
  REGISTER_COMPANY_CHANGE,
  REGISTER_BUSINESS_CHANGE,
  REGISTER_BUSINESS_TEXT_CHANGE,
  DIALOG_SHOW,
  COMMON_LOGIN,
  COMMON_PASSWORD
} from '../../../utils/constants';
import { registerSignUp } from '../../../utils/analytics';

validate.options = {
  fullMessages: false
};

export const clearScreen = () => {
  return (dispatch) => {
    dispatch({ type: REGISTER_CLEAR });
    dispatch({ type: REGISTER_APP_GOAL_CHANGE, payload: [] });
  }
};

export const nameChange = (password) => {
  return (dispatch) => {
    dispatch({ type: REGISTER_NAME_CHANGE, payload: password });
    dispatch({ type: REGISTER_CLEAR_ERRORS });
  }
};

export const lastNameChange = (password) => {
  return (dispatch) => {
    dispatch({ type: REGISTER_LAST_NAME_CHANGE, payload: password });
    dispatch({ type: REGISTER_CLEAR_ERRORS });
  }
};

export const mailChange = (password) => {
  return (dispatch) => {
    dispatch({ type: REGISTER_MAIL_CHANGE, payload: password });
    dispatch({ type: REGISTER_CLEAR_ERRORS });
  }
};

export const idNumberChange = (password) => {
  return (dispatch) => {
    dispatch({ type: REGISTER_ID_CHANGE, payload: password });
    dispatch({ type: REGISTER_CLEAR_ERRORS });
  }
};

export const phoneChange = (password) => {
  return (dispatch) => {
    dispatch({ type: REGISTER_PHONE_CHANGE, payload: password });
    dispatch({ type: REGISTER_CLEAR_ERRORS });
  }
};

export const passChange = (password) => {
  return (dispatch) => {
    dispatch({ type: REGISTER_PASSWORD_CHANGE, payload: password });
    dispatch({ type: REGISTER_CLEAR_ERRORS });
  }
};

export const companyChange = (password) => {
  return (dispatch) => {
    dispatch({ type: REGISTER_COMPANY_CHANGE, payload: password });
    dispatch({ type: REGISTER_CLEAR_ERRORS });
  }
};

export const businessChange = (password) => {
  return (dispatch) => {
    dispatch({ type: REGISTER_BUSINESS_CHANGE, payload: password });
    dispatch({ type: REGISTER_BUSINESS_TEXT_CHANGE, payload: null });
    dispatch({ type: REGISTER_CLEAR_ERRORS });
  }
};

export const businessTextChange = (password) => {
  return (dispatch) => {
    dispatch({ type: REGISTER_BUSINESS_TEXT_CHANGE, payload: password });
    dispatch({ type: REGISTER_CLEAR_ERRORS });
  }
};

export const verify = ({
  name,
  lastName,
  email,
  phone,
  password,
  company,
  business,
  businessText,
  navigation
}) => {
  return (dispatch) => {
    let constraints = {
      name: {
        presence: {
          allowEmpty: false,
        },
      },
      lastName: {
        presence: {
          allowEmpty: false,
        },
      },
      email: {
        presence: {
          allowEmpty: false,
          message: 'Este campo es requerido'
        },
        email: {
          message: 'Formato inválido'
        }
      },
      phone: {
        presence: {
          allowEmpty: false,
        }
      },
      company: {
        presence: {
          allowEmpty: false,
        }
      },
      business: {
        presence: {
          allowEmpty: false,
        },
      },
      password: {
        presence: {
          allowEmpty: false,
        },
      },
    };

    if (business) {
      if (business.label == 'Otro') {
        constraints.businessText = {
          presence: {
            allowEmpty: false,
          }
        }
      }
    }
    const errors = validate({ name, lastName, email, phone, password, company, business, businessText }, constraints);
    if (errors) {
      dispatch({ type: REGISTER_FORM_FAIL, payload: errors });
    }
    else if (business && business.label && !business.label.toLowerCase().includes('ferreter')) {
      dispatch({
        type: DIALOG_SHOW,
        payload: {
          title: 'Aviso',
          message: 'Lamentamos informarte que Piida aún no ha llegado a tu sector. Pero no te preocupes, nos pondremos en contacto contigo cuando estemos disponibles para tu tipo de negocio.',
        }
      });
    }
    else {
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
      Token.getToken()
        .then(token => {
          User.createAccount({
            token,
            name,
            lastName,
            email,
            phone,
            company,
            password,
            business: business.value,
            businessText,
          })
            .then(response => {
              if (response.registered) {
                dispatch({ type: COMMON_LOGIN, payload: response });
                dispatch({ type: COMMON_PASSWORD, payload: password });
                registerSignUp(response)
              }
              dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
              dispatch({
                type: DIALOG_SHOW,
                payload: {
                  title: 'Nueva cuenta',
                  message: response.message,
                }
              });
            })
            .catch(() => {
              dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
              dispatch({
                type: DIALOG_SHOW,
                payload: {
                  title: 'Error',
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
              title: 'Error',
              message: 'Hubo un error de comunicación con el servidor, por favor revisa tu conexión y/o intenta más tarde.',
            }
          });
        })
    }
  }
};