import React, {useState} from "react";
import {TouchableOpacity, Text, Image} from "react-native";
import { colors } from "../styles/basicStyles";
import {getButtonStyles} from '../styles/componentStyles';

const ActionButton = ({
  style,
  title,
  colorText,
  textStyle,
  icon,
	...otherProps
}) => {
  const [pressed, setPressed] = useState(false);
  const buttonStyles = getButtonStyles();

  return(
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        buttonStyles.container, 
        pressed ? buttonStyles.pressed : buttonStyles.notPressed,
        style
      ]}
      {...otherProps}>
      {title && (
        <Text
          style={[buttonStyles.text, {
            color:colorText ? colorText : colors.buttonText
          }, textStyle]}>
          {title}
        </Text>
      )}
      {icon && (
        <Image
          style={buttonStyles.icon}
          source={icon}
        />
      )}
      
      
    </TouchableOpacity>
  );
};

export default ActionButton;
