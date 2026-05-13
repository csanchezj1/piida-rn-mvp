import React, { Component } from 'react';
import {View, Text, TouchableOpacity, Image, Platform} from 'react-native';
import {Button} from 'react-native-paper';
import {getFormStyles} from '../../../styles/screenStyles';
import {SaleProductItem, SelectList, SaleKitItem} from '../../../components';
import {fieldErrors} from '../../../utils/screenFunctions';
import {registerEventScreenMounted} from '../../../utils/analytics';
import { Layout } from '../../../layouts';
import { NumericFormat } from 'react-number-format';
import { normalizeSize } from '../../../styles/basicStyles';

class BuyScreen extends Component {
  styles = getFormStyles();
  componentDidMount(){
    registerEventScreenMounted(this.props, 'Formulario compra', 'BuyScreen');
    if(this.props.user.features.includes('cash_management_required')){
      this.props.actions.login()
    }
  }
  componentWillUnmount(){
    this.props.actions.clearScreen();
  }
  form(){
    return(
      <View>
        <View
          style={this.styles.card}>
          <Text
            style={this.styles.label}>
            Datos del cliente
          </Text>
          <SelectList
            label={'Busca un cliente'}
            isError={fieldErrors('customer', this.props.errors) != ''}
            errorText={fieldErrors('customer', this.props.errors)}
            onPress={() => this.props.navigation.navigate('Provider', {
              from:'customer'
            })}/>
          {this.props.customer && (
            <View>
              {this.props.customer.label && (
                <View
                  style={this.styles.dataCont}>
                  <Text
                    style={this.styles.valueBold}>
                    {'Nombre'}
                  </Text>
                  <Text
                    style={this.styles.value}>
                    {this.props.customer.label}
                  </Text>
                </View>
              )}
              {this.props.customer.phone && (
                <View
                  style={this.styles.dataCont}>
                  <Text
                    style={this.styles.valueBold}>
                    {'Número telefónico'}
                  </Text>
                  <Text
                    style={this.styles.value}>
                    {this.props.customer.phone}
                  </Text>
                </View>
              )}
              {this.props.customer.id_number && (
                <View
                  style={this.styles.dataCont}>
                  <Text
                    style={this.styles.valueBold}>
                    {'Número de identificación'}
                  </Text>
                  <Text
                    style={this.styles.value}>
                    {this.props.customer.id_number}
                  </Text>
                </View>
              )}
              {this.props.customer.address && (
                <View
                  style={this.styles.dataCont}>
                  <Text
                    style={this.styles.valueBold}>
                    {'Dirección'}
                  </Text>
                  <Text
                    style={this.styles.value}>
                    {this.props.customer.address}
                  </Text>
                </View>
              )}
              {this.props.customer.email && (
                <View
                  style={this.styles.dataCont}>
                  <Text
                    style={this.styles.valueBold}>
                    {'Correo electrónico: '}
                  </Text>
                  <Text
                    style={this.styles.value}>
                    {this.props.customer.email}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
        <View
          style={this.styles.card}>
          <Text
            style={this.styles.label}>
            Productos o servicios
          </Text>
          
          <SelectList
            label={'Busca un producto'}
            isError={fieldErrors('product', this.props.errors) != ''}
            errorText={fieldErrors('product', this.props.errors)}
            onPress={() => this.props.user.features.includes('product_extra_fields_production_date') ?
              this.props.navigation.navigate('ProductCategories') :
              this.props.navigation.navigate('Provider', {
              from:'product'})}
            />
          {this.props.user.features.includes('product_extra_fields_big_riders') && Platform.OS == 'android' && (
            <TouchableOpacity
              style={this.styles.addCont}
              activeOpacity={0.9}
              onPress={() => this.props.navigation.navigate('QRScan')}>
              <Text
                style={this.styles.addTxt}>
                Escanea el producto
              </Text>
              <Image
                style={this.styles.addImg}
                source={require('../../../assets/images/qr_code_scanner.png')}
              />
            </TouchableOpacity>
          )}
          {this.props.product.length > 0 && (
            this.props.product.map((item, index) => {
              let name = item.label;
              if(item.production_date){
                name = item.label + ' / ' + item.production_date;
              }
              return(
                (item.type || item.body != '') ? (
                  <SaleKitItem
                    style={[this.styles.productItem, {
                      marginTop:index==0 ? normalizeSize(10) : 0
                    }]}
                    name={name}
                    code={item.code}
                    products={item.products}
                    product={item.body}
                    value={item.price}
                    qty={item.qty + ''}
                    key={index}
                    onAdd={() => this.props.actions.addProduct(item)}
                    onRemove={() => this.props.actions.removeProduct(item)}
                    onDelete={() => this.props.actions.deleteProduct(item)}
                    onChangeQty={(qty) => this.props.actions.qtyChange(qty, item)}
                  />
                ) : (
                  <SaleProductItem
                    style={[this.styles.productItem, {
                      marginTop:index==0 ? normalizeSize(10) : 0
                    }]}
                    name={name}
                    code={item.code}
                    value={item.price}
                    qty={item.qty + ''}
                    key={index}
                    onChangePrice={this.props.user.features.includes('sale_edit_product_price') ?
                      (price) => this.props.actions.priceChange(price, item) :
                      null
                    }
                    onAdd={() => this.props.actions.addProduct(item)}
                    onRemove={() => this.props.actions.removeProduct(item)}
                    onDelete={() => this.props.actions.deleteProduct(item)}
                    onChangeQty={(qty) => this.props.actions.qtyChange(qty, item)}
                  />
                )
              );
            })
          )}  
          {this.props.product.length > 0 && (
            <View
              style={this.styles.totalCont}>
              <Text
                style={this.styles.label}>
                {'Total '}
              </Text>
              <NumericFormat 
                value={this.props.total} 
                displayType={'text'} 
                thousandSeparator={'.'} 
                decimalSeparator={','} 
                prefix={'$'} 
                renderText={
                  (value) => 
                  <Text style={this.styles.valueBold}>
                    {value}
                  </Text>
                }
              />
            </View>
          )}
        </View>
        <Button
          mode="contained"
          style={[this.styles.button, {marginTop: normalizeSize(8)}]}
          onPress={() => this.props.actions.confirmOrder({
            uid:this.props.user.uid,
            product:this.props.product,
            customer:this.props.customer,
            navigation:this.props.navigation,
          })}>
          Continuar con la orden
        </Button>
      </View>
    );
  }
  render() {
    return (
      <Layout
        title={'Registrar'}
        subtitle={'venta'}
        contentContainerStyle={{justifyContent:'flex-start'}}
        hideLogo={true}>
        {this.props.user.features.includes('cash_management_required') ? (
          this.props.user.cash_id == 0 ? (
            <View>
              <Text
                style={this.styles.noLabel}>
                Aún no puedes registrar ventas
              </Text>
              <Text
                style={this.styles.noText}>
                Debes iniciar tu turno antes de registrar una venta. Inicia tu turno abriendo la caja aquí.
              </Text>
              <Button
                mode="contained"
                onPress={() => this.props.navigation.navigate('Box', {type:'openBox'})}>
                Abrir caja
              </Button>
            </View>
          ) : (
            this.form()
          )
        ) : (
          this.form()
        )}
      </Layout>
    );
  }
}
export default BuyScreen;