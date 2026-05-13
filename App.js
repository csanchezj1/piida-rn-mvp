import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {PaperProvider} from 'react-native-paper';
import {store, persistor} from './src/store';
import { Platform } from 'react-native';
import { requestTrackingPermission } from 'react-native-tracking-transparency';
import { Settings } from 'react-native-fbsdk-next';
import AppNavigator from './src/navigation/container';
import Notifications from './src/notifications/container';
import Progress from './src/utils/progress/container';
import Dialog from './src/utils/dialog/container';
import { setStore as setApiStore } from './src/api';
import { piidaTheme } from './src/styles/paperTheme';

// Bloque 4 multi-sucursal: el wrapper axios necesita una referencia al store
// para leer la sucursal activa antes de cada request. Lo seteamos al cargar
// el módulo de App — ANTES del primer render para garantizar disponibilidad.
setApiStore(store);


class App extends Component {
  async componentDidMount (){
    Settings.initializeSDK();
    if (Platform.OS === 'ios') {
      const status = await requestTrackingPermission();
      console.log('Tracking status:', status);
    }
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