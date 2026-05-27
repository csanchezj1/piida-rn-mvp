import React, {Component, useEffect, useRef} from 'react';
import {NavigationContainer, useNavigationContainerRef} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabs } from './bottomTabs';
import { DrawerMenu } from './drawerMenu';
import { BranchModal } from './branchModal';
import { lastSaleNavTarget } from '../../utils/lastSalePref';
import {
  Splashscreen, 
  LoginScreen,
  RegisterScreen,
  RegisterCompanyScreen,
  RecoveryPassGetCodeScreen,
  RecoveryPassSendCodeScreen,
  ChangePassScreen,
  BuyScreen,
  TransferScreen,
  ProviderScreen,
  AddProductKitScreen,
  CreateProviderScreen,
  BuyDetailsScreen,
  TransferDetailsScreen,
  RemissionScreen,
  KitScreen,
  OrderDetailsScreen,
  ConfirmOrderScreen,
  ConfirmCashOrderScreen,
  PayOrderScreen,
  OrdersScreen,
  OptionsScreen,
  CreateProductScreen,
  CreateCustomerScreen,
  ClientsScreen,
  BranchesScreen,
  ProvidersScreen,
  NotificationsListScreen,
  InventoryListScreen,
  QRScanScreen,
  PlansScreen,
  BoxScreen,
  ProductCategoriesScreen,
  CreateProductCategoryScreen,
  ProductVariationsScreen,
  InventoryCategoryScreen,
  NewSaleScreen,
  CreateCreditCardScreen,
  AddInventoryScreen,
  ProductsScreen,
  PrinterSettingsScreen,
  BillingScreen,
  VentaLibreScreen,
  AdvancedReportsScreen
} from '../../screens';
import { colors } from '../../styles/basicStyles';

const Stack = createNativeStackNavigator();

