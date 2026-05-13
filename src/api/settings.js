import { Platform } from 'react-native';

// Producción: portal.piida.co (NestJS detrás de nginx + SSL).
// Para volver a dev local descomentá los baseUrl de abajo.
const settings = {
  baseUrl: 'https://portal.piida.co/',
  // baseUrl: Platform.OS === 'android' ? 'http://10.0.2.2:3000/' : 'http://localhost:3000/', // dev local
  // baseUrl: 'http://192.168.1.75:3000/', // device físico en LAN
  // baseUrl: 'https://piida.co/',         // production legacy (Drupal)
  user: 'rest_api',
  password: 'HOxRWWMuoDk7p4y5qLi8Ewj8',
};

export default settings;
