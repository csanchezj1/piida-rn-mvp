import React, { Component } from 'react';
import {StatusBar, View, ScrollView, RefreshControl, Platform, TouchableOpacity, Dimensions} from 'react-native';
import {Card, Text} from 'react-native-paper';
import { NumericFormat } from 'react-number-format';
import Movements from '../../../api/movements';
import {getHomeStyles} from '../../../styles/screenStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';
import { CircleChart, SelectList, Shimmer } from '../../../components';
import { colors, fonts, normalizeSize } from '../../../styles/basicStyles';

const TOP_PRODUCTS_VISIBLE = 5;

class HomeScreen extends Component {
  styles = getHomeStyles();
  state = { topProducts: null };
  componentDidMount(){
    this.props.actions.getBalance()
    this.loadTopProducts()
    registerEventScreenMounted(this.props, 'Home', 'HomeScreen');
  }
  componentDidUpdate(prevProps){
    if (prevProps.refetchTick !== this.props.refetchTick) {
      this.props.actions.getBalance();
      this.loadTopProducts();
    }
  }

  loadTopProducts = () => {
    if (!this.props.user?.uid) return;
    Movements.getInventory(this.props.user.uid)
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        // Mostramos los primeros N productos (mantiene orden del back).
        // Incluimos los que tienen stock 0 para que se vean como en el
        // mockup (barra vacía + "0" a la derecha).
        const visible = list.slice(0, TOP_PRODUCTS_VISIBLE);
        // El máximo se calcula sobre TODA la respuesta para que la barra
        // de cada producto sea proporcional al stock más alto del catálogo.
        const max = list.reduce(
          (m, p) => Math.max(m, Number(p.total) || 0),
          0,
        );
        this.setState({ topProducts: visible, maxStock: max });
      })
      .catch(() => this.setState({ topProducts: [], maxStock: 0 }));
  };

  renderInventoryCard() {
    const products = this.state.topProducts;
    const max = this.state.maxStock || 1;

    return (
      <Card
        mode="outlined"
        style={{
          marginHorizontal: normalizeSize(16),
          marginTop: normalizeSize(16),
          backgroundColor: '#FFFFFF',
        }}
      >
        <Card.Content>
          {/* Header: título + Ver más */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: normalizeSize(14),
            }}
          >
            <Text
              variant="titleMedium"
              style={{
                fontFamily: fonts.bold,
                color: colors.buttonBackground,
              }}
            >
              Inventario
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => this.props.navigation.navigate('InventoryList')}
            >
              <Text
                variant="labelLarge"
                style={{
                  fontFamily: fonts.medium,
                  color: colors.buttonBackground,
                  textDecorationLine: 'underline',
                }}
              >
                Ver más
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lista de productos con barra proporcional */}
          {products === null ? (
            [0, 1, 2].map((i) => (
              <Shimmer
                key={`shim-inv-${i}`}
                height={normalizeSize(50)}
                width={Dimensions.get('window').width - normalizeSize(40)}
                style={{ marginBottom: normalizeSize(8), borderRadius: 10 }}
              />
            ))
          ) : products.length > 0 ? (
            products.map((p, idx) => {
              const stock = Number(p.total) || 0;
              const pct = max > 0 ? Math.min(stock / max, 1) : 0;
              return (
                <View
                  key={`inv-${p.tid}-${idx}`}
                  style={{
                    marginBottom: normalizeSize(10),
                    borderRadius: normalizeSize(8),
                    overflow: 'hidden',
                    borderLeftWidth: 3,
                    borderLeftColor: colors.buttonBackground,
                    backgroundColor: '#FFF1D9',
                  }}
                >
                  {/* Fila con bar fill detrás + contenido encima */}
                  <View
                    style={{
                      minHeight: normalizeSize(46),
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* Barra de fill (debajo del contenido) */}
                    {pct > 0 && (
                      <View
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: `${pct * 100}%`,
                          backgroundColor: '#FCD08A',
                        }}
                      />
                    )}
                    {/* Contenido */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: normalizeSize(14),
                        paddingVertical: normalizeSize(10),
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        style={{
                          flex: 1,
                          fontFamily: fonts.bold,
                          fontSize: normalizeSize(15),
                          color: colors.buttonBackground,
                          marginRight: normalizeSize(10),
                        }}
                      >
                        {p.product || 'Producto'}
                      </Text>
                      <NumericFormat
                        value={stock}
                        displayType="text"
                        thousandSeparator="."
                        decimalSeparator=","
                        renderText={(formatted) => (
                          <Text
                            style={{
                              fontFamily: fonts.bold,
                              fontSize: normalizeSize(16),
                              color: '#222',
                            }}
                          >
                            {formatted}
                          </Text>
                        )}
                      />
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <Text
              variant="bodySmall"
              style={{
                textAlign: 'center',
                color: colors.purplishGrey,
                paddingVertical: normalizeSize(20),
              }}
            >
              Aún no hay productos en inventario.
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  }
  componentWillUnmount(){
    //this.props.actions.clear()
  }
  renderBalance(){
    return(
      !Array.isArray(this.props.total.balance) && (
        <Card
          mode="outlined"
          style={{
            marginHorizontal: normalizeSize(16),
            marginTop: normalizeSize(16),
            backgroundColor: '#FFFFFF',
          }}>
          <Card.Content style={this.styles.circleGraph}>
            <SelectList
              label={'Selecciona desde cuando quieres ver tus ingresos y salidas'}
              variables={[
                {
                  label:'Desde que inicié con Piida',
                  value:'all'
                },
                {
                  label:'Mes actual',
                  value:'month'
                },
                {
                  label:'Hoy',
                  value:'day'
                }
              ]}
              value={this.props.period.label}
              onValueChange={(item) => this.props.actions.changePeriod(item)}
            />
            <View
              style={[this.styles.balanceCont, {flexDirection: 'row', alignItems: 'baseline'}]}>
              <Text
                style={[this.styles.balanceLabel, {
                  fontFamily: fonts.semiBold,
                  fontSize: normalizeSize(18),
                  color: colors.label,
                  marginRight: normalizeSize(8),
                }]}>
                {'Total: '}
              </Text>
              <Text
                style={[this.styles.balanceTotal, {
                  fontFamily: fonts.bold,
                  fontSize: normalizeSize(20),
                  color: colors.text,
                }]}>
                {this.props.total.balance.total}
              </Text>
            </View>
            <CircleChart
              enter={this.props.total.balance.advances}
              out={this.props.total.balance.purchases}
              period={this.props.period.value}
            />
          </Card.Content>
        </Card>
      )
    )
  }
  render() {
    return (
      <>
      <StatusBar 
        barStyle={Platform.OS == 'ios' ? "dark-content" : 'light-content'}
        backgroundColor={colors.carmine}/>
      <ScrollView
        style={this.styles.container}
        contentContainerStyle={this.styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={this.props.showRrefresh}
            onRefresh={() => {
              this.props.actions.getBalance()
            }}
            progressViewOffset={0}
          />
        }>
        {this.props.total ? (
          <View>
            {this.props.user.features.includes('hide_statistics_collaborator') ? (
              this.props.user.roles.includes('content_editor') && (
                this.renderBalance()
              )
            ) : (
              this.renderBalance()
            )}
          
            {!Array.isArray(this.props.total.inventory) > 0 && (
              this.renderInventoryCard()
            )}
          </View>
        ) : (
          <View 
            style={this.styles.shimmerCont}>
            {Array.from(Array(2).keys()).map((e, i) => {
              return(
                <Shimmer
                  key={i}
                  style={this.styles.shimmer}
                  height={this.styles.shimmer.height}
                  width={this.styles.shimmer.width}/>
              )
            })}
          </View>
        )}
      </ScrollView>
      
      </>
    );
  }
}
export default HomeScreen;