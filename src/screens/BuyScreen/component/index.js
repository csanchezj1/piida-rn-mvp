import React, {Component} from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon, Text} from 'react-native-paper';
import AppShell from '../../../layouts/AppShell';
import {SaleProductItem} from '../../../components';
import {fonts} from '../../../styles/basicStyles';
import {fieldErrors} from '../../../utils/screenFunctions';
import {registerEventScreenMounted} from '../../../utils/analytics';

// Paleta — alineada con el rediseño tablet.
const BG = '#FAF5EC';
const INK = '#1A130C';
const GOLD = '#F7A928';
const DGOLD = '#C66E00';
const MUTED = '#7E6A52';
const SUBTLE = '#A89580';
const WHITE = '#FFFFFF';
const BORDER_SOFT = '#EFE3D2';
const TINT_GOLD = '#FFF6E1';
const RED = '#D7263D';
const ACCENT = '#FF5A1F';

// Iconos por tipo de gasto (matching del mockup 32).
const ICON_BY_LABEL = {
  'Servicios públicos': 'lightbulb-outline',
  Servicios: 'lightbulb-outline',
  Arriendo: 'home-city-outline',
  Nómina: 'account-group-outline',
  'Compra de productos': 'package-variant',
  Transporte: 'truck-outline',
  Otro: 'note-text-outline',
};

const parseMoney = (s) => Number(String(s || '').replace(/[^0-9]/g, '')) || 0;
const fmtMoney = (n) => Number(n || 0).toLocaleString('es-CO', {maximumFractionDigits: 0});

class BuyScreen extends Component {
  state = {
    paymentPickerOpen: false,
  };

  componentDidMount() {
    this.props.actions.getFieldsInfo(this.props.user.company);
    registerEventScreenMounted(this.props, 'Formulario gasto', 'BuyScreen');
    if (this.props.user.features?.includes('cash_management_required')) {
      this.props.actions.login();
    }
  }

  componentWillUnmount() {
    this.props.actions.clearScreen();
  }

  isProductBuy() {
    const e = this.props.expense;
    return !!(e && (e.label === 'Compra de productos' || e.value === 50));
  }

  hasOpenShift() {
    const u = this.props.user || {};
    return (
      !u.features?.includes('cash_management_required') || Number(u.cash_id) > 0
    );
  }

  total() {
    if (this.isProductBuy()) {
      return (this.props.product || []).reduce((sum, it) => {
        const price = parseMoney(it.price);
        const qty = Number(it.qty) || 1;
        return sum + price * qty;
      }, 0);
    }
    return parseMoney(this.props.value);
  }

  // ── Sub-header ────────────────────────────────────────────
  renderSubHeader() {
    return (
      <View style={st.subHeader}>
        <TouchableOpacity
          style={st.backBtn}
          activeOpacity={0.85}
          onPress={() => this.props.navigation.goBack()}>
          <Icon source="chevron-left" size={24} color={INK} />
        </TouchableOpacity>
        <View style={{flex: 1, marginLeft: 8}}>
          <Text style={st.title}>Registrar gasto</Text>
          <Text style={st.subtitle}>Nuevo egreso de caja</Text>
        </View>
      </View>
    );
  }

