import React, { Component } from 'react';
import {Image, Text, View, Platform} from 'react-native';
import {Button} from 'react-native-paper';
import {getBuyDetailsStyles} from '../../../styles/screenStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';
import { Layout } from '../../../layouts';
import { OrderProductItem } from '../../../components';
import { NumericFormat } from 'react-number-format';
import { colors, normalizeSize } from '../../../styles/basicStyles';
import ViewShot from "react-native-view-shot";
import RNFS from "react-native-fs";
import Share from 'react-native-share';

class BuyDetailsScreen extends Component {
  styles = getBuyDetailsStyles();
  componentDidMount(){
    registerEventScreenMounted(this.props, 'Detalles de la compra', 'BuyDetailsScreen');
    if(this.props.route.params){
      if(this.props.route.params.details){
        if(this.props.route.params.details.order){
          this.props.actions.getItems(this.props.route.params.details.order);
          this.props.actions.getPayments(this.props.route.params.details.movement_id);
        }
      }
    }
  }
  componentWillUnmount(){
    this.props.actions.clear();
  }
  render() {
    const details = this.props.route.params.details;
    return (
      <Layout
       contentContainerStyle={{justifyContent:'flex-start', paddingBottom: normalizeSize(150)}}
        hideLogo={true}
        title={'Detalles del'}
        subtitle={'movimiento'}
        onPress={() => {
          /*this.viewShot.capture().then((uri) => {
            RNFS.readFile(uri, 'base64').then((res) => {
              let urlString = 'data:image/png;base64,' + res;
              let options = {
                title: 'Comprobante Piida',
                message: 'Hola',
                url: urlString,
                type: 'image/png',
              };
              console.log(options)
              Share.open(options)
                .then((res) => {
                  console.log(res);
                })
                .catch((err) => {
                  err && console.log(err);
                });
            });
          });*/
          this.viewShot.capture().then((uri) => {
            Share.open({
              title: 'Comprobante Piida',
              message: 'Comprobante Piida',
              url: `file://${uri}`,
              type: 'image/png',
              failOnCancel: false,
            })
            .catch(err => console.log(err));
          });
        }}>
        <ViewShot
          ref={(ref) => this.viewShot = ref} 
          options={{ 
            fileName:'Comprobante ' + this.props.user.company_name, 
            format: "png", 
            quality: 1 
          }}>
          <View
            style={this.styles.reciptCont}>
            <Text
              style={this.styles.title}>
              {this.props.user.company_name}
            </Text>
            <Text
              style={this.styles.title}>
              {this.props.user.branch_office_name}
            </Text>
            <Text
              style={this.styles.title}>
              {this.props.user.branch_office_phone}
            </Text>
            
            {details.movement && (
              <Text 
                style={[this.styles.statusText, {
                  color:colors.text,
                  fontSize:normalizeSize(22),
                  marginTop:normalizeSize(20)
                }]}>
                {'Transacción '}{details.movement}
              </Text>
            )}
            {details.date && (
              <Text 
                style={[this.styles.statusText, {
                  color:colors.text,
                  
                }]}>
                {details.date}
              </Text>
            )}
            {details.value && (
              <View>
                <Text
                  style={this.styles.label}>
                  Valor
                </Text>
                <NumericFormat 
                  value={details.value} 
                  displayType={'text'} 
                  thousandSeparator={'.'} 
                  decimalSeparator={','} 
                  prefix={'$'} 
                  renderText={
                    (value) => 
                    <Text
                      style={this.styles.storeName}>
                      {value}
                    </Text>
                  }
                />
              </View>
            )}
            {details.provider && (
              <View>
                <Text
                  style={this.styles.label}>
                  Proveedor
                </Text>
                <Text 
                  style={this.styles.storeName}>
                  {details.provider}
                </Text>
              </View>
            )}
            {details.customer && (
              <View>
                <Text
                  style={this.styles.label}>
                  Cliente
                </Text>
                <Text 
                  style={this.styles.storeName}>
                  {details.customer}
                </Text>
              </View>
            )}
            {details.movementType && (
              <>
                <Text
                  style={this.styles.label}>
                  Concepto
                </Text>
                <Text
                  style={this.styles.value}>
                  {details.movementType}
                </Text>
              </>
            )}
            {/*
              Si tenemos payments desde la API (venta con uno o varios medios)
              priorizamos eso porque trae nombre + valor real por medio. El
              campo details.paymentType es el legacy que sólo viene completo
              cuando la venta tuvo UN solo medio — si payments.length > 0,
              evitamos duplicar y sólo mostramos la lista detallada.
            */}
            {this.props.payments.length > 0 ? (
              <>
                <Text style={this.styles.label}>
                  {this.props.payments.length > 1 ? 'Medios de pago' : 'Medio de pago'}
                </Text>
                {this.props.payments.map((item, index) => {
                  // type ya viene normalizado por el action; pero por defensa,
                  // si llega un response viejo con payment_method, lo cubrimos.
                  const name = item.type || item.payment_method || item.method || 'Medio de pago';
                  return (
                    <View
                      key={index}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        // paddingHorizontal corre el valor un poco hacia adentro
                        // para que no quede pegado al borde derecho del recibo.
                        paddingHorizontal: normalizeSize(16),
                        marginVertical: normalizeSize(2),
                      }}>
                      <Text style={[this.styles.value, {flex: 1, marginHorizontal: 0}]}>
                        {name}
                      </Text>
                      <NumericFormat
                        value={item.value}
                        displayType={'text'}
                        thousandSeparator={'.'}
                        decimalSeparator={','}
                        prefix={'$'}
                        renderText={(v) => (
                          <Text style={[this.styles.value, {marginHorizontal: 0}]}>
                            {v}
                          </Text>
                        )}
                      />
                    </View>
                  );
                })}
              </>
            ) : details.paymentType ? (
              <>
                <Text
                  style={this.styles.label}>
                  Medio de pago
                </Text>
                <Text
                  style={this.styles.value}>
                  {details.paymentType }
                </Text>
              </>
            ) : null}
            {details.observations && (
              <>
                <Text
                  style={this.styles.label}>
                  Observaciones
                </Text>
                <Text
                  style={this.styles.value}>
                  {details.observations }
                </Text>
              </>
            )}         
            {details.orderConsecutive && (
              <Text 
                style={[this.styles.statusText, {
                  color:colors.text,
                  fontSize:normalizeSize(18),
                  marginTop:normalizeSize(10)
                }]}>
                {'Detalles de la orden '}{details.orderConsecutive}
              </Text>
            )} 
            {details.orderId && (
              <Text 
                style={[this.styles.statusText, {
                  color:colors.text,
                  fontSize:normalizeSize(18),
                  marginTop:normalizeSize(10),
                  textAlign:'center'
                }]}>
                {'Producto comprado bajo la orden '}{details.orderId}
              </Text>
            )}         
            {/*
              Render: si el server ya devolvió items (BUY_DETAILS_ITEMS) los
              usamos como fuente de verdad y ocultamos details.product (preview
              que pasa BalanceScreen para evitar el flicker mientras carga).
              Antes ambos se renderizaban juntos → aparecía el producto del
              catálogo y un duplicado "Venta libre (sin nombre)" porque el
              field correcto en items[] es item.name, no item.product.
            */}
            {this.props.items && this.props.items.items && this.props.items.items.length > 0 ? (
              <View>
                {this.props.items.items.map(item => (
                  <OrderProductItem
                    key={item.nid}
                    style={this.styles.item}
                    // El back v2 devuelve item.name (catálogo) o "Venta libre"
                    // marcada como item.is_free_item con name custom. Fallback
                    // a item.product por compat de respuestas viejas.
                    name={item.name || item.product || 'Venta libre (sin nombre)'}
                    value={item.subtotal ?? item.value ?? 0}
                    qty={item.qty}
                    products={item.products}
                  />
                ))}
              </View>
            ) : (
              details.product && (
                <View>
                  {details.product.map(item => (
                    <OrderProductItem
                      key={item.nid}
                      style={this.styles.item}
                      name={item.label}
                      value={item.price * item.qty}
                      qty={item.qty}
                      products={item.products}
                    />
                  ))}
                </View>
              )
            )}
            {(details.total) && (
              <View style={this.styles.separator}/>
            )}
            {details.total && (
              <View  
                style={this.styles.priceCont}>
                <Text 
                  style={[this.styles.totalLabel, {
                    fontSize:normalizeSize(14)
                  }]}>
                  Total
                </Text>
                <NumericFormat 
                  value={details.total} 
                  displayType={'text'} 
                  thousandSeparator={'.'} 
                  decimalSeparator={','} 
                  prefix={'$'} 
                  renderText={
                    (value) => 
                    <Text 
                      style={[this.styles.totalValue, {
                        fontSize:normalizeSize(14)
                      }]}>
                      {value}
                    </Text>
                  }
                />
              </View>
            )}
            {details.paid && (
              <View  
                style={this.styles.priceCont}>
                <Text 
                  style={[this.styles.totalLabel, {
                    fontSize:normalizeSize(14)
                  }]}>
                  Pagado
                </Text>
                <NumericFormat 
                  value={details.paid} 
                  displayType={'text'} 
                  thousandSeparator={'.'} 
                  decimalSeparator={','} 
                  prefix={'$'} 
                  renderText={
                    (value) => 
                    <Text 
                      style={[this.styles.totalValue, {
                        fontSize:normalizeSize(14)
                      }]}>
                      {value}
                    </Text>
                  }
                />
              </View>
            )}
            {details.total && details.paid && (
              <View  
                style={this.styles.priceCont}>
                <Text 
                  style={this.styles.totalLabel}>
                  SALDO
                </Text>
                <NumericFormat 
                  value={details.total - details.paid} 
                  displayType={'text'} 
                  thousandSeparator={'.'} 
                  decimalSeparator={','} 
                  prefix={'$'} 
                  renderText={
                    (value) => 
                    <Text style={this.styles.totalValue}>
                      {value}
                    </Text>
                  }
                />
              </View>
            )}
            <Image
              style={this.styles.footer}
              resizeMode={'contain'}
              source={require('../../../assets/images/bott.png')}
            />
          </View>
        </ViewShot>
        {Platform.OS === 'android' && (
          <Button
            mode="contained"
            icon="printer"
            onPress={() => this.props.actions.reprintReceipt(details)}
            style={{
              marginTop: normalizeSize(20),
              alignSelf: 'center',
            }}
            contentStyle={{paddingVertical: normalizeSize(4), paddingHorizontal: normalizeSize(12)}}>
            Reimprimir recibo
          </Button>
        )}
      </Layout>
    );
  }
}
export default BuyDetailsScreen;