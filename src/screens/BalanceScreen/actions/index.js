import API from '../../../api/api';
import Movements from '../../../api/movements';

import {
  BALANCE_LIST,
  BALANCE_TOTAL,
  BALANCE_REQUEST_MADE,
  BALANCE_SHOW_LOADER,
  BALANCE_LIST_OFFSET,
  BALANCE_SHOW_REFRESH,
  HOME_BUTTON_STATE,
  BALANCE_MARK_CANCELLED,
  DIALOG_SHOW,
  PROGRESS_VISIBLE_CHANGE,
  BRANCH_REFETCH_TICK,
} from '../../../utils/constants';


export const changeState = (state) => {
  return (dispatch) => {
    dispatch({ type: HOME_BUTTON_STATE, payload: state });
  }
};

export const getBalance = (uid) => {
  return (dispatch) => {
    Movements.getBalance(uid)
      .then((res) => {
        dispatch({ type: BALANCE_TOTAL, payload: res });
      });
  }
};

export const getMovements = (pp_id, resetOffset) => {
  return (dispatch, getState) => {
    const { offset, list, requestMade } = getState().balanceData;
    dispatch({ type: BALANCE_SHOW_REFRESH, payload: false });
    if (resetOffset) {
      dispatch({ type: BALANCE_LIST, payload: null });
    }
    let currentOffset = resetOffset ? 0 : offset;
    if (!requestMade || resetOffset) {
      dispatch({ type: BALANCE_REQUEST_MADE, payload: true });
      dispatch({ type: BALANCE_SHOW_LOADER, payload: true });
      API.getMovementsPurchase(pp_id, currentOffset)
        .then(response => {
          dispatch({ type: BALANCE_SHOW_LOADER, payload: false });
          let currentList = resetOffset ? null : list;
          if (currentList != null) {
            if (response.length > 0) {
              var nextOffset = currentOffset + 10;
              dispatch({ type: BALANCE_LIST_OFFSET, payload: nextOffset });
              dispatch({ type: BALANCE_REQUEST_MADE, payload: false });
              let newList = JSON.parse(JSON.stringify(currentList));
              response.map(item => {
                const index = newList.findIndex(e => e.date == item.created);
                if (index !== -1) {
                  if (!newList[index].children.some(child => child.id === item.id)) {
                    newList[index].children.push(item);
                  }
                } else {
                  newList.push({ date: item.created, children: [item] });
                }
              });
              dispatch({ type: BALANCE_LIST, payload: newList });
            }
          } else {
            var nextOffset = currentOffset + 10;
            dispatch({ type: BALANCE_LIST_OFFSET, payload: nextOffset });
            dispatch({ type: BALANCE_REQUEST_MADE, payload: false });
            let element = [];
            response.map(item => {
              const index = element.findIndex(e => e.date == item.created);
              if (index !== -1) {
                if (!element[index].children.some(child => child.id === item.id)) {
                  element[index].children.push(item);
                }
              } else {
                element.push({ date: item.created, children: [item] });
              }
            });
            dispatch({ type: BALANCE_LIST, payload: element });
          }
        });
    }
  }
};

/**
 * Cancela (soft) un movimiento desde el listado. Requiere motivo.
 * Optimistic: marca el item como CANCELLED en Redux. En caso de error,
 * dispara refetch para volver al estado real.
 */
export const deleteMovementInline = (nid, reason, onComplete) => {
  return (dispatch, getState) => {
    dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
    const uid = getState().userData?.user?.uid;

    Movements.deleteMovement({ nid, reason, uid })
      .then(res => {
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
        if (res.success) {
          // Marcamos cancelado en el listado (no lo removemos: queda visible
          // con badge "Cancelado").
          dispatch({
            type: BALANCE_MARK_CANCELLED,
            payload: {
              nid,
              cancellation_reason: res.cancellation_reason ?? reason,
              cancelled_at: res.cancelled_at ?? new Date().toISOString(),
            },
          });
          dispatch({
            type: DIALOG_SHOW,
            payload: {
              title: 'Movimiento cancelado',
              message: res.message || 'El movimiento quedó marcado como cancelado.',
            },
          });
          if (typeof onComplete === 'function') onComplete();
        } else {
          dispatch({ type: BRANCH_REFETCH_TICK });
          dispatch({
            type: DIALOG_SHOW,
            payload: {
              title: 'Error',
              message: res.error || 'No se pudo cancelar el movimiento.',
            }
          });
          if (typeof onComplete === 'function') onComplete();
        }
      })
      .catch(err => {
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
        dispatch({ type: BRANCH_REFETCH_TICK });
        const msg =
          err?.data?.message ||
          err?.data?.error ||
          err?.message ||
          'Error al cancelar el movimiento.';
        dispatch({
          type: DIALOG_SHOW,
          payload: { title: 'Error', message: msg }
        });
        if (typeof onComplete === 'function') onComplete();
      });
  };
};

export const clear = () => {
  return (dispatch) => {
    dispatch({ type: BALANCE_LIST, payload: null });
    dispatch({ type: BALANCE_TOTAL, payload: null });
  }
};