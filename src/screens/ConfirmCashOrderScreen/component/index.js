import React, {Component} from 'react';
import {ScrollView, View} from 'react-native';
import {Button, Card, Checkbox, HelperText, Text, TextInput} from 'react-native-paper';
import {fieldErrors} from '../../../utils/screenFunctions';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';
import {NumericFormat} from 'react-number-format';
import {colors, normalizeSize} from '../../../styles/basicStyles';

class ConfirmCashOrderScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(this.props, 'Confirmar compra en efectivo', 'ConfirmCashOrderScreen');
  }
  componentWillUnmount() {
    this.props.actions.clearScreen();
  }
  formatCurrency(value) {
    if (!value) return '';
    const number = parseInt(value, 10);
    if (isNaN(number)) return '';
    return `$${number.toLocaleString('es-CO')}`;
  }

  render() {
    const valueErr = fieldErrors('value', this.props.errors);
    return (
      <Layout title={'Pago en'} subtitle={'efectivo'} hideLogo={true}>
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
                    style={{
                      color: colors.text,
                      marginVertical: normalizeSize(8),
                    }}>
                    {value}
                  </Text>
                )}
              />

              <TextInput
                mode="outlined"
                label="¿Con cuánto paga el cliente?"
                placeholder="Con cuánto paga el cliente"
                keyboardType="numeric"
                left={<TextInput.Icon icon="cash-multiple" />}
                value={this.formatCurrency(this.props.value)}
                error={!!valueErr}
                onChangeText={(value) => this.props.actions.valueChange(value)}
                style={{marginTop: normalizeSize(12)}}
              />
              <HelperText type="error" visible={!!valueErr}>
                {valueErr}
              </HelperText>

              <Text variant="titleMedium" style={{color: colors.label, marginTop: normalizeSize(8)}}>
                Devolución al cliente
              </Text>
              <NumericFormat
                value={this.props.returnValue}
                displayType={'text'}
                thousandSeparator={'.'}
                decimalSeparator={','}
                prefix={'$'}
                renderText={(value) => (
                  <Text
                    variant="displayMedium"
                    style={{
                      color: colors.text,
                      marginVertical: normalizeSize(8),
                    }}>
                    {value}
                  </Text>
                )}
              />

              <Button
                mode="contained"
                onPress={() =>
                  this.props.actions.confirmOrder({
                    navigation: this.props.navigation,
                  })
                }
                style={{marginTop: normalizeSize(8)}}
                contentStyle={{paddingVertical: normalizeSize(6)}}>
                Finalizar venta
              </Button>
            </Card.Content>
          </Card>

          {this.props.user.features.includes('billing_alegra') && (
            <View style={{marginTop: normalizeSize(12)}}>
              <Checkbox.Item
                label="¿Desea generar factura electrónica?"
                status={this.props.invoice ? 'checked' : 'unchecked'}
                onPress={() => this.props.actions.hasInvoice()}
                position="leading"
                labelStyle={{textAlign: 'left'}}
              />
            </View>
          )}

          <Card
            mode="outlined"
            style={{backgroundColor: '#FFFFFF', marginTop: normalizeSize(12)}}>
            <Card.Content>
              <Text variant="bodyMedium" style={{color: colors.purplishGrey}}>
                Si no deseas calcular devolución:
              </Text>
              <Button
                mode="outlined"
                onPress={() =>
                  this.props.actions.completePayment({
                    navigation: this.props.navigation,
                  })
                }
                style={{marginTop: normalizeSize(8)}}>
                Pago completo
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </Layout>
    );
  }
}
export default ConfirmCashOrderScreen;
