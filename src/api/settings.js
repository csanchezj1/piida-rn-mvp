import { Platform } from 'react-native';

// Entorno SANDBOX: sandbox.piida.co (NestJS, cuenta AWS separada, datos de
// prueba). El `password` es el MAGIC_PASS del sandbox — distinto al de prod.
// Para volver a producción, descomentá el bloque PRODUCCIÓN.
const settings = {
  baseUrl: 'https://sandbox.piida.co/',
  user: 'rest_api',
  password: 'f3911c2c0b29beec0516b69a',

  // ── PRODUCCIÓN (portal.piida.co) ──
  // baseUrl: 'https://portal.piida.co/',
  // password: 'HOxRWWMuoDk7p4y5qLi8Ewj8',

  // ── DEV LOCAL ──
  // baseUrl: Platform.OS === 'android' ? 'http://10.0.2.2:3000/' : 'http://localhost:3000/',
  // baseUrl: 'http://192.168.1.75:3000/', // device físico en LAN
};

export default settings;
