import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {PaperProvider} from 'react-native-paper';
import {store, persistor} from './src/store';
import { Platform } from 'react-native';
import { requestTrackingPermission } from 'react-native-tracking-transparency';
import { Settings } from 'react-native-fbsdk-next';
import {Dimensions} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import AppNavigator from './src/navigation/container';
import Notifications from './src/notifications/container';
import Progress from './src/utils/progress/container';
import Dialog from './src/utils/dialog/container';
import { setStore as setApiStore } from './src/api';
import { piidaTheme } from './src/styles/paperTheme';
import { startPrinterKeepAlive, stopPrinterKeepAlive } from './src/utils/printing/printerService';

// Bloque 4 multi-sucursal: el wrapper axios necesita una referencia al store
// para leer la sucursal activa antes de cada request. Lo seteamos al cargar
// el módulo de App — ANTES del primer render para garantizar disponibilidad.
setApiStore(store);


class App extends Component {
  async componentDidMount (){
    // Estrategia: phones quedan locked en portrait (no queremos rotar layouts
    // diseñados para portrait). Tablets quedan libres para que usen su
    // orientación natural (la TCL 10.1" no respeta lockToLandscape ni
    // Left/Right; deja que el hardware/sensor decida). El layout responsivo
    // se encarga de mostrar split o single-column según `width >= height`.
    const {width, height} = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 500;
    if (isTablet) {
      Orientation.unlockAllOrientations();
    } else {
      Orientation.lockToPortrait();
    }
    Settings.initializeSDK();
    if (Platform.OS === 'ios') {
      const status = await requestTrackingPermission();
      console.log('Tracking status:', status);
    }
    // Keep-alive de la impresora: evita que el clon iSH58 entre en sleep.
    // Solo corre con la app en primer plano (lo maneja el propio módulo).
    startPrinterKeepAlive();
  }

  componentWillUnmount() {
    stopPrinterKeepAlive();
  }

  render(){
    return(
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <PaperProvider theme={piidaTheme}>
            <AppNavigator/>
            <Notifications/>
            <Progress/>
            <Dialog/>
          </PaperProvider>
        </PersistGate>
      </Provider>
    );
  }
}

export default App;