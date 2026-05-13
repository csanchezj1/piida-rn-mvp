import TokenAPI from '../../api/token';
import DeviceAPI from '../../api/firebaseToken';
import branchApi from '../../api/branch';
import CashManagement from '../../api/cashManagement';

import {
  NAVIGATION_SHOW_DRAWER,
  NAVIGATION_DIALOG_VISILE,
  COMMON_LOGOUT,
  BALANCE_LIST,
  BALANCE_TOTAL,
  HOME_TOTAL,
  INVENTORY_LIST,
  INVENTORY_TOTAL,
  DIALOG_SHOW,
  DIALOG_VISIBLE,
  DIALOG_RESET,
  BRANCH_MODAL_VISIBLE,
  BRANCH_SET_ACTIVE,
  BRANCH_SET_LIST,
  CASH_SHIFT_SET,
  CASH_SHIFT_CLEAR,
} from '../../utils/constants';

export const showDrawer = (show) => {
  return(dispatch) =>{
    dispatch({type: NAVIGATION_SHOW_DRAWER, payload:show});
  }
};

export const dialogVisible = (show) => {
  return(dispatch) =>{
    dispatch({type: NAVIGATION_DIALOG_VISILE, payload:show});
  }
};

export const logout = () => {
  return(dispatch, getState) =>{
    const {
      firebaseToken
    } = getState().userData;

    TokenAPI.getToken()
    .then(token => {
      DeviceAPI.deleteFCM(token, firebaseToken)
    })
    
    dispatch({type: COMMON_LOGOUT});
    dispatch({type: NAVIGATION_DIALOG_VISILE, payload:false});
    dispatch({ type: BALANCE_LIST, payload: null });
    dispatch({ type: BALANCE_TOTAL, payload: null });
    dispatch({ type: HOME_TOTAL, payload: null });
    dispatch({ type: INVENTORY_LIST, payload: null });
    dispatch({ type: INVENTORY_TOTAL, payload: [] });
  }
};

export const showSubscriptionMessage = (name, navigation) => {
  return(dispatch) =>{
    let title = '';
    let message = '';
    switch (name) {
      case 'nosale':
        title = 'Venta';
        message = 'Has alcanzado el límite diario de registro de ventas. Recuerda que para poder registrar un número ilimitado de tus ventas debes poseer una suscripción premium.';
        break;
      case 'notransfer':
        title = 'Traslado de inventario';
        message = 'Recuerda que este servicio está disponible con tu suscripción premium.';
        break;
      case 'nomovement':
        title = 'Gasto';
        message = 'Has alcanzado el límite diario de movimientos. Recuerda que para poder registrar un número ilimitado de gastos debes poseer una suscripción premium.';
        break;
    }
    dispatch({
      type: DIALOG_SHOW,
      payload: { 
        title,
        message,
        acceptTitle:'Ver planes',
        showCancelButton:true,
        acceptAction:() => {
          navigation.navigate('Plans'),
          dispatch(hide())
        }
      }
    });
  }
};

export const hide = () => {
  return(dispatch) => {
    dispatch({ type: DIALOG_VISIBLE, payload: false})
    dispatch({ type: DIALOG_RESET})
  };
};

// ─── Bloque 4 multi-sucursal — switcher ───────────────────
export const showBranchModal = (visible) => {
  return (dispatch) => {
    dispatch({ type: BRANCH_MODAL_VISIBLE, payload: visible });
  };
};

export const setActiveBranch = (id) => {
  return (dispatch) => {
    dispatch({ type: BRANCH_SET_ACTIVE, payload: id });
    dispatch({ type: BRANCH_MODAL_VISIBLE, payload: false });
    dispatch({ type: NAVIGATION_SHOW_DRAWER, payload: false });
    // Al cambiar de sucursal, refrescamos el estado del turno: el back
    // filtra por X-Branch-Id, así que open/close de otra sucursal no
    // contaminan ésta. CASH_SHIFT_CLEAR primero para evitar que el FAB
    // muestre por un instante el shift de la sucursal anterior.
    dispatch({ type: CASH_SHIFT_CLEAR });
    dispatch(refreshCashStatus());
  };
};

/**
 * Consulta GET /api/v2/cash/status (el wrapper axios inyecta X-Branch-Id
 * automáticamente desde activeBranchData) y guarda el resultado en
 * cashShiftData. Se usa en cada momento donde el turno puede haber cambiado:
 *   - cambio de sucursal
 *   - foco de la home / pantalla de venta
 *   - después de open/close/loan
 */
export const refreshCashStatus = () => {
  return (dispatch, getState) => {
    const branchId = getState().activeBranchData?.activeBranchId ?? null;
    TokenAPI.getToken()
      .then((token) => CashManagement.getCashStatus({ token }))
      .then((response) => {
        dispatch({
          type: CASH_SHIFT_SET,
          payload: {
            activeShiftId: response?.current?.nid ?? 0,
            hasOpenShift: !!response?.has_open_shift,
            branchId,
          },
        });
      })
      .catch(() => {
        // Falla silenciosa: el FAB queda con el último estado conocido
        // y se reintentará en el próximo focus.
      });
  };
};

/** Refresca la lista de branches del user — útil tras crear una nueva. */
export const refreshBranches = () => {
  return (dispatch, getState) => {
    const { user, password } = getState().userData;
    if (!user?.email || !password) return;
    branchApi.getMyBranches(user.email, password)
      .then(branches => {
        dispatch({
          type: BRANCH_SET_LIST,
          payload: Array.isArray(branches) ? branches : [],
        });
      })
      .catch(() => {});
  };
};
