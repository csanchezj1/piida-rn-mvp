import React, {Component} from 'react';
import {ScrollView, View} from 'react-native';
import {Button, Card, Checkbox, HelperText, Text, TextInput} from 'react-native-paper';
import {SelectList} from '../../../components';
import {fieldErrors} from '../../../utils/screenFunctions';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';
import {NumericFormat} from 'react-number-format';
import {colors, normalizeSize} from '../../../styles/basicStyles';

class ConfirmOrderScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(this.props, 'Confirmar compra', 'ConfirmOrderScreen');
    this.props.actions.getFieldsInfo();
  }
  componentWillUnmount() {
    this.props.actions.clearScreen();
  }
  paymentsQty() {
    let options = [];
    Array.from(Array(this.props.paymentsType.length).keys()).map((e) => {
      options.push({
        label: e + 1,
        value: e + 1,
      });
    });

    return options;
  }
  paymentsError(index, field) {
    if (this.props.errorArr.length > 0) {
      const i = this.props.errorArr.findIndex((e) => e.index == index);
      if (i !== -1) {
        if (field == 'type') {
          return !this.props.errorArr[i].type;
        } else {
          return !this.props.errorArr[i].value;
        }
      }
    }

    return false;
  }

  renderPaymentValueInput(index, errorVisible) {
    return (
      <>
        <TextInput
          mode="outlined"
          label="Valor abonado"
          placeholder="Ingresa el valor abonado"
          keyboardType="numeric"
          left={<TextInput.Icon icon="cash-multiple" />}
          value={this.props.payment[index] ? this.props.payment[index].value || '' : ''}
          error={errorVisible}
          onChangeText={(value) => this.props.actions.valueChange(value, index)}
          style={{marginTop: normalizeSize(8)}}
        />
      </>
    );
  }

  render() {
    const orderPaymentErr = fieldErrors('orderPayment', this.props.errors);
    const paymentsQtyErr = fieldErrors('paymentsQty', this.props.errors);
    const paymentErr = fieldErrors('payment', this.props.errors);

    return (
      <Layout title={'Confirmar'} subtitle={'orden'} hideLogo={true}>
        <ScrollView
          style={{width: '100%'}}
          contentContainerStyle={{
            paddingHorizontal: normalizeSize(16),
            paddingBottom: normalizeSize(40),
          }}>
          <Card mode="outlined" style={{backgroundColor: '#FFFFFF', marginTop: normalizeSize(8)}}>
            <Card.Content>
              <Text variant="titleMedium" style={{color: colors.label}}>
                Valor a pagar
              </Text>
              <NumericFormat
                value={this.props.total}
                displayType={'text'}
                thousandSeparator={'.'}
                decimalSeparator={','}
                prefix={'$'}
                renderText={(value) => (
                  <Text
                    variant="displaySmall"
                    style={{color: colors.text, marginVertical: normalizeSize(8)}}>
                    {value}
                  </Text>
                )}
              />

              {/* SelectList queda con su look propio — Paper no trae dropdown nativo */}
              <SelectList
                label={'¿Cómo se pagará de la orden?'}
                variables={this.props.orderPaymentsType}
                isError={!!orderPaymentErr}
                value={this.props.orderPayment ? this.props.orderPayment.label : null}
                icon={require('../../../assets/images/wallet.png')}
                onValueChange={(payment) => this.props.actions.orderPaymentChange(payment)}
              />
              <HelperText type="error" visible={!!orderPaymentErr}>
                {orderPaymentErr}
              </HelperText>

              {this.props.orderPayment &&
                this.props.orderPayment.value != 46 && (
                  <>
                    <SelectList
                      label={'Cantidad de medios de pago'}
                      variables={this.paymentsQty()}
                      isError={!!paymentsQtyErr}
                      value={this.props.paymentsQty ? this.props.paymentsQty.label : null}
                      icon={require('../../../assets/images/wallet.png')}
                      onValueChange={(payment) => this.props.actions.paymentsQtyChange(payment)}
                    />
                    <HelperText type="error" visible={!!paymentsQtyErr}>
                      {paymentsQtyErr}
                    </HelperText>

                    {this.props.paymentsQty &&
                      (this.props.paymentsQty.value == 1 ? (
                        this.props.orderPayment.value == 44 ? (
                          <>
                            <SelectList
                              label={'Medio de pago de la orden'}
                              variables={this.props.paymentsType}
                              isError={!!paymentErr || this.paymentsError(0, 'type')}
                              value={
                                this.props.payment[0]
                                  ? this.props.payment[0].type
                                    ? this.props.payment[0].type.label
                                    : null
                                  : null
                              }
                              icon={require('../../../assets/images/wallet.png')}
                              onValueChange={(payment) => this.props.actions.paymentChange(payment, 0)}
                            />
                            <HelperText type="error" visible={!!paymentErr}>
                              {paymentErr}
                            </HelperText>
                          </>
                        ) : (
                          <View>
                            <SelectList
                              label={'Medio de pago de la orden'}
                              variables={this.props.paymentsType}
                              isError={!!paymentErr || this.paymentsError(0, 'type')}
                              value={
                                this.props.payment[0]
                                  ? this.props.payment[0].type
                                    ? this.props.payment[0].type.label
                                    : null
                                  : null
                              }
                              icon={require('../../../assets/images/wallet.png')}
                              onValueChange={(payment) => this.props.actions.paymentChange(payment, 0)}
                            />
                            {this.renderPaymentValueInput(
                              0,
                              !!paymentErr || this.paymentsError(0, 'value'),
                            )}
                            <HelperText type="error" visible={!!paymentErr}>
                              {paymentErr}
                            </HelperText>
                          </View>
                        )
                      ) : (
                        Array.from(Array(this.props.paymentsQty.value).keys()).map((e) => (
                          <Card
                            key={e}
                            mode="outlined"
                            style={{
                              backgroundColor: 'rgba(247,169,40,0.04)',
                              marginTop: normalizeSize(8),
                            }}>
                            <Card.Content>
                              <Text
                                variant="bodyMedium"
                                style={{
                                  color: colors.label,
                                  marginBottom: normalizeSize(8),
                                }}>
                                Información para el método de pago {e + 1}
                              </Text>
                              <SelectList
                                label={'Medio de pago'}
                                variables={this.props.paymentsType}
                                isError={!!paymentErr || this.paymentsError(e, 'type')}
                                value={
                                  this.props.payment[e]
                                    ? this.props.payment[e].type
                                      ? this.props.payment[e].type.label
                                      : null
                                    : null
                                }
                                icon={require('../../../assets/images/wallet.png')}
                                onValueChange={(payment) =>
                                  this.props.actions.paymentChange(payment, e)
                                }
                              />
                              <TextInput
                                mode="outlined"
                                label="Valor pagado"
                                placeholder="Ingresa el valor pagado"
                                keyboardType="numeric"
                                left={<TextInput.Icon icon="cash-multiple" />}
                                value={
                                  this.props.payment[e]
                                    ? this.props.payment[e].value || ''
                                    : ''
                                }
                                error={!!paymentErr || this.paymentsError(e, 'value')}
                                onChangeText={(value) =>
                                  this.props.actions.valueChange(value, e)
                                }
                                style={{marginTop: normalizeSize(8)}}
                              />
                            </Card.Content>
                          </Card>
                        ))
                      ))}
                  </>
                )}

              <TextInput
                mode="outlined"
                label="Observaciones"
                placeholder="Observaciones"
                value={this.props.observations || ''}
                numberOfLines={5}
                multiline={true}
                onChangeText={(value) => this.props.actions.obsChange(value)}
                style={{marginTop: normalizeSize(12)}}
              />

              {this.props.user.features.includes('billing_alegra') && (
                <View style={{marginTop: normalizeSize(8)}}>
                  <Checkbox.Item
                    label="¿Desea generar factura electrónica?"
                    status={this.props.invoice ? 'checked' : 'unchecked'}
                    onPress={() => this.props.actions.hasInvoice()}
                    position="leading"
                    labelStyle={{textAlign: 'left'}}
                  />
                </View>
              )}
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={() =>
              this.props.actions.confirmOrder({
                uid: this.props.user.uid,
                navigation: this.props.navigation,
              })
            }
            style={{marginTop: normalizeSize(16)}}
            contentStyle={{paddingVertical: normalizeSize(6)}}>
            Confirmar
          </Button>
        </ScrollView>
      </Layout>
    );
  }
}
export default ConfirmOrderScreen;
