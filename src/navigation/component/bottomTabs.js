import * as React from 'react';
import {HomeScreen, BalanceScreen, InventoryScreen, NewSaleScreen} from '../../screens';
import { Image, TouchableOpacity, Text, View, StatusBar} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {getBottomStyles} from '../../styles/menuStyles';
import { colors, fonts } from '../../styles/basicStyles';
import { Header } from '../../components';
import { FloatingAction } from "react-native-floating-action";

const Tab = createBottomTabNavigator();
const styles = getBottomStyles();

function BottomMenu({ state, descriptors, navigation }) {
  return (
    <SafeAreaView
      edges={[]}
      style={styles.cont}>
      <View 
        style={[styles.container,{
          //opacity:otherProps.buttonState ? 1 : 0
        }]}>
        {true && (
          state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.title;
    
            const iconActive =
              route.name === "Home"
                ? require('../../assets/images/ventas.png')
                : route.name === "Balance"
                ? require('../../assets/images/ic_money.png')
                : route.name === "Inventory"
                ? require('../../assets/images/ic_inventory.png')
                : route.name === "Orders"
                ? require('../../assets/images/ic_menu_balance.png')
                : route.name === "Statistics"
                ? require('../../assets/images/overview.png')
                : null;
            
            const isFocused = state.index === index;
    
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
    
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };
    
            return (
              <TouchableOpacity
                key={route.name}
                activeOpacity={0.9}
                onPress={onPress}
                style={[styles.itemContainer, {
                  opacity:isFocused ? 1 : 0.5,
                }]}>
                <Image
                  resizeMode={'contain'}
                  source={iconActive}
                  style={styles.itemIcon}
                />
                <Text style={[styles.textIcon, {
                  fontFamily: isFocused ? fonts.medium : fonts.regular
                }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </SafeAreaView>
  );
}

function BottomTabs({otherProps, navigation}) {
  // Multi-sucursal: el FAB consulta el estado del turno SCOPED a la sucursal
  // activa (cashShiftActiveId viene de cashShiftData en Redux, refrescado
  // contra el server). Ya no leemos otherProps.user.cash_id porque era
  // global a la cuenta y se quedaba stale cuando la caja se cerraba desde
  // la web o desde otra sucursal.
  const hasOpenShift = (otherProps.cashShiftActiveId ?? 0) > 0;
  let actions = [
    {
      text: hasOpenShift ? 'Prestar / Cerrar caja' : 'Abrir caja',
      color:colors.darkishRed,
      textBackground:'transparent',
      icon: require('../../assets/images/ic_cash_register.png'),
      name: hasOpenShift ? 'closeBox' : 'openBox',
      textStyle:styles.textOne,
      shadow:{shadowOpacity: 0},
      textElevation:0
    },
    {
      text: "Productos",
      color:colors.label,
      textBackground:'transparent',
      icon: require('../../assets/images/products.png'),
      name:'Products',
      textStyle:styles.textOne,
      shadow:{shadowOpacity: 0},
      textElevation:0
    },
    {
      text: "Nuevo gasto",
      color:colors.buttonBackground,
      textBackground:'transparent',
      icon: require('../../assets/images/product.png'),
      name: otherProps.user.movements_limit ? "Buy" : 'nomovement',
      textStyle:styles.textOne,
      shadow:{shadowOpacity: 0},
      textElevation:0
    },
    {
      text: "Surtir inventario",
      color:colors.inputPlaceholder,
      textBackground:'transparent',
      icon: require('../../assets/images/add_inv.png'),
      name: "AddInventory",
      textStyle:styles.textOne,
      shadow:{shadowOpacity: 0},
      textElevation:0
    },
    {
      // Gating real por feature flag del plan: solo aparece habilitado si
      // el plan actual tiene `branchTransfer: true` en sus features. Plan
      // Gratis no lo tiene → cae a 'notransfer' que muestra dialog upgrade.
      // Fallback a `subscription == 83` por si plan_features no llegó (apps
      // viejas pre-deploy).
      text: "Trasladar de inventario",
      color:colors.inputLineActive,
      textBackground:'transparent',
      icon: require('../../assets/images/ic_sync_alt.png'),
      name: (Array.isArray(otherProps.user.plan_features)
        ? otherProps.user.plan_features.includes('branchTransfer')
        : otherProps.user.subscription == 83)
        ? "Transfer"
        : 'notransfer',
      textStyle:styles.textOne,
      shadow:{shadowOpacity: 0},
      textElevation:0
    },
  ];
  /*if(otherProps.user.features.includes('build_kit')){
    actions.push({
      text: "Nuevo combo",
      color:colors.label,
      textBackground:'transparent',
      icon: require('../../assets/images/products.png'),
      name: "Kit",
      textStyle:styles.textOne,
      shadow:{shadowOpacity: 0},
      textElevation:0
    });
  }*/
  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={styles.safe.backgroundColor}/>
      <Tab.Navigator
        initialRouteName={'Home'}
        backBehavior={'none'}
        tabBar={props => <BottomMenu otherProps={otherProps} {...props} />}>
        <Tab.Screen
          name="Home"
          component={NewSaleScreen}
          options={{
            title: 'Venta',
            unmountOnBlur:true,  
            header:() => (
              <Header
                showHeader={true}
                onMore={() => otherProps.actions.showDrawer(true)}
              />
            ), 
          }}
        />
        <Tab.Screen
          name="Statistics"
          component={HomeScreen}
          options={{
            title: 'Reportes',
            unmountOnBlur:true,  
            header:() => (
              <Header
                showHeader={true}
                onMore={() => otherProps.actions.showDrawer(true)}
              />
            ), 
          }}
        />
        <Tab.Screen
          name="Balance"
          component={BalanceScreen}
          options={{
            title: 'Movimientos',
            unmountOnBlur:true,  
            header:() => (
              <Header
                showHeader={true}
                onMore={() => otherProps.actions.showDrawer(true)}
              />
            ), 
          }}
        />
        <Tab.Screen
          name="Inventory"
          component={InventoryScreen}
          options={{
            title: 'Inventario',
            unmountOnBlur:true,  
            header:() => (
              <Header
                showHeader={true}
                onMore={() => otherProps.actions.showDrawer(true)}
              />
            ), 
          }}
        />
      </Tab.Navigator>

      <FloatingAction
        //ref={(ref) => {floatingAction = ref}}
        distanceToEdge={styles.distanceToEdge}
        color={styles.color}
        overlayColor={'rgba(68,68,68,0.9)'}
        position={'right'}
        onPressItem={name => {
          name == 'nosale' || name == 'notransfer' || name == 'nomovement' ?
            otherProps.actions.showSubscriptionMessage(name, navigation) : 
          name == 'openBox' || name == 'closeBox' ?
            navigation.navigate('Box', {type:name}) :
            navigation.navigate(name)
        }}
        actions={actions}
      />
    </>
  );
}

export{BottomTabs}