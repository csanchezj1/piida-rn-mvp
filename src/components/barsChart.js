import React from "react";
import {View} from "react-native";
import {getBarStyles} from '../styles/componentStyles';
import Bar from "./bar";

const BarsChart = ({
  style,
  labels,
  data,
  onPressBar
}) => {
  const styles = getBarStyles();
 
  return(
    <View
      style={[styles.container, style]}>
      {labels.length > 0 && (
        labels.map((item, index) => {
         
          return(
            <Bar
              key={index}
              width={((data[index]/Math.max(...data)) * 100) + '%'}
              label={item.label}
              value={data[index]}
              onPress={onPressBar ? () => onPressBar(item) : null}
            />
          );
        })
      )}
      
    </View>
  );
};

export default BarsChart;
