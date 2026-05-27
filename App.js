import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {PaperProvider} from 'react-native-paper';
import {store, persistor} from './src/store';
import { Platform, Text as RNText, TextInput as RNTextInput } from 'react-native';
import { Text as PaperText } from 'react-native-paper';
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

// Deshabilita el font scaling global del sistema: si el cajero agranda la
// letra desde Ajustes → Pantalla → Tamaño de fuente, los layouts (KPIs,
// tablas, headers) se rompen porque están dimensionados a px fijos. Para
// mantener consistencia POS fijamos allowFontScaling=false en los defaults
// de Text y TextInput (tanto RN como Paper) — pantallas individuales pueden
// override pasando allowFontScaling=true cuando lo necesiten.
if (!RNText.defaultProps) RNText.defaultProps = {};
RNText.defaultProps.allowFontScaling = false;
if (!RNTextInput.defaultProps) RNTextInput.defaultProps = {};
RNTextInput.defaultProps.allowFontScaling = false;
if (PaperText && !PaperText.defaultProps) PaperText.defaultProps = {};
if (PaperText && PaperText.defaultProps) PaperText.defaultProps.allowFontScaling = false;


class App extends Component {
  async componentDidMount (){
    // Estrategia: phones → portrait (los layouts originales fueron
    // diseñados para esa orientación). Tablets → landscape (rediseño POS
    // tablet de mostrador). Detectamos por shortest-side >= 500dp.
    const {width, height} = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 500;
    if (isTablet) {
      Orientation.lockToLandscape();
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