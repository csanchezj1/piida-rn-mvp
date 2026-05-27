import React, { Component } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text as RNText, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { Button, Card, Checkbox, HelperText, Icon, IconButton, Text, TextInput } from 'react-native-paper';
import { fieldErrors } from '../../../utils/screenFunctions';
import { registerEventScreenMounted } from '../../../utils/analytics';
import { Layout } from '../../../layouts';
import { NumericFormat } from 'react-number-format';
import { colors, fonts, normalizeSize } from '../../../styles/basicStyles';
import Movements from '../../../api/movements';
import {prewarmPrinter} from '../../../utils/printing/printerService';

// Split tablet sólo cuando la pantalla está físicamente landscape
// (width >= height). En portrait cae al layout phone.
const isTabletNow = () => {
  const { width, height } = Dimensions.get('window');
  const shortest = Math.min(width, height);
  const longest = Math.max(width, height);
  return shortest >= 500 && longest / shortest < 1.8 && width >= height;
};

// Misma paleta que VentaLibreScreen tablet — warm beige + coral CTA.
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
  badge: '#FF5A1F',
};

const WHITE = '#FFFFFF';
const BEIGE = '#F7F0E8';
const ACCENT_LIGHT = '#FFF4EB';
const TEXT_DARK = '#3D2E25';

const DENOMINATIONS = [1000, 2000, 5000, 10000, 20000, 50000];

class ConfirmCashOrderScreen extends Component {
  // saleNumber: próximo consecutivo (badge del header).
  // selectedDenom: botón de monto resaltado — un valor de DENOMINATIONS o
  // 'exact'; null cuando el monto se editó por teclado.
  state = { saleNumber: null, selectedDenom: null };

  componentDidMount() {
    registerEventScreenMounted(this.props, 'Confirmar compra en efectivo', 'ConfirmCashOrderScreen');
    // Caliento el socket SPP al entrar: cuando el cajero toque "Finalizar
    // venta", el pulso del cajón llega sin la latencia del primer connect.
    prewarmPrinter();
    // No forzamos orientación: en tablet usamos la orientación natural del
    // hardware. La TCL 10.1" no respeta el lock de la lib.
    this._dimsUnsub = Dimensions.addEventListener('change', () => this.forceUpdate());
    const branch = this.props.user?.branch_office;
    if (branch) {
      Movements.getNextConsecutive(branch)
        .then((res) => {
          if (res && res.next != null) this.setState({ saleNumber: res.next });
        })
        .catch(() => { });
    }
  }

  componentWillUnmount() {
    this.props.actions.clearScreen();
    if (this._dimsUnsub && typeof this._dimsUnsub.remove === 'function') {
      this._dimsUnsub.remove();
    }
  }

  formatCurrency(value) {
    if (!value) return '';
    const number = parseInt(value, 10);
    if (isNaN(number)) return '';
    return `$${number.toLocaleString('es-CO')}`;
  }

  // ─── Helpers para tablet ────────────────────────────────────
  currentValueInt() {
    const v = this.props.value;
    if (!v) return 0;
    // valueChange ya limpia el value a sólo dígitos, pero por defensa quitamos
    // separadores de miles que pudieran venir desde otros orígenes.
    const cleaned = String(v).replace(/[^0-9]/g, '');
    return parseInt(cleaned || '0', 10);
  }

  setValueAbs = (n) => {
    this.props.actions.valueChange(String(Math.max(0, n)));
  };

  addDenomination = (delta) => {
    this.setState({ selectedDenom: delta });
    this.setValueAbs(this.currentValueInt() + delta);
  };

  applyExact = () => {
    this.setState({ selectedDenom: 'exact' });
    this.setValueAbs(this.props.total || 0);
  };

  clearValue = () => {
    this.setState({ selectedDenom: null });
    this.setValueAbs(0);
  };

  pushDigit = (digit) => {
    this.setState({ selectedDenom: null });
    const cur = this.currentValueInt();
    this.setValueAbs(cur * 10 + digit);
  };

