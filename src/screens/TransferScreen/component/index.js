import React, {Component} from 'react';
import {ScrollView, View} from 'react-native';
import {Button, HelperText, TextInput} from 'react-native-paper';
import {SelectList, SaleProductItem} from '../../../components';
import {fieldErrors} from '../../../utils/screenFunctions';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';
import {normalizeSize} from '../../../styles/basicStyles';

class TransferScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(
      this.props,
      'Formulario traslado de inventario',
      'TransferScreen',
    );
  }
  componentWillUnmount() {
    this.props.actions.clearScreen();
  }
  render() {
    const branchErr = fieldErrors('branch', this.props.errors);
    const productErr = fieldErrors('product', this.props.errors);
    return (
      <Layout
        title={'Trasladar'}
        subtitle={'Inventario'}
        contentContainerStyle={{justifyContent: 'flex-start'}}
        hideLogo={true}>
        <ScrollView
          style={{width: '100%'}}
          contentContainerStyle={{
            paddingHorizontal: normalizeSize(16),
            paddingBottom: normalizeSize(40),
          }}>
          <SelectList
            style={{marginTop: normalizeSize(10)}}
            label={'Sede o sucursal de destino'}
            isError={branchErr != ''}
            value={this.props.branch ? this.props.branch.label : null}
            icon={require('../../../assets/images/ic_business.png')}
            onPress={() =>
              this.props.navigation.navigate('Provider', {
                from: 'branch',
              })
            }
          />

          <View>
            <SelectList
              label={'Selecciona los productos'}
              isError={productErr != ''}
              icon={require('../../../assets/images/product.png')}
              onPress={() =>
                this.props.navigation.navigate('Provider', {
                  from: 'transfer_product',
                })
              }
            />
            {this.props.product.length > 0 &&
              this.props.product.map((item, index) => {
                let name = item.label;
                if (item.production_date) {
                  name = item.label + ' / ' + item.production_date;
                }
                return (
                  <SaleProductItem
                    key={index}
                    name={name}
                    qty={item.qty + ''}
                    onAdd={() => this.props.actions.addProduct(item)}
                    onRemove={() => this.props.actions.removeProduct(item)}
                    onDelete={() => this.props.actions.deleteProduct(item)}
                    onChangeQty={(qty) =>
                      this.props.actions.qtyChange(qty, item)
                    }
                  />
                );
              })}
          </View>

          <TextInput
            mode="outlined"
            label="Observaciones"
            placeholder="Observaciones"
            value={this.props.obs || ''}
            numberOfLines={5}
            multiline={true}
            onChangeText={(obs) => this.props.actions.obsChange(obs)}
            style={{marginTop: normalizeSize(10)}}
          />
          <HelperText type="info" visible={false}>
            {' '}
          </HelperText>

          <Button
            mode="contained"
            onPress={() =>
              this.props.actions.createTransfer({
                navigation: this.props.navigation,
              })
            }
            style={{marginTop: normalizeSize(8)}}
            contentStyle={{paddingVertical: normalizeSize(6)}}>
            Hacer traslado
          </Button>
        </ScrollView>
      </Layout>
    );
  }
}
export default TransferScreen;
