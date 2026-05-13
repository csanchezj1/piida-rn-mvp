import React, {Component} from 'react';
import {View, RefreshControl, ActivityIndicator} from 'react-native';
import {Text} from 'react-native-paper';
import {Bar, Shimmer} from '../../../components';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';
import {colors, normalizeSize} from '../../../styles/basicStyles';

class InventoryCategoryScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(
      this.props,
      'Listado de inventario por producto categorizado',
      'InventoryCategoryScreen',
    );
    this.props.actions.getProducts(true, this.props.route.params.cat);
  }

  render() {
    return (
      <Layout
        title={'Inventario total'}
        subtitle={this.props.route.params.name}
        contentContainerStyle={{justifyContent: 'flex-start'}}
        hideLogo={true}
        onScrollEndDrag={({nativeEvent}) => {
          if (
            nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
            nativeEvent.contentSize.height - 1
          ) {
            this.props.actions.getProducts(false, this.props.route.params.cat);
          }
        }}
        refreshControl={
          <RefreshControl
            refreshing={this.props.showRrefresh}
            onRefresh={() => {
              this.props.actions.getProducts(true, this.props.route.params.cat);
            }}
            progressViewOffset={10}
          />
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
export default InventoryCategoryScreen;