  // ─── Tablet render ──────────────────────────────────────────
  renderTablet() {
    const { total = 0, returnValue = 0, value, errors, product = [] } = this.props;
    const valueInt = this.currentValueInt();
    const valueErr = fieldErrors('value', errors);
    const itemsCount = (product || []).reduce((acc, it) => acc + (Number(it.qty) || 1), 0);

    const canFinish = valueInt >= (total || 0);
    const bottomInset = (this.context && this.context.bottom) || 0;
    return (
      <SafeAreaView edges={['top']} style={t.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header */}
        <View style={t.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.props.navigation.goBack()}
            style={t.closeBtn}>
            <Text style={t.closeBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={t.headerTitle}>Pago en efectivo</Text>
          <View style={t.badge}>
            <Icon source="cash" size={12} color={T.accent} />
            <Text style={t.badgeText}>EFECTIVO</Text>
          </View>
          <View style={{ flex: 1 }} />
          <Text style={t.headerSub}>
            {this.state.saleNumber != null ? `Venta #${this.state.saleNumber} · ` : ''}
            {itemsCount} {itemsCount === 1 ? 'ítem' : 'ítems'}
          </Text>
        </View>

        {/* Body: teclado (izq) + detalle (der) */}
        <View style={t.body}>
          {/* IZQUIERDA: teclado numérico */}
          <View style={[t.kbPane, { paddingBottom: 22 + bottomInset }]}>
            <View style={t.kbHeader}>
              <Text style={t.kbTitle}>TECLADO NUMÉRICO</Text>
              <Text style={t.kbSub}>Indica el monto recibido</Text>
            </View>
            <View style={t.kbWrap}>
              {[
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9],
              ].map((row, ri) => (
                <View key={ri} style={t.kbRow}>
                  {row.map((d) => (
                    <TouchableOpacity
                      key={d}
                      activeOpacity={0.6}
                      style={t.kbKey}
                      onPress={() => this.pushDigit(d)}>
                      <Text style={t.kbKeyText}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
              <View style={t.kbRow}>
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={t.kbKey}
                  onPress={this.clearValue}>
                  <Text style={[t.kbKeyText, t.kbKeyTextSm]}>Limpiar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={t.kbKey}
                  onPress={() => this.pushDigit(0)}>
                  <Text style={t.kbKeyText}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={t.kbKey}
                  onPress={() => {
                    this.setState({ selectedDenom: null });
                    this.setValueAbs(Math.floor(this.currentValueInt() / 10));
                  }}>
                  <Text style={[t.kbKeyText, t.kbKeyTextMd]}>⌫</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* DERECHA: valor + denominaciones + devolución (scroll) + CTAs fijos */}
          <View style={[t.detailPane, { paddingBottom: 14 + bottomInset }]}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={t.detailScroll}
              showsVerticalScrollIndicator={false}>
              {/* Valor a pagar */}
              <View>
                <Text style={t.label}>VALOR A PAGAR</Text>
                <View style={t.valueRow}>
                  <Text style={t.valueSign}>$</Text>
                  <NumericFormat
                    value={total}
                    displayType="text"
                    thousandSeparator="."
                    decimalSeparator=","
                    renderText={(v) => <Text style={t.valueBig}>{v}</Text>}
                  />
                  <Text style={t.valueCop}>COP</Text>
                </View>
              </View>

              {/* Card: Con cuánto paga */}
              <View style={t.payCard}>
                <View style={t.payCardRow}>
                  <View style={t.payIcon}>
                    <Icon source="cash-multiple" size={20} color={T.textDim} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={t.paySmallLabel}>Con cuánto paga</Text>
                    <NumericFormat
                      value={valueInt}
                      displayType="text"
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="$"
                      renderText={(v) => (
                        <Text style={[t.payAmount, valueInt > 0 && t.payAmountActive]}>{v}</Text>
                      )}
                    />
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[
                      t.exactBtn,
                      this.state.selectedDenom === 'exact' && t.btnSelected,
                    ]}
                    onPress={this.applyExact}>
                    <Icon source="lightning-bolt" size={12} color={T.accent} />
                    <Text style={t.exactBtnText}>Exacto</Text>
                  </TouchableOpacity>
                </View>
                <View style={t.denomGrid}>
                  {DENOMINATIONS.map((d) => (
                    <TouchableOpacity
                      key={d}
                      activeOpacity={0.7}
                      style={[
                        t.denomBtn,
                        this.state.selectedDenom === d && t.btnSelected,
                      ]}
                      onPress={() => this.addDenomination(d)}>
                      <Text
                        style={t.denomText}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.75}>
                        <RNText style={{ color: T.accent }}>+</RNText>${d.toLocaleString('es-CO')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Card: Devolución al cliente */}
              <View style={t.returnCard}>
                <Text style={t.label}>DEVOLUCIÓN AL CLIENTE</Text>
                <NumericFormat
                  value={returnValue || 0}
                  displayType="text"
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="$"
                  renderText={(v) => (
                    <Text style={[t.returnBig, (returnValue || 0) > 0 && t.returnBigActive]}>
                      {v}
                    </Text>
                  )}
                />
                <Text style={t.returnHint}>
                  Indica cuánto entregó el cliente para calcular
                </Text>
              </View>

              {!!valueErr && (
                <HelperText type="error" visible style={{ padding: 0 }}>
                  {valueErr}
                </HelperText>
              )}

              {this.props.user.features.includes('billing_alegra') && (
                <Checkbox.Item
                  label="Generar factura electrónica"
                  status={this.props.invoice ? 'checked' : 'unchecked'}
                  onPress={() => this.props.actions.hasInvoice()}
                  position="leading"
                  labelStyle={{ textAlign: 'left', fontSize: 13, color: T.text }}
                  style={{ paddingHorizontal: 0 }}
                />
              )}
            </ScrollView>

            {/* CTAs — fijos al pie, siempre visibles.
                Orden: Finalizar venta (primary, izquierda) | Pago completo (secondary, derecha). */}
            <View style={t.ctaRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[t.ctaPrimary, canFinish && t.ctaPrimaryActive]}
                disabled={!canFinish}
                onPress={() => this.props.actions.confirmOrder({ navigation: this.props.navigation, from: this.props.route?.params?.from })}>
                <Text
                  style={[t.ctaPrimaryText, canFinish && t.ctaPrimaryTextActive]}
                  numberOfLines={1}>
                  Finalizar venta
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                style={t.ctaSecondary}
                onPress={() => this.props.actions.completePayment({ navigation: this.props.navigation, from: this.props.route?.params?.from })}>
                <Icon source="lightning-bolt" size={16} color={T.accent} />
                <Text style={t.ctaSecondaryText} numberOfLines={1}>Pago completo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Phone render (Layout previo) ───────────────────────────
  renderPhone() {
    const valueErr = fieldErrors('value', this.props.errors);
    return (
      <Layout title={'Pago en'} subtitle={'efectivo'} hideLogo>
        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={{
            paddingHorizontal: normalizeSize(16),
            paddingBottom: normalizeSize(40),
          }}>
          <Card mode="outlined" style={{ backgroundColor: '#FFFFFF', marginTop: normalizeSize(8) }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: colors.label }}>
                Valor a pagar
              </Text>
              <NumericFormat
                value={this.props.total}
                displayType="text"
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                renderText={(value) => (
                  <Text variant="displaySmall" style={{ color: colors.text, marginVertical: normalizeSize(8) }}>
                    {value}
                  </Text>
                )}
              />

              <TextInput
                mode="outlined"
                label="¿Con cuánto paga el cliente?"
                placeholder="Con cuánto paga el cliente"
                keyboardType="numeric"
                left={<TextInput.Icon icon="cash-multiple" />}
                value={this.formatCurrency(this.props.value)}
                error={!!valueErr}
                onChangeText={(value) => this.props.actions.valueChange(value)}
                style={{ marginTop: normalizeSize(12) }}
              />
              <HelperText type="error" visible={!!valueErr}>
                {valueErr}
              </HelperText>

              <Text variant="titleMedium" style={{ color: colors.label, marginTop: normalizeSize(8) }}>
                Devolución al cliente
              </Text>
              <NumericFormat
                value={this.props.returnValue}
                displayType="text"
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                renderText={(value) => (
                  <Text variant="displayMedium" style={{ color: colors.text, marginVertical: normalizeSize(8) }}>
                    {value}
                  </Text>
                )}
              />

              <Button
                mode="contained"
                onPress={() => this.props.actions.confirmOrder({ navigation: this.props.navigation, from: this.props.route?.params?.from })}
                style={{ marginTop: normalizeSize(8) }}
                contentStyle={{ paddingVertical: normalizeSize(6) }}>
                Finalizar venta
              </Button>
            </Card.Content>
          </Card>

          {this.props.user.features.includes('billing_alegra') && (
            <View style={{ marginTop: normalizeSize(12) }}>
              <Checkbox.Item
                label="¿Desea generar factura electrónica?"
                status={this.props.invoice ? 'checked' : 'unchecked'}
                onPress={() => this.props.actions.hasInvoice()}
                position="leading"
                labelStyle={{ textAlign: 'left' }}
              />
            </View>
          )}

          <Card mode="outlined" style={{ backgroundColor: '#FFFFFF', marginTop: normalizeSize(12) }}>
            <Card.Content>
              <Text variant="bodyMedium" style={{ color: colors.purplishGrey }}>
                Si no deseas calcular devolución:
              </Text>
              <Button
                mode="outlined"
                onPress={() => this.props.actions.completePayment({ navigation: this.props.navigation, from: this.props.route?.params?.from })}
                style={{ marginTop: normalizeSize(8) }}>
                Pago completo
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </Layout>
    );
  }

  render() {
    return isTabletNow() ? this.renderTablet() : this.renderPhone();
  }
}

// Insets de safe-area para padear los CTAs por encima de la barra de
// navegación de Android en landscape (sin esto quedan tapados).
ConfirmCashOrderScreen.contextType = SafeAreaInsetsContext;

// ─── Tablet styles ────────────────────────────────────────────
// Valores literales en px: la TCL 10.1" reporta 1280×800, idéntico al
// canvas del diseño 02, así que el mapeo es 1:1 sin normalizeSize().
const t = StyleSheet.create({
  root: { flex: 1, backgroundColor: WHITE },

  // ── Header ──────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 20,
    columnGap: 14,
    backgroundColor: WHITE,
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
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 26,
    color: T.text,
    includeFontPadding: false,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    letterSpacing: -0.3,
    color: T.text,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: ACCENT_LIGHT,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: T.accent,
  },
  headerSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: T.textMuted,
  },

  // ── Body split ──────────────────────────────────────────────
  body: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: T.bg,
  },

  // ── Panel izquierdo: teclado ────────────────────────────────
  kbPane: {
    flex: 560,
    backgroundColor: WHITE,
    paddingHorizontal: 28,
    paddingTop: 16,
  },
  kbHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  kbTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 0.6,
    color: T.textMuted,
  },
  kbSub: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: T.textDim,
  },
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
    borderWidth: 1,
    borderColor: '#F3ECE0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3C1E0A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  kbKeyText: {
    fontFamily: fonts.semiBold,
    fontSize: 46,
    color: T.text,
    includeFontPadding: false,
  },
  kbKeyTextSm: {
    fontSize: 22,
    color: T.textMuted,
  },
  kbKeyTextMd: {
    fontSize: 30,
  },

  // ── Panel derecho: detalle ──────────────────────────────────
  detailPane: {
    flex: 700,
    backgroundColor: T.bg,
    paddingHorizontal: 40,
    paddingTop: 12,
  },
  detailScroll: {
    rowGap: 12,
    paddingBottom: 4,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1.2,
    color: T.textMuted,
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    columnGap: 6,
  },
  valueSign: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: T.accent,
  },
  valueBig: {
    fontFamily: fonts.bold,
    fontSize: 56,
    letterSpacing: -2,
    color: T.text,
    includeFontPadding: false,
  },
  valueCop: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: T.textMuted,
    marginLeft: 6,
  },

