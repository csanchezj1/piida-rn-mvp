/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Silenciar LogBox en dev — los toasts amarillos/rojos cubren el FAB y
// rompen los flows Maestro. Los errores reales siguen yendo a la consola.
if (__DEV__) {
  LogBox.ignoreAllLogs(true);
}

AppRegistry.registerComponent(appName, () => App);
