import React, { Component } from 'react';
import {View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView} from 'react-native';
import {ActivityIndicator, Button} from 'react-native-paper';
import {newSaleStyles} from '../../../styles/screenStyles';
import {Shimmer, SaleKitItem, SaleProductItem, Autocomplete, ProductItem} from '../../../components';
import {registerEventScreenMounted} from '../../../utils/analytics';
import { DialogContainer, Layout } from '../../../layouts';
import { colors, fonts, normalizeSize } from '../../../styles/basicStyles';
import RBSheet from "react-native-raw-bottom-sheet";

class AddInventoryScreen extends Component {
  styles = newSaleStyles();
  componentDidMount(){
    registerEventScreenMounted(this.props, 'Surtir inventario', 'AddInventoryScreen');
    this.props.actions.getProducts('', true);
  }
  componentWillUnmount(){
    this.props.actions.clear();
  }
  componentDidUpdate(prevProps){
    if(prevProps.customer != this.props.customer && prevProps.list == this.props.list){
      this.RBSheet.open()
    }
  }
  
  handlePress = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.props.actions.clearProduct();
    }, 2000);
  }
  
  render() {
    return (
      <>
      <Layout
        title={'Surtir'}
        subtitle={'inventario'}
        contentContainerStyle={{justifyContent:'flex-start'}}
        //description={'Recuerda que desde piida.co puedes crear de forma masiva tus productos.'}
        hideLogo={true}
        headerComp={this.props.list && (
          <View
            style={this.styles.safe}>
            <Autocomplete
              style={this.styles.search}
              placeholder={'Buscar producto...'}
              value={this.props.text}
              onChangeText={(text) => {this.props.actions.textChange(text)}}
              results={this.props.searchButton}
              selectItem={() =>{
                this.props.actions.getProducts(this.props.text, true);
                this.props.actions.clearSearch()
              }}
              clearText={() =>{
                this.props.actions.textChange(null)
                this.props.actions.getProducts('', true);
              }}
            />
            <TouchableOpacity
              style={this.styles.qrScanCont}
              activeOpacity={0.9}
              onPress={() => this.props.navigation.navigate('QRScan')}>
              <Image
                style={this.styles.qrScan}
                source={require('../../../assets/images/qr_code_scanner.png')}
              />
            </TouchableOpacity>
          </View>
        )}>
        <View>
        <ScrollView
          style={{height:'100%'}}>
          {this.props.list ? (
            this.props.list.length > 0 ? (
              <>
              {this.props.list.map((item, index) => {
                return(
                  <ProductItem
                    key={index}
                    name={item.name}
                    nid={item.nid}
                    label={item.label}
                    production_date={item.production_date}
                    code={item.code}
                    hasVariations={this.props.user.features.includes('product_extra_fields_production_date')}
                    productSelected={this.props.productSelected == item.nid}
                    style={{
                      marginBottom:index==this.props.list.length-1 ? normalizeSize(150) : normalizeSize(0),
                    }}
                    onPress={
                      this.props.user.features.includes('product_extra_fields_production_date') ? 
                        () => {this.props.navigation.navigate('ProductVariations', {
                          cat:item.tid,
                          catName:item.name,
                          from:'addInventory'
                        })} :
                        () => {
                          this.props.actions.selectProduct(item),
                          this.handlePress()
                        }
                    }
                  />
                )
              })}
              {this.props.showLoader && (
                <View style={this.styles.loaderContainer}>
                  <ActivityIndicator size="large" color={colors.buttonBackground} />
                </View>
              )}
              </>
            ) : (
              <View
                style={{height:2000}}>
                <Text
                  style={this.styles.noresult}>
                  No existen productos en el sistema
                </Text>
              </View>
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
          <RBSheet
            ref={(ref) => {
              this.RBSheet = ref;
            }}
            minClosingHeight={(50)}
            height={this.styles.bottomSheetHeigth}
            customStyles={{container: this.styles.bottomSheetContainer}}
            draggable={true}
            openDuration={500}
            closeDuration={500}
            dragFromTopOnly={true}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => this.RBSheet.close()}
              style={this.styles.closeCont}>
              <Image
                style={this.styles.closeImg}
                resizeMode='contain'
                source={require('../../../assets/images/ic_close.png')}
              />
            </TouchableOpacity>
            <Text
              style={this.styles.title}>
              Productos a surtir
            </Text>
            <TouchableOpacity
              style={this.styles.addCustomerCont}
              activeOpacity={0.9}
              onPress={
                this.props.customer ?
                () => {
                  this.props.actions.customerVisible(true),
                  this.RBSheet.close()
                } :
                () => {
                  this.props.navigation.navigate('Provider', {
                    from:'providerNew'
                  }),
                  this.RBSheet.close()
                }
              }>
              {this.props.customer ? (
                <Text
                  style={this.styles.addCustomerText}>
                  Proveedor: <Text style={{fontFamily:fonts.regular}}>
                    {this.props.customer.label}
                  </Text>
                </Text>
              ) : (
                <Text
                  style={this.styles.addCustomerText}>
                  Agregar proveedor
                </Text>
              )}  
              
              <Image
                style={this.styles.addCustomerArrow}
                resizeMode='contain'
                source={require('../../../assets/images/arrow_right.png')}
              />
            </TouchableOpacity>
            
            {this.props.product.length > 0 ? (
              <ScrollView>
                {this.props.product.map((item, index) => {
                  let name = item.label;
                  if(item.production_date){
                    name = item.label + ' / ' + item.production_date;
                  }
                  return(
                    (item.type || item.body != '') ? (
                      <SaleKitItem
                        style={[this.styles.productItem, {
                          marginTop:index==0 ? normalizeSize(10) : 0
                        }]}
                        name={name}
                        code={item.code}
                        products={item.products}
                        product={item.body}
                        value={item.price}
                        qty={item.qty + ''}
                        key={index}
                        onAdd={() => this.props.actions.addProduct(item)}
                        onRemove={() => this.props.actions.removeProduct(item)}
                        onDelete={() => this.props.actions.deleteProduct(item)}
                        onChangeQty={(qty) => this.props.actions.qtyChange(qty, item)}
                      />
                    ) : (
                      <SaleProductItem
                        style={[this.styles.productItem, {
                          marginTop:index==0 ? normalizeSize(10) : 0
                        }]}
                        name={name}
                        code={item.code}
                        qty={item.qty + ''}
                        key={index}
                        onAdd={() => this.props.actions.addProduct(item)}
                        onRemove={() => this.props.actions.removeProduct(item)}
                        onDelete={() => this.props.actions.deleteProduct(item)}
                        onChangeQty={(qty) => this.props.actions.qtyChange(qty, item)}
                      />
                    )
                  );
                })}
              </ScrollView>
            ) : (
              <View
                style={this.styles.noProductMsg}>
                <Text
                  style={this.styles.noProductText}>
                  Aún no has agregado productos para surtir inventario
                </Text>
              </View>
            )}
            {this.props.product.length > 0 && (
              <SafeAreaView
                style={this.styles.RBSafe}>
                <Button
                  mode="contained"
                  onPress={() => {
                    this.RBSheet.close(),
                    this.props.actions.createPurchase()
                  }}>
                  Completar carga de inventario
                </Button>
              </SafeAreaView>
            )}
          </RBSheet>
        </View>
      </Layout>
      {this.props.list && (
        <View
          style={[this.styles.bottomSafe, {
            paddingBottom:normalizeSize(10)
          }]}>
          <TouchableOpacity
            onPress={() => this.RBSheet.open()}
            activeOpacity={0.9}
            style={this.styles.viewSale}>
            <Text
              style={[this.styles.description, {
                fontFamily:fonts.bold
              }]}>
              {this.props.product.length > 0 ? 'Continuar' : 'Aún no has agregado productos para surtir'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
       {this.props.customer && (
          <DialogContainer
            visible={this.props.customerVisible}
            style={this.styles.customerDialog}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                this.props.actions.customerVisible(false),
                this.RBSheet.open()
              }}
              style={this.styles.closeCont}>
              <Image
                style={this.styles.closeImg}
                resizeMode='contain'
                source={require('../../../assets/images/ic_close.png')}
              />
            </TouchableOpacity>
            <Text
              style={this.styles.title}>
              Datos del proveedor
            </Text>
            <View>
              {this.props.customer.label && (
                <View
                  style={this.styles.dataCont}>
                  <Text
                    style={this.styles.valueBold}>
                    {'Nombre'}
                  </Text>
                  <Text
                    style={this.styles.value}>
                    {this.props.customer.label}
                  </Text>
                </View>
              )}
              {this.props.customer.phone && (
                <View
                  style={this.styles.dataCont}>
                  <Text
                    style={this.styles.valueBold}>
                    {'Número telefónico'}
                  </Text>
                  <Text
                    style={this.styles.value}>
                    {this.props.customer.phone}
                  </Text>
                </View>
              )}
              {this.props.customer.id_number && (
                <View
                  style={this.styles.dataCont}>
                  <Text
                    style={this.styles.valueBold}>
                    {'Número de identificación'}
                  </Text>
                  <Text
                    style={this.styles.value}>
                    {this.props.customer.id_number}
                  </Text>
                </View>
              )}
              {this.props.customer.address && (
                <View
                  style={this.styles.dataCont}>
                  <Text
                    style={this.styles.valueBold}>
                    {'Dirección'}
                  </Text>
                  <Text
                    style={this.styles.value}>
                    {this.props.customer.address}
                  </Text>
                </View>
              )}
              {this.props.customer.email && (
                <View
                  style={this.styles.dataCont}>
                  <Text
                    style={this.styles.valueBold}>
                    {'Correo electrónico: '}
                  </Text>
                  <Text
                    style={this.styles.value}>
                    {this.props.customer.email}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              activeOpacity={0.9}
              style={this.styles.removeCustomerCont}
              onPress={() => this.props.actions.removeCustomer()}>
              <Text
                style={this.styles.removeCustomerText}>
                Remover proveedor
              </Text>
            </TouchableOpacity>
          </DialogContainer>
        )}
      </>
    );
  }
}
export default AddInventoryScreen;