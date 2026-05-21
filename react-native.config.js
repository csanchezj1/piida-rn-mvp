// Excluimos la lib de impresión BT del autolinking en iOS porque solo
// la usamos en Android (la iSH58 de Digital POS no es MFi-cert y Apple
// no permite Bluetooth Classic sin esa certificación). Sin esta config
// el Pod del módulo intenta compilarse en iOS y rompe el build.
module.exports = {
  assets: ['./assets/fonts'],
  dependencies: {
    'tp-react-native-bluetooth-printer': {
      platforms: {
        ios: null,
      },
    },
  },
};
