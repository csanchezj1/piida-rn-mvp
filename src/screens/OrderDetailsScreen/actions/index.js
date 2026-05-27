import Order from '../../../api/order';
import {printReceipt} from '../../../utils/printing/printerService';
import {getPrinterPrefs} from '../../../utils/printing/preferences';

import {
  ORDER_DETAILS_ITEMS,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_SHOW,
} from '../../../utils/constants';


export const getItems = (order) => {
  return(dispatch) =>{
    Order.getItems(order)
    .then(res => {
      dispatch({ type: ORDER_DETAILS_ITEMS, payload: res });
    })
  }
};

export const clear = () => {
  return(dispatch) =>{
    dispatch({ type: ORDER_DETAILS_ITEMS, payload: null });
  }
};

// Imprime el comprobante de la orden actual. Mismo patrón que
// BuyDetailsScreen/reprintReceipt: dispatch de DIALOG_SHOW para que el usuario
// vea si falta la impresora o si la impresión falló.
export const printOrder = (details) => {
  return async (dispatch, getState) => {
    const {user} = getState().userData;
    const {items} = getState().orderDetailsData;
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
      // Preferimos los datos denormalizados que vienen en la orden (defensa
      // en profundidad por si el user en redux no tiene company_name aún —
      // login response viejo). Fallback al user.
      const receipt = {
        companyName: items?.company_name || user?.company_name,
        branchName: items?.branch_office_name || user?.branch_office_name,
        branchPhone: items?.branch_office_phone || user?.branch_office_phone,
        branchAddress: items?.branch_office_address,
        consecutive: details?.consecutive,
        movementType: 'Comprobante',
        date: details?.date,
        items: (items?.items || []).map((it) => {
          const qty = Number(it.qty) || 0;
          const price = Number(it.price) || 0;
          const subtotal = Number(it.subtotal) || price * qty;
          return {
            name: it.name || it.product || 'Item',
            qty,
            price,
            subtotal,
          };
        }),
        total: details?.value,
        paid: details?.paid,
        paymentMethods: (items?.payments || []).map((p) => ({
          label: p.payment_method || (typeof p.type === 'string' ? p.type : p.type?.label) || 'Pago',
          value: p.value,
        })),
        customer: details?.customer,
        observations: details?.observations,
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
