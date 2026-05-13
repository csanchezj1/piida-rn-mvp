// Theme PIIDA para React Native Paper. Mantiene la paleta naranja (#F7A928)
// y las fuentes Montserrat de basicStyles.js. Se aplica vía PaperProvider
// en App.js.
import {MD3LightTheme, configureFonts} from 'react-native-paper';
import {colors, fonts} from './basicStyles';

const fontConfig = {
  default: {fontFamily: fonts.regular, fontWeight: '400'},
  medium: {fontFamily: fonts.medium, fontWeight: '500'},
  bold: {fontFamily: fonts.bold, fontWeight: '700'},
};

export const piidaTheme = {
  ...MD3LightTheme,
  roundness: 8,
  fonts: configureFonts({config: fontConfig}),
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.buttonBackground,
    onPrimary: '#FFFFFF',
    primaryContainer: '#FFEDD5',
    onPrimaryContainer: '#7A2E05',
    secondary: colors.label,
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FFE0CC',
    onSecondaryContainer: '#5B2200',
    tertiary: '#A6713A',
    error: colors.error,
    onError: '#FFFFFF',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceVariant: colors.inputBackground,
    onSurface: colors.text,
    onSurfaceVariant: colors.purplishGrey,
    outline: colors.purplishGrey,
    outlineVariant: '#E5E5E5',
    inverseSurface: colors.text,
    inverseOnSurface: '#FFFFFF',
    inversePrimary: '#FFC380',
  },
};
