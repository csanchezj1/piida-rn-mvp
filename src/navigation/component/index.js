import React, {Component, useEffect, useRef} from 'react';
import {NavigationContainer, useNavigationContainerRef} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabs } from './bottomTabs';
import { DrawerMenu } from './drawerMenu';
import { BranchModal } from './branchModal';
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
  VentaLibreScreen
} from '../../screens';
import { colors } from '../../styles/basicStyles';

const Stack = createNativeStackNavigator();

function Navigation({props}){
  const navigationRef = useNavigationContainerRef();
  const lastShiftRefresh = useRef(0);

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
            initialRouteName='BottomMenu'>
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
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false
              })}
            />
            <Stack.Screen
              name="Transfer"
              component={TransferScreen}
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
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false
              })}
            />
            <Stack.Screen
              name="CreateProduct"
              component={CreateProductScreen}
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
              name="AddInventory"
              component={AddInventoryScreen}
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
              name="CreateCustomer"
              component={CreateCustomerScreen}
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
              name="BuyDetails"
              component={BuyDetailsScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false,
              })}
            />
             <Stack.Screen
              name="TransferDetails"
              component={TransferDetailsScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false,
              })}
            />
            <Stack.Screen
              name="OrderDetails"
              component={OrderDetailsScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false,
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
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false
              })}
            />
             <Stack.Screen
              name="ConfirmCashOrder"
              component={ConfirmCashOrderScreen}
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
              name="PrinterSettings"
              component={PrinterSettingsScreen}
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
              name="Billing"
              component={BillingScreen}
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
              name="VentaLibre"
              component={VentaLibreScreen}
              options={() => ({
                headerShown: false,
                animation: 'slide_from_bottom',
                presentation: 'fullScreenModal',
              })}
            />
            <Stack.Screen
              name="PayOrder"
              component={PayOrderScreen}
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
              name="OrdersHistory"
              component={OrdersScreen}
              options={() =>({
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:'black',
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false
              })}
            />
            <Stack.Screen
              name="NotificationsList"
              component={NotificationsListScreen}
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
              name="Products"
              component={ProductsScreen}
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
              name="InventoryList"
              component={InventoryListScreen}
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
                animation: 'slide_from_left',
                headerTransparent: true,
                headerTintColor:colors.buttonBackground,
                title:'',
                headerShadowVisible:false,
                headerBackTitleVisible: false
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
