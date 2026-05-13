import React, {useState} from "react";
import {View, Text, TouchableOpacity, Image} from "react-native";
import {getTextInputStyles} from '../styles/componentStyles';
import { colors } from "../styles/basicStyles"; 
import DateTimePickerModal from "react-native-modal-datetime-picker";

const TextDate = props => {
	const {
    style,
    value,
    label,
    errorText,
    isError,
    dateSelected,
    icon,
    ...otherProps
	} = props;

  const styles = getTextInputStyles();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  var borderColor = value ? colors.inputLineActive : colors.inputLineInactive;

  if(isError){
    borderColor = colors.error;
  }
  
  return (
    <View style={style}>
      {label && (
        <Text
          style={[styles.label, {
            //opacity: label && value || isError ? 1 : 1,
            color:isError ? colors.error : colors.label
          }]}>
          {label}
        </Text>  
      )}
      <TouchableOpacity 
        activeOpacity={1}
        style={[styles.textInputContainer,{ 
          borderColor,
          backgroundColor:value ? colors.inputBackgroundFilled : colors.inputBackground
        }]}
        onPress={() => setDatePickerVisibility(true)}>
        {icon && (
          <View
            style={styles.iconCont}>
            <Image
              resizeMode="contain"
              style={[styles.icon, {
                tintColor: value ? colors.tintColorActive : colors.tintColor
              }]}
              source={icon}
            />
          </View>
        )}
        <Text
          style={[styles.input, {
            color: value ? colors.inputTextColor : colors.inputPlaceholder,
            height:null,
          }]}>
          {value ? value : label}
        </Text>
        <Image
          style={styles.arrow}
          resizeMode={'contain'}
          source={require('../assets/images/arrow_blue.png')}
        />
      </TouchableOpacity>
      <Text
        style={[styles.errorText, {
          opacity: isError ? 1 : 0
        }]}>
        {errorText ? errorText[0] : 'Este campo es requerido'}
      </Text>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode='date'
        onCancel={() => setDatePickerVisibility(false)}
        onConfirm={(date) => {
          dateSelected(date)
          setDatePickerVisibility(false)
        }}
        {...otherProps}
      />
    </View>
  );  
};

export default TextDate;