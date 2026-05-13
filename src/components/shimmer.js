import React from "react";
import {Dimensions} from 'react-native';
import {shimerColors} from '../styles/basicStyles';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

// react-native-shimmer-placeholder usa Animated.interpolate con outputRange
// derivado de `width`/`height`. Si llega un string (ej. "100%"), el native
// driver de RN 0.71+ revienta con "java.lang.String cannot be cast to Double".
// Coercionamos a número con un fallback al ancho/alto de pantalla para que
// el lib siempre reciba números válidos.
const screen = Dimensions.get('window');

const toNumber = (v, fallback) => {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  const parsed = parseFloat(v);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const Shimmer = ({
  style,
  width,
  height,
  ...otherProps
}) => {
  const safeWidth = toNumber(width, screen.width);
  const safeHeight = toNumber(height, 16);
  return(
    <ShimmerPlaceHolder
      style={style}
      width={safeWidth}
      height={safeHeight}
      shimmerColors={shimerColors}
      LinearGradient={LinearGradient}
      {...otherProps}/>
  );
};

export default Shimmer;
