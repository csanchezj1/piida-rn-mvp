import React, {useRef, useEffect} from "react";
import {Text, TouchableOpacity, Animated} from "react-native";
import {productStyles} from '../styles/componentStyles';
import { NumericFormat } from "react-number-format";

const ProductItem = ({
  name,
  nid,
  label,
  production_date,
  code,
  available,
  hasVariations,
  productSelected,
  price,
  cost,
  style,
  ...otherProps
}) => {
  const styles = productStyles();
  const opacity = useRef(new Animated.Value(0)).current;

  const blink = () => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      blink(); // loop
    });
  };

  useEffect(() => {
    blink();
  }, []);

   return(
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.listCont, style]}
        {...otherProps}>
        {nid && (
          productSelected && (
            <Animated.Text
              style={[styles.seeVariations, {position:'absolute', opacity:opacity, top:10, right:10}]}>
              Agregado
            </Animated.Text>
          )
        )}
        {(name || label) && (
          // Antes se renderizaban label Y name por separado, lo que producía
          // el nombre duplicado cuando ambos venían con el mismo valor desde
          // el back. Ahora mostramos uno solo: name preferido sobre label.
          <Text
            style={styles.listText}>
            {name || label}
          </Text>
        )}
        {production_date && (
          <Text
            style={styles.label}>
            {'Fecha de producción: '}
            <Text
              style={styles.listText}>
              {production_date}
            </Text>
          </Text>
        )}
        {code && (
          <Text
            style={styles.label}>
            {'Código: '}
            <Text
              style={styles.listText}>
              {code}
            </Text>
          </Text>
        )}
        {cost && (
          <Text
            style={styles.label}>
            {'Costo: '}
            <NumericFormat 
              value={cost} 
              displayType={'text'} 
              thousandSeparator={'.'} 
              decimalSeparator={','} 
              refix="$"
              renderText={
                (value) => 
                <Text style={styles.listText}>
                  {value}
                </Text>
              }
            />
          </Text>
        )}
        {price && (
          <Text
            style={styles.label}>
            {'Precio: '}
           
            <NumericFormat 
              value={price} 
              displayType={'text'} 
              thousandSeparator={'.'} 
              decimalSeparator={','} 
              prefix="$"
              renderText={
                (value) => 
                <Text style={styles.listText}>
                  {value}
                </Text>
              }
            />
          </Text>
        )}
        {available && (
          <Text
            style={styles.label}>
            {'Disponibilidad: '}
            <Text
              style={styles.listText}>
              {available}
            </Text>
          </Text>
        )}
        {hasVariations && (
          <Text
            style={styles.seeVariations}>
            Ver variaciones
          </Text>
        )}
      </TouchableOpacity>
    )
};

export default ProductItem;
