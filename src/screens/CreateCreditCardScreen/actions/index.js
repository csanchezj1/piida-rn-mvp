import Login from '../../../api/login';
import Subscription from '../../../api/subscription';
import Token from '../../../api/token';

import {
  CREATE_CARD_FORM,
  CREATE_CARD_CCV_ERROR,
  CREATE_CARD_EXPIRY_ERROR,
  CREATE_CARD_NAME_ERROR,
  CREATE_CARD_NUMBER_ERROR,
  CREATE_CARD_CLEAR,
  DIALOG_SHOW,
  PROGRESS_VISIBLE_CHANGE,
  CREATE_CARD_IDENTIFICATION,
  CREATE_CARD_IDENTIFICATION_ERROR,
  CREATE_CARD_MODE,  
  COMMON_LOGIN
} from '../../../utils/constants';

export const clear = () => { 
  return (dispatch) => {
    dispatch({type: CREATE_CARD_CLEAR})
  };
};

export const cardFormChange = (form) => { 
  return (dispatch) => {
    dispatch({type: CREATE_CARD_FORM, payload: form});
    dispatch({type: CREATE_CARD_CCV_ERROR, payload: null});
    dispatch({type: CREATE_CARD_EXPIRY_ERROR, payload: null});
    dispatch({type: CREATE_CARD_NAME_ERROR, payload: null});
    dispatch({type: CREATE_CARD_NUMBER_ERROR, payload: null});
    dispatch({type: CREATE_CARD_IDENTIFICATION_ERROR, payload: null});
  };
};

export const identificationChange = (form) => { 
  return (dispatch) => {
    if(form != ''){
      dispatch({type: CREATE_CARD_IDENTIFICATION, payload: form});
    }
    else{
      dispatch({type: CREATE_CARD_IDENTIFICATION, payload: null});
    }
    dispatch({type: CREATE_CARD_IDENTIFICATION_ERROR, payload: null});
    dispatch({type: CREATE_CARD_CCV_ERROR, payload: null});
    dispatch({type: CREATE_CARD_EXPIRY_ERROR, payload: null});
    dispatch({type: CREATE_CARD_NAME_ERROR, payload: null});
    dispatch({type: CREATE_CARD_NUMBER_ERROR, payload: null});
  };
};

export const changeMode = (mode) => { 
  return (dispatch) => {
    dispatch({type: CREATE_CARD_MODE, payload: mode});
  };
};

export const createCard = (navigation) => { 
  return (dispatch, getState) => {
    const {
      idForm,
      cardForm
    } = getState().createCreditCardData;

    const {
      user,
    } = getState().userData;

    const { 
      price,
      plan
    } = getState().planData;

    if(cardForm){
      if(cardForm.valid && idForm){
        let expiry = cardForm.values.expiry.split('/');
        let franchise = cardForm.values.type.toUpperCase().replace('-', '');
        if(franchise == 'AMERICANEXPRESS'){
          franchise = 'AMEX';
        }
        else if(franchise == 'DINERSCLUB'){
          franchise = 'DINERS';
        }
      
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
        Token.getToken()
        .then(token =>{
          Subscription.createCreditCard({
            token,
            uid:user.uid,
            number:cardForm.values.number.split(' ').join(''),
            ccv:cardForm.values.cvc,
            expiration:'20' + expiry[1] + '/' + expiry[0],
            name:cardForm.values.name,
            dni:idForm,
            franchise
          })
          .then(response => {           
            if(response.card_id != 0){
              Subscription.createSubscription({
                token, 
                uid:user.uid,
                planID:plan,
                subscriptionID:price.id,
                cardID:response.card_id
              })
              .then(res => {
                dispatch(login())
                let message = 'Felicidades, tu suscripción quedó activada';
                if(res.success){
                  navigation.reset({
                    index: 0,
                    routes: [
                      {name: 'BottomMenu'},
                    ],
                  })
                }
                else{
                  message = res.error
                }
                dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
                dispatch({
                  type: DIALOG_SHOW,
                  payload: {
                    title:'Suscripción',
                    message
                  }
                });
              })
              .catch((e) =>{
                console.log(e)
                dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
                dispatch({
                  type: DIALOG_SHOW,
                  payload: {
                    message:'Hubo un error de comunicación con el servidor, revisa tu conexión y/o intenta mas tarde',
                  }
                });
              })
            }
            else{
              dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
              dispatch({
                type: DIALOG_SHOW,
                payload: {
                  title:'Error creación tarjeta',
                  message:response.error,
                }
              });
            }
          })
          .catch((e) =>{
            console.log(e)
            dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
            dispatch({
              type: DIALOG_SHOW,
              payload: {
                message:'Hubo un error de comunicación con el servidor, revisa tu conexión y/o intenta mas tarde',
              }
            });
          })
        })
        .catch((e) =>{
          console.log(e)
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          dispatch({
            type: DIALOG_SHOW,
            payload: {
              message:'Hubo un error de comunicación con el servidor, revisa tu conexión y/o intenta mas tarde',
            }
          });
        })
      }
      else{
        if(cardForm.status.cvc != 'valid'){
          dispatch({type: CREATE_CARD_CCV_ERROR, payload: 'CVC incompleto o inválido'});
        }
        if(cardForm.status.expiry != 'valid'){
          dispatch({type: CREATE_CARD_EXPIRY_ERROR, payload: 'Fecha de expiración incompleta o inválida'});
        }
        if(cardForm.status.name != 'valid'){
          dispatch({type: CREATE_CARD_NAME_ERROR, payload: 'Nombre del titular incompleto'});
        }
        if(cardForm.status.number != 'valid'){
          dispatch({type: CREATE_CARD_NUMBER_ERROR, payload: 'Número de la tarjeta incompleto o inválido'});
        }
        if(idForm == null){
          dispatch({type: CREATE_CARD_IDENTIFICATION_ERROR, payload: 'Este campo es requerido'});
        }
      }
    }
    else{
      dispatch({type: CREATE_CARD_CCV_ERROR, payload: 'CVC incompleto o inválido'});
      dispatch({type: CREATE_CARD_EXPIRY_ERROR, payload: 'Fecha de expiración incompleta o inválida'});
      dispatch({type: CREATE_CARD_NAME_ERROR, payload: 'Nombre del titular incompleto'});
      dispatch({type: CREATE_CARD_NUMBER_ERROR, payload: 'Número de la tarjeta incompleto o inválido'});
    }
  };
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
