import React, { Component } from 'react';
import {View, Text, Image} from 'react-native';
import {Button, HelperText, TextInput} from 'react-native-paper';
import {getFormStyles, getBuyDetailsStyles} from '../../../styles/screenStyles';
import {OrderProductItem, SelectList} from '../../../components';
import {fieldErrors} from '../../../utils/screenFunctions';
import {registerEventScreenMounted} from '../../../utils/analytics';
import { Layout } from '../../../layouts';
import { NumericFormat } from 'react-number-format';
import { normalizeSize, colors } from '../../../styles/basicStyles';

class PayOrderScreen extends Component {
  styles = getFormStyles();
  orderStyles = getBuyDetailsStyles();
  componentDidMount(){
    registerEventScreenMounted(this.props, 'Abonar a la orden', 'PayOrderScreen');
    this.props.actions.getFieldsInfo();
    if(this.props.route.params){
      if(this.props.route.params.order){
        if(this.props.route.params.order.nid){
          this.props.actions.getItems(this.props.route.params.order.nid);
        }
      }
    }
  }
  componentWillUnmount(){
    this.props.actions.clearScreen();
  }
  paymentsQty(){
    let options = [];
    Array.from(Array(this.props.paymentsType.length).keys()).map((e) => {
      options.push({
        label:e+1,
        value:e+1,
      })
    })

    return options;
  }
  paymentsError(index, field){
    if(this.props.errorArr.length > 0){
      const i = this.props.errorArr.findIndex(e => e.index == index);
      if(i !== -1){
        if(field == 'type'){
          return !this.props.errorArr[i].type;
        }
        else{
          return !this.props.errorArr[i].value;
        }
      }
    }

    return false;
  }

