import React, {Component} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button, IconButton, Text} from 'react-native-paper';
import {NumericFormat} from 'react-number-format';
import RBSheet from 'react-native-raw-bottom-sheet';
import {Keypad, SaleKitItem, SaleProductItem} from '../../../components';
import {colors, fonts, normalizeSize} from '../../../styles/basicStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';

class VentaLibreScreen extends Component {
  state = {
    keypadValue: '0',
    keypadNote: '',
  };

  componentDidMount() {
    registerEventScreenMounted(this.props, 'Venta Libre', 'VentaLibreScreen');
  }

  componentDidUpdate(prevProps) {
    // Replica el comportamiento de NewSaleScreen: si el cliente cambia
    // mientras estamos en la pantalla, abrir el sheet de "Venta actual".
    if (prevProps.customer !== this.props.customer && this.RBSheet) {
      this.RBSheet.open();
    }
  }

  flushPendingKeypadToProduct() {
    const pending = parseInt(this.state.keypadValue || '0', 10);
    if (pending > 0) {
      const fc = (this.props.product || []).filter((p) => p.type === 'free').length + 1;
      const itemName = this.state.keypadNote ? this.state.keypadNote : 'Item ' + fc;
      this.props.actions.selectProduct({
        nid: 'free_sale_' + Date.now(),
        name: itemName,
        label: itemName,
        price: pending,
        qty: 1,
        type: 'free',
        available: 9999,
        body: '',
        code: '',
      });
      this.setState({keypadValue: '0', keypadNote: ''});
    }
  }

  proceedToCheckout = (route) => {
    if (this.RBSheet) this.RBSheet.close();
    setTimeout(() => this.props.navigation.navigate(route), 100);
  };

  openPaymentSheet = () => {
    // Asegurar que el monto que estaba en el keypad se sume como ítem antes
    // de abrir el resumen — si no, el usuario ve un sheet sin productos.
    this.flushPendingKeypadToProduct();
    if (this.RBSheet) this.RBSheet.open();
  };

  render() {
    const {product = [], total = 0, customer} = this.props;
    const displayProducts = product || [];

    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header con close X (X baja por paddingTop) */}
        <View style={styles.header}>
          <IconButton
            icon="close"
            size={normalizeSize(28)}
            onPress={() => this.props.navigation.goBack()}
            iconColor={colors.text}
            style={styles.closeBtn}
          />
          <Text style={styles.headerTitle}>Venta Libre</Text>
          <View style={{width: normalizeSize(48)}} />
        </View>

        {/* Body: Keypad centrado verticalmente.
            paddingBottom:0 override quita el hueco de 80px del Keypad
            original (que existía para acomodar el botón absoluto de NewSale).
            En VentaLibre el footer es sticky aparte, no hace falta. */}
        <View style={styles.body}>
          <Keypad
            style={{paddingBottom: 0}}
            onChange={(val, note) =>
              this.setState({keypadValue: val, keypadNote: note})
            }
            onAdd={(price, note) => {
              const fc = (this.props.product || []).filter((p) => p.type === 'free').length + 1;
              const itemName = note ? note : 'Item ' + fc;
              this.props.actions.selectProduct({
                nid: 'free_sale_' + Date.now(),
                name: itemName,
                label: itemName,
                price: price,
                qty: 1,
                type: 'free',
                available: 9999,
                body: '',
                code: '',
              });
            }}
          />
        </View>

        {/* Continua con el pago — sticky bottom */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={this.openPaymentSheet}
            contentStyle={{paddingVertical: normalizeSize(8)}}
            style={styles.payButton}>
            <View style={{alignItems: 'center'}}>
              <Text style={styles.payText}>Continua con el pago</Text>
              <NumericFormat
                value={total}
                displayType={'text'}
                thousandSeparator={'.'}
                decimalSeparator={','}
                prefix={'$'}
                renderText={(value) => (
                  <Text style={styles.paySub}>
                    {displayProducts.length} items · Total {value}
                  </Text>
                )}
              />
            </View>
          </Button>
        </View>

        {/* Sheet "Venta actual" — replica del de NewSaleScreen para mantener
            la misma UX: cliente, listado de productos editables, total y
            opciones de pago (efectivo / otras). */}
        <RBSheet
          ref={(ref) => (this.RBSheet = ref)}
          minClosingHeight={50}
          height={normalizeSize(560)}
          customStyles={{container: styles.sheetContainer}}
          draggable={true}
          openDuration={400}
          closeDuration={400}
          dragFromTopOnly={true}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => this.RBSheet.close()}
            style={styles.closeCont}>
            <Image
              style={styles.closeImg}
              resizeMode="contain"
              source={require('../../../assets/images/ic_close.png')}
            />
          </TouchableOpacity>
          <Text style={styles.sheetTitle}>Venta actual</Text>

          <TouchableOpacity
            style={styles.addCustomerCont}
            activeOpacity={0.9}
            onPress={
              customer
                ? () => {
                    this.props.actions.customerVisible(true);
                    this.RBSheet.close();
                  }
                : () => {
                    this.props.navigation.navigate('Provider', {from: 'customer'});
                    this.RBSheet.close();
                  }
            }>
            {customer ? (
              <Text style={styles.addCustomerText}>
                Cliente:{' '}
                <RNText style={{fontFamily: fonts.regular}}>
                  {customer.label}
                </RNText>
              </Text>
            ) : (
              <Text style={styles.addCustomerText}>Agregar cliente</Text>
            )}
            <Image
              style={styles.addCustomerArrow}
              resizeMode="contain"
              source={require('../../../assets/images/arrow_right.png')}
            />
          </TouchableOpacity>

