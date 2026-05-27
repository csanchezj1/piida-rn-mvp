import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import {Icon} from 'react-native-paper';
import {NumericFormat} from 'react-number-format';
import AppShell from '../../../layouts/AppShell';
import {fieldErrors} from '../../../utils/screenFunctions';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {fonts} from '../../../styles/basicStyles';

// Rediseño tablet (diseño 13 — Confirmar orden / medios de pago). Usa AppShell
// con su topbar default + sub-header propio. 2 columnas: izq = formulario
// (valor, tipo de pago, medios de pago, observaciones, factura), der = resumen
// de la orden + "Confirmar venta". Toda la lógica de pagos vive en las actions
// del screen (remissionData) y se preserva.

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

// Tipos de pago de la orden (ids estables del back: 44/45/46).
const ORDER_PAYMENTS = [
  {
    value: 44,
    label: 'Pago completo',
    title: 'Pago total',
    desc: 'Cliente paga todo ahora',
  },
  {
    value: 45,
    label: 'Pago parcial',
    title: 'Abono parcial',
    desc: 'Paga una parte, resto luego',
  },
  {
    value: 46,
    label: 'Pagar después',
    title: 'Fiado',
    desc: 'No paga ahora · queda pendiente',
  },
];

const Money = ({value, style}) => (
  <NumericFormat
    value={value || 0}
    displayType="text"
    thousandSeparator="."
    decimalSeparator=","
    prefix="$"
    renderText={(v) => <Text style={style}>{v}</Text>}
  />
);

class ConfirmOrderScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(
      this.props,
      'Confirmar compra',
      'ConfirmOrderScreen',
    );
    this.props.actions.getFieldsInfo();
  }

  componentWillUnmount() {
    this.props.actions.clearScreen();
  }

  // Ícono según el nombre del medio de pago.
  methodIcon(label) {
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
  }

  // errorArr trae {index, type:bool, value:bool} — false = error en ese campo.
  paymentsError(index, field) {
    const arr = this.props.errorArr || [];
    const i = arr.findIndex((e) => e.index == index);
    if (i === -1) return false;
    return field === 'type' ? !arr[i].type : !arr[i].value;
  }

  selectOrderPayment = (opt) => {
    this.props.actions.orderPaymentChange({label: opt.label, value: opt.value});
    // Para pago completo/parcial dejamos lista una línea de pago.
    if (opt.value !== 46 && !this.props.paymentsQty) {
      this.props.actions.paymentsQtyChange({label: 1, value: 1});
    }
  };

  addPaymentLine = () => {
    const q = this.props.paymentsQty ? this.props.paymentsQty.value : 0;
    if (q >= (this.props.paymentsType || []).length) return;
    this.props.actions.paymentsQtyChange({label: q + 1, value: q + 1});
  };

  removeLastLine = () => {
    const q = this.props.paymentsQty ? this.props.paymentsQty.value : 1;
    if (q <= 1) return;
    this.props.actions.paymentsQtyChange({label: q - 1, value: q - 1});
  };

  confirm = () => {
    const {orderPayment, customer, navigation} = this.props;
    // Fiado (46) requiere cliente; intercepta antes de pegarle al back y
    // ofrece ir directo a la pantalla de seleccionar cliente.
    if (orderPayment && orderPayment.value === 46 && !customer) {
      this.props.actions.requireCustomerForFiado(navigation);
      return;
    }
    this.props.actions.confirmOrder({
      uid: this.props.user.uid,
      navigation,
      from: this.props.route?.params?.from,
    });
  };

  // ── Sub-header ───────────────────────────────────────────
  renderSubHeader() {
    const n = (this.props.product || []).length;
    return (
      <View style={s.subHeader}>
        <TouchableOpacity
          style={s.backBtn}
          activeOpacity={0.7}
          onPress={() => this.props.navigation.goBack()}>
          <Icon source="chevron-left" size={26} color={INK} />
        </TouchableOpacity>
        <View>
          <View style={s.titleRow}>
            <Text style={s.title}>Confirmar orden</Text>
            <View style={s.pedidoBadge}>
              <Text style={s.pedidoTxt}>PEDIDO</Text>
            </View>
          </View>
          <Text style={s.subtitle}>
            {n} {n === 1 ? 'producto' : 'productos'} en la venta
          </Text>
        </View>
      </View>
    );
  }

  // ── Columna izquierda — formulario ───────────────────────
  renderOrderPayments() {
    const sel = this.props.orderPayment;
    const err = fieldErrors('orderPayment', this.props.errors);
    return (
      <View style={s.section}>
        <Text style={s.sectionTitle}>¿Cómo se pagará la orden?</Text>
        <View style={s.optionsRow}>
          {ORDER_PAYMENTS.map((opt) => {
            const on = sel && sel.value === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                activeOpacity={0.85}
                style={[s.optionCard, on && s.optionCardOn]}
                onPress={() => this.selectOrderPayment(opt)}>
                <View style={s.optionHead}>
                  <Text style={[s.optionTitle, on && {color: DGOLD}]}>
                    {opt.title}
                  </Text>
                  <Icon
                    source={
                      on ? 'radiobox-marked' : 'radiobox-blank'
                    }
                    size={18}
                    color={on ? GOLD : BORDER}
                  />
                </View>
                <Text style={s.optionDesc}>{opt.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {!!err && <Text style={s.errorTxt}>{err}</Text>}
      </View>
    );
  }

  renderPaymentLine(i) {
    const {payment, paymentsType, orderPayment, paymentsQty} = this.props;
    const line = payment[i] || {};
    const locked =
      orderPayment &&
      orderPayment.value === 44 &&
      paymentsQty &&
      paymentsQty.value === 1;
    const typeErr = this.paymentsError(i, 'type');
    const valueErr = this.paymentsError(i, 'value');
    const multi = !!paymentsQty && paymentsQty.value > 1;
    const canRemove = multi && i === paymentsQty.value - 1;
    return (
      <View key={i} style={s.payLine}>
        {multi && (
          <View style={s.payLineHead}>
            <Text style={s.payLineNum}>Medio de pago {i + 1}</Text>
            {canRemove && (
              <TouchableOpacity
                onPress={this.removeLastLine}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Icon source="close" size={18} color={MUTED} />
              </TouchableOpacity>
            )}
          </View>
        )}
        <View style={s.methodChips}>
          {(paymentsType || []).map((pt) => {
            const on = line.type && line.type.value === pt.value;
            return (
              <TouchableOpacity
                key={pt.value}
                activeOpacity={0.85}
                style={[
                  s.methodChip,
                  on && s.methodChipOn,
                  typeErr && !line.type && s.methodChipErr,
                ]}
                onPress={() => this.props.actions.paymentChange(pt, i)}>
                <Icon
                  source={this.methodIcon(pt.label)}
                  size={18}
                  color={on ? DGOLD : MUTED}
                />
                <Text
                  style={[s.methodChipTxt, on && {color: DGOLD}]}
                  numberOfLines={1}>
                  {pt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={s.valueRow}>
          <Text style={s.valueLabel}>VALOR ABONADO</Text>
          {locked ? (
            <Text style={s.valueText}>{line.value || '—'}</Text>
          ) : (
            <TextInput
              style={[s.valueInput, valueErr && s.valueInputErr]}
              keyboardType="numeric"
              placeholder="$0"
              placeholderTextColor={MUTED}
              value={line.value || ''}
              onChangeText={(t) => this.props.actions.valueChange(t, i)}
            />
          )}
        </View>
      </View>
    );
  }

  renderMediosDePago() {
    const {orderPayment, paymentsQty, paymentsType} = this.props;
    if (!orderPayment || orderPayment.value === 46) return null;
    const qty = paymentsQty ? paymentsQty.value : 0;
    const canAdd = qty < (paymentsType || []).length;
    const err =
      fieldErrors('payment', this.props.errors) ||
      fieldErrors('paymentsQty', this.props.errors);
    return (
      <View style={s.section}>
        <View style={s.sectionHeadRow}>
          <Text style={s.sectionTitle}>Medios de pago</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={!canAdd}
            style={[s.addBtn, !canAdd && s.addBtnOff]}
            onPress={this.addPaymentLine}>
            <Icon source="plus" size={15} color={canAdd ? DGOLD : MUTED} />
            <Text style={[s.addBtnTxt, !canAdd && {color: MUTED}]}>
              Agregar otro
            </Text>
          </TouchableOpacity>
        </View>
        {Array.from(Array(Math.max(qty, 0)).keys()).map((i) =>
          this.renderPaymentLine(i),
        )}
        {!!err && <Text style={s.errorTxt}>{err}</Text>}
      </View>
    );
  }

  renderObservaciones() {
    return (
      <View style={s.section}>
        <Text style={s.sectionTitle}>Observaciones</Text>
        <TextInput
          style={s.obsInput}
          placeholder="Agrega una nota para esta venta (opcional)"
          placeholderTextColor={MUTED}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={this.props.observations || ''}
          onChangeText={(t) => this.props.actions.obsChange(t)}
        />
      </View>
    );
  }

  renderFactura() {
    if (!this.props.user.features.includes('billing_alegra')) return null;
    const on = !!this.props.invoice;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={s.facturaRow}
        onPress={() => this.props.actions.hasInvoice()}>
        <Icon
          source={on ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={22}
          color={on ? GOLD : MUTED}
        />
        <View style={{flex: 1}}>
          <Text style={s.facturaTitle}>Generar factura electrónica</Text>
          <Text style={s.facturaSub}>
            Se enviará al correo del cliente si está registrado
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Columna derecha — resumen ────────────────────────────
  renderResumen() {
    const {product, total} = this.props;
    return (
      <View style={s.resumenCard}>
        <Text style={s.resumenLabel}>RESUMEN</Text>
        <Text style={s.resumenTitle}>Orden actual</Text>
        <ScrollView
          style={{flex: 1, marginTop: 6}}
          showsVerticalScrollIndicator={false}>
          {(product || []).map((item, i) => {
            const qty = Number(item.qty || 0);
            const price = Number(item.price || 0);
            return (
              <View key={item.nid || i} style={s.resItem}>
                <View style={s.resQty}>
                  <Text style={s.resQtyTxt}>×{qty}</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={s.resName} numberOfLines={2}>
                    {item.label || item.name}
                  </Text>
                  <View style={s.resUnitRow}>
                    <Money value={price} style={s.resUnit} />
                    <Text style={s.resUnit}> c/u</Text>
                  </View>
                </View>
                <Money value={price * qty} style={s.resLineTotal} />
              </View>
            );
          })}
        </ScrollView>
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>TOTAL</Text>
          <Money value={total} style={s.totalAmount} />
        </View>
        <TouchableOpacity
          style={s.confirmBtn}
          activeOpacity={0.85}
          onPress={this.confirm}>
          <Icon source="check" size={20} color={WHITE} />
          <Text style={s.confirmTxt}>Confirmar venta</Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <AppShell active="venta" header={this.renderSubHeader()}>
        <View style={s.body}>
          <ScrollView
            style={s.leftCol}
            contentContainerStyle={{rowGap: 12, paddingBottom: 16}}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {this.renderOrderPayments()}
            {this.renderMediosDePago()}
            {this.renderObservaciones()}
            {this.renderFactura()}
          </ScrollView>
          <View style={s.rightCol}>{this.renderResumen()}</View>
        </View>
      </AppShell>
    );
  }
}

const s = StyleSheet.create({
  // Sub-header
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: BG,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 19,
    color: INK,
  },
  pedidoBadge: {
    backgroundColor: SOFT,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pedidoTxt: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: DGOLD,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
    marginTop: 1,
  },

  // Body
  body: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    columnGap: 14,
  },
  leftCol: {flex: 1.55},
  rightCol: {flex: 1},

  // Sección genérica
  section: {rowGap: 8},
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: INK,
  },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorTxt: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: RED,
  },

  // Tipo de pago de la orden
  optionsRow: {
    flexDirection: 'row',
    columnGap: 10,
  },
  optionCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 12,
    rowGap: 6,
  },
  optionCardOn: {
    borderColor: GOLD,
    backgroundColor: TINT,
  },
  optionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: INK,
  },
  optionDesc: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: MUTED,
    lineHeight: 15,
  },

  // Medios de pago
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    backgroundColor: SOFT,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addBtnOff: {backgroundColor: '#F0E9DB'},
  addBtnTxt: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: DGOLD,
  },
  payLine: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 10,
    rowGap: 8,
  },
  payLineHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payLineNum: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: MUTED,
  },
  methodChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },
  methodChipOn: {
    borderColor: GOLD,
    backgroundColor: TINT,
  },
  methodChipErr: {borderColor: RED},
  methodChipTxt: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: INK,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F4ECDD',
    paddingTop: 10,
  },
  valueLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: MUTED,
    letterSpacing: 0.5,
  },
  valueText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: INK,
  },
  valueInput: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: INK,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 130,
    textAlign: 'right',
  },
  valueInputErr: {borderColor: RED},

  // Observaciones
  obsInput: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: INK,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
    minHeight: 64,
  },

  // Factura electrónica
  facturaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
  },
  facturaTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: INK,
  },
  facturaSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: MUTED,
    marginTop: 1,
  },

  // Resumen (columna derecha)
  resumenCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 16,
  },
  resumenLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: MUTED,
    letterSpacing: 1,
  },
  resumenTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: INK,
    marginTop: 2,
  },
  resItem: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F4ECDD',
  },
  resQty: {
    backgroundColor: SOFT,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  resQtyTxt: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: DGOLD,
  },
  resName: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: INK,
  },
  resUnitRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 1,
  },
  resUnit: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: MUTED,
  },
  resLineTotal: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: INK,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 14,
    marginTop: 4,
  },
  totalLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: MUTED,
    letterSpacing: 1,
  },
  totalAmount: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: INK,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    backgroundColor: INK,
    borderRadius: 14,
    height: 54,
    marginTop: 14,
  },
  confirmTxt: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: WHITE,
  },
});

export default ConfirmOrderScreen;
