import React, {Component} from 'react';
import {ScrollView, View} from 'react-native';
import {Button, Card, HelperText, List, Text, TextInput} from 'react-native-paper';
import {SaleProductItem} from '../../../components';
import {fieldErrors} from '../../../utils/screenFunctions';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';
import {NumericFormat} from 'react-number-format';
import {colors, normalizeSize} from '../../../styles/basicStyles';

class KitScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(this.props, 'Formulario armar combo', 'KitScreen');
  }
  componentWillUnmount() {
    this.props.actions.clearScreen();
  }
  render() {
    const nameErr = fieldErrors('name', this.props.errors);
    const proErr = fieldErrors('pro', this.props.errors);
    const totErr = fieldErrors('tot', this.props.errors);
    return (
      <Layout
        title={'Arma'}
        subtitle={'un combo'}
        contentContainerStyle={{justifyContent: 'flex-start'}}
        hideLogo={true}>
        <ScrollView
          style={{width: '100%'}}
          contentContainerStyle={{
            paddingHorizontal: normalizeSize(16),
            paddingBottom: normalizeSize(40),
          }}>
          <TextInput
            mode="outlined"
            label="Nombre del combo"
            placeholder="Ingresa el nombre del combo"
            left={<TextInput.Icon icon="package-variant" />}
            autoCapitalize="none"
            value={this.props.name || ''}
            error={nameErr != ''}
            onChangeText={(name) => this.props.actions.nameChange(name)}
            style={{marginTop: normalizeSize(6)}}
          />
          <HelperText type="error" visible={nameErr != ''}>
            {nameErr}
          </HelperText>

          <Card mode="outlined" style={{marginTop: normalizeSize(8)}}>
            <Card.Content>
              <Text
                variant="titleSmall"
                style={{
                  color: colors.label,
                  marginBottom: normalizeSize(10),
                }}>
                Productos o servicios
              </Text>
              <List.Item
                title="Agrega productos al combo"
                left={(props) => <List.Icon {...props} icon="plus-circle-outline" />}
                onPress={() => this.props.navigation.navigate('AddProductKit')}
                style={{paddingHorizontal: 0}}
              />
              <HelperText type="error" visible={proErr != ''}>
                {proErr}
              </HelperText>

              {this.props.pro.length > 0 &&
                this.props.pro.map((item, index) => (
                  <SaleProductItem
                    style={{
                      marginTop: index == 0 ? normalizeSize(10) : 0,
                    }}
                    name={item.label}
                    code={item.code}
                    value={item.price}
                    qty={item.qty + ''}
                    key={item.nid}
                    onChangePrice={
                      this.props.user.features.includes(
                        'sale_edit_product_price',
                      )
                        ? (price) =>
                            this.props.actions.priceChange(price, item)
                        : null
                    }
                    onAdd={() => this.props.actions.addProduct(item)}
                    onRemove={() => this.props.actions.removeProduct(item)}
                    onDelete={() => this.props.actions.deleteProduct(item)}
                    onChangeQty={(qty) =>
                      this.props.actions.qtyChange(qty, item)
                    }
                  />
                ))}

              {this.props.pro.length > 0 && (
                <View style={{marginTop: normalizeSize(10)}}>
                  <Text
                    variant="titleSmall"
                    style={{
                      color: colors.label,
                      marginBottom: normalizeSize(10),
                    }}>
                    Total
                  </Text>
                  <NumericFormat
                    value={this.props.tot}
                    displayType={'text'}
                    thousandSeparator={'.'}
                    decimalSeparator={','}
                    prefix={'$'}
                    renderText={(value) => (
                      <>
                        <TextInput
                          mode="outlined"
                          label="Total"
                          keyboardType="numeric"
                          left={<TextInput.Icon icon="currency-usd" />}
                          value={value || ''}
                          error={totErr != ''}
                          onChangeText={(price) =>
                            this.props.actions.priceChange(price)
                          }
                        />
                        <HelperText type="error" visible={totErr != ''}>
                          {totErr}
                        </HelperText>
                      </>
                    )}
                  />
                </View>
              )}
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={() =>
              this.props.actions.confirmKit({
                navigation: this.props.navigation,
                cat: this.props.route.params
                  ? this.props.route.params.cat
                  : null,
              })
            }
            style={{marginTop: normalizeSize(16)}}
            contentStyle={{paddingVertical: normalizeSize(6)}}>
            Agregar combo a la orden
          </Button>
        </ScrollView>
      </Layout>
    );
  }
}
export default KitScreen;
