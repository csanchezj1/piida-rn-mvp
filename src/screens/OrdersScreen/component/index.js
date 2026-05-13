import React, {Component} from 'react';
import {
  Image,
  StatusBar,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button, Text} from 'react-native-paper';
import {getOrdersStyles} from '../../../styles/screenStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {MovementItem, Shimmer, Autocomplete} from '../../../components';
import {colors, normalizeSize} from '../../../styles/basicStyles';

class OrdersScreen extends Component {
  styles = getOrdersStyles();
  componentDidMount() {
    // changeTab ya dispara getMovements internamente — no llamarla doble.
    if (this.props.route.params) {
      this.props.actions.changeTab('history');
    } else {
      this.props.actions.changeTab('pending');
    }
    registerEventScreenMounted(this.props, 'Pantalla ordenes', 'OrdersScreen');

    // Refetch al volver a la pantalla (después de crear/cancelar una venta).
    this._focusListener = this.props.navigation.addListener('focus', () => {
      this.props.actions.getMovements(true);
    });
  }

  componentWillUnmount() {
    if (this._focusListener) this._focusListener();
  }

  render() {
    return (
      <>
        <SafeAreaView edges={['top']} style={this.styles.safe} />
        <StatusBar
          barStyle="light-content"
          backgroundColor={this.styles.safe.backgroundColor}
        />
        <View style={this.styles.container}>
          <Image
            style={this.styles.top}
            resizeMode="cover"
            source={require('../../../assets/images/background_orange.png')}
          />
          <View style={this.styles.head}>
            <Button
              mode="text"
              onPress={() => this.props.actions.changeTab('history')}
              textColor={
                this.props.tabActive == 'history' ? 'black' : 'white'
              }
              style={[
                this.styles.tab,
                {
                  borderBottomWidth:
                    this.props.tabActive == 'history' ? normalizeSize(3) : 0,
                },
              ]}>
              Historial
            </Button>

            <Button
              mode="text"
              onPress={() => this.props.actions.changeTab('pending')}
              textColor={
                this.props.tabActive == 'pending' ? 'black' : 'white'
              }
              style={[
                this.styles.tab,
                {
                  borderBottomWidth:
                    this.props.tabActive == 'pending' ? normalizeSize(3) : 0,
                },
              ]}>
              Pagos pendientes
            </Button>
          </View>
          <Autocomplete
            results={[]}
            placeholder={'Buscar por cliente o No. de orden'}
            clearText={() => this.props.actions.autocompleteChange('')}
            value={this.props.autoValue}
            onChangeText={(text) => {
              this.props.actions.autocompleteChange(text);
            }}
          />

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: this.props.list
                ? this.props.list.length == 0
                  ? 'center'
                  : 'flex-start'
                : 'flex-start',
            }}
            onScrollEndDrag={({nativeEvent}) => {
              if (
                nativeEvent.layoutMeasurement.height +
                  nativeEvent.contentOffset.y >=
                nativeEvent.contentSize.height - 1
              ) {
                this.props.actions.getMovements(false);
              }
            }}
            refreshControl={
              <RefreshControl
                refreshing={this.props.showRrefresh}
                onRefresh={() => {
                  this.props.actions.getMovements(true);
                }}
                progressViewOffset={10}
              />
            }>
            {this.props.list ? (
              this.props.list.length > 0 ? (
                <>
                  {this.props.list.map((e, i) => (
                    <View key={i}>
                      <Text
                        variant="titleSmall"
                        style={{
                          color: colors.text,
                          marginHorizontal: normalizeSize(20),
                          marginTop: normalizeSize(15),
                        }}>
                        {e.date}
                      </Text>
                      {e.children.map((item, index) => (
                        <MovementItem
                          key={index}
                          style={this.styles.item}
                          title={item.title}
                          value={
                            this.props.tabActive == 'pending'
                              ? item.value - item.paid
                              : item.value
                          }
                          status={item.hour}
                          qty={1}
                          from={this.props.tabActive}
                          onPress={
                            this.props.tabActive == 'pending'
                              ? () =>
                                  this.props.navigation.navigate('PayOrder', {
                                    order: item,
                                  })
                              : () =>
                                  this.props.navigation.navigate(
                                    'OrderDetails',
                                    {
                                      details: {
                                        order: item.nid,
                                        consecutive: item.consecutive,
                                        customer: item.customer,
                                        value: item.value,
                                        paid: item.paid,
                                        date:
                                          item.created.replace(/\n/g, '') +
                                          ' ' +
                                          item.hour.replace(/\n/g, ''),
                                      },
                                    },
                                  )
                          }
                        />
                      ))}
                    </View>
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
                </>
              ) : (
                <View
                  style={{
                    width: '100%',
                    paddingHorizontal: normalizeSize(20),
                  }}>
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: colors.purplishGrey,
                      textAlign: 'center',
                    }}>
                    {this.props.tabActive == 'pending'
                      ? 'No tienes pagos pendientes por cobrar'
                      : 'Aún no tienes ordenes registadas'}
                  </Text>
                </View>
              )
            ) : (
              <View style={this.styles.shimmerCont}>
                {Array.from(Array(12).keys()).map((_, i) => (
                  <Shimmer
                    key={i}
                    style={this.styles.shimmer}
                    height={this.styles.shimmer.height}
                    width={this.styles.shimmer.width}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </>
    );
  }
}
export default OrdersScreen;
