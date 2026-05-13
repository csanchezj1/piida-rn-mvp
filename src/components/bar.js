import React from "react";
import {View, Text, TouchableOpacity} from "react-native";
import {getBarStyles} from '../styles/componentStyles';
import { NumericFormat } from "react-number-format";

const Bar = ({
  style,
  width,
  label,
  value,
  ...otherProps
}) => {
  const styles = getBarStyles();

  return(
    <TouchableOpacity
      style={[styles.bar, style]}
      activeOpacity={1}
      {...otherProps}>
      <View
        style={[styles.barInner,{
        width
        }]}
      />
      <View
        style={styles.labelCont}>
        <Text
          style={styles.label}>
          {label}
        </Text>
      
        <NumericFormat 
          value={value} 
          displayType={'text'} 
          thousandSeparator={'.'} 
          decimalSeparator={','} 
          renderText={
            (value) => 
            <Text style={styles.value}>
              {value}
            </Text>
          }
        />
      </View>
      {otherProps.onPress && (
        <Text
          style={styles.details}>
          Ver detalles
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Bar;
