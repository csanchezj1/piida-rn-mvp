import React from "react";
import {View, Text, TouchableOpacity, Image} from "react-native";
import {saleProductItemStyles} from '../styles/componentStyles';
import { NumericFormat } from 'react-number-format';
import { TextInput } from ".";

const SaleProductItem = ({
  name,
  code,
  value,
  qty,
  style,
  onRemove,
  onAdd,
  onDelete,
  onChangePrice,
  onCheck,
  onChangeQty,
  checked
}) => {
  const styles = saleProductItemStyles();
  
  return(
    <View 
      style={[
        styles.container,
        style
      ]}>
      <View style={styles.nameCont}>
        <Text 
          style={styles.name}>
            {code && (
              <Text>
                {code}{' - '}
              </Text>
            )}
          {name}
        </Text>
        {onDelete && (
          <TouchableOpacity 
            activeOpacity={0.9}
            style={styles.deleteCont}
            onPress={onDelete}>
            <Image
              style={styles.deleteIcon}
              resizeMode="contain"
              source={require('../assets/images/trash.png')}
            />
          </TouchableOpacity>
        )}
      </View>
      {onChangePrice &&(
        <View
          style={styles.unitPriceCont}>
          <Text 
            style={styles.label}>
            Valor unitario $
          </Text>
          <TextInput
            style={styles.unitPrice}
            keyboardType='numeric'
            value={value}
            hideError={true}
            onChangeText={onChangePrice}
          />
          <View
            style={styles.checkCont}>
            <Text
              style={styles.checkLabel}>
              Editar precio en producto
            </Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onCheck}>
              <Image
                style={styles.check}
                source={checked ?
                  require('../assets/images/ic_check_box.png') :
                  require('../assets/images/ic_check_box_blank.png') 
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View 
        style={styles.qtyCont}>
        {onChangeQty && (
          <TextInput
            style={styles.qtyInput}
            inputStyle={styles.inputStyle}
            keyboardType='numeric'
            value={qty}
            onChangeText={onChangeQty}
            hideError
          />
        )}
        <View
          style={{flexDirection:'row'}}>
          {onRemove && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onRemove}>
              <Image
                style={styles.btnIcon}
                resizeMode="contain"
                source={require('../assets/images/remove.png')}
              />
            </TouchableOpacity>
          )}
          {onAdd && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onAdd}>
              <Image
                style={[styles.btnIcon, styles.btnTop]}
                resizeMode="contain"
                source={require('../assets/images/add.png')}
              />
            </TouchableOpacity>
          )}
          
        </View>
        
        <NumericFormat 
          value={value * qty} 
          displayType={'text'} 
          thousandSeparator={'.'} 
          decimalSeparator={','} 
          prefix={'$'} 
          renderText={
            (value) => 
            <Text
              style={styles.shipping}>
              {value}
            </Text> 
          }
        />
      </View>
    </View>   
  );
};

export default SaleProductItem;
