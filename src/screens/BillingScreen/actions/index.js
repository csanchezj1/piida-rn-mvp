import Billing from '../../../api/billing';
import {
  BILLING_LOAD,
  BILLING_LOADING,
  BILLING_BUSY,
  BILLING_ERROR,
  BILLING_CLEAR,
  DIALOG_SHOW,
} from '../../../utils/constants';

const auth = (getState) => {
  const {user, password} = getState().userData;
  return {email: user?.email, password};
};

// Coerciona a array para que la UI nunca reciba {} u otra cosa.
const asArray = (v) => (Array.isArray(v) ? v : []);

export const loadAll = () => async (dispatch, getState) => {
  dispatch({type: BILLING_LOADING, payload: true});
  dispatch({type: BILLING_ERROR, payload: null});
  try {
    const a = auth(getState);
    const [plans, cards, subscription] = await Promise.all([
      Billing.getPlans(a).catch(() => []),
      Billing.listCards(a).catch(() => []),
      Billing.getSubscription(a).catch(() => null),
    ]);
    dispatch({
      type: BILLING_LOAD,
      payload: {
        plans: asArray(plans),
        cards: asArray(cards),
        subscription: subscription && typeof subscription === 'object' ? subscription : null,
      },
    });
  } catch (e) {
    dispatch({type: BILLING_ERROR, payload: e?.message || 'Error cargando facturación.'});
  } finally {
    dispatch({type: BILLING_LOADING, payload: false});
  }
};

export const clear = () => (dispatch) => dispatch({type: BILLING_CLEAR});

export const tokenizeCard = (form) => async (dispatch, getState) => {
  dispatch({type: BILLING_BUSY, payload: true});
  try {
    const a = auth(getState);
    await Billing.tokenizeCard({...a, ...form});
    await dispatch(loadAll());
    dispatch({
      type: DIALOG_SHOW,
      payload: {title: 'Tarjeta agregada', message: 'Tu tarjeta quedó guardada.'},
    });
  } catch (e) {
    const msg =
      e?.data?.message ||
      e?.message ||
      'No se pudo tokenizar la tarjeta.';
    dispatch({type: DIALOG_SHOW, payload: {title: 'Error', message: msg}});
  } finally {
    dispatch({type: BILLING_BUSY, payload: false});
  }
};

export const removeCard = (cardId) => async (dispatch, getState) => {
  dispatch({type: BILLING_BUSY, payload: true});
  try {
    const a = auth(getState);
    await Billing.removeCard({...a, id: cardId});
    await dispatch(loadAll());
  } catch (e) {
    dispatch({
      type: DIALOG_SHOW,
      payload: {title: 'Error', message: e?.message || 'No se pudo eliminar.'},
    });
  } finally {
    dispatch({type: BILLING_BUSY, payload: false});
  }
};

export const subscribe = ({planId, creditCardId, cvv}) =>
  async (dispatch, getState) => {
    dispatch({type: BILLING_BUSY, payload: true});
    try {
      const a = auth(getState);
      await Billing.subscribe({...a, planId, creditCardId, cvv});
      await dispatch(loadAll());
      dispatch({
        type: DIALOG_SHOW,
        payload: {
          title: 'Suscripción activa',
          message: '¡Listo! Tu plan ya está activo.',
        },
      });
    } catch (e) {
      const msg =
        e?.data?.message ||
        e?.message ||
        'El cobro fue rechazado.';
      dispatch({type: DIALOG_SHOW, payload: {title: 'Error', message: msg}});
    } finally {
      dispatch({type: BILLING_BUSY, payload: false});
    }
  };

// Crea un payment intent (transferencia / efectivo). onDone se llama al
// terminar OK para que la UI cierre el modal y muestre el mensaje.
export const createPaymentIntent = ({planSlug, amount, method, reference, notes}, onDone) =>
  async (dispatch, getState) => {
    dispatch({type: BILLING_BUSY, payload: true});
    try {
      const a = auth(getState);
      await Billing.createPaymentIntent({...a, planSlug, amount, method, reference, notes});
      if (onDone) onDone();
    } catch (e) {
      const msg =
        e?.data?.message ||
        e?.message ||
        'No se pudo registrar el pago.';
      dispatch({type: DIALOG_SHOW, payload: {title: 'Error', message: msg}});
    } finally {
      dispatch({type: BILLING_BUSY, payload: false});
    }
  };

export const cancelSubscription = () => async (dispatch, getState) => {
  dispatch({type: BILLING_BUSY, payload: true});
  try {
    const a = auth(getState);
    await Billing.cancel(a);
    await dispatch(loadAll());
  } catch (e) {
    dispatch({type: DIALOG_SHOW, payload: {title: 'Error', message: e?.message}});
  } finally {
    dispatch({type: BILLING_BUSY, payload: false});
  }
};

export const resumeSubscription = () => async (dispatch, getState) => {
  dispatch({type: BILLING_BUSY, payload: true});
  try {
    const a = auth(getState);
    await Billing.resume(a);
    await dispatch(loadAll());
  } catch (e) {
    dispatch({type: DIALOG_SHOW, payload: {title: 'Error', message: e?.message}});
  } finally {
    dispatch({type: BILLING_BUSY, payload: false});
  }
};
