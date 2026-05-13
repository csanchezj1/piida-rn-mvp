import React, {useState} from "react";
import {getSearchStyles} from '../styles/componentStyles';
import { colors } from '../styles/basicStyles';
import {
  TextInput,
  Text,
  Image,
  View,
  TouchableOpacity,
} from 'react-native';

const Autocomplete = props => {
	const {
    style,
    results,
    selectItem,
    clear,
    clearText,
		...otherProps
	} = props;
  const styles = getSearchStyles();
  const [isFocus, setActive] = useState(false);
  var borderColor = colors.inputLine;
  if(isFocus){
    borderColor = colors.inputLineActive;
  }
  return (
    <View style={style}>
      <View
        style={styles.container}>
        <View 
          style={styles.mailContainer}>  
          <Image
            resizeMode={'contain'}
            source={require('../assets/images/search.png')}  
            style={styles.icon}/>
          <TextInput 
            style={styles.text}
            returnKeyType='search'
            onFocus={() => setActive(true)}
            onBlur={() => setActive(false)}
            placeholderTextColor={colors.text}
            onSubmitEditing={selectItem}
            {...otherProps}/>
          {clearText &&(
            <TouchableOpacity
              style={[styles.clearCont, {
                opacity : (otherProps.value != null && otherProps.value != '') ? 1 : 0
              }]}
              activeOpacity={0.8}
              onPress={clearText}>
              <Image
                resizeMode={'contain'}
                source={require('../assets/images/ic_clear.png')}
                style={styles.clear}/>
            </TouchableOpacity>
          )}
        </View>
        {results && (
          results.length > 0 && (
            <View style={styles.resultsContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={selectItem}
                style={styles.itemContainer}>
                <Text
                  style={styles.itemText}>
                  {'Buscar "' + otherProps.value + '"'}
                </Text>
                <Image
                  resizeMode={'contain'}
                  source={require('../assets/images/arrow_right.png')}
                  style={styles.arrow}/>
              </TouchableOpacity>
            </View>
          )
        )}
      </View>
    </View>
  );  
};

export default Autocomplete;