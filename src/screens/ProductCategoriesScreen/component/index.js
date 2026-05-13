import React, {Component} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {Card, List, Text} from 'react-native-paper';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {FloatingAction} from 'react-native-floating-action';
import {Layout} from '../../../layouts';
import {Shimmer} from '../../../components';
import {colors, normalizeSize} from '../../../styles/basicStyles';

class ProductCategoriesScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(
      this.props,
      'Pantalla listado de categorias de producto',
      'ProductCategoriesScreen',
    );
    this.props.actions.getProducts('', true);
  }
  componentWillUnmount() {
    this.props.actions.clear();
  }

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
          title={'Productos'}
          description={'Busca los productos por su nombre'}
          onScrollEndDrag={({nativeEvent}) => {
            if (
              nativeEvent.layoutMeasurement.height +
                nativeEvent.contentOffset.y >=
              nativeEvent.contentSize.height - 1
            ) {
              this.props.actions.getProducts(
                this.props.text == null ? '' : this.props.text,
                false,
              );
            }
          }}
          autoCompleteProps={
            this.props.list
              ? {
                  placeholder: 'Buscar producto...',
                  value: this.props.text,
                  onChangeText: (text) => {
                    this.props.actions.textChange(text);
                  },
                  results: this.props.searchButton,
                  selectItem: () => {
                    this.props.actions.getProducts(this.props.text, true);
                    this.props.actions.clearSearch();
                  },
                  clearText: () => {
                    this.props.actions.textChange(null);
                    this.props.actions.getProducts('', true);
                  },
                }
              : null
          }>
          {this.props.list ? (
            this.props.list.length > 0 ? (
              <View
                style={{width: '100%', paddingHorizontal: normalizeSize(16)}}>
                {this.props.list.map((item) => (
                  <Card
                    key={item.tid}
                    mode="outlined"
                    style={{marginBottom: normalizeSize(8)}}>
                    <List.Item
                      title={item.name}
                      description={`Disponibilidad: ${item.available}  ·  Ver variaciones`}
                      left={(props) => (
                        <List.Icon {...props} icon="shape-outline" />
                      )}
                      right={(props) => (
                        <List.Icon {...props} icon="chevron-right" />
                      )}
                      onPress={() => {
                        this.props.navigation.navigate('ProductVariations', {
                          cat: item.tid,
                          catName: item.name,
                          from: 'productCategories',
                        });
                      }}
                    />
                  </Card>
                ))}
                {this.props.showLoader && (
                  <View
                    style={{
                      alignItems: 'center',
                      paddingVertical: normalizeSize(16),
                    }}>
                    <ActivityIndicator
                      size="large"
                      color={colors.buttonBackground}
                    />
                  </View>
                )}
              </View>
            ) : (
              <View
                style={{
                  width: '100%',
                  paddingHorizontal: normalizeSize(20),
                }}>
                <Text
                  variant="bodyMedium"
                  style={{color: colors.purplishGrey, textAlign: 'center'}}>
                  No existen productos en el sistema
                </Text>
              </View>
            )
          ) : (
            <View
              style={{
                width: '100%',
                paddingHorizontal: normalizeSize(16),
                paddingTop: normalizeSize(8),
              }}>
              {Array.from(Array(12).keys()).map((_, i) => (
                <Shimmer
                  key={i}
                  style={{marginBottom: normalizeSize(8), borderRadius: 8}}
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
          color={colors.label}
          distanceToEdge={{
            vertical: normalizeSize(80),
            horizontal: normalizeSize(30),
          }}
          overlayColor={'transparent'}
          onOpen={() => this.floatingAction.animateButton()}
          onPressMain={() =>
            this.props.navigation.navigate('CreateProductCategory')
          }
        />
      </>
    );
  }
}
export default ProductCategoriesScreen;
