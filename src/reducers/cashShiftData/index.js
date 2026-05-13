import {
  CASH_SHIFT_SET,
  CASH_SHIFT_CLEAR,
  COMMON_LOGOUT,
} from '../../utils/constants';

/**
 * Estado del turno activo, scoped a la sucursal activa del usuario.
 * Se refresca desde el server (getCashStatus) cada vez que:
 *   - Cambia la sucursal activa (BRANCH_SET_ACTIVE)
 *   - Se monta la home / pantalla de venta
 *   - Se abre/cierra/préstamo (BoxScreen submit)
 *
 * Esto reemplaza el uso de userData.user.cash_id (que no era branch-aware
 * y quedaba stale si la caja se cerraba desde otra app/web).
 */
const initialState = {
  activeShiftId: 0,         // 0 = sin turno abierto
  hasOpenShift: false,
  branchId: null,           // sucursal del último refresh
  lastLoaded: 0,            // timestamp del último refresh
};

const cashShiftData = (state = initialState, action) => {
  switch (action.type) {
    case CASH_SHIFT_SET: {
      const p = action.payload || {};
      return {
        ...state,
        activeShiftId: p.activeShiftId ?? 0,
        hasOpenShift: !!p.hasOpenShift,
        branchId: p.branchId ?? null,
        lastLoaded: Date.now(),
      };
    }
    case CASH_SHIFT_CLEAR:
    case COMMON_LOGOUT:
      return { ...initialState };
    default:
      return state;
  }
};

export default cashShiftData;
