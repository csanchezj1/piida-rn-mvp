import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Icon, IconButton, Text, TextInput as PaperTextInput } from 'react-native-paper';
import { NumericFormat } from 'react-number-format';
import RBSheet from 'react-native-raw-bottom-sheet';
import { Keypad, SaleKitItem, SaleProductItem } from '../../../components';
import { colors, fonts, normalizeSize } from '../../../styles/basicStyles';
import { registerEventScreenMounted } from '../../../utils/analytics';
import Movements from '../../../api/movements';

// Mostramos el split tablet sólo si:
//   1. El lado más corto >= 500dp (tablet, no phone).
//   2. width >= height (landscape físico).
// La TCL 10.1" no respeta forced rotation; por eso requerimos que ya esté
// landscape para activar el split (si la tablet está vertical cae al
// layout phone, no se ve roto).
const isTabletNow = () => {
  const { width, height } = Dimensions.get('window');
  const shortest = Math.min(width, height);
  const longest = Math.max(width, height);
  const aspect = longest / shortest;
  return shortest >= 500 && aspect < 1.8 && width >= height;
};

// Paleta del rediseño tablet (warm beige + coral CTA). Solo se aplica en
// VentaLibre y ConfirmCashOrder en modo tablet — el resto de la app sigue
// con la paleta PIIDA (#F7A928 dorado).
const T = {
  bg: '#FFFBF6',
  bgAlt: '#F7F0E8',
  card: '#F4E9DB',
  panel: '#EFE2D2',
  text: '#1A1410',
  textMuted: '#8C6F60',
  textDim: '#B89F90',
  accent: '#FF5A1F',
  divider: 'rgba(60, 30, 10, 0.12)',
};

class VentaLibreScreen extends Component {
  state = {
    keypadValue: '0',
    keypadNote: '',
    saleNumber: null, // próximo consecutivo, para el badge "VENTA #N"
  };

  componentDidMount() {
    registerEventScreenMounted(this.props, 'Venta Libre', 'VentaLibreScreen');
    // Próximo número de venta para el badge del header.
    const branch = this.props.user?.branch_office;
    if (branch) {
      Movements.getNextConsecutive(branch)
        .then((res) => {
          if (res && res.next != null) this.setState({ saleNumber: res.next });
        })
        .catch(() => { });
    }
    // En tablet NO forzamos orientación con la lib (la TCL 10.1" ignora
    // lockToLandscape Left/Right y termina renderizando rotado). Dejamos la
    // orientación libre que el hardware decida y resolvemos el layout en
    // función de las dimensiones actuales (ver isLandscapeNow()).
    // Re-renderizar al rotar:
    this._dimsUnsub = Dimensions.addEventListener('change', () => this.forceUpdate());
  }

  componentWillUnmount() {
    if (this._dimsUnsub && typeof this._dimsUnsub.remove === 'function') {
      this._dimsUnsub.remove();
    }
  }

