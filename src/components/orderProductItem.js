import React from "react";
import {View, Text} from "react-native";
import {getOrderProductItemStyles} from '../styles/componentStyles';
import { NumericFormat } from 'react-number-format';

const OrderProductItem = ({
  name,
  value,
  qty,
  date,
  style,
  products
}) => {
  const styles = getOrderProductItemStyles();
  
  return(
    <View 
      style={[
        styles.container,
        style
      ]}>
      <View style={{flex:1}}>
        {date && (
          <Text 
            style={styles.shipping}>
            {date}
          </Text>
        )}
        <Text 
          style={styles.name}>
          {name}
        </Text>
        {products && (
          products.length > 0 && (
            <View
              style={styles.prosCont}>
              {products.map((item, index) => {
                return(
                  <View
                    style={styles.proCont}
                    key={index}>
                    <Text
                      style={styles.proName}>
                      {item.product}
                    </Text>
                    <NumericFormat 
                      value={item.qty} 
                      displayType={'text'} 
                      thousandSeparator={'.'} 
                      decimalSeparator={','} 
                      renderText={
                        (value) => 
                        <Text style={styles.proQty}>
                          {value}
                        </Text>
                      }
                    />
                  </View>
                )
              })}
            </View>
          )
        )}
        
        <NumericFormat 
          value={value} 
          displayType={'text'} 
          thousandSeparator={'.'} 
          decimalSeparator={','} 
          prefix={'$'} 
          renderText={
            (value) => 
            <Text style={styles.shipping}>
              {value}
            </Text>
          }
        />
      </View>
      <View>
        {qty && (
          <>
          <Text 
            style={styles.kg}>
            Cantidad
          </Text>
          <View 
            style={styles.qtyCont}>
            <NumericFormat 
              value={qty} 
              displayType={'text'} 
              thousandSeparator={'.'} 
              decimalSeparator={','} 
              renderText={
                (value) => 
                <Text style={styles.qtyTxt}>
                  {value}
                </Text>
              }
            />
          </View>
          </>
        )}
      </View>
    </View>   
  );
};

export default OrderProductItem;
