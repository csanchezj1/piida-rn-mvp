import AsyncStorage from '@react-native-async-storage/async-storage';

// Recuerda qué pantalla de venta usó el cajero la última vez que finalizó
// una venta. Al abrir la app o tocar "VENTA" en el sidebar, navegamos a
// esa pantalla — es la que el cajero está acostumbrado a usar.
//
// Valores válidos: 'VentaLibre' | 'NewSale'. Default: 'NewSale' (catálogo)
// porque era el comportamiento histórico antes del cambio.
const KEY = 'piida:lastSaleScreen';

export const setLastSaleScreen = async (screen) => {
  if (screen !== 'VentaLibre' && screen !== 'NewSale') return;
  try {
    await AsyncStorage.setItem(KEY, screen);
  } catch (_) {
    // best-effort, no rompemos el flujo de venta si falla el guardado.
  }
};

export const getLastSaleScreen = async () => {
  try {
    const v = await AsyncStorage.getItem(KEY);
    if (v === 'VentaLibre' || v === 'NewSale') return v;
  } catch (_) {}
  return 'NewSale';
};

// Helper para el sidebar: dado el `getLastSaleScreen()` async, devolvemos
// la ruta + params de Stack a la que hay que navegar.
//   'VentaLibre' → {route: 'VentaLibre'}
//   'NewSale'    → {route: 'BottomMenu', params: {screen: 'Home'}}
export const lastSaleNavTarget = async () => {
  const screen = await getLastSaleScreen();
  if (screen === 'VentaLibre') return {route: 'VentaLibre'};
  return {route: 'BottomMenu', params: {screen: 'Home'}};
};
