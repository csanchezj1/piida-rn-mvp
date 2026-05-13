import React, { Component } from 'react';
import {Image, Text, SafeAreaView, StatusBar, View, ScrollView, RefreshControl, TouchableOpacity} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {getInventoryStyles} from '../../../styles/screenStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';
import { MovementItem, Shimmer } from '../../../components';
import { colors, normalizeSize } from '../../../styles/basicStyles';

class InventoryScreen extends Component {
  styles = getInventoryStyles();
  componentDidMount(){
    this.props.actions.getMovements(this.props.user.branch_office, true);
    if(this.props.user.features.includes('product_extra_fields_production_date')){
      this.props.actions.inventoryByCategory(this.props.user.uid)
    }
    else{
      this.props.actions.getInventory(this.props.user.uid);
    }

    registerEventScreenMounted(this.props, 'Pantalla saldo y listado de movimientos', 'BalanceScreen');
  }
  componentDidUpdate(prevProps){
    // Bloque 4 multi-sucursal: re-fetch cuando el switcher cambia la branch.
    if (prevProps.refetchTick !== this.props.refetchTick) {
      this.props.actions.getMovements(this.props.user.branch_office, true);
      if(this.props.user.features.includes('product_extra_fields_production_date')){
        this.props.actions.inventoryByCategory(this.props.user.uid)
      } else {
        this.props.actions.getInventory(this.props.user.uid);
      }
    }
  }
  componentWillUnmount(){
    //this.props.actions.clear();
  }
  render() {
    return (
      <>
     
      <View
        style={this.styles.container}>
        <View
          style={this.styles.head}>
          <Text
            style={this.styles.totalLabel}>
            Inventario total
          </Text>
          <ScrollView
            ref={ref => {this.scrollView = ref}}
            onContentSizeChange={() => this.scrollView.scrollToEnd({animated: true})}
            horizontal>
          {this.props.total.length > 0 && (
            <>
            {this.props.total.map((item, index) => {
              return(
                <TouchableOpacity
                  key={index}
                  activeOpacity={1}
                  style={[this.styles.productCont,{
                    marginStart:index == 0 ? normalizeSize(20) : 0,
                  }]}
                  onPress={this.props.user.features.includes('product_extra_fields_production_date') ?
                    () => this.props.navigation.navigate('InventoryCategory', {
                      cat:item.tid,
                      name:item.product,
                    }) :
                    null
                  }>
                  <Text
                    style={this.styles.productLabel}>
                    {item.product}
                  </Text>
                  <Text
                    style={this.styles.productValue}>
                    {item.total}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {this.props.total.length > 4 && (
              <TouchableOpacity
                activeOpacity={0.9}
                style={[this.styles.productCont, {
                  marginEnd:normalizeSize(20),
                  backgroundColor:colors.dialogTitle
                }]}
                onPress={() => this.props.navigation.navigate('InventoryList')}>
                <Text
                  style={[this.styles.productLabel, {
                    color:'white'
                  }]}>
                  Ver
                </Text>
                <Text
                  style={[this.styles.productValue,{
                    color:'white'
                  }]}>
                  más
                </Text>
              </TouchableOpacity>
            )}
            </>
          )}
          </ScrollView>
        </View>
        <Text
          style={this.styles.movTxt}>
          Movimientos
        </Text>
        <ScrollView
          contentContainerStyle={{
            flexGrow:1,
            justifyContent:this.props.list ? this.props.list.length == 0 ? 'center' : 'flex-start' : 'flex-start'
          }}
          onScrollEndDrag={({nativeEvent}) => {
            if(nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height -1){
              this.props.actions.getMovements(this.props.user.branch_office, false);
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={this.props.showRrefresh}
              onRefresh={() => {
                this.props.actions.getMovements(this.props.user.branch_office, true),
                this.props.actions.getInventory(this.props.user.uid)
              }}
              progressViewOffset={5}
            />
          }>
          {this.props.list ? (
            
            this.props.list.length > 0 ? (
              <>
            
              {this.props.list.map((e, i) => {
                return(
                  <View
                    key={i}>
                    <Text
                      style={this.styles.date}>
                      {e.date}
                    </Text>
                    {e.children.map((item, index) => {
                      let title = null;
                      let qty = 1;

                      if(item.qty){
                        qty = item.qty * qty;
                      }
                      if(item.qty_item){
                        qty = item.qty_item * qty; 
                      }
                      if(item.qty_kit_item){
                        qty = item.qty_kit_item * qty;
                      }
                      if(item.expensive_qty){
                        qty = item.expensive_qty
                      }

                      if(item.product){
                        title = item.product;
                      }
                      else if(item.expensive_product){
                        title = item.expensive_product;
                      }
                      else if(item.product_item){
                        title = item.product_item
                      }
                      else if(item.product_kit_item){
                        title = item.product_kit_item;
                      }

                      const total = item.total ? item.total : item.value * qty;
                      let product = null;
                      if(item.expensive_product){
                        product = [{
                          label:item.expensive_product,
                          nid:index,
                          //price:total/qty,
                          qty:item.expensive_qty
                        }];
                      }
                      else if(item.product){
                        product = [{
                          label:item.product,
                          nid:index,
                          //price:total/qty,
                          qty
                        }];
                      }
                      else if(item.product_item){
                        product = [{
                          label:item.product_item,
                          nid:index,
                          //price:total/qty,
                          qty
                        }]
                      }
                      else if(item.product_kit_item){
                        product = [{
                          label:item.product_kit_item,
                          nid:index,
                          //price:total/qty,
                          qty
                        }]
                      }
                      return(
                        <MovementItem
                          key={index}
                          style={this.styles.item}
                          title={title}
                          type={item.movement_type}
                          value={item.value}
                          qty={qty}
                          status={item.hour}
                          from={'warehouse'}                         
                          onPress={(item.movement_type == 'Salida de inventario' || item.movement_type == 'Entrada de inventario')?
                            () => this.props.navigation.navigate('TransferDetails', {
                              details:{
                                observations:item.observations,
                                movement_in:item.movement_type == 'Entrada de inventario' ? item.movement : null,
                                movement_out:item.movement_type == 'Salida de inventario' ? item.movement : null,
                                branch_destination:item.branch_destination,
                                date:item.created.replace(/\n/g, '') + ' ' + item.hour.replace(/\n/g, ''),
                                product
                              }}
                            ) :
                            () => this.props.navigation.navigate('BuyDetails', {
                              details:{
                                customer:item.customer,
                                provider:item.provider,
                                paymentType:item.payment,
                                humidity:item.humidity,
                                date:item.created.replace(/\n/g, '') + ' ' + item.hour.replace(/\n/g, ''),
                                movementType:item.expense_type ? 'Ingreso de inventario' : 'Salida de inventario',
                                movement:item.movement,
                                orderId:item.order_id,
                                product
                              }}
                            )
                          }
                        />
                      );
                    })}
                  </View>
                )
              })}
              <View style={this.styles.loaderContainer}>
                {this.props.showLoader && (
                  <ActivityIndicator size="large" color={colors.buttonBackground} />
                )}
              </View>
              </>
            ) : (
              <Text
                style={this.styles.noresult}>
                Aún no tienes movimientos registrados
              </Text>
            )
          ) : (
            <View 
              style={this.styles.shimmerCont}>
              {Array.from(Array(12).keys()).map((e, i) => {
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
      </View>
      </>
    );
  }
}
export default InventoryScreen;