import React, { useRef, useEffect, useState } from 'react';
import { View, Animated,TouchableOpacity } from 'react-native';
import {getTopSheetStyles} from '../styles/componentStyles';

const TopSheet = ({ 
  visible, 
  onClose,
  children
}) => {
  const [show, setVisible] = useState(false);
  const styles = getTopSheetStyles();
  const translateY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(setVisible(true));
    } else {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false)
      });
    }
  }, [visible]);
  return (
    <>
      {show && (
        <Animated.View style={[styles.container, { 
          transform:[{ 
            translateY:translateY.interpolate({ 
              inputRange: [0, 1], 
              outputRange: [-300, 0] }) 
            }]
          }]}>
          <View 
            style={styles.card}>
            {children}
          </View>
          <TouchableOpacity
            activeOpacity={1}
            onPress={onClose}
            style={{flex:1}}
          />
      </Animated.View>
      )}
    </>
  );
};

export default TopSheet;
