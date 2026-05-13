import React, {useState}from "react";
import {TextInput, View, Text, Image, TouchableOpacity, Platform} from "react-native";
import {getTextInputStyles} from '../styles/componentStyles';
import { colors, normalizeSize } from "../styles/basicStyles";

const CustomTextInput = props => {
	const {
    style,
    isError,
    errorText,
    isPass,
    isWhite,
    icon,
    placeholder,
    label,
    hideError,
    description,
    inputStyle,
		...otherProps
	} = props;

  const [isFocus, setActive] = useState(false);
  const [showPass, setShowPass] = useState(true);
  const styles = getTextInputStyles();

  const errorView = () => {
    if(hideError !== undefined){
      if(hideError){
        return null;
      }
    }
    
    return(
      <View style={{flexDirection:'row'}}>
        <Text
          style={[styles.errorText, {
            opacity: isError ? 1 : 0
          }]}>
          {errorText ? errorText[0] : 'Este campo es requerido'}
        </Text>
        <Text 
          style={[styles.maxLength, {
            opacity: otherProps.maxLength ? 1 : 0,
            color:isWhite ? 'white' : colors.inputTextColor
          }]}>
          {`${otherProps.value ? otherProps.value.length : 0}/${otherProps.maxLength}`}
        </Text>
      </View>
    )
  }

  var borderColor = isWhite ? 'white' : otherProps.value ? colors.inputLineFilled : colors.inputLineInactive;
  if(isError){
    borderColor = colors.error;
  }
  else if(isFocus){
    borderColor = colors.inputLineActive;
  }
  

  return (
    <View style={style}>
      {label && (
        <Text
          style={[styles.label, {
            opacity: label && otherProps.value ? 1 : 0,
            color:isError ? colors.error : colors.label
          }]}>
          {label}
        </Text>
      )}
      <View 
        style={[styles.textInputContainer,{
          borderColor,
          backgroundColor:isWhite ? 'white' : 
            otherProps.value ? colors.inputBackgroundFilled : colors.inputBackground,
          height: otherProps.numberOfLines ? 
            otherProps.numberOfLines > 1 ? 
            otherProps.numberOfLines * normalizeSize(20) : 
            null :
            null,
          maxHeight: otherProps.numberOfLines ? 
            otherProps.numberOfLines == 1 ? 
            normalizeSize(80) : 
            null :
            null,
          borderRadius: otherProps.numberOfLines ? 
            otherProps.numberOfLines > 1 ? 
            normalizeSize(10) : 
            normalizeSize(5) :
            normalizeSize(5),
        },
        inputStyle]}> 
        {icon && (
          <Image
            resizeMode="contain"
            style={[styles.icon, {
              tintColor:
                otherProps.value ? colors.tintColorActive : colors.tintColor
            }]}
            source={icon}
          />
        )}
        <TextInput 
          style={[styles.input, {
            paddingTop: otherProps.numberOfLines ? otherProps.numberOfLines > 1 ? normalizeSize(15) : Platform.OS == 'android' ? normalizeSize(0) : normalizeSize(15) : 0,
            textAlignVertical:otherProps.numberOfLines && otherProps.numberOfLines > 1 ? 'top' : 'center',
          }]} 
          placeholder={placeholder ?  placeholder : null}
          placeholderTextColor={colors.inputPlaceholder}
          onFocus={() => setActive(true)}
          onBlur={() => setActive(false)}
          secureTextEntry={isPass ? showPass : false}
          cursorColor={'black'}
          {...otherProps}
        />
        
        {isPass && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setShowPass(!showPass)}>
            <Image
              resizeMode="contain"
              style={[styles.icon, {
                marginEnd:0
              }]}
              source={showPass ? require('../assets/images/ic_visibility.png') : require('../assets/images/ic_visibility_off.png')}
            />
          </TouchableOpacity>
         
        )}
      </View>
      {errorView()}
      {description && (
        <Text
          style={[styles.descriptionText, {
            marginTop:isError ? 0 : normalizeSize(-14)
          }]}>
          {description}
        </Text>
      )}
     
    </View>
  );  
};

export default CustomTextInput;