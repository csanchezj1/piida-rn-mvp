import React, {Component} from 'react';
import {ScrollView, View} from 'react-native';
import {Button, HelperText, TextInput, Text} from 'react-native-paper';
import {SaleProductItem, SelectList} from '../../../components';
import {fieldErrors} from '../../../utils/screenFunctions';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';
import {colors, normalizeSize} from '../../../styles/basicStyles';

class BuyScreen extends Component {
  componentDidMount() {
    this.props.actions.getFieldsInfo(this.props.user.company);
    registerEventScreenMounted(this.props, 'Formulario gasto', 'BuyScreen');
    if (this.props.user.features.includes('cash_management_required')) {
      this.props.actions.login();
    }
  }
  componentWillUnmount() {
    this.props.actions.clearScreen();
  }
  form() {
    const expenseErr = fieldErrors('expense', this.props.errors);
    const providerErr = fieldErrors('provider', this.props.errors);
    const valueErr = fieldErrors('value', this.props.errors);
    const paymentErr = fieldErrors('payment', this.props.errors);
    const productErr = fieldErrors('product', this.props.errors);
    return (
      <View style={{width: '100%'}}>
        <SelectList
          style={{marginTop: normalizeSize(10)}}
          label={'Tipo de gasto'}
          variables={this.props.expenseType}
          isError={expenseErr != ''}
          value={this.props.expense ? this.props.expense.label : null}
          icon={require('../../../assets/images/product.png')}
          onValueChange={(expense) =>
            this.props.actions.expenseTypeChange(expense)
          }
        />

        {this.props.expense &&
          (this.props.expense.label == 'Compra de productos' ||
          this.props.expense.value == 50 ? (
            <SelectList
              label={'Proveedor'}
              isError={providerErr != ''}
              value={this.props.provider ? this.props.provider.label : null}
              icon={require('../../../assets/images/partner.png')}
              onPress={() =>
                this.props.navigation.navigate('Provider', {
                  from: 'provider',
                })
              }
            />
          ) : (
            <>
              <TextInput
                mode="outlined"
                label="Valor unitario"
                placeholder="Valor unitario"
                keyboardType="numeric"
                left={<TextInput.Icon icon="currency-usd" />}
                value={this.props.value || ''}
                error={valueErr != ''}
                onChangeText={(value) =>
                  this.props.actions.valueChange(value)
                }
                style={{marginTop: normalizeSize(6)}}
              />
              <HelperText type="error" visible={valueErr != ''}>
                {valueErr}
              </HelperText>
            </>
          ))}

        <SelectList
          label={'pago'}
          variables={this.props.paymentsType}
          isError={paymentErr != ''}
          value={this.props.payment ? this.props.payment.label : null}
          icon={require('../../../assets/images/wallet.png')}
          onValueChange={(payment) => this.props.actions.paymentChange(payment)}
        />

        <TextInput
          mode="outlined"
          label="Observaciones"
          placeholder="Observaciones"
          value={this.props.obs || ''}
          numberOfLines={5}
          multiline
          onChangeText={(obs) => this.props.actions.obsChange(obs)}
          style={{marginTop: normalizeSize(6)}}
        />

        {this.props.expense &&
          (this.props.expense.label == 'Compra de productos' ||
            this.props.expense.value == 50) && (
            <View>
              <SelectList
                label={'Selecciona los productos'}
                isError={productErr != ''}
                icon={require('../../../assets/images/product.png')}
                onPress={() =>
                  this.props.navigation.navigate('Provider', {
                    from: 'buy_product',
                  })
                }
              />
              {this.props.product.length > 0 &&
                this.props.product.map((item, index) => (
                  <SaleProductItem
                    key={index}
                    name={item.label}
                    qty={item.qty + ''}
                    value={item.price}
                    onAdd={() => this.props.actions.addProduct(item)}
                    onRemove={() => this.props.actions.removeProduct(item)}
                    onDelete={() => this.props.actions.deleteProduct(item)}
                    onChangeQty={(qty) =>
                      this.props.actions.qtyChange(qty, item)
                    }
                    onChangePrice={(price) =>
                      this.props.actions.priceChange(price, item)
                    }
                  />
                ))}
            </View>
          )}

        <Button
          mode="contained"
          onPress={() =>
            this.props.actions.createPurchase({
              uid: this.props.user.uid,
              navigation: this.props.navigation,
            })
          }
          style={{marginTop: normalizeSize(16)}}
          contentStyle={{paddingVertical: normalizeSize(6)}}>
          Enviar
        </Button>
      </View>
    );
  }
  render() {
    return (
      <Layout
        title={'Registrar'}
        subtitle={'gasto'}
        contentContainerStyle={{justifyContent: 'flex-start'}}
        hideLogo={true}>
        <ScrollView
          style={{width: '100%'}}
          contentContainerStyle={{
            paddingHorizontal: normalizeSize(16),
            paddingBottom: normalizeSize(40),
          }}>
          {this.props.user.features.includes('cash_management_required') ? (
            this.props.user.cash_id == 0 ? (
              <View>
                <Text
                  variant="titleMedium"
                  style={{
                    color: colors.label,
                    textAlign: 'center',
                    marginTop: normalizeSize(20),
                  }}>
                  Aún no puedes registrar gastos
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{
                    color: colors.purplishGrey,
                    textAlign: 'center',
                    marginTop: normalizeSize(10),
                    marginBottom: normalizeSize(20),
                  }}>
                  Debes iniciar tu turno antes de registrar un gasto. Inicia tu
                  turno abriendo la caja aquí.
                </Text>
                <Button
                  mode="contained"
                  onPress={() =>
                    this.props.navigation.navigate('Box', {type: 'openBox'})
                  }
                  contentStyle={{paddingVertical: normalizeSize(6)}}>
                  Abrir caja
                </Button>
              </View>
            ) : (
              this.form()
            )
          ) : (
            this.form()
          )}
        </ScrollView>
      </Layout>
    );
  }
}
export default BuyScreen;
