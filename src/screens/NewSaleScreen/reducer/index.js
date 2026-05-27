import customer from '../../../api/customer';
import {
  NEW_SALE_LIST,
  NEW_SALE_LIST_OFFSET,
  NEW_SALE_REQUEST_MADE,
  NEW_SALE_SHOW_LOADER,
  NEW_SALE_TEXT_CHANGE,
  NEW_SALE_SEARCH_BTN,
  NEW_SALE_CLEAR,
  NEW_SALE_FORM_FAIL,
  NEW_SALE_PRODUCT_CHANGE,
  NEW_SALE_TOTAL_CHANGE,
  NEW_SALE_CUSTOMER_CHANGE,
  NEW_SALE_CUSTOMER_VISIBLE,
  NEW_SALE_PRODUCT_SELECTED
} from '../../../utils/constants';

const initialState = {
  list: null,
  requestMade: false,
  offset:0,
  showLoader:false,
  text:null,
  searchButton:[],
  errors:null,
  product:[],
  total:0,
  customer:null,
  customerVisible:false,
  productSelected:null
};

const newSaleData = (state = initialState, action) => {
  switch (action.type) {
    case NEW_SALE_LIST:
      return { ...state, list: action.payload};
    case NEW_SALE_REQUEST_MADE:
      return { ...state, requestMade: action.payload};
    case NEW_SALE_LIST_OFFSET:
      return { ...state, offset: action.payload};
    case NEW_SALE_SHOW_LOADER:
      return { ...state, showLoader: action.payload};
    case NEW_SALE_TEXT_CHANGE:
      return { ...state, text: action.payload};
    case NEW_SALE_SEARCH_BTN:
      return { ...state, searchButton: action.payload};
    case NEW_SALE_FORM_FAIL:
      return { ...state, errors: action.payload };
    case NEW_SALE_PRODUCT_CHANGE: {
      const items = action.payload || [];
      // Total derivado de la lista — fuente única de verdad. Antes el total
      // se mantenía aparte con aritmética incremental, propenso a desync
      // (resultado: TOTAL en negativo con 0 items).
      const total = items.reduce((sum, it) => {
        const price = parseInt(it?.price, 10) || 0;
        const qty = parseInt(it?.qty, 10) || 0;
        return sum + price * qty;
      }, 0);
      return { ...state, product: items, total, changed: new Date() };
    }
    case NEW_SALE_TOTAL_CHANGE:
      // No-op: total se deriva en NEW_SALE_PRODUCT_CHANGE.
      return state;
    case NEW_SALE_CUSTOMER_CHANGE:
      return { ...state, customer: action.payload };
    case NEW_SALE_CUSTOMER_VISIBLE:
      return { ...state, customerVisible: action.payload };
    case NEW_SALE_PRODUCT_SELECTED:
      return { ...state, productSelected: action.payload };
    case NEW_SALE_CLEAR:
      // ⚠️ Spread shallow del initialState compartía la misma referencia de
      // `product` / `searchButton`. Como varias actions hacen push/splice
      // directo sobre state.product, después de la primer venta el array
      // de initialState quedaba contaminado y CLEAR ya no limpiaba el
      // carrito (total iba a 0 pero los items seguían ahí). Devolvemos
      // nuevos arrays siempre.
      return {
        ...initialState,
        product: [],
        searchButton: [],
      };
    default:
      return state;
  }
}

export default newSaleData;