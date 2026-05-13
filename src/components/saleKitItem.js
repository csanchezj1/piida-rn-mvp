import React from "react";
import {View, Text, TouchableOpacity, Image} from "react-native";
import {saleProductItemStyles} from '../styles/componentStyles';
import { NumericFormat } from 'react-number-format';
import { normalizeSize } from "../styles/basicStyles";
import { TextInput } from ".";

const SaleKitItem = ({
  products,
  product,
  name,
  code,
  value,
  qty,
  style,
  onRemove,
  onAdd,
  onDelete,
  onChangeQty,
}) => {
  const styles = saleProductItemStyles();
  let newProduct = null;
  if(product){
    newProduct = product.replace("\n", '')
    newProduct = newProduct.split(',')
  }
  
  return(
    <View 
      style={[
        styles.container,
        style
      ]}>
      
      <View
        style={[styles.nameCont,{
          marginBottom:normalizeSize(10)
        }]}>
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

      {products && (
        products.map((item, index) => {
          return(
            <View 
              key={index}
              style={styles.proCont}>
              <Text 
                style={[styles.name,{
                  color:'black'
                }]}>
                  {item.code && (
                    <Text>
                      {item.code}{' - '}
                    </Text>
                  )}
                {item.label}{':  '}{item.qty}
              </Text>
            </View>
          )
        })
      )}
      {newProduct && (
        newProduct.map((item, index) => {
          return(
            <View 
              key={index}
              style={styles.proCont}>
              <Text 
                style={[styles.name,{
                  color:'black'
                }]}>
                {item}
              </Text>
              <Text 
                style={styles.qtyTxt}>
                {item.qty}
              </Text>
            </View>
          )
        })
      )}
     
      <View 
        style={styles.qtyCont}>
        {onChangeQty && (
          <TextInput
            style={styles.qtyInput}
            keyboardType='numeric'
            value={qty}
            onChangeText={onChangeQty}
            hideError
          />
        )}
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                style={[styles.btnIcon, { marginLeft: normalizeSize(5) }]}
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

export default SaleKitItem;
