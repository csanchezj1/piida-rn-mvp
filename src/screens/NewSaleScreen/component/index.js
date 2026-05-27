import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { ActivityIndicator, Icon } from 'react-native-paper';
import { NumericFormat } from 'react-number-format';
import { LimitBanner } from '../../../components';
import { DialogContainer } from '../../../layouts';
import { fonts } from '../../../styles/basicStyles';
import { registerEventScreenMounted } from '../../../utils/analytics';

// Rediseño tablet (diseño 12 — Nueva Venta / Catálogo): pantalla standalone
// de 2 paneles. Izq = catálogo de productos (grid). Der = carrito (cliente,
// líneas, total, cobro). Toda la lógica de carrito/búsqueda/cantidades/cobro
// vive en las actions del screen y se preserva.

const BG = '#FAF5EC';
const INK = '#1A130C';
const GOLD = '#F7A928';
const DGOLD = '#C66E00';
const MUTED = '#7E6A52';
const WHITE = '#FFFFFF';
const BORDER = '#EFE3D2';
const TINT = '#FFF6E4';
const SOFT = '#FFF1D6';
const RED = '#D33A2A';
const LOW_STOCK = 6;

const Money = ({ value, style }) => (
  <NumericFormat
    value={value || 0}
    displayType="text"
    thousandSeparator="."
    decimalSeparator=","
    prefix="$"
    renderText={(v) => <Text style={style}>{v}</Text>}
  />
);

class NewSaleScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(this.props, 'Nueva venta', 'NewSaleScreen');
    if (this.props.user.features.includes('cash_management_required')) {
      this.props.actions.login();
    }
    this.props.actions.getProducts('', true);
  }

  componentWillUnmount() {
    this.props.actions.clear();
  }

  componentDidUpdate(prevProps) {
    // Recargar catálogo al cambiar de sucursal (refetchTick sube).
    if (prevProps.refetchTick !== this.props.refetchTick) {
      this.props.actions.getProducts('', true);
    }
  }

  goBack = () => {
    if (this.props.navigation.canGoBack()) this.props.navigation.goBack();
  };

  checkout = (route) => {
    if (this.props.product.length > 0) this.props.navigation.navigate(route, {from: 'NewSale'});
  };

  openCustomer = () => {
    if (this.props.customer) {
      this.props.actions.customerVisible(true);
    } else {
      this.props.navigation.navigate('Clients', { from: 'customer' });
    }
  };

  // QR habilitado solo con feature big_riders (y con caja abierta si aplica).
  getQrScan() {
    const { user, navigation } = this.props;
    if (!user.features.includes('product_extra_fields_big_riders')) return null;
    if (
      user.features.includes('cash_management_required') &&
      user.cash_id == 0
    ) {
      return null;
    }
    return () => navigation.navigate('QRScan');
  }

  // ── Header — 3 columnas: X a la izquierda, pills centrados, espacio
  //    a la derecha. Misma estética que VentaLibre para que el cajero
  //    perciba el switch de modo como un toggle, no como dos pantallas.
  renderHeader() {
    return (
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity
            style={s.backBtn}
            activeOpacity={0.7}
            onPress={() => this.props.navigation.navigate('AdvancedReports')}>
            <Text style={s.closeX}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Toggle Libre / Catálogo — Catálogo activo */}
        <View style={s.modePillsWrap}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={s.modePill}
            onPress={() => this.props.navigation.navigate('VentaLibre')}>
            <View style={s.modePillDotInactive} />
            <Text style={s.modePillText}>Venta libre</Text>
          </TouchableOpacity>
          <View style={[s.modePill, s.modePillActive]}>
            <View style={s.modePillDot} />
            <Text style={s.modePillTextActive}>Catálogo</Text>
          </View>
        </View>

        <View style={s.headerRight} />
      </View>
    );
  }

  // ── Catálogo (panel izquierdo) ───────────────────────────
  renderCatalogPanel() {
    const { list, text } = this.props;
    const qr = this.getQrScan();
    return (
      <View style={s.catalogPanel}>
        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Icon source="magnify" size={20} color={MUTED} />
            <TextInput
              style={s.searchInput}
              placeholder="Buscar producto..."
              placeholderTextColor={MUTED}
              value={text || ''}
              returnKeyType="search"
              onChangeText={(t) => this.props.actions.getProducts(t, true)}
            />
            {!!text && (
              <TouchableOpacity
                onPress={() => {
                  this.props.actions.textChange(null);
                  this.props.actions.getProducts('', true);
                }}>
                <Icon source="close-circle" size={18} color={MUTED} />
              </TouchableOpacity>
            )}
          </View>
          {qr && (
            <TouchableOpacity style={s.qrBtn} activeOpacity={0.8} onPress={qr}>
              <Icon source="qrcode-scan" size={22} color={INK} />
            </TouchableOpacity>
          )}
        </View>
        {list == null ? (
          <View style={s.centerBox}>
            <ActivityIndicator size="large" color={GOLD} />
          </View>
        ) : list.length === 0 ? (
          <View style={s.centerBox}>
            <Icon source="package-variant" size={48} color={BORDER} />
            <Text style={s.emptyTxt}>No se encontraron productos</Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={s.grid}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {list.map((item, i) =>
              this.props.user.features.includes(
                'product_extra_fields_production_date',
              )
                ? this.renderCategoryCard(item, i)
                : this.renderProductCard(item, i),
            )}
          </ScrollView>
        )}
      </View>
    );
  }

  renderProductCard(item, key) {
    const inCart = this.props.product.find((p) => p.nid === item.nid);
    const qty = inCart ? Number(inCart.qty) : 0;
    const avail = item.available == null ? null : Number(item.available);
    const low = avail != null && avail <= LOW_STOCK;
    const cat = item.category || item.category_name;
    return (
      <TouchableOpacity
        key={item.nid || key}
        activeOpacity={0.85}
        onPress={() => this.props.actions.selectProduct(item)}
        style={[s.card, !!inCart && s.cardActive]}>
        <View style={s.cardTop}>
          {cat ? (
            <Text style={s.cardTag}>{String(cat).toUpperCase()}</Text>
          ) : (
            <View />
          )}
          {avail != null && (
            <Text style={[s.cardStock, low && s.cardStockLow]}>
              {avail} en stock
            </Text>
          )}
        </View>
        <Text style={s.cardName} numberOfLines={2}>
          {item.name || item.label}
        </Text>
        <View style={s.cardBottom}>
          <Money value={item.price} style={s.cardPrice} />
          {inCart ? (
            <View style={s.stepper}>
              <TouchableOpacity
                style={s.stepBtn}
                onPress={() => this.props.actions.removeProduct(item)}>
                <Icon source="minus" size={16} color={DGOLD} />
              </TouchableOpacity>
              <Text style={s.stepQty}>{qty}</Text>
              <TouchableOpacity
                style={s.stepBtn}
                onPress={() => this.props.actions.selectProduct(item)}>
                <Icon source="plus" size={16} color={DGOLD} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.addBtn}>
              <Icon source="plus" size={16} color={WHITE} />
              <Text style={s.addBtnTxt}>Agregar</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  renderCategoryCard(item, key) {
    return (
      <TouchableOpacity
        key={item.tid || key}
        activeOpacity={0.85}
        style={s.card}
        onPress={() =>
          this.props.navigation.navigate('ProductVariations', {
            cat: item.tid,
            catName: item.name,
            from: 'newSale',
          })
        }>
        <Text style={s.cardName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={s.cardBottom}>
          <Text style={s.catLink}>Ver variaciones</Text>
          <Icon source="chevron-right" size={20} color={GOLD} />
        </View>
      </TouchableOpacity>
    );
  }

  // ── Carrito (panel derecho) ──────────────────────────────
  renderCartPanel() {
    const { product, customer } = this.props;
    const units = product.reduce((sum, p) => sum + Number(p.qty || 0), 0);
    return (
      <View style={s.cartPanel}>
        <TouchableOpacity
          style={s.customerCard}
          activeOpacity={0.85}
          onPress={this.openCustomer}>
          <View style={s.customerIcon}>
            <Icon source="account-outline" size={22} color={DGOLD} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.customerName} numberOfLines={1}>
              {customer ? customer.label : 'Agregar cliente'}
            </Text>
            <Text style={s.customerSub} numberOfLines={1}>
              {customer
                ? 'Toca para ver o quitar'
                : 'Toca para vincular un cliente'}
            </Text>
          </View>
          <View style={s.customerAdd}>
            <Icon source={customer ? 'pencil' : 'plus'} size={18} color={DGOLD} />
          </View>
        </TouchableOpacity>

        <View style={s.cartHeader}>
          <Text style={s.cartHeaderLabel}>TU VENTA</Text>
          <Text style={s.cartHeaderCount}>
            {units} {units === 1 ? 'unidad' : 'unidades'}
          </Text>
        </View>

        {product.length === 0 ? (
          <View style={s.cartEmpty}>
            <Icon source="cart-outline" size={44} color={BORDER} />
            <Text style={s.cartEmptyTxt}>
              Aún no has agregado productos a la venta
            </Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {product.map((item, i) => this.renderCartLine(item, i))}
          </ScrollView>
        )}

        {this.renderTotal(units)}
      </View>
    );
  }

  renderCartLine(item, key) {
    const editable = this.props.user.features.includes(
      'sale_edit_product_price',
    );
    const cat = item.category || item.category_name;
    const qty = Number(item.qty || 0);
    return (
      <View key={item.nid || key} style={s.line}>
        <View style={s.lineTop}>
          {cat ? (
            <Text style={s.lineTag}>{String(cat).toUpperCase()}</Text>
          ) : (
            <View />
          )}
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => this.props.actions.deleteProduct(item)}>
            <Icon source="trash-can-outline" size={20} color={RED} />
          </TouchableOpacity>
        </View>

        <Text style={s.lineName} numberOfLines={2}>
          {item.label || item.name}
        </Text>

        {editable ? (
          <View>
            <View style={s.priceEditRow}>
              <Text style={s.lineUnit}>$</Text>
              <TextInput
                style={s.priceInput}
                keyboardType="numeric"
                value={String(item.price)}
                onChangeText={(t) => this.props.actions.priceChange(t, item)}
              />
              <Text style={s.lineUnit}>cada uno</Text>
            </View>
            <TouchableOpacity
              style={s.checkRow}
              onPress={() => this.props.actions.checkChange(item)}>
              <Icon
                source={
                  item.edit_product
                    ? 'checkbox-marked'
                    : 'checkbox-blank-outline'
                }
                size={18}
                color={item.edit_product ? GOLD : MUTED}
              />
              <Text style={s.checkTxt}>Guardar precio en el producto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.lineUnitWrap}>
            <Money value={item.price} style={s.lineUnitPrice} />
            <Text style={s.lineUnitSuffix}> cada uno</Text>
          </View>
        )}

        <View style={s.lineBottom}>
          <View style={s.stepper}>
            <TouchableOpacity
              style={s.stepBtn}
              onPress={() => this.props.actions.removeProduct(item)}>
              <Icon source="minus" size={16} color={DGOLD} />
            </TouchableOpacity>
            <TextInput
              style={s.stepInput}
              keyboardType="numeric"
              value={String(item.qty)}
              onChangeText={(t) => this.props.actions.qtyChange(t, item)}
            />
            <TouchableOpacity
              style={s.stepBtn}
              onPress={() => this.props.actions.addProduct(item)}>
              <Icon source="plus" size={16} color={DGOLD} />
            </TouchableOpacity>
          </View>
          <Money value={item.price * qty} style={s.lineTotal} />
        </View>
      </View>
    );
  }

  renderTotal(units) {
    const { product, total } = this.props;
    const disabled = product.length === 0;
    return (
      <View style={s.totalBlock}>
        <View style={s.totalRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.totalLabel}>TOTAL A COBRAR</Text>
            <Money value={total} style={s.totalAmount} />
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.totalMeta}>
              {units} {units === 1 ? 'unidad' : 'unidades'}
            </Text>
            <Text style={s.totalMeta}>
              en {product.length}{' '}
              {product.length === 1 ? 'producto' : 'productos'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[s.payBtn, disabled && s.payBtnDisabled]}
          activeOpacity={0.85}
          disabled={disabled}
          onPress={() => this.checkout('ConfirmCashOrder')}>
          <Icon source="credit-card-outline" size={20} color={WHITE} />
          <Text style={s.payBtnTxt}>Pago en efectivo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.otherPay}
          disabled={disabled}
          onPress={() => this.checkout('ConfirmOrder')}>
          <Text style={[s.otherPayTxt, disabled && { color: MUTED }]}>
            Otras formas de pago
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Estados que bloquean la venta ────────────────────────
  renderCashBlocked() {
    return (
      <View style={s.blockWrap}>
        <View style={s.blockCard}>
          <View style={s.blockIcon}>
            <Icon source="cash-register" size={36} color={DGOLD} />
          </View>
          <Text style={s.blockTitle}>Aún no puedes registrar ventas</Text>
          <Text style={s.blockMsg}>
            Debes iniciar tu turno antes de registrar una venta. Inicia tu
            turno abriendo la caja.
          </Text>
          <TouchableOpacity
            style={s.blockBtn}
            activeOpacity={0.85}
            onPress={() =>
              this.props.navigation.navigate('Box', { type: 'openBox' })
            }>
            <Text style={s.blockBtnTxt}>Abrir caja</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderLimitBlocked() {
    return (
      <View style={s.blockWrap}>
        <View style={{ width: '100%', maxWidth: 520 }}>
          <LimitBanner
            title="Llegaste al límite diario 🎉"
            message={
              'Tu Plan Gratis incluye 30 ventas por día. Mejorá a Plan Básico ($19.000/mes) para registrar ventas ilimitadas y desbloquear más funciones.'
            }
            ctaLabel="Mejorar mi plan"
            onPress={() => this.props.navigation.navigate('Billing')}
            variant="warning"
          />
        </View>
      </View>
    );
  }

  renderCustomerDialog() {
    const { customer, customerVisible, actions } = this.props;
    if (!customer) return null;
    return (
      <DialogContainer visible={customerVisible} style={s.dialog}>
        <TouchableOpacity
          style={s.dialogClose}
          onPress={() => actions.customerVisible(false)}>
          <Icon source="close" size={22} color={INK} />
        </TouchableOpacity>
        <Text style={s.dialogTitle}>Datos del cliente</Text>
        {this.renderDialogRow('Nombre', customer.label)}
        {this.renderDialogRow('Número telefónico', customer.phone)}
        {this.renderDialogRow('Número de identificación', customer.id_number)}
        {this.renderDialogRow('Dirección', customer.address)}
        {this.renderDialogRow('Correo electrónico', customer.email)}
        <TouchableOpacity
          style={s.removeCustomer}
          onPress={() => actions.removeCustomer()}>
          <Icon source="account-remove-outline" size={18} color={RED} />
          <Text style={s.removeCustomerTxt}>
            Remover cliente de la venta
          </Text>
        </TouchableOpacity>
      </DialogContainer>
    );
  }

  renderDialogRow(label, value) {
    if (!value) return null;
    return (
      <View style={s.dialogRow}>
        <Text style={s.dialogLabel}>{label}</Text>
        <Text style={s.dialogValue}>{value}</Text>
      </View>
    );
  }

  render() {
    const { user } = this.props;
    // Regla de negocio: sin turno/caja abierto no se vende, sin excepciones.
    // Fuente de verdad: cashShiftData.activeShiftId (branch-aware, refresh
    // on focus del Stack). `user.cash_id` quedaba stale si la caja se
    // operaba desde otra sesión, por eso lo dejamos como fallback solamente.
    const hasOpenShift =
      (Number(this.props.cashShiftActiveId) || 0) > 0 ||
      (Number(user?.cash_id) || 0) > 0;
    const cashBlocked = !hasOpenShift;
    const limitBlocked = !user.orders_limit;
    return (
      <SafeAreaView style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {this.renderHeader()}
        {cashBlocked ? (
          this.renderCashBlocked()
        ) : limitBlocked ? (
          this.renderLimitBlocked()
        ) : (
          <View style={s.body}>
            {this.renderCatalogPanel()}
            {this.renderCartPanel()}
          </View>
        )}
        {this.renderCustomerDialog()}
      </SafeAreaView>
    );
  }
}

const s = StyleSheet.create({
  // Pantalla full-bleed (sin sidebar AppShell) — comportamiento idéntico a
  // VentaLibre para que las dos pantallas de venta se sientan iguales.
  root: {flex: 1, backgroundColor: BG},
  // Header propio inline — espejado pixel-a-pixel del de VentaLibre para
  // que los pills queden al mismo nivel y el cajero perciba ambas pantallas
  // como dos modos de la misma vista (height/padding/bg idénticos).
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 20,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 30, 10, 0.07)',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: {
    fontFamily: fonts.medium,
    fontSize: 20,
    color: INK,
    includeFontPadding: false,
  },
  // Columnas del header (mismas que VentaLibre para que el toggle quede
  // centrado horizontalmente).
  headerLeft: {flex: 1, flexDirection: 'row', alignItems: 'center', columnGap: 8},
  headerRight: {flex: 1},

  // Toggle modo de venta — pills segmented control. Catálogo activo en
  // negro con dot naranja; "Venta libre" outline → toca y va a VentaLibre.
  // Beige #F7F0E8 idéntico al de VentaLibre para que el wrap se vea igual.
  modePillsWrap: {
    flexDirection: 'row',
    backgroundColor: '#F7F0E8',
    borderRadius: 999,
    padding: 4,
    columnGap: 4,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  modePillActive: {backgroundColor: INK},
  modePillDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5A1F'},
  modePillDotInactive: {width: 8, height: 8, borderRadius: 4, backgroundColor: MUTED, opacity: 0.5},
  modePillText: {fontFamily: fonts.semiBold, fontSize: 12, color: MUTED},
  modePillTextActive: {fontFamily: fonts.bold, fontSize: 12, color: WHITE},

  // Body 2 paneles
  body: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    columnGap: 16,
  },
  catalogPanel: { flex: 1.7 },
  cartPanel: { flex: 1 },

  // Buscador
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    marginBottom: 14,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: INK,
    padding: 0,
  },
  qrBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Grid catálogo
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 8,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 10,
  },
  emptyTxt: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: MUTED,
  },

  // Card de producto
  card: {
    width: '48%',
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
  },
  cardActive: {
    borderColor: GOLD,
    backgroundColor: TINT,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTag: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: DGOLD,
    letterSpacing: 0.5,
  },
  cardStock: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: MUTED,
  },
  cardStockLow: { color: RED },
  cardName: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: INK,
    marginBottom: 14,
    minHeight: 40,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: INK,
  },
  catLink: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: GOLD,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    backgroundColor: GOLD,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addBtnTxt: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: WHITE,
  },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
  },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GOLD,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepQty: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: INK,
    minWidth: 22,
    textAlign: 'center',
  },
  stepInput: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: INK,
    minWidth: 38,
    height: 30,
    textAlign: 'center',
    padding: 0,
  },

  // Carrito — cliente
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  customerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: INK,
  },
  customerSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: MUTED,
    marginTop: 1,
  },
  customerAdd: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Carrito — encabezado lista
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cartHeaderLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: MUTED,
    letterSpacing: 1,
  },
  cartHeaderCount: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: MUTED,
  },
  cartEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 10,
    paddingHorizontal: 20,
  },
  cartEmptyTxt: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
  },

  // Carrito — línea
  line: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 12,
  },
  lineTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  lineTag: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: DGOLD,
    letterSpacing: 0.5,
    backgroundColor: SOFT,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    overflow: 'hidden',
  },
  lineName: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: INK,
    marginBottom: 4,
  },
  lineUnitWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  lineUnitPrice: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: MUTED,
  },
  lineUnitSuffix: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
  },
  lineBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  lineTotal: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: INK,
  },

  // Línea — edición de precio (feature sale_edit_product_price)
  priceEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    marginVertical: 2,
  },
  lineUnit: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
  },
  priceInput: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: INK,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 80,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    marginTop: 4,
  },
  checkTxt: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: MUTED,
  },

  // Carrito — total + cobro
  totalBlock: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 12,
    marginTop: 12,
    rowGap: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: MUTED,
    letterSpacing: 1,
    marginBottom: 2,
  },
  totalAmount: {
    fontFamily: fonts.bold,
    fontSize: 30,
    color: INK,
  },
  totalMeta: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: MUTED,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    backgroundColor: INK,
    borderRadius: 14,
    height: 54,
  },
  payBtnDisabled: { opacity: 0.4 },
  payBtnTxt: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: WHITE,
  },
  otherPay: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  otherPayTxt: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: DGOLD,
  },

  // Estados bloqueantes
  blockWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  blockCard: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    maxWidth: 460,
    rowGap: 8,
  },
  blockIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  blockTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: INK,
    textAlign: 'center',
  },
  blockMsg: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 19,
  },
  blockBtn: {
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  blockBtnTxt: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: WHITE,
  },

  // Dialog cliente
  dialog: {
    height: undefined,
    maxHeight: '85%',
    alignSelf: 'center',
    width: '88%',
    maxWidth: 460,
    borderRadius: 20,
    padding: 22,
  },
  dialogClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dialogTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: INK,
    marginTop: 4,
    marginBottom: 14,
  },
  dialogRow: { marginBottom: 12 },
  dialogLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: MUTED,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dialogValue: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: INK,
  },
  removeCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 6,
    marginTop: 8,
    paddingVertical: 10,
  },
  removeCustomerTxt: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: RED,
  },
});

export default NewSaleScreen;