  // Card "Con cuánto paga"
  payCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 13,
    rowGap: 11,
  },
  payCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 14,
  },
  payIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: BEIGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paySmallLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.4,
    color: T.textMuted,
  },
  payAmount: {
    fontFamily: fonts.bold,
    fontSize: 28,
    letterSpacing: -0.6,
    color: T.textDim,
    marginTop: 2,
  },
  payAmountActive: {
    color: T.text,
  },
  exactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: ACCENT_LIGHT,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  exactBtnText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: T.accent,
  },
  denomGrid: {
    flexDirection: 'row',
    columnGap: 6,
  },
  denomBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 10,
    backgroundColor: T.bg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  denomText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: T.text,
  },
  // Resalta el borde del botón de monto recién tocado (Exacto / +$N).
  btnSelected: {
    borderColor: T.accent,
  },

  // Card "Devolución al cliente"
  returnCard: {
    backgroundColor: WHITE,
    borderRadius: 22,
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  returnBig: {
    fontFamily: fonts.bold,
    fontSize: 50,
    letterSpacing: -2,
    color: T.textDim,
    marginTop: 4,
    includeFontPadding: false,
  },
  returnBigActive: {
    color: T.text,
  },
  returnHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: T.textMuted,
    marginTop: 8,
  },

  // ── CTAs ────────────────────────────────────────────────────
  ctaRow: {
    flexDirection: 'row',
    columnGap: 12,
    height: 64,
    marginTop: 14,
  },
  ctaSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: BEIGE,
  },
  ctaSecondaryText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: TEXT_DARK,
  },
  ctaPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: BEIGE,
  },
  ctaPrimaryActive: {
    backgroundColor: T.accent,
  },
  ctaPrimaryText: {
    fontFamily: fonts.bold,
    fontSize: 17,
    letterSpacing: 0.2,
    color: T.textDim,
  },
  ctaPrimaryTextActive: {
    color: WHITE,
  },
});

export default ConfirmCashOrderScreen;
