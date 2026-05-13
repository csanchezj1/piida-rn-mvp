import {getPrinterPrefs} from './preferences';
import {printReceipt, openCashDrawer, PRINTING_IS_AVAILABLE} from './printerService';

// Dispara cajón + impresión en modo fire-and-forget. NO debe bloquear
// el navigation.reset post-venta. Si algo falla, solo lo logueamos.
//
// Importante: el cajón se abre en una llamada SEPARADA, ANTES del recibo.
// Esto garantiza que el pulso llegue a la impresora aunque después el
// papel se acabe o el ticket falle por cualquier otra razón. El recibo
// se imprime con openDrawer:false para no abrir dos veces.
export const triggerAutoPrintAfterSale = async ({receipt, isCashSale}) => {
  if (!PRINTING_IS_AVAILABLE) return;

  let prefs;
  try {
    prefs = await getPrinterPrefs();
  } catch (e) {
    console.log('[auto-print] no se pudieron leer prefs:', e?.message || e);
    return;
  }
  if (!prefs.address) return;

  // 1) Cajón primero, aislado — si falla la impresión después, el cajón
  //    ya quedó abierto.
  if (isCashSale && prefs.openDrawerOnCashSale) {
    try {
      await openCashDrawer();
    } catch (e) {
      console.log('[auto-print] openCashDrawer falló:', e?.message || e);
    }
  }

  // 2) Recibo. Si el papel se acabó, esto fallará pero ya el cajón abrió.
  if (prefs.autoPrintAfterSale) {
    try {
      await printReceipt(receipt, {openDrawer: false});
    } catch (e) {
      console.log('[auto-print] printReceipt falló:', e?.message || e);
    }
  }
};
