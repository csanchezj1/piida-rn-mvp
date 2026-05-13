import {
  PRINTER_SETTINGS_LOAD,
  PRINTER_SETTINGS_PAIRED,
  PRINTER_SETTINGS_SELECTED,
  PRINTER_SETTINGS_AUTO_PRINT,
  PRINTER_SETTINGS_OPEN_DRAWER,
  PRINTER_SETTINGS_LOADING,
  PRINTER_SETTINGS_CLEAR,
  PRINTER_SETTINGS_FOUND,
  PRINTER_SETTINGS_SCANNING,
  PRINTER_SETTINGS_PAIRING,
} from '../../../utils/constants';

const initialState = {
  address: null,
  name: null,
  autoPrintAfterSale: true,
  openDrawerOnCashSale: true,
  paired: [],
  found: [],
  loading: false,
  scanning: false,
  pairingAddress: null,
};

const printerSettingsData = (state = initialState, action) => {
  switch (action.type) {
    case PRINTER_SETTINGS_LOAD:
      return {...state, ...action.payload};
    case PRINTER_SETTINGS_PAIRED:
      return {...state, paired: action.payload};
    case PRINTER_SETTINGS_SELECTED:
      return {...state, address: action.payload.address, name: action.payload.name};
    case PRINTER_SETTINGS_AUTO_PRINT:
      return {...state, autoPrintAfterSale: action.payload};
    case PRINTER_SETTINGS_OPEN_DRAWER:
      return {...state, openDrawerOnCashSale: action.payload};
    case PRINTER_SETTINGS_LOADING:
      return {...state, loading: action.payload};
    case PRINTER_SETTINGS_FOUND:
      return {...state, found: action.payload};
    case PRINTER_SETTINGS_SCANNING:
      return {...state, scanning: action.payload};
    case PRINTER_SETTINGS_PAIRING:
      return {...state, pairingAddress: action.payload};
    case PRINTER_SETTINGS_CLEAR:
      return {...initialState};
    default:
      return state;
  }
};

export default printerSettingsData;