          {displayProducts.length > 0 ? (
            <ScrollView style={{flex: 1}}>
              {displayProducts.map((item, index) => {
                let name = item.label;
                if (item.production_date) {
                  name = item.label + ' / ' + item.production_date;
                }
                return item.type || (item.body && item.body !== '') ? (
                  <SaleKitItem
                    style={{marginTop: index === 0 ? normalizeSize(10) : 0}}
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
                    style={{marginTop: index === 0 ? normalizeSize(10) : 0}}
                    name={name}
                    code={item.code}
                    value={item.price}
                    qty={item.qty + ''}
                    key={index}
                    onAdd={item.isTemp ? null : () => this.props.actions.addProduct(item)}
                    onRemove={item.isTemp ? null : () => this.props.actions.removeProduct(item)}
                    onDelete={item.isTemp ? null : () => this.props.actions.deleteProduct(item)}
                    onChangeQty={item.isTemp ? null : (qty) => this.props.actions.qtyChange(qty, item)}
                  />
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.noProductMsg}>
              <Text style={styles.noProductText}>
                Aún no has agregado productos a la venta
              </Text>
            </View>
          )}

          {displayProducts.length > 0 && (
            <SafeAreaView style={styles.RBSafe}>
              <NumericFormat
                value={total}
                displayType={'text'}
                thousandSeparator={'.'}
                decimalSeparator={','}
                prefix={'$'}
                renderText={(value) => (
                  <Text style={styles.totalValue}>{value}</Text>
                )}
              />
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                  style={styles.otherPayCont}
                  activeOpacity={0.9}
                  onPress={() => this.proceedToCheckout('ConfirmOrder')}>
                  <Text style={styles.otherPayTxt}>Otras formas de pago</Text>
                </TouchableOpacity>
                <Button
                  mode="contained"
                  onPress={() => this.proceedToCheckout('ConfirmCashOrder')}
                  style={styles.payCashBtn}
                  contentStyle={{paddingVertical: normalizeSize(2)}}>
                  Pago efectivo
                </Button>
              </View>
            </SafeAreaView>
          )}
        </RBSheet>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalizeSize(4),
    // paddingTop baja la X respecto al borde superior; el statusbar ya está
    // arriba en SafeAreaView, así que sumamos un poco de aire.
    paddingTop: normalizeSize(12),
    paddingBottom: normalizeSize(4),
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  closeBtn: {
    margin: 0,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    color: colors.text,
    // Título más grande que el variant titleMedium (~16) y más pesado.
    fontSize: normalizeSize(20),
  },
  body: {
    flex: 1,
    // Centra verticalmente el Keypad dentro del espacio entre header y footer.
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: normalizeSize(16),
    paddingTop: normalizeSize(8),
    paddingBottom: normalizeSize(16),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  payButton: {
    backgroundColor: colors.buttonBackground,
    borderRadius: normalizeSize(10),
  },
  payText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: normalizeSize(16),
  },
  paySub: {
    color: '#FFFFFF',
    fontFamily: fonts.regular,
    fontSize: normalizeSize(13),
    marginTop: normalizeSize(2),
  },
  sheetContainer: {
    borderTopLeftRadius: normalizeSize(16),
    borderTopRightRadius: normalizeSize(16),
    paddingHorizontal: normalizeSize(16),
  },
  closeCont: {
    position: 'absolute',
    top: normalizeSize(12),
    right: normalizeSize(12),
    padding: normalizeSize(6),
    zIndex: 10,
  },
  closeImg: {
    width: normalizeSize(18),
    height: normalizeSize(18),
  },
  sheetTitle: {
    textAlign: 'center',
    fontFamily: fonts.semiBold,
    color: colors.text,
    fontSize: normalizeSize(18),
    marginTop: normalizeSize(14),
    marginBottom: normalizeSize(8),
  },
  addCustomerCont: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: normalizeSize(12),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  addCustomerText: {
    fontFamily: fonts.semiBold,
    color: colors.text,
    fontSize: normalizeSize(14),
    flex: 1,
  },
  addCustomerArrow: {
    width: normalizeSize(12),
    height: normalizeSize(12),
    tintColor: colors.purplishGrey,
  },
  noProductMsg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: normalizeSize(20),
  },
  noProductText: {
    color: colors.purplishGrey,
    fontFamily: fonts.regular,
    fontSize: normalizeSize(14),
    textAlign: 'center',
  },
  RBSafe: {
    paddingTop: normalizeSize(8),
  },
  totalValue: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: normalizeSize(25),
    marginVertical: normalizeSize(10),
    textAlign: 'center',
  },
  otherPayCont: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalizeSize(10),
    marginRight: normalizeSize(8),
    borderWidth: 1,
    borderColor: colors.buttonBackground,
    borderRadius: normalizeSize(8),
  },
  otherPayTxt: {
    color: colors.buttonBackground,
    fontFamily: fonts.semiBold,
    fontSize: normalizeSize(13),
    textAlign: 'center',
  },
  payCashBtn: {
    flex: 1,
    backgroundColor: colors.buttonBackground,
    borderRadius: normalizeSize(8),
  },
});

export default VentaLibreScreen;