  componentDidUpdate(prevProps) {
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
      this.setState({ keypadValue: '0', keypadNote: '' });
    }
  }

  proceedToCheckout = (route) => {
    // En tablet la confirmación se hace inline (no sheet) → flush antes de
    // navegar para que la venta lleve el último monto del teclado también.
    this.flushPendingKeypadToProduct();
    if (this.RBSheet) this.RBSheet.close();
    setTimeout(() => this.props.navigation.navigate(route), 100);
  };

  openPaymentSheet = () => {
    this.flushPendingKeypadToProduct();
    if (this.RBSheet) this.RBSheet.open();
  };

  // ─── Tablet helpers ─────────────────────────────────────────
  pressKey = (key) => {
    if (key === 'Limpiar') {
      this.setState({ keypadValue: '0' });
      return;
    }
    if (key === '+') {
      const price = parseInt(this.state.keypadValue || '0', 10);
      if (price <= 0) return;
      const fc = (this.props.product || []).filter((p) => p.type === 'free').length + 1;
      const note = this.state.keypadNote;
      const itemName = note ? note : 'Item ' + fc;
      this.props.actions.selectProduct({
        nid: 'free_sale_' + Date.now(),
        name: itemName,
        label: itemName,
        price,
        qty: 1,
        type: 'free',
        available: 9999,
        body: '',
        code: '',
      });
      this.setState({ keypadValue: '0', keypadNote: '' });
      return;
    }
    // Dígito
    const cur = this.state.keypadValue === '0' ? '' : this.state.keypadValue;
    this.setState({ keypadValue: cur + key });
  };

  renderTabletKeypadColumn() {
    const KEYS = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['Limpiar', '0', '+'],
    ];
    const hasNote = !!this.state.keypadNote;
    const valueInt = parseInt(this.state.keypadValue || '0', 10);
    const isZero = valueInt === 0;
    return (
      <View style={t.leftPane}>
        {/* Card: Valor del artículo + botón Agregar nota */}
        <View style={t.valueCard}>
          <View style={{ flex: 1 }}>
            <Text style={t.valueLabel}>VALOR DEL ARTÍCULO</Text>
            <View style={t.valueRow}>
              <Text style={t.valueSign}>$</Text>
              <NumericFormat
                value={valueInt}
                displayType="text"
                thousandSeparator="."
                decimalSeparator=","
                renderText={(v) => (
                  <Text style={[t.valueBig, !isZero && t.valueBigActive]}>{v}</Text>
                )}
              />
              <Text style={t.valueCop}>COP</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[t.noteBtn, hasNote && t.noteBtnActive]}
            onPress={() => this.noteSheet && this.noteSheet.open()}>
            <Icon source="note-text-outline" size={25} color={T.textMuted} />
            <Text style={t.noteBtnText} numberOfLines={1}>
              {hasNote ? `Nota: ${this.state.keypadNote}` : 'Agregar nota'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Teclado: 4 filas × 3 columnas */}
        <View style={t.kbWrap}>
          {KEYS.map((row, ri) => (
            <View key={ri} style={t.kbRow}>
              {row.map((key) => {
                const isAdd = key === '+';
                const isClear = key === 'Limpiar';
                const addActive = isAdd && !isZero;
                return (
                  <TouchableOpacity
                    key={key}
                    activeOpacity={0.6}
                    style={[
                      t.kbKey,
                      isAdd && t.kbKeyAdd,
                      addActive && t.kbKeyAddActive,
                    ]}
                    onPress={() => this.pressKey(key)}>
                    <Text
                      style={[
                        t.kbKeyText,
                        isClear && t.kbKeyClearText,
                        isAdd && t.kbKeyAddText,
                        addActive && t.kbKeyAddTextActive,
                      ]}>
                      {key}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  }

  renderTabletSummaryColumn() {
    const { product = [], total = 0, customer } = this.props;
    const items = product || [];
    // El cajero puede tipear un monto y tocar "Pago efectivo" directo sin
    // pasar por "+": al disparar el checkout hacemos flush automático del
    // keypad como ítem free. Por eso los CTAs se habilitan también con
    // monto pendiente, no sólo con items ya agregados.
    const pendingFromKeypad = parseInt(this.state.keypadValue || '0', 10);
    const hasContent = items.length > 0 || pendingFromKeypad > 0;
    const displayTotal = total + (pendingFromKeypad > 0 ? pendingFromKeypad : 0);
    const displayCount = items.length + (pendingFromKeypad > 0 ? 1 : 0);

    return (
      <View style={t.rightPane}>
        <View style={t.rightHeader}>
          <Text style={t.rightTitle}>Venta actual</Text>
          <Text style={t.rightCount}>
            {displayCount} {displayCount === 1 ? 'ítem' : 'ítems'}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={t.customerBtn}
          onPress={
            customer
              ? () => this.props.actions.customerVisible(true)
              : () => this.props.navigation.navigate('Provider', { from: 'customer' })
          }>
          <View style={t.customerIcon}>
            <Icon
              source={customer ? 'check' : 'account-outline'}
              size={22}
              color={T.textMuted}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={t.customerLabel} numberOfLines={1}>
              {customer ? `Cliente: ${customer.label}` : 'Agregar cliente'}
            </Text>
            <Text style={t.customerSub}>Opcional · puntos y crédito</Text>
          </View>
          <Text style={t.customerArrow}>›</Text>
        </TouchableOpacity>

        <View style={t.itemsArea}>
          {items.length === 0 ? (
            <View style={t.emptyWrap}>
              <View style={t.emptyCircle}>
                <Text style={t.emptyCircleIcon}>🛒</Text>
              </View>
              <Text style={t.emptyTitle}>Tu venta está vacía</Text>
              <Text style={t.emptySub}>
                Ingresa un valor a la izquierda y toca <RNText style={{ color: T.accent, fontFamily: fonts.bold }}>+</RNText> para agregarlo
              </Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ paddingVertical: normalizeSize(2) }}>
              {items.map((item, index) => {
                let name = item.label;
                if (item.production_date) name = item.label + ' / ' + item.production_date;
                const qty = parseInt(item.qty + '', 10) || 1;
                const subtotal = (item.price || 0) * qty;
                return (
                  <View key={index} style={t.compactItem}>
                    <View style={{ flex: 1, paddingRight: normalizeSize(8) }}>
                      <Text style={t.compactItemName} numberOfLines={1}>{name}</Text>
                      <NumericFormat
                        value={subtotal}
                        displayType="text"
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="$"
                        renderText={(v) => <Text style={t.compactItemPrice}>{v}</Text>}
                      />
                    </View>
                    {!item.isTemp && (
                      <View style={t.compactQty}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => this.props.actions.removeProduct(item)}
                          style={t.compactQtyBtn}>
                          <Text style={t.compactQtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={t.compactQtyText}>{qty}</Text>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => this.props.actions.addProduct(item)}
                          style={t.compactQtyBtn}>
                          <Text style={t.compactQtyBtnText}>+</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => this.props.actions.deleteProduct(item)}
                          style={t.compactDelBtn}>
                          <Text style={t.compactDelText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        <View style={t.footer}>
          <View style={t.totalRow}>
            <Text style={t.totalLabel}>TOTAL</Text>
            <NumericFormat
              value={displayTotal}
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="$"
              renderText={(v) => <Text style={t.totalValue}>{v}</Text>}
            />
          </View>

          <View style={t.ctaRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!hasContent}
              onPress={() => this.proceedToCheckout('ConfirmOrder')}
              style={[t.ctaOther, !hasContent && t.ctaDisabled]}>
              <Icon source="credit-card-outline" size={14} color={T.textDim} />
              <Text
                style={t.ctaOtherText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}>
                Otras formas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!hasContent}
              onPress={() => this.proceedToCheckout('ConfirmCashOrder')}
              style={[t.ctaCash, hasContent && t.ctaCashActive]}>
              <Icon
                source="cash"
                size={14}
                color={hasContent ? '#FFFFFF' : T.textDim}
              />
              <Text
                style={[t.ctaCashText, hasContent && t.ctaCashTextActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}>
                Pago efectivo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  renderTablet() {
    return (
      <SafeAreaView style={t.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header */}
        <View style={t.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={t.closeBtn}
            onPress={() => this.props.navigation.goBack()}>
            <Text style={t.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={t.headerTitle}>Venta libre</Text>
          <View style={t.headerBadge}>
            <Text style={t.headerBadgeText}>
              {this.state.saleNumber != null ? `VENTA #${this.state.saleNumber}` : 'VENTA'}
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          <Text style={t.headerSub}>Terminal · Mostrador 1</Text>
        </View>

        {/* Split body */}
        <View style={t.body}>
          {this.renderTabletKeypadColumn()}
          {this.renderTabletSummaryColumn()}
        </View>

        {/* Note sheet (compartido tablet+phone) */}
        {this.renderNoteSheet()}
      </SafeAreaView>
    );
  }

  renderNoteSheet() {
    return (
      <RBSheet
        ref={(ref) => (this.noteSheet = ref)}
        height={normalizeSize(260)}
        openDuration={200}
        closeDuration={200}
        customStyles={{ container: { borderTopLeftRadius: 16, borderTopRightRadius: 16 } }}>
        <View style={{ padding: normalizeSize(20) }}>
          <Text style={{ fontFamily: fonts.semiBold, fontSize: normalizeSize(16), textAlign: 'center', marginBottom: normalizeSize(12), color: T.text }}>
            Añadir nota al ítem
          </Text>
          <PaperTextInput
            mode="outlined"
            label="Nota"
            placeholder="Ej: Combo dos paninis"
            value={this.state.keypadNote}
            onChangeText={(text) => this.setState({ keypadNote: text })}
            outlineColor={T.divider}
            activeOutlineColor={T.accent}
            style={{ backgroundColor: '#FFFFFF' }}
          />
          <Button
            mode="contained"
            buttonColor={T.accent}
            textColor="#FFFFFF"
            onPress={() => this.noteSheet && this.noteSheet.close()}
            style={{ marginTop: normalizeSize(14) }}>
            Listo
          </Button>
        </View>
      </RBSheet>
    );
  }

  // ─── Phone fallback (layout previo) ─────────────────────────
  renderPhone() {
    const { product = [], total = 0, customer } = this.props;
    const displayProducts = product || [];

    return (
      <SafeAreaView style={p.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <View style={p.header}>
          <IconButton
            icon="close"
            size={normalizeSize(28)}
            onPress={() => this.props.navigation.goBack()}
            iconColor={colors.text}
            style={{ margin: 0 }}
          />
          <Text style={p.headerTitle}>Venta Libre</Text>
          <View style={{ width: normalizeSize(48) }} />
        </View>

        <View style={p.body}>
          <Keypad
            style={{ paddingBottom: 0 }}
            onChange={(val, note) =>
              this.setState({ keypadValue: val, keypadNote: note })
            }
            onAdd={(price, note) => {
              const fc = (this.props.product || []).filter((pp) => pp.type === 'free').length + 1;
              const itemName = note ? note : 'Item ' + fc;
              this.props.actions.selectProduct({
                nid: 'free_sale_' + Date.now(),
                name: itemName,
                label: itemName,
                price,
                qty: 1,
                type: 'free',
                available: 9999,
                body: '',
                code: '',
              });
            }}
          />
        </View>

        <View style={p.footer}>
          <Button
            mode="contained"
            onPress={this.openPaymentSheet}
            contentStyle={{ paddingVertical: normalizeSize(8) }}
            style={p.payButton}>
            <View style={{ alignItems: 'center' }}>
              <Text style={p.payText}>Continua con el pago</Text>
              <NumericFormat
                value={total}
                displayType={'text'}
                thousandSeparator={'.'}
                decimalSeparator={','}
                prefix={'$'}
                renderText={(value) => (
                  <Text style={p.paySub}>
                    {displayProducts.length} items · Total {value}
                  </Text>
                )}
              />
            </View>
          </Button>
        </View>

        <RBSheet
          ref={(ref) => (this.RBSheet = ref)}
          minClosingHeight={50}
          height={normalizeSize(560)}
          customStyles={{ container: p.sheetContainer }}
          draggable
          openDuration={400}
          closeDuration={400}
          dragFromTopOnly>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => this.RBSheet.close()}
            style={p.closeCont}>
            <Image
              style={p.closeImg}
              resizeMode="contain"
              source={require('../../../assets/images/ic_close.png')}
            />
          </TouchableOpacity>
          <Text style={p.sheetTitle}>Venta actual</Text>
          <TouchableOpacity
            style={p.addCustomerCont}
            activeOpacity={0.9}
            onPress={
              customer
                ? () => {
                  this.props.actions.customerVisible(true);
                  this.RBSheet.close();
                }
                : () => {
                  this.props.navigation.navigate('Provider', { from: 'customer' });
                  this.RBSheet.close();
                }
            }>
            {customer ? (
              <Text style={p.addCustomerText}>
                Cliente: <RNText style={{ fontFamily: fonts.regular }}>{customer.label}</RNText>
              </Text>
            ) : (
              <Text style={p.addCustomerText}>Agregar cliente</Text>
            )}
            <Image
              style={p.addCustomerArrow}
              resizeMode="contain"
              source={require('../../../assets/images/arrow_right.png')}
            />
          </TouchableOpacity>

          {displayProducts.length > 0 ? (
            <ScrollView style={{ flex: 1 }}>
              {displayProducts.map((item, index) => {
                let name = item.label;
                if (item.production_date) name = item.label + ' / ' + item.production_date;
                return item.type || (item.body && item.body !== '') ? (
                  <SaleKitItem
                    style={{ marginTop: index === 0 ? normalizeSize(10) : 0 }}
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
                    style={{ marginTop: index === 0 ? normalizeSize(10) : 0 }}
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
            <View style={p.noProductMsg}>
              <Text style={p.noProductText}>Aún no has agregado productos a la venta</Text>
            </View>
          )}

          {displayProducts.length > 0 && (
            <SafeAreaView style={p.RBSafe}>
              <NumericFormat
                value={total}
                displayType="text"
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                renderText={(v) => <Text style={p.totalValue}>{v}</Text>}
              />
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={p.otherPayCont}
                  activeOpacity={0.9}
                  onPress={() => this.proceedToCheckout('ConfirmOrder')}>
                  <Text style={p.otherPayTxt}>Otras formas de pago</Text>
                </TouchableOpacity>
                <Button
                  mode="contained"
                  onPress={() => this.proceedToCheckout('ConfirmCashOrder')}
                  style={p.payCashBtn}
                  contentStyle={{ paddingVertical: normalizeSize(2) }}>
                  Pago efectivo
                </Button>
              </View>
            </SafeAreaView>
          )}
        </RBSheet>
      </SafeAreaView>
    );
  }

  render() {
    return isTabletNow() ? this.renderTablet() : this.renderPhone();
  }
}

// ─── Tablet styles ────────────────────────────────────────────
// ─── Estilos tablet — traducidos 1:1 del diseño HTML (canvas 1280×800).
// Valores literales (sin normalizeSize) para fidelidad exacta: el diseño ya
// está pensado a tamaño tablet; el split flex adapta al ancho real.
const WHITE = '#FFFFFF';
const BEIGE = '#F7F0E8';
const TEXT_DARK = '#3D2E25';
const DIVIDER = 'rgba(60, 30, 10, 0.07)';

const t = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 20,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: BEIGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontFamily: fonts.medium,
    fontSize: 20,
    color: T.text,
    includeFontPadding: false,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: T.text,
    letterSpacing: -0.3,
    marginLeft: 16,
  },
  headerBadge: {
    backgroundColor: BEIGE,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  headerBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: T.textMuted,
    letterSpacing: 0.5,
  },
  headerSub: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: T.textMuted,
  },

  body: { flex: 1, flexDirection: 'row' },

  // ── Panel izquierdo (keypad) — 840/1260 ≈ flex 2 ──
  leftPane: {
    flex: 2,
    paddingVertical: 20,
    paddingHorizontal: 32,
    backgroundColor: T.bg,
    rowGap: 16,
  },

  // Card: Valor del artículo
  valueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: WHITE,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  valueLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: T.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  valueSign: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: T.textDim,
    marginRight: 8,
  },
  valueBig: {
    fontFamily: fonts.bold,
    fontSize: 52,
    color: T.textDim,
    letterSpacing: -1.6,
    includeFontPadding: false,
  },
  valueBigActive: {
    color: T.text,
  },
  valueCop: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: T.textMuted,
    marginLeft: 6,
  },
  noteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: BEIGE,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    maxWidth: 220,
  },
  noteBtnActive: {
    backgroundColor: BEIGE,
  },
  noteBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: TEXT_DARK,
  },

  // Teclado: 4 filas × 3 columnas, teclas blancas grandes
  kbWrap: {
    flex: 1,
    rowGap: 14,
  },
  kbRow: {
    flex: 1,
    flexDirection: 'row',
    columnGap: 14,
  },
  kbKey: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kbKeyText: {
    fontFamily: fonts.semiBold,
    fontSize: 46,
    color: T.text,
    includeFontPadding: false,
  },
  kbKeyClearText: {
    fontSize: 24,
    color: T.textMuted,
  },
  // "+" — beige cuando el valor es 0; naranja cuando hay valor.
  kbKeyAdd: {
    backgroundColor: BEIGE,
  },
  kbKeyAddText: {
    fontSize: 40,
    color: T.textDim,
  },
  kbKeyAddActive: {
    backgroundColor: T.accent,
  },
  kbKeyAddTextActive: {
    color: WHITE,
  },

  // ── Panel derecho (venta actual) — 420/1260 ≈ flex 1 ──
  rightPane: {
    flex: 1,
    backgroundColor: WHITE,
  },
  rightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  rightTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: T.text,
    letterSpacing: -0.2,
  },
  rightCount: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: T.textMuted,
    letterSpacing: 0.3,
  },
  customerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    columnGap: 14,
  },
  customerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BEIGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: T.text,
  },
  customerSub: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: T.textMuted,
    marginTop: 2,
  },
  customerArrow: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: T.textDim,
  },

  itemsArea: {
    flex: 1,
    paddingVertical: 8,
  },
  // Estado vacío
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BEIGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyCircleIcon: {
    fontSize: 26,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: TEXT_DARK,
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: T.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  // Item compacto de la venta
  compactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  compactItemName: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: T.text,
  },
  compactItemPrice: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: T.textMuted,
    marginTop: 1,
  },
  compactQty: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactQtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: BEIGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactQtyBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: T.text,
    includeFontPadding: false,
  },
  compactQtyText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: T.text,
    marginHorizontal: 9,
    minWidth: 18,
    textAlign: 'center',
  },
  compactDelBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  compactDelText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: T.textDim,
    includeFontPadding: false,
  },

  // ── Footer: total + CTAs ──
  footer: {
    backgroundColor: WHITE,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: DIVIDER,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  totalLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: T.textMuted,
    letterSpacing: 0.3,
  },
  totalValue: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: T.text,
    letterSpacing: -1,
  },
  // CTAs en fila (icono a la izquierda del texto) — diseño 01: "Otras
  // formas" flex-grow 1 / "Pago efectivo" flex-grow 1.4, altura 56, radio 16.
  ctaRow: {
    flexDirection: 'row',
    columnGap: 10,
    height: 56,
  },
  ctaOther: {
    flex: 1.2,
    height: 46,
    borderRadius: 14,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: BEIGE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 5,
    paddingHorizontal: 4,
  },
  ctaOtherText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: T.textDim,
    letterSpacing: 0.1,
  },
  ctaCash: {
    flex: 1.3,
    height: 46,
    borderRadius: 14,
    backgroundColor: BEIGE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 5,
    paddingHorizontal: 4,
  },
  ctaCashActive: {
    backgroundColor: T.accent,
  },
  ctaCashText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: T.textDim,
    letterSpacing: 0.1,
  },
  ctaCashTextActive: {
    color: WHITE,
  },
  ctaDisabled: {
    opacity: 1,
  },
});

// ─── Phone styles (layout previo) ─────────────────────────────
const p = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalizeSize(4),
    paddingTop: normalizeSize(12),
    paddingBottom: normalizeSize(4),
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    color: colors.text,
    fontSize: normalizeSize(20),
  },
  body: {
    flex: 1,
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
  payText: { color: '#FFFFFF', fontFamily: fonts.bold, fontSize: normalizeSize(16) },
  paySub: { color: '#FFFFFF', fontFamily: fonts.regular, fontSize: normalizeSize(13), marginTop: normalizeSize(2) },
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
  closeImg: { width: normalizeSize(18), height: normalizeSize(18) },
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
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: normalizeSize(14),
    flex: 1,
  },
  addCustomerArrow: { width: normalizeSize(12), height: normalizeSize(12), tintColor: colors.purplishGrey },
  noProductMsg: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: normalizeSize(20) },
  noProductText: { color: colors.purplishGrey, fontFamily: fonts.regular, fontSize: normalizeSize(14), textAlign: 'center' },
  RBSafe: { paddingTop: normalizeSize(8) },
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
