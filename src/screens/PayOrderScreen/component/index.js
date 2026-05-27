import React, {Component} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Icon, Text, TextInput} from 'react-native-paper';
import {NumericFormat} from 'react-number-format';
import AppShell from '../../../layouts/AppShell';
import {fonts} from '../../../styles/basicStyles';
import {fieldErrors} from '../../../utils/screenFunctions';
import {registerEventScreenMounted} from '../../../utils/analytics';

// Paleta tablet (alineada con ConfirmOrder / Trasferencia).
const BG = '#FAF5EC';
const INK = '#1A130C';
const GOLD = '#F7A928';
const DGOLD = '#C66E00';
const ACCENT = '#FF5A1F';
const MUTED = '#7E6A52';
const WHITE = '#FFFFFF';
const BORDER = '#EFE3D2';
const SOFT = '#FFF6E1';
const SOFT_STRONG = '#FFE3B0';
const GREEN_TXT = '#1F8A4C';
const RED = '#D33A2A';
const PILL_BG = '#FFF1D6';
const PILL_TXT = '#C66E00';

// Iconos por nombre de medio de pago.
const methodIcon = (label) => {
  const l = String(label || '').toLowerCase();
  if (l.includes('efectivo')) return 'cash';
  if (
    l.includes('datáfono') ||
    l.includes('datafono') ||
    l.includes('tarjeta') ||
    l.includes('crédito') ||
    l.includes('credito') ||
    l.includes('débito') ||
    l.includes('debito')
  ) {
    return 'credit-card-outline';
  }
  if (l.includes('transfer')) return 'bank-outline';
  if (l.includes('nequi') || l.includes('daviplata') || l.includes('qr')) {
    return 'cellphone';
  }
  return 'wallet-outline';
};

class PayOrderScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(this.props, 'Abonar a la orden', 'PayOrderScreen');
    this.props.actions.getFieldsInfo();
    const order = this.props.route?.params?.order;
    if (order?.nid) this.props.actions.getItems(order.nid);
    // Este rediseño usa un único medio de pago — fijamos paymentsQty=1.
    this.props.actions.paymentsQtyChange({label: 1, value: 1});
  }

  componentWillUnmount() {
    this.props.actions.clearScreen();
  }

  getOrder() {
    return this.props.route?.params?.order || {};
  }

  pending() {
    const o = this.getOrder();
    const v = (o.value || 0) - (o.paid || 0);
    return v > 0 ? v : 0;
  }

  // ── Quick amounts ─────────────────────────────────────────
  quickAmounts() {
    const p = this.pending();
    return [
      {label: 'Total pendiente', value: p},
      {label: 'Mitad', value: Math.round(p / 2)},
      {label: '$10.000', value: 10000},
      {label: '$20.000', value: 20000},
    ];
  }

  setAmount = (n) => {
    this.props.actions.valueChange(String(n), 0);
  };

  setMethod = (m) => {
    this.props.actions.paymentChange(m, 0);
  };

  confirm = () => {
    const order = this.getOrder();
    this.props.actions.confirmOrder({
      uid: this.props.user.uid,
      navigation: this.props.navigation,
      total: this.pending(),
      order,
      orderTotal: order.value,
      paid: order.paid,
    });
  };

  // ── Sub-header ────────────────────────────────────────────
  renderSubHeader() {
    const o = this.getOrder();
    const sub = [
      o.consecutive ? `Orden #${o.consecutive}` : null,
      o.customer || null,
    ].filter(Boolean).join(' · ');
    return (
      <View style={s.subHeader}>
        <TouchableOpacity
          style={s.backBtn}
          activeOpacity={0.85}
          onPress={() => this.props.navigation.goBack()}>
          <Icon source="chevron-left" size={24} color={INK} />
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <View style={s.titleRow}>
            <Text style={s.title}>Abonar a la orden</Text>
            <View style={s.statusBadge}>
              <Icon source="clock-outline" size={11} color={PILL_TXT} />
              <Text style={s.statusTxt}>PENDIENTE</Text>
            </View>
          </View>
          {!!sub && <Text style={s.subtitle}>{sub}</Text>}
        </View>
      </View>
    );
  }

  // ── Card "valor pendiente" ───────────────────────────────
  renderPendingCard() {
    const o = this.getOrder();
    return (
      <View style={s.pendingCard}>
        <Text style={s.pendingLabel}>VALOR PENDIENTE POR PAGAR</Text>
        <View style={s.pendingRow}>
          <Text style={s.pendingSign}>$</Text>
          <NumericFormat
            value={this.pending()}
            displayType="text"
            thousandSeparator="."
            decimalSeparator=","
            renderText={(v) => (
              <Text style={s.pendingValue} numberOfLines={1} adjustsFontSizeToFit>
                {v}
              </Text>
            )}
          />
          <Text style={s.pendingCop}>COP</Text>
        </View>
        <View style={s.pendingFooter}>
          <View style={{flex: 1}}>
            <Text style={s.pendingFootLabel}>TOTAL ORDEN</Text>
            <NumericFormat
              value={o.value || 0}
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="$"
              renderText={(v) => <Text style={s.pendingFootValue}>{v}</Text>}
            />
          </View>
          <View style={{flex: 1, alignItems: 'flex-end'}}>
            <Text style={s.pendingFootLabel}>YA PAGADO</Text>
            <NumericFormat
              value={o.paid || 0}
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="$"
              renderText={(v) => (
                <Text style={[s.pendingFootValue, {color: GREEN_TXT}]}>{v}</Text>
              )}
            />
          </View>
        </View>
      </View>
    );
  }

  // ── Medio de pago — chips horizontales compactos ──────────
  renderMethods() {
    const {paymentsType, payment, errors} = this.props;
    const sel = payment?.[0]?.type;
    const err =
      fieldErrors('payment', errors) !== '' ||
      (this.props.errorArr || []).some((e) => e.index === 0 && !e.type);
    return (
      <View style={{marginTop: 10}}>
        <Text style={s.sectionLabel}>Medio de pago</Text>
        <View style={s.methodRow}>
          {(paymentsType || []).map((m) => {
            const on = sel && sel.value === m.value;
            return (
              <TouchableOpacity
                key={m.value}
                activeOpacity={0.85}
                style={[s.methodChip, on && s.methodChipOn]}
                onPress={() => this.setMethod(m)}>
                <Icon
                  source={methodIcon(m.label)}
                  size={16}
                  color={on ? DGOLD : MUTED}
                />
                <Text
                  style={[s.methodChipTxt, on && {color: DGOLD}]}
                  numberOfLines={1}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {err && (
          <Text style={s.errorTxt}>Selecciona un medio de pago.</Text>
        )}
      </View>
    );
  }

  // ── Valor a abonar ───────────────────────────────────────
  renderValueInput() {
    const {payment, errors} = this.props;
    const raw = payment?.[0]?.value || '';
    const intVal = parseInt(String(raw).replace(/[^0-9]/g, ''), 10) || 0;
    const err =
      fieldErrors('payment', errors) !== '' ||
      (this.props.errorArr || []).some((e) => e.index === 0 && !e.value);
    return (
      <View style={{marginTop: 10}}>
        <Text style={s.sectionLabel}>Valor a abonar</Text>
        <View style={[s.valueCard, err && s.valueCardErr]}>
          <Text style={s.valueSign}>$</Text>
          <TextInput
            mode="flat"
            keyboardType="numeric"
            value={intVal ? new Intl.NumberFormat('es-CO').format(intVal) : ''}
            placeholder="0"
            placeholderTextColor={MUTED}
            onChangeText={(t) => {
              const num = String(t).replace(/[^0-9]/g, '');
              this.props.actions.valueChange(num, 0);
            }}
            style={s.valueInput}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            theme={{colors: {primary: ACCENT, text: INK}}}
          />
        </View>
        <View style={s.quickRow}>
          {this.quickAmounts().map((q) => {
            const on = intVal && intVal === q.value;
            return (
              <TouchableOpacity
                key={q.label}
                activeOpacity={0.85}
                style={[s.quickChip, on && s.quickChipOn]}
                onPress={() => this.setAmount(q.value)}>
                <Text style={[s.quickChipTxt, on && {color: DGOLD}]}>
                  {q.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  // ── Confirm CTA ──────────────────────────────────────────
  renderConfirm() {
    const {payment} = this.props;
    const raw = payment?.[0]?.value || '';
    const intVal = parseInt(String(raw).replace(/[^0-9]/g, ''), 10) || 0;
    return (
      <TouchableOpacity
        style={s.confirmBtn}
        activeOpacity={0.9}
        onPress={this.confirm}>
        <Icon source="check" size={20} color={WHITE} />
        <NumericFormat
          value={intVal}
          displayType="text"
          thousandSeparator="."
          decimalSeparator=","
          prefix="$"
          renderText={(v) => (
            <Text style={s.confirmTxt}>Confirmar abono de  {v}</Text>
          )}
        />
      </TouchableOpacity>
    );
  }

  // ── Sidebar — detalle de la orden ────────────────────────
  renderSidebar() {
    const o = this.getOrder();
    const items = (this.props.items?.items || []).slice();
    const visible = items.slice(0, 3);
    const extra = Math.max(items.length - 3, 0);
    return (
      <View style={s.sidebar}>
        <Text style={s.sideKicker}>DETALLE DE LA ORDEN</Text>
        <Text style={s.sideOrderNum}>
          #{o.consecutive || '—'}
        </Text>
        {!!o.customer && (
          <Text style={s.sideCustomer}>{o.customer}</Text>
        )}

        <View style={{marginTop: 14, flex: 1}}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {visible.map((it, i) => {
              const qty = Number(it.qty) || 0;
              const itemName =
                it.name || it.product || it.label || 'Producto';
              const itemValue =
                Number(it.subtotal) ||
                (Number(it.price) || 0) * qty ||
                Number(it.value) ||
                0;
              return (
              <View key={it.nid || i} style={s.sideItem}>
                <View style={s.sideQty}>
                  <Text style={s.sideQtyTxt}>×{qty}</Text>
                </View>
                <View style={{flex: 1, minWidth: 0}}>
                  <Text style={s.sideItemName} numberOfLines={1}>
                    {itemName}
                  </Text>
                </View>
                <NumericFormat
                  value={itemValue}
                  displayType="text"
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="$"
                  renderText={(v) => <Text style={s.sideItemValue}>{v}</Text>}
                />
              </View>
              );
            })}
            {extra > 0 && (
              <Text style={s.sideMore}>+ {extra} ítems más</Text>
            )}
          </ScrollView>
        </View>

        <View style={s.sideTotals}>
          <View style={s.sideTotalRow}>
            <Text style={s.sideTotalLabel}>Total orden</Text>
            <NumericFormat
              value={o.value || 0}
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="$"
              renderText={(v) => <Text style={s.sideTotalValue}>{v}</Text>}
            />
          </View>
          <View style={s.sideTotalRow}>
            <Text style={s.sideTotalLabel}>Ya pagado</Text>
            <NumericFormat
              value={o.paid || 0}
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="$"
              renderText={(v) => (
                <Text style={[s.sideTotalValue, {color: GREEN_TXT}]}>{v}</Text>
              )}
            />
          </View>
          <View style={s.sideTotalRow}>
            <Text style={[s.sideTotalLabel, {fontFamily: fonts.bold}]}>
              Saldo actual
            </Text>
            <NumericFormat
              value={this.pending()}
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="$"
              renderText={(v) => (
                <Text style={[s.sideTotalValue, s.sideTotalStrong]}>{v}</Text>
              )}
            />
          </View>
        </View>
      </View>
    );
  }

  render() {
    return (
      <AppShell active="movimientos">
        <View style={s.body}>
          {this.renderSubHeader()}
          <View style={s.split}>
            <View style={s.leftCol}>
              {this.renderPendingCard()}
              {this.renderMethods()}
              {this.renderValueInput()}
            </View>
            <View style={s.rightCol}>
              {this.renderSidebar()}
              {this.renderConfirm()}
            </View>
          </View>
        </View>
      </AppShell>
    );
  }
}

const s = StyleSheet.create({
  body: {flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 12},

  // Sub-header
  subHeader: {flexDirection: 'row', alignItems: 'center', columnGap: 10, paddingBottom: 12},
  backBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  titleRow: {flexDirection: 'row', alignItems: 'center', columnGap: 10},
  title: {fontFamily: fonts.bold, fontSize: 20, color: INK, letterSpacing: -0.3},
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', columnGap: 4,
    backgroundColor: PILL_BG, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusTxt: {fontFamily: fonts.bold, fontSize: 10, color: PILL_TXT, letterSpacing: 0.6},
  subtitle: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},

  // Split
  split: {flex: 1, flexDirection: 'row', columnGap: 14, paddingBottom: 8},
  leftCol: {flex: 1.7},
  rightCol: {flex: 1},

  // Card pendiente (compacta para que todo quepa sin scroll)
  pendingCard: {
    backgroundColor: SOFT,
    borderWidth: 1.5, borderColor: SOFT_STRONG,
    borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14,
  },
  pendingLabel: {fontFamily: fonts.bold, fontSize: 10, color: DGOLD, letterSpacing: 0.8},
  pendingRow: {flexDirection: 'row', alignItems: 'baseline', marginTop: 2},
  pendingSign: {fontFamily: fonts.semiBold, fontSize: 20, color: INK, marginRight: 6},
  pendingValue: {
    fontFamily: fonts.bold, fontSize: 32, color: INK,
    letterSpacing: -1, includeFontPadding: false, flexShrink: 1,
  },
  pendingCop: {fontFamily: fonts.semiBold, fontSize: 12, color: MUTED, marginLeft: 6},
  pendingFooter: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 6, paddingTop: 6,
    borderTopWidth: 1, borderTopColor: '#F2D89F',
  },
  pendingFootLabel: {fontFamily: fonts.bold, fontSize: 9, color: MUTED, letterSpacing: 0.8},
  pendingFootValue: {fontFamily: fonts.bold, fontSize: 13, color: INK, marginTop: 1},

  // Métodos (chips compactos con wrap)
  sectionLabel: {fontFamily: fonts.bold, fontSize: 13, color: INK, marginBottom: 6},
  methodRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  methodChip: {
    flexDirection: 'row', alignItems: 'center', columnGap: 5,
    backgroundColor: WHITE,
    borderWidth: 1.5, borderColor: BORDER,
    borderRadius: 10, paddingVertical: 7, paddingHorizontal: 10,
  },
  methodChipOn: {borderColor: GOLD, backgroundColor: SOFT},
  methodChipTxt: {fontFamily: fonts.semiBold, fontSize: 12, color: INK},
  errorTxt: {fontFamily: fonts.medium, fontSize: 12, color: RED, marginTop: 4},

  // Input valor
  valueCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WHITE,
    borderWidth: 1.5, borderColor: BORDER, borderRadius: 12,
    paddingHorizontal: 14,
  },
  valueCardErr: {borderColor: RED},
  valueSign: {fontFamily: fonts.semiBold, fontSize: 18, color: INK, marginRight: 4},
  valueInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontFamily: fonts.bold,
    fontSize: 20, color: INK,
    height: 44,
    paddingHorizontal: 0,
  },
  quickRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6},
  quickChip: {
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  quickChipOn: {borderColor: GOLD, backgroundColor: SOFT},
  quickChipTxt: {fontFamily: fonts.semiBold, fontSize: 12, color: INK},

  // CTA — debajo del sidebar en la columna derecha.
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    columnGap: 8, backgroundColor: ACCENT, borderRadius: 14,
    height: 52, marginTop: 12,
  },
  confirmTxt: {fontFamily: fonts.bold, fontSize: 15, color: WHITE},

  // Sidebar
  sidebar: {
    flex: 1, backgroundColor: WHITE,
    borderWidth: 1, borderColor: BORDER, borderRadius: 16,
    padding: 16,
  },
  sideKicker: {fontFamily: fonts.bold, fontSize: 10, color: MUTED, letterSpacing: 1},
  sideOrderNum: {fontFamily: fonts.bold, fontSize: 22, color: INK, marginTop: 4},
  sideCustomer: {fontFamily: fonts.regular, fontSize: 13, color: MUTED, marginTop: 2},
  sideItem: {
    flexDirection: 'row', alignItems: 'center', columnGap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#F5EDDE',
  },
  sideQty: {
    backgroundColor: SOFT, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2, minWidth: 32,
    alignItems: 'center',
  },
  sideQtyTxt: {fontFamily: fonts.bold, fontSize: 11, color: DGOLD},
  sideItemName: {fontFamily: fonts.semiBold, fontSize: 13, color: INK},
  sideItemValue: {fontFamily: fonts.bold, fontSize: 13, color: INK},
  sideMore: {
    fontFamily: fonts.semiBold, fontSize: 12, color: DGOLD,
    marginTop: 6,
  },
  sideTotals: {
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: BORDER,
    rowGap: 6,
  },
  sideTotalRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  sideTotalLabel: {fontFamily: fonts.regular, fontSize: 13, color: MUTED},
  sideTotalValue: {fontFamily: fonts.semiBold, fontSize: 13, color: INK},
  sideTotalStrong: {fontFamily: fonts.bold, fontSize: 16, color: INK},
});

export default PayOrderScreen;
