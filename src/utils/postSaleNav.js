import {setLastSaleScreen} from './lastSalePref';

// Reset post-venta condicional según el origen del checkout.
//   from === 'VentaLibre' → vuelve a VentaLibre (cajero estaba en teclado libre).
//   resto (incluye 'NewSale' y undefined) → BottomMenu (catálogo, tab Home).
//
// Side-effect: persiste el `from` en AsyncStorage (`lastSaleScreen`) para
// que la próxima vez que el usuario abra la app o toque "VENTA" en el
// sidebar arranque en esa pantalla.
export const postSaleNavReset = (navigation, from) => {
  const lastScreen = from === 'VentaLibre' ? 'VentaLibre' : 'NewSale';
  setLastSaleScreen(lastScreen); // fire-and-forget
  const target = from === 'VentaLibre' ? 'VentaLibre' : 'BottomMenu';
  navigation.reset({
    index: 0,
    routes: [{name: target}],
  });
};
