import Order from '../../../api/order';
import Movements from '../../../api/movements';
import Token from '../../../api/token';
import {printReceipt} from '../../../utils/printing/printerService';
import {getPrinterPrefs} from '../../../utils/printing/preferences';

import {
  BUY_DETAILS_ITEMS,
  BUY_DETAILS_PAYMENTS,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_SHOW,
  BRANCH_REFETCH_TICK,
  BALANCE_REMOVE_ITEM,
} from '../../../utils/constants';


export const getItems = (order) => {
  return (dispatch) => {
    Order.getItems(order)
      .then(res => {
        dispatch({ type: BUY_DETAILS_ITEMS, payload: res });
      })
  }
};

export const getPayments = (nid) => {
  return (dispatch) => {
    if (!nid) {
      dispatch({ type: BUY_DETAILS_PAYMENTS, payload: [] });
      return;
    }
    Token.getToken()
      .then(token => {
        Movements.getPayments({ token, nid })
          .then(res => {
            // El back NestJS devuelve { payment_method, value, ... }, pero el
            // componente legacy renderiza item.type. Normalizamos para que
            // siempre haya un nombre visible aunque el back cambie de shape.
            const list = Array.isArray(res) ? res : [];
            const normalized = list.map((p) => ({
              ...p,
              type: p.type || p.payment_method || p.method || p.name || '',
            }));
            dispatch({ type: BUY_DETAILS_PAYMENTS, payload: normalized });
          })
          .catch((err) => {
            // No es una venta (gastos, transferencias) → no hay medios de pago.
            console.log('[BuyDetails] getPayments error:', err?.data?.error || err?.message || err);
            dispatch({ type: BUY_DETAILS_PAYMENTS, payload: [] });
          })
      })
  }
};

export const clear = () => {
  return (dispatch) => {
    dispatch({ type: BUY_DETAILS_ITEMS, payload: null });
    dispatch({ type: BUY_DETAILS_PAYMENTS, payload: [] });
  }
};

export const reprintReceipt = (details) => {
  return async (dispatch, getState) => {
    const {user} = getState().userData;
    const {items, payments} = getState().buyDetailsData;
    dispatch({type: PROGRESS_VISIBLE_CHANGE, payload: true});
    try {
      const prefs = await getPrinterPrefs();
      if (!prefs.address) {
        dispatch({
          type: DIALOG_SHOW,
          payload: {
            title: 'Sin impresora',
            message: 'No hay impresora configurada. Vé a "Configurar impresora" en el menú.',
          },
        });
        return;
      }
      const receipt = {
        companyName: user?.company_name,
        branchName: user?.branch_office_name,
        branchPhone: user?.branch_office_phone,
        consecutive: details?.orderConsecutive,
        movementType: details?.movementType,
        date: details?.date,
        items: (items?.items || details?.product || []).map((it) => ({
          name: it.name || it.product || it.label || 'Item',
          qty: it.qty,
          price: it.price ?? (it.subtotal && it.qty ? it.subtotal / it.qty : 0),
          subtotal: it.subtotal ?? it.value ?? (it.price || 0) * (it.qty || 0),
        })),
        total: details?.total,
        paid: details?.paid,
        paymentMethods: (payments || []).map((p) => ({type: {label: p.type}, value: p.value})),
        customer: details?.customer,
      };
      await printReceipt(receipt, {openDrawer: false});
    } catch (e) {
      dispatch({
        type: DIALOG_SHOW,
        payload: {
          title: 'Error de impresión',
          message: e?.message || 'No se pudo imprimir el recibo.',
        },
      });
    } finally {
      dispatch({type: PROGRESS_VISIBLE_CHANGE, payload: false});
    }
  };
};

export const deleteMovement = (nid, navigation, reason) => {
  return (dispatch, getState) => {
    dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
    const uid = getState().userData?.user?.uid;
    Token.getToken()
      .then(token => {
        // El back v2 requiere reason (motivo) y uid (usuario que cancela).
        // Si vino reason vacío usamos texto por defecto para no fallar — pero
        // el component muestra modal pidiendo motivo antes de invocar.
        Movements.deleteMovement({ token, nid, reason: reason || 'Cancelado desde la app', uid })
          .then(res => {
            dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
            if (res.success) {
              // 1. Eliminar el item del listado de Redux de forma inmediata
              //    (actualización optimista) para que no vuelva a aparecer
              //    mientras el re-fetch está en progreso.
              dispatch({ type: BALANCE_REMOVE_ITEM, payload: nid });
              // 2. Incrementar tick para que BalanceScreen recargue el listado
              dispatch({ type: BRANCH_REFETCH_TICK });
              // 3. Navegar de vuelta
              navigation.goBack();
              // 4. Mostrar el diálogo de éxito ya en BalanceScreen
              dispatch({
                type: DIALOG_SHOW,
                payload: {
                  title: 'Éxito',
                  message: res.message || 'Registro eliminado correctamente.',
                }
              });
            } else {
              dispatch({
                type: DIALOG_SHOW,
                payload: {
                  title: 'Error',
                  message: res.error || 'Ocurrió un error',
                }
              });
            }
          })
          .catch((err) => {
            console.log('err', err);
            dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
            dispatch({
              type: DIALOG_SHOW,
              payload: {
                title: 'Error',
                message: err?.data?.error || err?.message || 'Ocurrió un error de conexión',
              }
            });
          })
      })
  }
};