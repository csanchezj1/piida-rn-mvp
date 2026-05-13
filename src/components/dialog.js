import React from "react";
import {Image, Text, TouchableOpacity, View} from "react-native";
import { ActionButton } from "./";
import {getDialogStyles} from '../styles/componentStyles';

const Dialog = ({
  title,
  message,
  acceptTitle,
  onClose,
  onAccept,
  visible,
}) => {
  const styles = getDialogStyles();
  return(
    <View
      style={[styles.overlay, {
        display: visible ? 'flex' : 'none'
      }]}>
      
      <View
        style={styles.confirm}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onClose}
          style={styles.closeContainer}>
          <Image
            style={styles.close}
            source={require('../assets/images/close_black.png')}
          />
        </TouchableOpacity>
        <Text style={styles.titleConfirm}>
          {title}
        </Text>
        <Text style={styles.textConfirm}>
          {message}
        </Text>
        {onAccept && (
          <View style={styles.buttons}>
            <ActionButton
              title={acceptTitle}
              style={styles.button}
              colorText={'white'}
              onPress={onAccept}/>
          </View>
        )}
      </View>
    </View>
  );
};

export default Dialog;