  // ── Tipo de gasto (grid 3 columnas) ──────────────────────
  renderTypeGrid() {
    const types = this.props.expenseType || [];
    const expenseErr = fieldErrors('expense', this.props.errors);
    const selectedId = this.props.expense?.value;
    return (
      <View style={{marginBottom: 22}}>
        <Text style={st.sectionTitle}>Tipo de gasto</Text>
        <View style={st.grid}>
          {types.map((t) => {
            const on = selectedId === t.value;
            const icon = ICON_BY_LABEL[t.label] || 'note-text-outline';
            return (
              <TouchableOpacity
                key={t.value}
                activeOpacity={0.85}
                onPress={() => this.props.actions.expenseTypeChange(t)}
                style={[st.typeCard, on && st.typeCardActive]}>
                <View style={[st.typeIcon, on && st.typeIconActive]}>
                  <Icon source={icon} size={20} color={on ? DGOLD : MUTED} />
                </View>
                <Text style={[st.typeLabel, on && st.typeLabelActive]} numberOfLines={1}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {!!expenseErr && <Text style={st.fieldError}>{expenseErr}</Text>}
      </View>
    );
  }

  // ── Field card genérico (valor/forma pago/observaciones) ─
  renderValueCard() {
    const err = fieldErrors('value', this.props.errors);
    const n = parseMoney(this.props.value);
    return (
      <View style={[st.fieldCard, err && st.fieldCardError]}>
        <Text style={st.fieldLabel}>VALOR DEL GASTO</Text>
        <View style={{flexDirection: 'row', alignItems: 'center', columnGap: 8}}>
          <Text style={st.moneyPrefix}>$</Text>
          <TextInput
            style={st.moneyInput}
            placeholder="0"
            placeholderTextColor={SUBTLE}
            value={n ? n.toLocaleString('es-CO', {maximumFractionDigits: 0}).replace(/,/g, '.') : ''}
            onChangeText={(t) => this.props.actions.valueChange(t)}
            keyboardType="numeric"
            underlineColorAndroid="transparent"
          />
        </View>
        {!!err && <Text style={st.fieldError}>{err}</Text>}
      </View>
    );
  }

  renderPaymentCard() {
    const err = fieldErrors('payment', this.props.errors);
    const label = this.props.payment?.label;
    return (
      <View style={{marginBottom: 12}}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[st.fieldCard, err && st.fieldCardError]}
          onPress={() => this.setState({paymentPickerOpen: true})}>
          <Text style={st.fieldLabel}>FORMA DE PAGO</Text>
          <View style={st.fieldRow}>
            <Text style={[st.fieldValue, !label && {color: SUBTLE}]} numberOfLines={1}>
              {label || 'Seleccionar...'}
            </Text>
            <Icon source="chevron-down" size={20} color={MUTED} />
          </View>
        </TouchableOpacity>
        {!!err && <Text style={st.fieldError}>{err}</Text>}
      </View>
    );
  }

  renderObsCard() {
    return (
      <View style={[st.fieldCard, {marginBottom: 12}]}>
        <Text style={st.fieldLabel}>OBSERVACIONES</Text>
        <TextInput
          style={[st.fieldInput, {minHeight: 60}]}
          placeholder="Detalle (opcional)"
          placeholderTextColor={SUBTLE}
          value={this.props.obs || ''}
          onChangeText={(t) => this.props.actions.obsChange(t)}
          multiline
          underlineColorAndroid="transparent"
        />
      </View>
    );
  }

  // ── Compra de productos (provider + items) ────────────────
  renderProductsBlock() {
    const productErr = fieldErrors('product', this.props.errors);
    const providerErr = fieldErrors('provider', this.props.errors);
    return (
      <View style={{marginBottom: 12}}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[st.fieldCard, providerErr && st.fieldCardError]}
          onPress={() => this.props.navigation.navigate('Providers', {from: 'provider'})}>
          <Text style={st.fieldLabel}>PROVEEDOR</Text>
          <View style={st.fieldRow}>
            <Text style={[st.fieldValue, !this.props.provider?.label && {color: SUBTLE}]} numberOfLines={1}>
              {this.props.provider?.label || 'Tocá para seleccionar'}
            </Text>
            <Icon source="chevron-right" size={20} color={MUTED} />
          </View>
        </TouchableOpacity>
        {!!providerErr && <Text style={st.fieldError}>{providerErr}</Text>}

        <TouchableOpacity
          activeOpacity={0.85}
          style={[st.fieldCard, {marginTop: 12}, productErr && st.fieldCardError]}
          onPress={() => this.props.navigation.navigate('Provider', {from: 'buy_product'})}>
          <Text style={st.fieldLabel}>PRODUCTOS</Text>
          <View style={st.fieldRow}>
            <Text style={[st.fieldValue, {color: DGOLD}]}>+ Agregar productos</Text>
            <Icon source="chevron-right" size={20} color={MUTED} />
          </View>
        </TouchableOpacity>
        {!!productErr && <Text style={st.fieldError}>{productErr}</Text>}

        {(this.props.product || []).length > 0 && (
          <View style={{marginTop: 10, rowGap: 6}}>
            {this.props.product.map((item, index) => (
              <SaleProductItem
                key={index}
                name={item.label}
                qty={item.qty + ''}
                value={item.price}
                onAdd={() => this.props.actions.addProduct(item)}
                onRemove={() => this.props.actions.removeProduct(item)}
                onDelete={() => this.props.actions.deleteProduct(item)}
                onChangeQty={(qty) => this.props.actions.qtyChange(qty, item)}
                onChangePrice={(p) => this.props.actions.priceChange(p, item)}
              />
            ))}
          </View>
        )}
      </View>
    );
  }

  // ── Modal selector de forma de pago ──
  renderPaymentPicker() {
    if (!this.state.paymentPickerOpen) return null;
    const options = this.props.paymentsType || [];
    return (
      <Modal
        visible
        transparent
        animationType="fade"
        onRequestClose={() => this.setState({paymentPickerOpen: false})}>
        <TouchableOpacity
          activeOpacity={1}
          style={st.modalBackdrop}
          onPress={() => this.setState({paymentPickerOpen: false})}>
          <View style={st.modalPanel}>
            <Text style={st.modalTitle}>Forma de pago</Text>
            <ScrollView style={{maxHeight: 320}}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={String(opt.value)}
                  activeOpacity={0.7}
                  style={st.modalItem}
                  onPress={() => {
                    this.setState({paymentPickerOpen: false});
                    this.props.actions.paymentChange(opt);
                  }}>
                  <Text style={st.modalItemTxt}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  // ── Bloqueo sin caja abierta ──
  renderCashBlocked() {
    return (
      <View style={st.blockedWrap}>
        <View style={st.blockedIcon}>
          <Icon source="cash-register" size={32} color={DGOLD} />
        </View>
        <Text style={st.blockedTitle}>Aún no podés registrar gastos</Text>
        <Text style={st.blockedSub}>
          Tenés que iniciar tu turno abriendo la caja antes de registrar un gasto.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={st.blockedBtn}
          onPress={() => this.props.navigation.navigate('Box', {type: 'openBox'})}>
          <Text style={st.blockedBtnTxt}>Abrir caja</Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    if (!this.hasOpenShift()) {
      return (
        <AppShell active="venta">
          <View style={st.body}>
            {this.renderSubHeader()}
            {this.renderCashBlocked()}
          </View>
        </AppShell>
      );
    }

    const isProducts = this.isProductBuy();
    const total = this.total();

    return (
      <AppShell active="movimientos">
        <View style={st.body}>
          {this.renderSubHeader()}
          <ScrollView
            style={{flex: 1}}
            contentContainerStyle={{paddingBottom: 120}}
            showsVerticalScrollIndicator={false}>
            {this.renderTypeGrid()}

            <Text style={st.sectionTitle}>Detalle</Text>
            <View style={{rowGap: 12}}>
              {isProducts ? this.renderProductsBlock() : this.renderValueCard()}
              {this.renderPaymentCard()}
              {this.renderObsCard()}
            </View>
          </ScrollView>

          {/* CTA sticky */}
          <View style={st.ctaWrap}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[st.ctaBtn, total <= 0 && st.ctaBtnDisabled]}
              disabled={total <= 0}
              onPress={() =>
                this.props.actions.createPurchase({
                  uid: this.props.user.uid,
                  navigation: this.props.navigation,
                })
              }>
              <Icon source="arrow-down-bold" size={18} color={WHITE} />
              <Text style={st.ctaTxt}>
                Registrar gasto{total > 0 ? ` de $${fmtMoney(total)}` : ''}
              </Text>
            </TouchableOpacity>
          </View>

          {this.renderPaymentPicker()}
        </View>
      </AppShell>
    );
  }
}

const st = StyleSheet.create({
  body: {flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 12},

  // Sub-header
  subHeader: {flexDirection: 'row', alignItems: 'center', paddingBottom: 18},
  backBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {fontFamily: fonts.bold, fontSize: 22, color: INK, letterSpacing: -0.3},
  subtitle: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},

  sectionTitle: {fontFamily: fonts.bold, fontSize: 16, color: INK, marginBottom: 10, marginTop: 4},

  // Grid tipo de gasto
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  typeCard: {
    width: '32%',
    flexDirection: 'row', alignItems: 'center', columnGap: 10,
    backgroundColor: WHITE, borderRadius: 14,
    borderWidth: 1.5, borderColor: BORDER_SOFT,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  typeCardActive: {borderColor: GOLD, backgroundColor: TINT_GOLD},
  typeIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT,
    alignItems: 'center', justifyContent: 'center',
  },
  typeIconActive: {backgroundColor: WHITE, borderColor: GOLD},
  typeLabel: {flex: 1, fontFamily: fonts.semiBold, fontSize: 12, color: INK},
  typeLabelActive: {color: DGOLD},

  // Field cards (valor / forma pago / observaciones)
  fieldCard: {
    backgroundColor: WHITE, borderRadius: 14,
    borderWidth: 1.5, borderColor: BORDER_SOFT,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  fieldCardError: {borderColor: RED},
  fieldLabel: {
    fontFamily: fonts.bold, fontSize: 10, color: DGOLD,
    letterSpacing: 1, marginBottom: 6,
  },
  fieldRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  fieldValue: {fontFamily: fonts.semiBold, fontSize: 15, color: INK, flex: 1},
  fieldInput: {
    fontFamily: fonts.regular, fontSize: 14, color: INK,
    paddingVertical: 4, padding: 0, margin: 0,
  },
  moneyPrefix: {fontFamily: fonts.bold, fontSize: 22, color: DGOLD},
  moneyInput: {
    flex: 1, fontFamily: fonts.bold, fontSize: 26, color: INK,
    paddingVertical: 0, padding: 0,
  },
  fieldError: {fontFamily: fonts.regular, fontSize: 11, color: RED, marginTop: 4, marginLeft: 4},

  // CTA sticky
  ctaWrap: {position: 'absolute', left: 20, right: 20, bottom: 20},
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    columnGap: 10, backgroundColor: ACCENT, borderRadius: 14,
    paddingVertical: 18,
    shadowColor: '#3C1E0A', shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.18, shadowRadius: 10, elevation: 4,
  },
  ctaBtnDisabled: {backgroundColor: SUBTLE, shadowOpacity: 0},
  ctaTxt: {fontFamily: fonts.bold, fontSize: 15, color: WHITE},

  // Bloqueo caja
  blockedWrap: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24},
  blockedIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FFF4EB', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  blockedTitle: {fontFamily: fonts.bold, fontSize: 18, color: INK, textAlign: 'center', marginBottom: 6},
  blockedSub: {fontFamily: fonts.regular, fontSize: 14, color: MUTED, textAlign: 'center', marginBottom: 22, lineHeight: 20, maxWidth: 360},
  blockedBtn: {backgroundColor: ACCENT, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14},
  blockedBtnTxt: {fontFamily: fonts.bold, fontSize: 15, color: WHITE},

  // Modal picker
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(26,19,12,0.45)',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20,
  },
  modalPanel: {
    width: '100%', maxWidth: 380, backgroundColor: WHITE,
    borderRadius: 18, paddingVertical: 14, paddingHorizontal: 8,
  },
  modalTitle: {
    fontFamily: fonts.bold, fontSize: 14, color: INK,
    textAlign: 'center', paddingHorizontal: 12, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: BORDER_SOFT, marginBottom: 4,
  },
  modalItem: {paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10},
  modalItemTxt: {fontFamily: fonts.semiBold, fontSize: 15, color: INK},
});

export default BuyScreen;