function Navigation({props}){
  const navigationRef = useNavigationContainerRef();
  const lastShiftRefresh = useRef(0);
  // Force-reset a VentaLibre al cargar la sesión. initialRouteName no
  // alcanza si Android restauró nav state previo, así que reseteamos una
  // vez por ciclo de login.
  const didInitialResetRef = useRef(false);

  // Refresca el estado del turno cuando:
  //   - El usuario se loguea (props.user vuelve a estar)
  //   - Cambia la sucursal activa
  // Así evitamos mostrar el FAB con info stale (ej: web cerró la caja).
  useEffect(() => {
    if (props.user && props.actions?.refreshCashStatus) {
      props.actions.refreshCashStatus();
      lastShiftRefresh.current = Date.now();
    }
  }, [props.user, props.activeBranchId]);

  // Una vez que el splash termina y el usuario está logueado, navegar a la
  // pantalla de venta que el cajero usó la última vez (VentaLibre o catálogo
  // dentro de BottomMenu). Lee `lastSaleScreen` del AsyncStorage. Default
  // 'NewSale' → BottomMenu/Home.
  useEffect(() => {
    if (!props.user) {
      didInitialResetRef.current = false;
      return;
    }
    if (props.isLoading) return;
    if (didInitialResetRef.current) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled || !navigationRef.isReady()) return;
      const target = await lastSaleNavTarget();
      const route = target.route === 'BottomMenu'
        ? {name: 'BottomMenu', params: target.params}
        : {name: target.route};
      navigationRef.reset({index: 0, routes: [route]});
      didInitialResetRef.current = true;
    }, 50);
    return () => { cancelled = true; clearTimeout(t); };
  }, [props.user, props.isLoading]);

  // Refresca el estado del turno cada vez que el usuario navega — throttled
  // a 1 vez cada 5s para no spamear. Cubre el caso "web cerró la caja
  // mientras la app estaba en otra pantalla".
  const onStateChange = () => {
    if (!props.user || !props.actions?.refreshCashStatus) return;
    const now = Date.now();
    if (now - lastShiftRefresh.current < 5000) return;
    lastShiftRefresh.current = now;
    props.actions.refreshCashStatus();
  };

  return(
    <NavigationContainer
    ref={navigationRef}
    onStateChange={onStateChange}>
      {props.isLoading ? (
        <Stack.Navigator>
          <Stack.Screen
            name="Splashscreen"
            component={Splashscreen}
            options={{
              headerShown: false, 
              headerBackTitleVisible: false
            }}/>
        </Stack.Navigator>
      ) : (
        props.user ? (
          <>
          <Stack.Navigator
            screenOptions={{
              headerBackButtonDisplayMode: 'minimal',
            }}
            initialRouteName='VentaLibre'>
            <Stack.Screen
              name="BottomMenu"
              options={() => ({
                headerShown:false,    
              })}>
              {prop => <BottomTabs otherProps={props} {...prop} />}
            </Stack.Screen>
            <Stack.Screen
              name="Buy"
              component={BuyScreen}
              options={() =>({
                // Rediseño 32: AppShell + sub-header propio.
                headerShown: false,
                animation: 'slide_from_left',
              })}
            />
            <Stack.Screen
              name="Transfer"
              component={TransferScreen}
              options={() =>({
                // Rediseño 38: AppShell + sub-header propio.
                headerShown: false,
                animation: 'slide_from_left',
              })}
            />
            <Stack.Screen
              name="Provider"
              component={ProviderScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false
              })}
            />
            <Stack.Screen
              name="AddProductKit"
              component={AddProductKitScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false
              })}
            />
            <Stack.Screen
              name="CreateProvider"
              component={CreateProviderScreen}
              options={() =>({
                // Rediseño 39: AppShell + sub-header propio.
                headerShown: false,
                animation: 'slide_from_left',
              })}
            />
            <Stack.Screen
              name="CreateProduct"
              component={CreateProductScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerShown: false,
              })}
            />
            <Stack.Screen
              name="AddInventory"
              component={AddInventoryScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerShown: false,
              })}
            />
            <Stack.Screen
              name="CreateCustomer"
              component={CreateCustomerScreen}
              options={() =>({
                // Rediseño 29: AppShell + sub-header propio (back custom).
                headerShown: false,
                animation: 'slide_from_left',
              })}
            />
            <Stack.Screen
              name="Clients"
              component={ClientsScreen}
              options={() =>({
                // Rediseño tablet 26: AppShell + sub-header propio.
                headerShown: false,
                animation: 'slide_from_left',
              })}
            />
            <Stack.Screen
              name="Branches"
              component={BranchesScreen}
              options={() =>({
                // Rediseño tablet 28: AppShell + sub-header propio.
                headerShown: false,
                animation: 'slide_from_left',
              })}
            />
            <Stack.Screen
              name="Providers"
              component={ProvidersScreen}
              options={() =>({
                // Rediseño tablet 27: AppShell + sub-header propio.
                headerShown: false,
                animation: 'slide_from_left',
              })}
            />
            <Stack.Screen
              name="BuyDetails"
              component={BuyDetailsScreen}
              options={() =>({
                // Rediseño 37: AppShell + sub-header propio.
                headerShown: false,
                animation: 'slide_from_left',
              })}
            />
             <Stack.Screen
              name="TransferDetails"
              component={TransferDetailsScreen}
              options={() =>({
                // Rediseño 40: AppShell + sub-header propio.
                headerShown: false,
                animation: 'slide_from_left',
              })}
            />
            <Stack.Screen
              name="OrderDetails"
              component={OrderDetailsScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerShown: false,
              })}
            />
            <Stack.Screen
              name="Remission"
              component={RemissionScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false
              })}
            />
            <Stack.Screen
              name="NewSale"
              component={NewSaleScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false
              })}
            />
            <Stack.Screen
              name="Kit"
              component={KitScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false
              })}
            />
            <Stack.Screen
              name="ConfirmOrder"
              component={ConfirmOrderScreen}
              options={() =>({
                // El rediseño 13 trae su propio AppShell + sub-header.
                headerShown: false,
                animation: 'slide_from_left',
              })}
            />
             <Stack.Screen
              name="ConfirmCashOrder"
              component={ConfirmCashOrderScreen}
              options={() =>({
                // headerShown:false porque ConfirmCashOrder ya provee su
                // propio header (con back custom + título + badge EFECTIVO).
                // El header default del Stack pintaba una flecha naranja
                // del theme PIIDA encima del back custom.
                headerShown: false,
                animation: 'slide_from_left',
              })}
            />
            <Stack.Screen
              name="PrinterSettings"
              component={PrinterSettingsScreen}
              options={() =>({
                // Rediseño 35: AppShell + sub-header propio.
                headerShown: false,
                animation: 'slide_from_left',
              })}
            />
            <Stack.Screen
              name="Billing"
              component={BillingScreen}
              options={() =>({
                // Rediseño 34: AppShell + sub-header propio.
                headerShown: false,
                animation: 'slide_from_left',
              })}
            />
            <Stack.Screen
              name="AdvancedReports"
              component={AdvancedReportsScreen}
              options={() =>({
                // El rediseño 08 trae su propio AppShell + topbar. El header
                // transparente del Stack tapaba la topbar y le comía los taps.
                headerShown: false,
                animation: 'slide_from_left',
              })}
            />
            <Stack.Screen
              name="VentaLibre"
              component={VentaLibreScreen}
              options={() => ({
                headerShown: false,
              })}
            />
            <Stack.Screen
              name="PayOrder"
              component={PayOrderScreen}
              options={() =>({
                // Rediseño 16: AppShell + sub-header propio.
                headerShown: false,
                animation: 'slide_from_left',
              })}
            />
            <Stack.Screen
              name="OrdersHistory"
              component={OrdersScreen}
              options={() =>({
                // El rediseño 14 trae su propio AppShell + sub-header.
                headerShown: false,
                animation: 'slide_from_left',
              })}
            />
            <Stack.Screen
              name="NotificationsList"
              component={NotificationsListScreen}
              options={{
                animation: 'slide_from_left',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Products"
              component={ProductsScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerShown: false,
              })}
            />
            <Stack.Screen
              name="InventoryList"
              component={InventoryListScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerShown: false,
              })}
            />
            <Stack.Screen
              name="QRScan"
              component={QRScanScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false
              })}
            />
            <Stack.Screen
              name="Plans"
              component={PlansScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false
              })}
            />
            <Stack.Screen
              name="Box"
              component={BoxScreen}
              options={() =>({
                // Rediseño 30: AppShell + sub-header propio.
                headerShown: false,
                animation: 'slide_from_left',
              })}
            />
            <Stack.Screen
              name="ProductCategories"
              component={ProductCategoriesScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false
              })}
            />
            <Stack.Screen
              name="CreateProductCategory"
              component={CreateProductCategoryScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false
              })}
            />
            <Stack.Screen
              name="ProductVariations"
              component={ProductVariationsScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false
              })}
            />
            <Stack.Screen
              name="InventoryCategory"
              component={InventoryCategoryScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false
              })}
            />
            <Stack.Screen
              name="CreateCreditCard"
              component={CreateCreditCardScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false
              })}
            />
          </Stack.Navigator>
          <DrawerMenu
            props={props}
            navigationRef={navigationRef}
          />
          <BranchModal props={props} />
          </>
        ) : (
          <Stack.Navigator
            screenOptions={{
              headerBackButtonDisplayMode: 'minimal',
            }}>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: false, 
              }}/>
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
              })}
            />
            <Stack.Screen
              name="RegisterCompany"
              component={RegisterCompanyScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
              })}
            />
            <Stack.Screen
              name="RecoveryPassGetCode"
              component={RecoveryPassGetCodeScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
              })}
            />
            <Stack.Screen
              name="RecoveryPassSendCode"
              component={RecoveryPassSendCodeScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
              })}
            />
            <Stack.Screen
              name="ChangePass"
              component={ChangePassScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
              })}
            />
            <Stack.Screen
              name="Options"
              component={OptionsScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
              })}
            />
          </Stack.Navigator>
        )
      )}
    </NavigationContainer>
  )
}

class Init extends Component {
  render() {
    return(
      <Navigation props={this.props}/>
    );
  }
}

export default Init;
