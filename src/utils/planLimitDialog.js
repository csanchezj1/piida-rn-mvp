import {DIALOG_SHOW} from './constants';

/**
 * Detecta si un error del back es un límite/restricción del plan (403 con
 * mensaje sobre "límite", "plan" o "suscripción inactiva").
 *
 * Forma del error que recibe el cliente (NestJS):
 *   e.data.statusCode === 403
 *   e.data.message  === "Alcanzaste el límite diario de 30 ventas..."
 */
const isPlanLimitError = (e) => {
  const status = e?.data?.statusCode ?? e?.status ?? null;
  if (status !== 403) return false;
  const msg = e?.data?.message ?? e?.data?.error ?? '';
  return /l[íi]mite|alcanzaste|suscripci[óo]n.*inactiva|plan.*incluye|reactivala/i.test(msg);
};

/**
 * Helper que arma el dispatch del DIALOG correcto.
 *  - Si el error es un límite de plan: dialog amigable + CTA "Ver planes"
 *    que navega a BillingScreen (Suscripción y pagos).
 *  - Si es cualquier otro: dialog genérico "Error" con el mensaje del back
 *    o el fallback de "comunicación con el servidor".
 *
 * Uso:
 *   .catch((e) => {
 *     dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
 *     dispatch(buildErrorDialog(e, navigation));
 *   });
 */
export const buildErrorDialog = (e, navigation) => {
  const backMsg = e?.data?.message
    || (Array.isArray(e?.data?.errors) ? e.data.errors.join('. ') : null)
    || e?.data?.error;

  if (isPlanLimitError(e)) {
    return {
      type: DIALOG_SHOW,
      payload: {
        title: 'Necesitás mejorar tu plan',
        message: backMsg || 'Has alcanzado un límite de tu plan actual. Mejoralo para continuar.',
        acceptTitle: 'Ver planes',
        showCancelButton: true,
        cancelTitle: 'Cerrar',
        acceptAction: () => navigation.navigate('Billing'),
      },
    };
  }

  return {
    type: DIALOG_SHOW,
    payload: {
      title: 'Error',
      message: backMsg || 'Hubo un error de comunicación con el servidor, por favor revisa tu conexión y/o intenta más tarde.',
    },
  };
};
