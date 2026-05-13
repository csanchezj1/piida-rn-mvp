import {
  BALANCE_LIST,
  BALANCE_TOTAL,
  BALANCE_REQUEST_MADE,
  BALANCE_SHOW_LOADER,
  BALANCE_SHOW_REFRESH,
  BALANCE_LIST_OFFSET,
  BALANCE_REMOVE_ITEM,
  BALANCE_MARK_CANCELLED,
} from '../../../utils/constants';

const initialState = {
  list: null,
  total:null,
  requestMade: false,
  offset:0,
  showLoader:false,
  showRrefresh:false,
  listChanged:0
};

const balanceData = (state = initialState, action) => {
  switch (action.type) {
    case BALANCE_LIST:
      return { ...state, list: action.payload, listChanged:new Date()};
    case BALANCE_TOTAL:
      return { ...state, total: action.payload};
    case BALANCE_REQUEST_MADE:
      return { ...state, requestMade: action.payload};
    case BALANCE_SHOW_LOADER:
      return { ...state, showLoader: action.payload};
    case BALANCE_SHOW_REFRESH:
      return { ...state, showRrefresh: action.payload};
    case BALANCE_LIST_OFFSET:
      return { ...state, offset: action.payload};
    case BALANCE_REMOVE_ITEM: {
      // action.payload = movement_id (nid) a eliminar
      const removeId = action.payload;
      if (!state.list) return state;
      const newList = state.list
        .map(group => ({
          ...group,
          children: group.children.filter(item => item.movement_id !== removeId && item.id !== removeId),
        }))
        .filter(group => group.children.length > 0);
      return { ...state, list: newList, listChanged: new Date() };
    }
    case BALANCE_MARK_CANCELLED: {
      // action.payload = { nid, cancellation_reason, cancelled_at }
      const { nid, cancellation_reason, cancelled_at } = action.payload || {};
      if (!state.list || nid == null) return state;
      const newList = state.list.map(group => ({
        ...group,
        children: group.children.map(item => {
          const isMatch = item.movement_id === nid || item.id === nid;
          if (!isMatch) return item;
          return {
            ...item,
            status: 'CANCELLED',
            cancellation_reason: cancellation_reason ?? item.cancellation_reason,
            cancelled_at: cancelled_at ?? item.cancelled_at,
          };
        }),
      }));
      return { ...state, list: newList, listChanged: new Date() };
    }
    default:
      return state;
  }
};

export default balanceData;