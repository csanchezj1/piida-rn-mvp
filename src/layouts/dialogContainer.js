import React from "react";
import {View} from "react-native";
import {dialogContainer} from '../styles/layoutStyles';
import * as Animatable from 'react-native-animatable';

const DialogContainer = ({
  style,
  children,
  visible
}) => {
  const styles = dialogContainer();
  return(
    <View 
      style={[styles.overlay,{
        display:visible ? 'flex' : 'none'
      }]}> 
      {visible && (
        <Animatable.View
          animation={'fadeInUpBig'}
          duration={750} 
          easing="ease-out"
          style={[styles.confirm, style]}>
          {children}
        </Animatable.View>
      )}
    </View>     
  );
};

export default DialogContainer;