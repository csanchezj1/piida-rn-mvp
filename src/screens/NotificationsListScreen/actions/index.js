import Notifications from '../../../api/notifications';

import {
  NOTIFICATIONS_LIST,
  NOTIFICATIONS_UNREAD_COUNT,
} from '../../../utils/constants';

// MVP F5: el inbox se llena con notifs persistidas en el back. Auth real
// (email+password) — el endpoint /api/v2/notifications no acepta magic.

export const getNotifications = () => {
  return (dispatch, getState) => {
    const {user, password} = getState().userData;
    if (!user?.email || !password) {
      dispatch({type: NOTIFICATIONS_LIST, payload: []});
      return;
    }
    Notifications.list({email: user.email, password, offset: 0, limit: 30})
      .then((res) => {
        const items = Array.isArray(res?.items) ? res.items : [];
        dispatch({type: NOTIFICATIONS_LIST, payload: items});
      })
      .catch((err) => {
        console.log('[Notifications] list err:', err?.data?.error || err?.message || err);
        dispatch({type: NOTIFICATIONS_LIST, payload: []});
      });
  };
};

export const getUnreadCount = () => {
  return (dispatch, getState) => {
    const {user, password} = getState().userData;
    if (!user?.email || !password) return;
    Notifications.unreadCount({email: user.email, password})
      .then((res) => {
        dispatch({type: NOTIFICATIONS_UNREAD_COUNT, payload: res?.count ?? 0});
      })
      .catch(() => undefined);
  };
};

export const markRead = (id) => {
  return (dispatch, getState) => {
    const {user, password} = getState().userData;
    const {list} = getState().notificationsListData;
    // Optimista
    const updated = (list || []).map((n) =>
      n.id === id ? {...n, isRead: true} : n,
    );
    dispatch({type: NOTIFICATIONS_LIST, payload: updated});
    if (!user?.email || !password) return;
    Notifications.markRead({email: user.email, password, id})
      .then(() => dispatch(getUnreadCount()))
      .catch(() => undefined);
  };
};

export const markAllRead = () => {
  return (dispatch, getState) => {
    const {user, password} = getState().userData;
    const {list} = getState().notificationsListData;
    const updated = (list || []).map((n) => ({...n, isRead: true}));
    dispatch({type: NOTIFICATIONS_LIST, payload: updated});
    dispatch({type: NOTIFICATIONS_UNREAD_COUNT, payload: 0});
    if (!user?.email || !password) return;
    Notifications.markAllRead({email: user.email, password}).catch(() => undefined);
  };
};

export const clear = () => {
  return (dispatch) => {
    dispatch({type: NOTIFICATIONS_LIST, payload: null});
  };
};
