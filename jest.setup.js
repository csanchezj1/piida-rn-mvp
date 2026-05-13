jest.mock('react-native-vision-camera', () => ({
  Camera: () => null,
  useCameraDevice: () => null,
  useCodeScanner: () => ({}),
}));

jest.mock('react-native-raw-bottom-sheet', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => ({
        open: () => {},
        close: () => {},
      }));
      return React.createElement(View, { testID: 'rbsheet' }, props.children);
    }),
  };
});

jest.mock('react-native-firebase/analytics', () => ({}), { virtual: true });
jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: jest.fn(),
  logScreenView: jest.fn(),
}));
jest.mock('@react-native-firebase/app', () => ({}));
jest.mock('@react-native-firebase/messaging', () => () => ({
  hasPermission: jest.fn(() => Promise.resolve(1)),
  requestPermission: jest.fn(() => Promise.resolve(1)),
  getToken: jest.fn(() => Promise.resolve('mock-token')),
  onMessage: jest.fn(),
  onNotificationOpenedApp: jest.fn(),
  getInitialNotification: jest.fn(() => Promise.resolve(null)),
}));
