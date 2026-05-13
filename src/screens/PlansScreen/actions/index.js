import Subscription from "../../../api/subscription";
import Token from "../../../api/token";

import { 
  PLAN_PRICE,
  PLAN_CLEAR, 
  PLAN_ERROR,
  PLAN_INFO,
  DIALOG_SHOW,
  PLAN_PLAN,
  PLAN_PLAN_SELECTED,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_RESET
} from "../../../utils/constants"

export const getPlans = () => {
  return(dispatch, getState) => {
    const{
      user
    } = getState().userData;
    Subscription.getPlans(user.uid)
    .then(response => {
      dispatch({type:PLAN_INFO, payload:response});
    })
  }
}

export const selectPlan = (item) => {
  return(dispatch) => {
    dispatch({type:PLAN_PLAN_SELECTED, payload:item});
  }
}

export const validate = (navigation) => {
  return(dispatch, getState) =>{
    const{
      price
    } = getState().planData;
    if(price){
      navigation.navigate('CreateCreditCard');
    }
    else{
      dispatch({type:PLAN_ERROR, payload:true});
      dispatch({
        type: DIALOG_SHOW,
        payload: { 
          title:'Suscripción',
          message:'Por favor selecciona un plan para poder continuar',
        }
      });
    }
  }
}

export const priceChange = (price) => {
  return(dispatch, getState) => {
    const{
      planSelected
    } = getState().planData;
    dispatch({type:PLAN_PRICE, payload:price});
    dispatch({type:PLAN_PLAN, payload:planSelected.id});
    dispatch({type:PLAN_ERROR, payload:false});
  }
}

export const clear = () => {
  return(dispatch) => {
    dispatch({type:PLAN_CLEAR})
  }
}

export const showSubCancel = (date, id) => {
  return(dispatch) => {
    dispatch({
      type: DIALOG_SHOW,
      payload: { 
        title:'¿Estas seguro que deseas desactivar tu suscripción?',
        message:'Una vez que canceles, tu suscripción finalizará el ' + date + ' y a partir de esa fecha no podrás usar las funcionalidades premium de Piida.',
        acceptTitle:'Cancelar suscripción',
        acceptAction:() => dispatch(cancelSubscription(id))
      }
    });
  }
}

export const showSubContinue = (id) => {
  return(dispatch) => {
    dispatch({
      type: DIALOG_SHOW,
      payload: { 
        title:'Anular cancelación',
        message:'Al hacer clic en Aceptar, anulas tu solicitud previa de cancelación. Te daremos acceso a las funcionalidades Premium igual que antes. La fecha de renovación del plan se mantiene. La cancelación aún puede hacerse en cualquier momento y entrará en vigor cuando termine el período de facturación. Gracias por quedarte en Piida Premium.',
        acceptAction:() => dispatch(continueSubscription(id))
      }
    });
  }
}

export const cancelSubscription = (id) => {
  return(dispatch) => {
    dispatch({ type: DIALOG_RESET});
    dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
    Token.getToken()
    .then(token => {
      Subscription.cancelSubscription({
        token,
        subscriptionID:id
      })
      .then(() => {
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
        dispatch({
          type: DIALOG_SHOW,
          payload: { 
            title:'Suscripción cancelada exitosamente',
            message:'Haremos efectiva la cancelación una vez finalice el periodo facturado',
          }
        });
        dispatch({type:PLAN_CLEAR});
        dispatch(getPlans());
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
  }
}

export const continueSubscription = (id) => {
  return(dispatch) => {
    dispatch({ type: DIALOG_RESET});
    dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
    Token.getToken()
    .then(token => {
      Subscription.continueSubscription({
        token,
        subscriptionID:id
      })
      .then(() => {
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
        dispatch({
          type: DIALOG_SHOW,
          payload: { 
            title:'Piida Premium',
            message:'Suscripción reactivada exitosamente.',
          }
        });
        dispatch({type:PLAN_CLEAR});
        dispatch(getPlans());
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
  }
}