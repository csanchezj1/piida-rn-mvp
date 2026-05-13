module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation|react-native-raw-bottom-sheet|react-native-animatable|react-native-linear-gradient|react-native-svg|react-native-vector-icons|redux-persist)',
  ],
};
