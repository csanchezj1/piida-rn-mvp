import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import { newSaleStyles } from '../../../styles/screenStyles';
import { Shimmer, SaleKitItem, SaleProductItem, Autocomplete, ProductItem, Keypad, LimitBanner } from '../../../components';
import { registerEventScreenMounted } from '../../../utils/analytics';
import { DialogContainer } from '../../../layouts';
import { NumericFormat } from 'react-number-format';
import { fonts, colors, normalizeSize } from '../../../styles/basicStyles';
import RBSheet from "react-native-raw-bottom-sheet";

class NewSaleScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'library', // 'library' or 'keypad'
      keypadValue: '0',
      keypadNote: ''
    };
  }

  styles = newSaleStyles();
  componentDidMount() {
    registerEventScreenMounted(this.props, 'Nueva venta', 'NewSaleScreen');
    if (this.props.user.features.includes('cash_management_required')) {
      this.props.actions.login()
    }
    this.props.actions.getProducts('', true);
  }
  componentWillUnmount() {
    this.props.actions.clear();
  }
  componentDidUpdate(prevProps) {
    // Recargar catálogo cuando el usuario cambia de sucursal (refetchTick sube).
    // Igual que InventoryScreen, HomeScreen y BalanceScreen.
    if (prevProps.refetchTick !== this.props.refetchTick) {
      this.props.actions.getProducts('', true);
    }
    if (prevProps.customer != this.props.customer) {
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
  
  proceedToCheckout = (route) => {
    let currentKeypadVal = parseInt(this.state.keypadValue || '0', 10);
    if (this.state.activeTab === 'keypad' && currentKeypadVal > 0) {
      let fc = this.props.product.filter(p => p.type === "free").length + 1;
      let itemName = this.state.keypadNote ? this.state.keypadNote : "Item " + fc;
      this.props.actions.selectProduct({
        nid: "free_sale_" + Date.now(),
        name: itemName,
        label: itemName,
        price: currentKeypadVal,
        qty: 1,
        type: "free",
        available: 9999,
        body: "",
        code: ""
      });
      this.setState({ keypadValue: '0', keypadNote: '' });
    }
    if (this.RBSheet) {
      this.RBSheet.close();
    }
    setTimeout(() => {
      this.props.navigation.navigate(route);
    }, 100);
  }
  form() {
    return (
      this.props.user.orders_limit ? (
        <ScrollView
          style={{ height: '100%' }}>
          {this.props.list ? (
            this.props.list.length > 0 ? (
              <>
                {this.props.list.map((item, index) => {
                  return (
                    <ProductItem
                      key={index}
                      name={item.name}
                      nid={item.nid}
                      label={item.label}
                      production_date={item.production_date}
                      code={item.code}
                      available={item.available}
                      hasVariations={this.props.user.features.includes('product_extra_fields_production_date')}
                      productSelected={this.props.productSelected == item.nid}
                      style={{
                        marginBottom: index == this.props.list.length - 1 ? normalizeSize(150) : normalizeSize(0),
                      }}
                      onPress={
                        this.props.user.features.includes('product_extra_fields_production_date') ?
                          () => {
                            this.props.navigation.navigate('ProductVariations', {
                              cat: item.tid,
                              catName: item.name,
                              from: 'newSale'
                            })
                          } :
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
                style={{ height: 2000 }}>
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
                return (
                  <Shimmer
                    key={i}
                    style={this.styles.shimmer}
                    height={this.styles.shimmer.height}
                    width={this.styles.shimmer.width} />
                )
              })}
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={{paddingTop: normalizeSize(20)}}>
          <LimitBanner
            title="Llegaste al límite diario 🎉"
            message={'Tu Plan Gratis incluye 30 ventas por día. Mejorá a Plan Básico ($19.000/mes) para registrar ventas ilimitadas y desbloquear más funciones.'}
            ctaLabel="Mejorar mi plan"
            onPress={() => this.props.navigation.navigate('Billing')}
            variant="warning"
          />
        </View>
      )
    );
  }
  render() {
    let qrScan = null;
    if (this.props.user.features.includes('product_extra_fields_big_riders')) {
      if (this.props.user.features.includes('cash_management_required')) {
        if (this.props.user.cash_id != 0) {
          qrScan = () => this.props.navigation.navigate('QRScan');
        }
      }
      else {
        qrScan = () => this.props.navigation.navigate('QRScan');
      }
    }
    
    let currentKeypadVal = parseInt(this.state.keypadValue || '0', 10);
    let displayProducts = [...this.props.product];
    if (this.state.activeTab === 'keypad' && currentKeypadVal > 0) {
        let fc = this.props.product.filter(p => p.type === "free").length + 1;
        let itemName = this.state.keypadNote ? this.state.keypadNote : "Item " + fc;
        displayProducts.push({
          nid: "free_sale_temp",
          label: itemName,
          price: currentKeypadVal,
          qty: 1,
          type: "free",
          body: "",
          code: "",
          isTemp: true
        });
    }
    let displayTotal = this.props.total + (this.state.activeTab === 'keypad' ? currentKeypadVal : 0);
    
    return (
      <View
        style={{ backgroundColor: '#FFF', flex: 1 }}>
        <View style={{ flex: 1 }}>
          {this.state.activeTab === 'library' && (
            <View
              style={this.styles.safe}>
              <Autocomplete
                style={this.styles.search}
                placeholder={'Buscar producto...'}
                value={this.props.text}
                //onChangeText={(text) => {this.props.actions.textChange(text)}}
                onChangeText={(text) => this.props.actions.getProducts(text, true)}
                /*results={this.props.searchButton}
                selectItem={() =>{
                  this.props.actions.getProducts(this.props.text, true);
                  this.props.actions.clearSearch()
                }}*/
                clearText={() => {
                  this.props.actions.textChange(null)
                  this.props.actions.getProducts('', true);
                }}
              />
              {qrScan && (
                <TouchableOpacity
                  style={this.styles.qrScanCont}
                  activeOpacity={0.9}
                  onPress={qrScan}>
                  <Image
                    style={this.styles.qrScan}
                    source={require('../../../assets/images/qr_code_scanner.png')}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={this.styles.tabsContainer}>
            <TouchableOpacity
              style={this.styles.tabButton}
              onPress={() => this.props.navigation.navigate('VentaLibre')}
            >
              <Text style={this.styles.tabText}>Venta Libre</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[this.styles.tabButton, this.styles.tabButtonActive]}
              onPress={() => this.setState({ activeTab: 'library' })}
            >
              <Text style={[this.styles.tabText, this.styles.tabTextActive]}>Catálogo</Text>
            </TouchableOpacity>
          </View>

          {this.props.user.features.includes('cash_management_required') ? (
            this.props.user.cash_id == 0 ? (
              <View
                style={{ height: '100%' }}>
                <Text
                  style={this.styles.noLabel}>
                  Aún no puedes registrar ventas
                </Text>
                <Text
                  style={this.styles.noText}>
                  Debes iniciar tu turno antes de registrar una venta. Inicia tu turno abriendo la caja aquí.
                </Text>
                <Button
                  mode="contained"
                  onPress={() => this.props.navigation.navigate('Box', { type: 'openBox' })}
                  style={{marginTop: normalizeSize(12), marginHorizontal: normalizeSize(20)}}
                  contentStyle={{paddingVertical: normalizeSize(4)}}>
                  Abrir caja
                </Button>
              </View>
            ) : (
              this.state.activeTab === 'library' ? this.form() :
                <Keypad 
                  onChange={(val, note) => this.setState({ keypadValue: val, keypadNote: note })}
                  onAdd={(price, note) => {
                  let fc = this.props.product.filter(p => p.type === "free").length + 1;
                  let itemName = note ? note : "Item " + fc;
                  this.props.actions.selectProduct({
                    nid: "free_sale_" + Date.now(),
                    name: itemName,
                    label: itemName,
                    price: price,
                    qty: 1,
                    type: "free",
                    available: 9999,
                    body: "",
                    code: ""
                  })
                }} />
            )
          ) : (
            this.state.activeTab === 'library' ? this.form() :
              <Keypad 
                onChange={(val, note) => this.setState({ keypadValue: val, keypadNote: note })}
                onAdd={(price, note) => {
                let fc = this.props.product.filter(p => p.type === "free").length + 1;
                let itemName = note ? note : "Item " + fc;
                this.props.actions.selectProduct({
                  nid: "free_sale_" + Date.now(),
                  name: itemName,
                  label: itemName,
                  price: price,
                  qty: 1,
                  type: "free",
                  available: 9999,
                  body: "",
                  code: ""
                })
              }} />
          )}
          <RBSheet
            ref={(ref) => {
              this.RBSheet = ref;
            }}
            minClosingHeight={(50)}
            height={this.styles.bottomSheetHeigth}
            customStyles={{ container: this.styles.bottomSheetContainer }}
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
              Venta actual
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
                      from: 'customer'
                    }),
                      this.RBSheet.close()
                  }
              }>
              {this.props.customer ? (
                <Text
                  style={this.styles.addCustomerText}>
                  Cliente: <Text style={{ fontFamily: fonts.regular }}>
                    {this.props.customer.label}
                  </Text>
                </Text>
              ) : (
                <Text
                  style={this.styles.addCustomerText}>
                  Agregar cliente
                </Text>
              )}

              <Image
                style={this.styles.addCustomerArrow}
                resizeMode='contain'
                source={require('../../../assets/images/arrow_right.png')}
              />
            </TouchableOpacity>

            {displayProducts.length > 0 ? (
              <ScrollView>
                {displayProducts.map((item, index) => {
                  let name = item.label;
                  if (item.production_date) {
                    name = item.label + ' / ' + item.production_date;
                  }
                  return (
                    (item.type || item.body != '') ? (
                      <SaleKitItem
                        style={[this.styles.productItem, {
                          marginTop: index == 0 ? normalizeSize(10) : 0
                        }]}
                        name={name}
                        code={item.code}
                        products={item.products}
                        product={item.body}
                        value={item.price}
                        qty={item.qty + ''}
                        key={index}
                        onAdd={item.isTemp ? null : () => this.props.actions.addProduct(item)}
                        onRemove={item.isTemp ? null : () => this.props.actions.removeProduct(item)}
                        onDelete={item.isTemp ? null : () => this.props.actions.deleteProduct(item)}
                        onChangeQty={item.isTemp ? null : (qty) => this.props.actions.qtyChange(qty, item)}
                      />
                    ) : (
                      <SaleProductItem
                        style={[this.styles.productItem, {
                          marginTop: index == 0 ? normalizeSize(10) : 0
                        }]}
                        name={name}
                        code={item.code}
                        value={item.price}
                        qty={item.qty + ''}
                        key={index}
                        onChangePrice={this.props.user.features.includes('sale_edit_product_price') ?
                          (price) => this.props.actions.priceChange(price, item) :
                          null
                        }
                        onCheck={this.props.user.features.includes('sale_edit_product_price') ?
                          () => this.props.actions.checkChange(item) :
                          null
                        }
                        checked={item.edit_product}
                        onAdd={item.isTemp ? null : () => this.props.actions.addProduct(item)}
                        onRemove={item.isTemp ? null : () => this.props.actions.removeProduct(item)}
                        onDelete={item.isTemp ? null : () => this.props.actions.deleteProduct(item)}
                        onChangeQty={item.isTemp ? null : (qty) => this.props.actions.qtyChange(qty, item)}
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
                  Aún no has agregado productos a la venta
                </Text>
              </View>
            )}
            {displayProducts.length > 0 && (
              <SafeAreaView
                style={this.styles.RBSafe}>
                <NumericFormat
                  value={displayTotal}
                  displayType={'text'}
                  thousandSeparator={'.'}
                  decimalSeparator={','}
                  prefix={'$'}
                  renderText={
                    (value) =>
                      <Text style={[this.styles.totalValue, {
                        fontSize: normalizeSize(25),
                        marginVertical: normalizeSize(10),
                        textAlign: 'center'
                      }]}>
                        {value}
                      </Text>
                  }
                />
                <View
                  style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    style={this.styles.otherPayCont}
                    activeOpacity={0.9}
                    onPress={() => this.proceedToCheckout('ConfirmOrder')}>
                    <Text
                      style={this.styles.otherPayTxt}>
                      Otras formas de pago
                    </Text>
                  </TouchableOpacity>
                  <Button
                    mode="contained"
                    onPress={() => this.proceedToCheckout('ConfirmCashOrder')}
                    style={this.styles.button}
                    contentStyle={{paddingVertical: normalizeSize(2)}}>
                    Pago efectivo
                  </Button>
                </View>
              </SafeAreaView>
            )}
          </RBSheet>
        </View>
        {this.props.list && (
          this.state.activeTab === 'keypad' ? (
            <View
              style={{ position: 'absolute', bottom: normalizeSize(10), width: '100%', paddingHorizontal: normalizeSize(10), alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => this.RBSheet.open()}
                activeOpacity={0.9}
                style={{
                  backgroundColor: colors.buttonBackground,
                  borderRadius: normalizeSize(10),
                  paddingVertical: normalizeSize(10),
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: 480,
                  shadowColor: 'black',
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 5,
                }}>
                <Text
                  style={{ color: 'white', fontFamily: fonts.bold, fontSize: normalizeSize(16), marginBottom: normalizeSize(2) }}>
                  {'Continua con el pago'}
                </Text>
                <NumericFormat
                  value={displayTotal}
                  displayType={'text'}
                  thousandSeparator={'.'}
                  decimalSeparator={','}
                  prefix={'$'}
                  renderText={
                    (value) =>
                      <Text style={{ color: 'white', fontFamily: fonts.regular, fontSize: normalizeSize(14) }}>
                        {displayProducts.length} items   |   Total {value}
                      </Text>
                  }
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={this.styles.bottomSafe}>
              <TouchableOpacity
                onPress={() => this.RBSheet.open()}
                activeOpacity={0.9}
                style={this.styles.viewSale}>
                <Text
                  style={this.styles.description}>
                  {displayProducts.length > 0 ? 'Continua con el pago' : 'Aún no has agregado productos'}
                </Text>
                <Text
                  style={this.styles.totalLabel}>
                  {'Total '}
                  <NumericFormat
                    value={displayTotal}
                    displayType={'text'}
                    thousandSeparator={'.'}
                    decimalSeparator={','}
                    prefix={'$'}
                    renderText={
                      (value) =>
                        <Text style={this.styles.totalValue}>
                          {value}
                        </Text>
                    }
                  />
                </Text>
              </TouchableOpacity>
            </View>
          )
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
              Datos del cliente
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
                Remover cliente de la venta
              </Text>
            </TouchableOpacity>
          </DialogContainer>
        )}
      </View>
    );
  }
}
export default NewSaleScreen;