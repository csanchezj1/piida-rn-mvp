import {Component} from 'react';
import {View, RefreshControl, ActivityIndicator} from 'react-native';
import {Text} from 'react-native-paper';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';
import {ProductItem, Shimmer} from '../../../components';
import {FloatingAction} from 'react-native-floating-action';
import {colors, normalizeSize} from '../../../styles/basicStyles';

class ProductsScreen extends Component {
  componentDidMount() {
    this.props.actions.getProducts('', true);
    registerEventScreenMounted(
      this.props,
      'Pantalla listado de notificaciones',
      'NotificationsListScreen',
    );
  }
  componentDidUpdate(prevProps) {
    if (prevProps.refetchTick !== this.props.refetchTick) {
      this.props.actions.getProducts(this.props.text || '', true);
    }
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
          onScrollEndDrag={({nativeEvent}) => {
            if (
              nativeEvent.layoutMeasurement.height +
                nativeEvent.contentOffset.y >=
              nativeEvent.contentSize.height - 1
            ) {
              this.props.actions.getProducts('', false);
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={this.props.showRrefresh}
              onRefresh={() => {
                this.props.actions.getProducts('', true);
              }}
              progressViewOffset={10}
            />
          }
          autoCompleteProps={
            this.props.list
              ? {
                  placeholder: 'Buscar producto...',
                  onChangeText: (text) => {
                    this.props.actions.textChange(text);
                  },
                  results: this.props.searchButton,
                  value: this.props.text,
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
                  <ProductItem
                    key={item.nid}
                    name={item.label}
                    code={item.code}
                    price={item.price}
                    cost={item.cost}
                    onPress={
                      !this.props.user.features.includes(
                        'product_extra_fields_production_date',
                      )
                        ? () =>
                            this.props.navigation.navigate('CreateProduct', {
                              product: item,
                            })
                        : null
                    }
                  />
                ))}

                <View
                  style={{
                    alignItems: 'center',
                    paddingVertical: normalizeSize(16),
                  }}>
                  {this.props.showLoader && (
                    <ActivityIndicator
                      size="large"
                      color={colors.buttonBackground}
                    />
                  )}
                </View>
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
                  No se encontraron productos
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
        {this.props.user.features.includes('build_kit') ? (
          <FloatingAction
            ref={(ref) => {
              this.floatingAction = ref;
            }}
            distanceToEdge={{
              vertical: normalizeSize(80),
              horizontal: normalizeSize(30),
            }}
            color={colors.label}
            overlayColor={'rgba(68,68,68,0.9)'}
            position={'right'}
            onPressItem={(name) => {
              this.props.navigation.navigate(name);
            }}
            actions={[
              {
                text: 'Nuevo producto',
                color: colors.text,
                textBackground: 'transparent',
                icon: require('../../../assets/images/product.png'),
                name: this.props.user.features.includes(
                  'product_extra_fields_production_date',
                )
                  ? 'CreateProductCategory'
                  : 'CreateProduct',
                textStyle: {
                  fontSize: 18,
                  color: 'white',
                },
                shadow: {shadowOpacity: 0},
                textElevation: 0,
              },
              {
                text: 'Nuevo combo',
                color: colors.buttonBackground,
                textBackground: 'transparent',
                icon: require('../../../assets/images/products.png'),
                name: 'Kit',
                textStyle: {
                  fontSize: 18,
                  color: 'white',
                },
                shadow: {shadowOpacity: 0},
                textElevation: 0,
              },
            ]}
          />
        ) : (
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
            onPressMain={() => this.props.navigation.navigate('CreateProduct')}
          />
        )}
      </>
    );
  }
}
export default ProductsScreen;
