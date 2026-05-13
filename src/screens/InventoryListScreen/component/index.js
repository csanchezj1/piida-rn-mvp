import React, {Component} from 'react';
import {View, RefreshControl, ActivityIndicator} from 'react-native';
import {Text} from 'react-native-paper';
import {Bar, Shimmer} from '../../../components';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';
import {colors, normalizeSize} from '../../../styles/basicStyles';

class InventoryListScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(
      this.props,
      'Listado de inventario por producto',
      'InventoryListScreen',
    );
    this.props.actions.getProducts(true);
  }

  render() {
    return (
      <Layout
        title={'Inventario'}
        subtitle={'total'}
        contentContainerStyle={{justifyContent: 'flex-start'}}
        hideLogo={true}
        onScrollEndDrag={({nativeEvent}) => {
          if (
            nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
            nativeEvent.contentSize.height - 1
          ) {
            this.props.actions.getProducts(false);
          }
        }}
        refreshControl={
          <RefreshControl
            refreshing={this.props.showRrefresh}
            onRefresh={() => {
              this.props.actions.getProducts(true);
            }}
            progressViewOffset={10}
          />
        }
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
                  this.props.actions.getProducts(true);
                  this.props.actions.clearSearch();
                },
                clearText: () => {
                  this.props.actions.textChange(null),
                    this.props.actions.getProducts(true);
                },
              }
            : null
        }>
        {this.props.list ? (
          this.props.list.length > 0 ? (
            <View
              style={{
                width: '100%',
                paddingHorizontal: normalizeSize(16),
              }}>
              {this.props.list.map((e, i) => {
                return (
                  <Bar
                    style={{marginTop: normalizeSize(8)}}
                    width={'100%'}
                    label={e.product_name}
                    value={e.qty}
                    key={i}
                    onPress={
                      this.props.user.features.includes(
                        'product_extra_fields_production_date',
                      )
                        ? () =>
                            this.props.navigation.navigate('InventoryCategory', {
                              cat: e.product_id,
                              name: e.product_name,
                            })
                        : null
                    }
                  />
                );
              })}

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
                marginTop: normalizeSize(100),
              }}>
              <Text
                variant="bodyMedium"
                style={{color: colors.purplishGrey, textAlign: 'center'}}>
                Aún no tienes movimientos de inventario
              </Text>
            </View>
          )
        ) : (
          <View
            style={{
              width: '100%',
              paddingHorizontal: normalizeSize(20),
              paddingTop: normalizeSize(8),
            }}>
            {Array.from(Array(12).keys()).map((e) => {
              return (
                <Shimmer
                  key={e}
                  style={{marginBottom: normalizeSize(8)}}
                  height={normalizeSize(48)}
                  width={'100%'}
                />
              );
            })}
          </View>
        )}
      </Layout>
    );
  }
}
export default InventoryListScreen;
