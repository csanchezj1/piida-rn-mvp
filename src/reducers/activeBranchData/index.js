import {
  BRANCH_SET_LIST,
  BRANCH_SET_ACTIVE,
  BRANCH_MODAL_VISIBLE,
  BRANCH_REFETCH_TICK,
  COMMON_LOGOUT,
} from '../../utils/constants';

const initialState = {
  /** Lista de sucursales del user (vía GET /api/v2/branches). */
  branches: [],
  /** ID de la sucursal activa. La inyectamos en X-Branch-Id en cada request. */
  activeBranchId: null,
  /** Modal del switcher visible. */
  modalVisible: false,
  /**
   * Contador que se incrementa al cambiar la sucursal activa. Las pantallas
   * (InventoryScreen, ProductsScreen, BalanceScreen, BoxScreen) lo escuchan
   * en useEffect para re-fetchear sus datos sin acoplar refetch a cada acción.
   */
  refetchTick: 0,
};

const activeBranchData = (state = initialState, action) => {
  switch (action.type) {
    case BRANCH_SET_LIST:
      return { ...state, branches: action.payload || [] };
    case BRANCH_SET_ACTIVE: {
      const id = action.payload == null ? null : Number(action.payload);
      // Solo "tickea" si efectivamente cambió.
      if (state.activeBranchId === id) return state;
      return {
        ...state,
        activeBranchId: id,
        refetchTick: state.refetchTick + 1,
      };
    }
    case BRANCH_MODAL_VISIBLE:
      return { ...state, modalVisible: !!action.payload };
    case BRANCH_REFETCH_TICK:
      return { ...state, refetchTick: state.refetchTick + 1 };
    case COMMON_LOGOUT:
      return { ...initialState };
    default:
      return state;
  }
};

export default activeBranchData;
