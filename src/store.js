import {legacy_createStore, applyMiddleware, compose} from 'redux';
import {persistStore, persistReducer} from 'redux-persist';
import reducer from './reducers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import {thunk} from 'redux-thunk';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
  blacklist: [
    'navigationData',
    'progressData',
    'dialogData',
    'splashscreenData',
    'loginData',
    'recoveryPassGetCodeData',
    'recoveryPassSendCodeData',
    'changePassData',
    'buyData',
    'createProviderData',
    'providerData',
    'balanceData',
    'inventoryData',
    'remissionData',
    'homeData',
    'termsData',
    'ordersData',
    'payOrderData',
    'buyDetailsData',
    'orderDetailsData',
    'registerData',
    'createProductData',
    'createCustomerData',
    'notificationsListData',
    'transferData',
    'kitData',
    'addProductKitData',
    'inventroyListData',
    'qrScanData',
    'boxData',
    'createProductCategoryData',
    'productCategoriesData',
    'productVariationsData',
    'inventoryCategoryData',
    'newSaleData',
    'confirmCahsOrderData',
    'createCreditCardData',
    'planData',
    'addInventoryData',
    'productsData'
  ],
};

const persistedReducer = persistReducer(persistConfig, reducer);

let store = legacy_createStore(persistedReducer, compose(applyMiddleware(thunk)));
let persistor = persistStore(store);

export {store, persistor};