  render() {
    let order = null;
    let subtitle = '';
    if(this.props.route.params){
      if(this.props.route.params.order){
        order = this.props.route.params.order;
        subtitle = 'orden No. ' + order.consecutive
      }
    }
    return (
      <Layout
        title={'Abonar o pagar'}
        subtitle={subtitle}
        contentContainerStyle={{justifyContent:'flex-start'}}
        hideLogo={true}>
        <View
          style={this.styles.card}>
          <Text
            style={this.styles.labelBig}>
            Valor pendiente por pagar
          </Text>
          <NumericFormat 
            value={order ? order.value - order.paid : null} 
            displayType={'text'} 
            thousandSeparator={'.'} 
            decimalSeparator={','} 
            prefix={'$'} 
            renderText={
              (value) => 
              <Text style={this.styles.valueBig}>
                {value}
              </Text>
            }/>
          <SelectList
            label={'Cantidad de medios de pago'}
            variables={this.paymentsQty()}
            isError={fieldErrors('paymentsQty', this.props.errors) != ''}
            value={this.props.paymentsQty ? this.props.paymentsQty.label : null}
            icon={require('../../../assets/images/wallet.png')}
            onValueChange={(payment) => this.props.actions.paymentsQtyChange(payment)}/>

          {this.props.paymentsQty && (
            this.props.paymentsQty.value == 1 ? (
              <View>
                <SelectList
                  label={'Medio de pago de la orden'}
                  variables={this.props.paymentsType}
                  isError={fieldErrors('payment', this.props.errors) != '' || this.paymentsError(0, 'type')}
                  value={this.props.payment[0] ? this.props.payment[0].type ? this.props.payment[0].type.label : null : null}
                  icon={require('../../../assets/images/wallet.png')}
                  onValueChange={(payment) => this.props.actions.paymentChange(payment, 0)}/>
                {(() => {
                  const valueErr = fieldErrors('payment', this.props.errors) != '' || this.paymentsError(0, 'value');
                  return (
                    <>
                      <TextInput
                        mode="outlined"
                        label="Valor a pagar"
                        placeholder="Ingresa el valor a pagar"
                        keyboardType="numeric"
                        left={<TextInput.Icon icon="cash" />}
                        value={this.props.payment[0] ? (this.props.payment[0].value || '') : ''}
                        error={!!valueErr}
                        onChangeText={(value) => this.props.actions.valueChange(value, 0)}
                        style={{marginTop: normalizeSize(8)}}
                      />
                      <HelperText type="error" visible={!!valueErr}>
                        {fieldErrors('payment', this.props.errors)}
                      </HelperText>
                    </>
                  );
                })()}
              </View>
            ) : (
              Array.from(Array(this.props.paymentsQty.value).keys()).map((e) => {
                const valueErr = fieldErrors('payment', this.props.errors) != '' || this.paymentsError(e, 'value');
                return(
                  <View
                    key={e}
                    style={this.styles.paymentCont}>
                    <Text
                      style={[this.styles.label, {
                        marginBottom:normalizeSize(5)
                      }]}>
                      Información para el método de pago {e + 1}
                    </Text>
                    <SelectList
                      label={'Medio de pago'}
                      variables={this.props.paymentsType}
                      isError={fieldErrors('payment', this.props.errors) != '' || this.paymentsError(e, 'type')}
                      value={this.props.payment[e] ? this.props.payment[e].type ? this.props.payment[e].type.label : null : null}
                      icon={require('../../../assets/images/wallet.png')}
                      onValueChange={(payment) => this.props.actions.paymentChange(payment, e)}/>
                    <TextInput
                      mode="outlined"
                      label="Valor a pagar"
                      placeholder="Ingresa el valor a pagar"
                      keyboardType="numeric"
                      left={<TextInput.Icon icon="cash" />}
                      value={this.props.payment[e] ? (this.props.payment[e].value || '') : ''}
                      error={!!valueErr}
                      onChangeText={(value) => this.props.actions.valueChange(value, e)}
                      style={{marginTop: normalizeSize(8)}}
                    />
                    <HelperText type="error" visible={!!valueErr}>
                      {fieldErrors('payment', this.props.errors)}
                    </HelperText>
                  </View>
                )
              })
            ))
          }

          <Button
            mode="contained"
            onPress={() => this.props.actions.confirmOrder({
              uid:this.props.user.uid,
              navigation:this.props.navigation,
              total:order ? order.value - order.paid : null,
              order:order,
              orderTotal:order.value,
              paid:order.paid,
            })}
            style={{marginTop: normalizeSize(8), marginBottom: normalizeSize(8)}}
            contentStyle={{paddingVertical: normalizeSize(4)}}>
            Confirmar
          </Button>
        </View>

        <View
          style={this.orderStyles.reciptCont}>
          <Text 
            style={[this.orderStyles.statusText, {
              color:colors.text,
              fontSize:normalizeSize(18),
              marginTop:normalizeSize(10)
            }]}>
            Detalles de la orden
          </Text>
          {order.customer && (
            <View>
              <Text
                style={this.orderStyles.label}>
                Cliente
              </Text>
              <Text 
                style={this.orderStyles.storeName}>
                {order.customer}
              </Text>
            </View>
          )}
          {order.observations && (
            <View>
              <Text
                style={this.orderStyles.label}>
                Observaciones
              </Text>
              <Text
                style={this.orderStyles.value}>
                {order.observations }
              </Text>
            </View>
          )}                       
          {this.props.items && (
            <>
            {this.props.items.items.length > 0 && (
              <View>
                <Text
                  style={this.orderStyles.label}>
                  Items comprados
                </Text>
                {this.props.items.items.map(item => {
                return(
                  <OrderProductItem
                    key={item.nid}
                    style={this.orderStyles.item}
                    name={item.product}
                    value={item.value}
                    qty={item.qty}
                    products={item.products}
                  />
                )
                })}
              </View>
            )}
            {this.props.items.payments.length > 0 && (
              <View>
                <Text
                  style={this.orderStyles.label}>
                  Pagos
                </Text>
                {this.props.items.payments.map((item, index) => {
                return(
                  <OrderProductItem
                    key={index}
                    style={this.orderStyles.item}
                    name={item.type}
                    value={item.value}
                    date={item.date}
                  />
                )
                })}
              </View>
            )}
            </>
          )}
          {(order.value) && (
            <View style={this.orderStyles.separator}/>
          )}
          {order.value && (
            <View  
              style={this.orderStyles.priceCont}>
              <Text 
                style={[this.orderStyles.totalLabel, {
                  fontSize:normalizeSize(14)
                }]}>
                Total
              </Text>
              <NumericFormat 
                value={order.value} 
                displayType={'text'} 
                thousandSeparator={'.'} 
                decimalSeparator={','} 
                prefix={'$'} 
                renderText={
                  (value) => 
                  <Text 
                    style={[this.orderStyles.totalValue, {
                      fontSize:normalizeSize(14)
                    }]}>
                    {value}
                  </Text>
                }
              />
            </View>
          )}
          {order.paid && (
            <View  
              style={this.orderStyles.priceCont}>
              <Text 
                style={[this.orderStyles.totalLabel, {
                  fontSize:normalizeSize(14)
                }]}>
                Pagado
              </Text>
              <NumericFormat 
                value={order.paid} 
                displayType={'text'} 
                thousandSeparator={'.'} 
                decimalSeparator={','}  
                prefix={'$'} 
                renderText={
                  (value) => 
                  <Text 
                    style={[this.orderStyles.totalValue, {
                      fontSize:normalizeSize(14)
                    }]}>
                    {value}
                  </Text>
                }
              />
            </View>
          )}
          {order.value && order.paid && (
            <View  
              style={this.orderStyles.priceCont}>
              <Text 
                style={this.orderStyles.totalLabel}>
                SALDO
              </Text>
              <NumericFormat 
                value={order.value - order.paid} 
                displayType={'text'} 
                thousandSeparator={'.'} 
                decimalSeparator={','} 
                prefix={'$'} 
                renderText={
                  (value) => 
                  <Text style={this.orderStyles.totalValue}>
                    {value}
                  </Text>
                }
              />
            </View>
          )}
          <Image
            style={this.orderStyles.footer}
            resizeMode={'contain'}
            source={require('../../../assets/images/bott.png')}
          />
        </View>
      </Layout>
    );
  }
}
export default PayOrderScreen;