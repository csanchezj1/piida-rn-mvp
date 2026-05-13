import {combineReducers} from 'redux';

import userData from './userData';
import fieldsData from './fieldsData';
import navigationData from '../navigation/reducer';
import dialogData from '../utils/dialog/reducer';
import progressData from '../utils/progress/reducer';
import splashscreenData from '../screens/Splashscreen/reducer';
import loginData from '../screens/LoginScreen/reducer';
import recoveryPassGetCodeData from '../screens/RecoveryPassGetCodeScreen/reducer';
import recoveryPassSendCodeData from '../screens/RecoveryPassSendCodeScreen/reducer';
import changePassData from '../screens/ChangePassScreen/reducer';
import buyData from '../screens/BuyScreen/reducer';
import createProviderData from '../screens/CreateProviderScreen/reducer';
import providerData from '../screens/ProviderScreen/reducer';
import balanceData from '../screens/BalanceScreen/reducer';
import inventoryData from '../screens/InventoryScreen/reducer';
import remissionData from '../screens/RemissionScreen/reducer';
import ordersData from '../screens/OrdersScreen/reducer';
import payOrderData from '../screens/PayOrderScreen/reducer';
import buyDetailsData from '../screens/BuyDetailsScreen/reducer';
import orderDetailsData from '../screens/OrderDetailsScreen/reducer';
import homeData from '../screens/HomeScreen/reducer';
import termsData from '../screens/TermsScreen/reducer';
import registerData from '../screens/RegisterScreen/reducer';
import createProductData from '../screens/CreateProductScreen/reducer';
import createCustomerData from '../screens/CreateCustomerScreen/reducer';
import notificationsListData from '../screens/NotificationsListScreen/reducer';
import transferData from '../screens/TransferScreen/reducer';
import kitData from '../screens/KitScreen/reducer';
import addProductKitData from '../screens/AddProductKitScreen/reducer';
import inventroyListData from '../screens/InventoryListScreen/reducer';
import qrScanData from '../screens/QRScanScreen/reducer';
import boxData from '../screens/BoxScreen/reducer';
import productCategoriesData from '../screens/ProductCategoriesScreen/reducer';
import createProductCategoryData from '../screens/CreateProductCategoryScreen/reducer';
import productVariationsData from '../screens/ProductVariationsScreen/reducer';
import inventoryCategoryData from '../screens/InventoryCategoryScreen/reducer';
import newSaleData from '../screens/NewSaleScreen/reducer';
import confirmCahsOrderData from '../screens/ConfirmCashOrderScreen/reducer';
import createCreditCardData from '../screens/CreateCreditCardScreen/reducer';
import planData from '../screens/PlansScreen/reducer';
import addInventoryData from '../screens/AddInventoryScreen/reducer';
import productsData from '../screens/ProductsScreen/reducer';
import printerSettingsData from '../screens/PrinterSettingsScreen/reducer';
import billingData from '../screens/BillingScreen/reducer';
import activeBranchData from './activeBranchData';
import cashShiftData from './cashShiftData';

export default combineReducers({
  userData,
  fieldsData,
  dialogData,
  progressData,
  splashscreenData,
  loginData,
  recoveryPassGetCodeData,
  recoveryPassSendCodeData,
  changePassData,
  navigationData,
  buyData,
  createProviderData,
  providerData,
  balanceData,
  inventoryData,
  remissionData,
  homeData,
  termsData,
  ordersData,
  payOrderData,
  buyDetailsData,
  orderDetailsData,
  registerData,
  createProductData,
  createCustomerData,
  notificationsListData,
  transferData,
  kitData,
  addProductKitData,
  inventroyListData,
  qrScanData,
  boxData,
  productCategoriesData,
  createProductCategoryData,
  productVariationsData,
  inventoryCategoryData,
  newSaleData,
  confirmCahsOrderData,
  createCreditCardData,
  planData,
  addInventoryData,
  productsData,
  printerSettingsData,
  billingData,
  activeBranchData,
  cashShiftData,
});
