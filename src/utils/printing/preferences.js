import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  printerAddress: '@piida/printer_address',
  printerName: '@piida/printer_name',
  autoPrintAfterSale: '@piida/auto_print_after_sale',
  openDrawerOnCashSale: '@piida/open_drawer_on_cash_sale',
};

const readBool = async (key, fallback) => {
  const raw = await AsyncStorage.getItem(key);
  if (raw == null) return fallback;
  return raw === '1';
};

export const getPrinterPrefs = async () => {
  const [address, name, autoPrint, openDrawer] = await Promise.all([
    AsyncStorage.getItem(KEYS.printerAddress),
    AsyncStorage.getItem(KEYS.printerName),
    readBool(KEYS.autoPrintAfterSale, true),
    readBool(KEYS.openDrawerOnCashSale, true),
  ]);
  return {
    address: address || null,
    name: name || null,
    autoPrintAfterSale: autoPrint,
    openDrawerOnCashSale: openDrawer,
  };
};

export const setPrinter = async ({address, name}) => {
  if (address) {
    await AsyncStorage.setItem(KEYS.printerAddress, address);
    await AsyncStorage.setItem(KEYS.printerName, name || '');
  } else {
    await AsyncStorage.removeItem(KEYS.printerAddress);
    await AsyncStorage.removeItem(KEYS.printerName);
  }
};

export const setAutoPrintAfterSale = (enabled) =>
  AsyncStorage.setItem(KEYS.autoPrintAfterSale, enabled ? '1' : '0');

export const setOpenDrawerOnCashSale = (enabled) =>
  AsyncStorage.setItem(KEYS.openDrawerOnCashSale, enabled ? '1' : '0');
