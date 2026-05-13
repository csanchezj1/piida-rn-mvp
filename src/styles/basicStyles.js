import { Dimensions, PixelRatio } from 'react-native';
const screenWidth = Dimensions.get('window').width;

// scale = factor de escalado tipográfico/dimensional global.
// Base 360pt = phones standard. En iPad 11" (834pt) sin cap, scale = 2.32
// y todo (fonts, paddings, heights del keypad) se duplica produciendo
// elementos gigantes que desbordan sus contenedores. Cap a 1.4 mantiene
// la app proporcionada en tablets sin afectar phones (en iPhone 14 Pro Max
// scale ≈ 1.20, dentro del cap).
const rawScale = screenWidth / 360;
const scale = Math.min(rawScale, 1.4);
export const shimerColors = ['#EFEFEF', '#DFDFDF', '#EFEFEF'];

export const colors = {
  buttonBackground: '#F7A928',
  buttonText:'white',
  inputLineActive:'#E88304',
  inputLineInactive:'white',
  inputLineFilled:'#FFAB05',
  inputBackground:'#F5F5F5',
  inputBackgroundFilled:'#F5F5F5',
  inputPlaceholder:'#878787',
  inputTextColor:'#000000',
  loaderText:'#000000',
  loaderIndicator:'#E84004',
  dialogTitle:'#FF6D09',
  dialogText:'#000000',
  text:'#000',
  error:'#FF2205',
  success:'#16A34A',
  label:'#FF6D09',
  tintColorActive:'black',
  tintColor:'#808080',

  darkishRed:'#AD0A14',
  carmine:'#FF2205',
  carmineTwo:'#A30415',
  red:'#FF6D09',
  white:'#EBEBEB',
  purplishGrey:'#727176',
  brick:'#AC231B',
  rouge:'#CCAD2D',
};

export const fonts = {
  bold:'Montserrat-Bold',
  light:'Montserrat-Light',
  medium:'Montserrat-Medium',
  regular:'Montserrat-Regular',
  semiBold:'Montserrat-SemiBold',
}

export const normalizeSize = (size) => {
  const newSize = size * scale; 
  return Math.round(PixelRatio.roundToNearestPixel(newSize))
}