import React, {Component} from 'react';
import {View} from 'react-native';
import {ActivityIndicator, Card, Divider, List, Text} from 'react-native-paper';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {FloatingAction} from 'react-native-floating-action';
import {Layout} from '../../../layouts';
import {Shimmer} from '../../../components';
import {colors, normalizeSize} from '../../../styles/basicStyles';

class ProductVariationsScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(this.props, 'Pantalla listado de variaciones de producto', 'ProductVariationsScreen');
    if (this.props.route.params) {
      this.props.actions.getProduct('', true, this.props.route.params.cat);
    }
  }
  componentWillUnmount() {
    this.props.actions.clear();
  }

  renderItemDescription = (item) => {
    const parts = [];
    if (item.production_date) parts.push(`Fecha de producción: ${item.production_date}`);
    if (item.code) parts.push(`Código: ${item.code}`);
    if (item.available) parts.push(`Disponibilidad: ${item.available}`);
    return parts.length > 0 ? parts.join('\n') : undefined;
  };

  render() {
    return (
      <>
        <Layout
          contentContainerStyle={
            this.props.list
              ? this.props.list.length > 0
                ? {justifyContent: 'flex-start'}
                : {justifyContent: 'center'}
              : {justifyContent: 'center'}
          }
          hideLogo={true}
          title={'Variaciones de ' + this.props.route.params.catName}
          description={'Busca las variaciones por su nombre o código.'}
          onScrollEndDrag={({nativeEvent}) => {
            if (
              nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
              nativeEvent.contentSize.height - 1
            ) {
              this.props.actions.getProduct(
                this.props.text == null ? '' : this.props.text,
                false,
                this.props.route.params.cat,
              );
            }
          }}
          autoCompleteProps={
            this.props.list
              ? {
                  placeholder: 'Buscar variación...',
                  value: this.props.text,
                  results: this.props.searchButton,
                  onChangeText: (text) => {
                    this.props.actions.textChange(text);
                  },
                  selectItem: () => {
                    this.props.actions.getProduct(this.props.text, true, this.props.route.params.cat);
                    this.props.actions.clearSearch();
                  },
                  clearText: () => {
                    this.props.actions.textChange(null);
                    this.props.actions.getProduct('', true, this.props.route.params.cat);
                  },
                }
              : null
          }>
          {this.props.list ? (
            this.props.list.length > 0 ? (
              <View style={{width: '100%', paddingHorizontal: normalizeSize(16)}}>
                <Card mode="outlined" style={{backgroundColor: '#FFFFFF'}}>
                  <Card.Content style={{paddingHorizontal: 0, paddingVertical: 0}}>
                    {this.props.list.map((item, idx) => {
                      const onPress =
                        this.props.route.params.from == 'addInventory'
                          ? () => this.props.actions.selectProduct(item, this.props.navigation)
                          : this.props.route.params.from == 'newSale'
                          ? () => this.props.actions.selectProvider(item, this.props.navigation)
                          : undefined;
                      return (
                        <View key={item.nid}>
                          {idx > 0 && <Divider />}
                          <List.Item
                            title={item.label}
                            description={this.renderItemDescription(item)}
                            descriptionNumberOfLines={3}
                            onPress={onPress}
                            left={(p) => <List.Icon {...p} icon="package-variant-closed" />}
                          />
                        </View>
                      );
                    })}
                  </Card.Content>
                </Card>
                {this.props.showLoader && (
                  <View style={{paddingVertical: normalizeSize(16), alignItems: 'center'}}>
                    <ActivityIndicator size="large" color={colors.buttonBackground} />
                  </View>
                )}
              </View>
            ) : (
              <View style={{width: '100%', paddingHorizontal: normalizeSize(16)}}>
                <Text
                  variant="bodyMedium"
                  style={{textAlign: 'center', color: colors.purplishGrey}}>
                  Lo sentimos, no encontramos variaciones para el producto seleccionado
                </Text>
              </View>
            )
          ) : (
            <View style={{width: '100%', paddingHorizontal: normalizeSize(16)}}>
              {Array.from(Array(12).keys()).map((e, i) => (
                <Shimmer
                  key={i}
                  style={{marginVertical: normalizeSize(4)}}
                  height={normalizeSize(60)}
                  width={'100%'}
                />
              ))}
            </View>
          )}
        </Layout>

        <FloatingAction
          ref={(ref) => {
            this.floatingAction = ref;
          }}
          color={colors.buttonBackground}
          distanceToEdge={normalizeSize(20)}
          overlayColor={'transparent'}
          onOpen={() => this.floatingAction.animateButton()}
          onPressMain={() =>
            this.props.navigation.navigate('CreateProduct', {
              cat: this.props.route.params.cat,
            })
          }
        />
      </>
    );
  }
}
export default ProductVariationsScreen;
