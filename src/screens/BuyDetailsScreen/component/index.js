import React, {Component} from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon, Text} from 'react-native-paper';
import {NumericFormat} from 'react-number-format';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import AppShell from '../../../layouts/AppShell';
import {fonts} from '../../../styles/basicStyles';
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
const GREEN_BG = '#DCEFE2';
const GREEN_TXT = '#1F8A4C';
const RED = '#D7263D';
const RED_BG = '#FBE0DE';
const ORANGE_BG = '#FFE9D6';
const ORANGE_TXT = '#C66E00';

const Money = ({value, style, prefix}) => (
  <NumericFormat
    value={Math.abs(Number(value) || 0)}
    displayType="text"
    thousandSeparator="."
    decimalSeparator=","
    prefix={(prefix || '') + '$'}
    renderText={(v) => <Text style={style}>{v}</Text>}
  />
);

class BuyDetailsScreen extends Component {
  state = {
    cancelOpen: false,
    cancelReason: '',
    cancelError: null,
  };

  componentDidMount() {
    registerEventScreenMounted(this.props, 'Detalles de la compra', 'BuyDetailsScreen');
    const details = this.props.route.params?.details;
    if (details?.order) {
      this.props.actions.getItems(details.order);
      this.props.actions.getPayments(details.movement_id);
    }
  }

  componentWillUnmount() {
    this.props.actions.clear();
  }

  // ── Helpers ───────────────────────────────────────────────
  getDetails() {
    return this.props.route.params?.details || {};
  }

  isExpense() {
    return this.getDetails().movement === 'expense';
  }

  isCancelled() {
    return this.getDetails().status === 'CANCELLED';
  }

  totalAmount() {
    const d = this.getDetails();
    if (d.total) return Number(d.total) || 0;
    const qty = d.qty || 1;
    return (Number(d.value) || 0) * qty;
  }

  shareReceipt = () => {
    if (!this.viewShot?.capture) return;
    this.viewShot.capture().then((uri) => {
      Share.open({
        title: 'Comprobante Piida',
        message: 'Comprobante Piida',
        url: `file://${uri}`,
        type: 'image/png',
        failOnCancel: false,
      }).catch((err) => console.log(err));
    });
  };

  // ── Sub-header ────────────────────────────────────────────
  renderSubHeader() {
    const d = this.getDetails();
    const txnId = d.movement || d.movement_id ? `MV-${String(d.movement_id || d.movement).replace(/[^0-9]/g, '').padStart(8, '0')}` : '';
    const subParts = [txnId && `Transacción ${txnId}`, d.date].filter(Boolean);
    const cancelled = this.isCancelled();
    return (
      <View style={st.subHeader}>
        <TouchableOpacity
          style={st.backBtn}
          activeOpacity={0.85}
          onPress={() => this.props.navigation.goBack()}>
          <Icon source="chevron-left" size={24} color={INK} />
        </TouchableOpacity>
        <View style={{flex: 1, marginLeft: 8}}>
          <Text style={st.title}>Detalle del movimiento</Text>
          {subParts.length > 0 && (
            <Text style={st.subtitle} numberOfLines={1}>{subParts.join(' · ')}</Text>
          )}
        </View>
        {Platform.OS === 'android' && (
          <TouchableOpacity
            style={st.headerBtn}
            activeOpacity={0.85}
            onPress={() => this.props.actions.reprintReceipt(d)}>
            <Icon source="printer-outline" size={16} color={INK} />
            <Text style={st.headerBtnTxt}>Reimprimir</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={st.headerBtn}
          activeOpacity={0.85}
          onPress={this.shareReceipt}>
          <Icon source="share-variant-outline" size={16} color={INK} />
          <Text style={st.headerBtnTxt}>Compartir</Text>
        </TouchableOpacity>
        {!cancelled && d.movement_id && (
          <TouchableOpacity
            style={[st.headerBtn, st.headerBtnDanger]}
            activeOpacity={0.85}
            onPress={() => this.setState({cancelOpen: true, cancelReason: '', cancelError: null})}>
            <Icon source="close-circle-outline" size={16} color={RED} />
            <Text style={[st.headerBtnTxt, {color: RED}]}>Cancelar mov.</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── Card recibo (LEFT) ────────────────────────────────────
  renderReceiptCard() {
    const d = this.getDetails();
    const {user} = this.props;
    const expense = this.isExpense();
    const total = this.totalAmount();
    const itemsArr =
      this.props.items?.items?.length > 0
        ? this.props.items.items.map((it) => ({
            name: it.name || it.product || it.label || it.title || 'Venta libre',
            qty: it.qty || 1,
            unit: (it.subtotal ?? it.value ?? 0) / (it.qty || 1),
            subtotal: it.subtotal ?? it.value ?? 0,
          }))
        : (Array.isArray(d.product) ? d.product : []).map((it) => ({
            name: it.label || it.name || it.product || 'Producto',
            qty: it.qty || 1,
            unit: it.price,
            subtotal: (it.price || 0) * (it.qty || 1),
          }));

    return (
      <ViewShot
        ref={(ref) => (this.viewShot = ref)}
        options={{
          fileName: 'Comprobante ' + (user.company_name || 'piida'),
          format: 'png',
          quality: 1,
        }}
        style={st.receiptWrap}>
        <View style={st.receiptCard}>
          {/* Header empresa */}
          <Text style={st.companyName}>{user.company_name || ''}</Text>
          {!!user.branch_office_name && (
            <Text style={st.companyMeta}>{user.branch_office_name}</Text>
          )}
          {!!user.branch_office_phone && (
            <View style={st.phoneRow}>
              <Icon source="phone-outline" size={12} color={MUTED} />
              <Text style={st.companyPhone}>{user.branch_office_phone}</Text>
            </View>
          )}

          {/* Pill tipo */}
          <View style={[st.typePill, expense ? st.typePillExpense : st.typePillIncome]}>
            <Text style={[st.typePillTxt, expense ? {color: RED} : {color: GREEN_TXT}]}>
              {expense ? 'EGRESO' : 'INGRESO'}
              {d.movementType ? ` · ${String(d.movementType).toUpperCase()}` : ''}
            </Text>
          </View>

          {/* Valor */}
          <Text style={st.valueLabel}>VALOR DE LA TRANSACCIÓN</Text>
          <View style={st.valueRow}>
            <Money
              value={total}
              prefix={expense ? '−' : '+'}
              style={[st.valueAmount, {color: expense ? RED : GREEN_TXT}]}
            />
            <Text style={st.valueCop}>COP</Text>
          </View>

          <View style={st.receiptDivider} />

          {/* Proveedor / Cliente y Concepto */}
          <View style={st.kvRow}>
            {(d.provider || d.customer) && (
              <View style={{flex: 1}}>
                <Text style={st.kvLabel}>{d.provider ? 'PROVEEDOR' : 'CLIENTE'}</Text>
                <View style={st.kvValueRow}>
                  <Icon source={d.provider ? 'truck-outline' : 'account-outline'} size={14} color={DGOLD} />
                  <Text style={st.kvValue} numberOfLines={1}>{d.provider || d.customer}</Text>
                </View>
              </View>
            )}
            {d.movementType && (
              <View style={{flex: 1}}>
                <Text style={st.kvLabel}>CONCEPTO</Text>
                <Text style={st.kvValue}>{d.movementType}</Text>
              </View>
            )}
          </View>

          {/* Ítems */}
          {itemsArr.length > 0 && (
            <>
              <Text style={[st.kvLabel, {marginTop: 18}]}>ÍTEMS DE LA TRANSACCIÓN</Text>
              <View style={{marginTop: 8}}>
                {itemsArr.map((it, i) => (
                  <View key={i} style={st.itemRow}>
                    <View style={st.itemQtyBadge}>
                      <Text style={st.itemQtyTxt}>×{it.qty}</Text>
                    </View>
                    <View style={{flex: 1, minWidth: 0}}>
                      <Text style={st.itemName} numberOfLines={1}>{it.name}</Text>
                      {it.unit > 0 && it.qty > 1 && (
                        <Money value={it.unit} style={st.itemUnit} />
                      )}
                    </View>
                    <Money value={it.subtotal} style={st.itemSubtotal} />
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Observaciones */}
          {!!d.observations && (
            <View style={{marginTop: 18}}>
              <Text style={st.kvLabel}>OBSERVACIONES</Text>
              <Text style={[st.kvValue, {marginTop: 4}]}>{d.observations}</Text>
            </View>
          )}
        </View>
      </ViewShot>
    );
  }

  // ── Sidebar derecho ───────────────────────────────────────
  renderSidebar() {
    const d = this.getDetails();
    const {user, payments} = this.props;
    const cancelled = this.isCancelled();
    const fullName =
      `${user?.names || ''} ${user?.last_names || ''}`.trim() || user?.email || '—';
    const totalPaid = (payments || []).reduce((sum, p) => sum + (Number(p.value) || 0), 0)
                       || (Number(d.paid) || 0)
                       || this.totalAmount();

    return (
      <View style={st.sidebar}>
        {/* REGISTRO */}
        <View style={st.sideCard}>
          <Text style={st.sideTitle}>REGISTRO</Text>
          <View style={st.sideRow}>
            <Text style={st.sideLabel}>Registrado por</Text>
            <Text style={st.sideValue}>{fullName}</Text>
          </View>
          {!!d.date && (
            <View style={st.sideRow}>
              <Text style={st.sideLabel}>Fecha y hora</Text>
              <Text style={st.sideValue}>{d.date}</Text>
            </View>
          )}
          {!!user?.branch_office_name && (
            <View style={st.sideRow}>
              <Text style={st.sideLabel}>Sucursal</Text>
              <Text style={st.sideValue}>{user.branch_office_name}</Text>
            </View>
          )}
          <View style={st.sideRow}>
            <Text style={st.sideLabel}>Estado</Text>
            <View
              style={[
                st.statusPill,
                cancelled ? st.statusPillCancelled : st.statusPillActive,
              ]}>
              <Text
                style={[
                  st.statusPillTxt,
                  {color: cancelled ? RED : GREEN_TXT},
                ]}>
                {cancelled ? 'CANCELADO' : 'ACTIVO'}
              </Text>
            </View>
          </View>
          {cancelled && !!d.cancellationReason && (
            <View style={st.cancelBox}>
              <Text style={st.cancelLabel}>Motivo</Text>
              <Text style={st.cancelValue}>{d.cancellationReason}</Text>
              {!!d.cancelledByName && (
                <Text style={st.cancelMeta}>por {d.cancelledByName}</Text>
              )}
            </View>
          )}
        </View>

        {/* DESGLOSE DE PAGOS */}
        {(payments?.length > 0 || d.paymentType) && (
          <View style={st.sideCard}>
            <Text style={st.sideTitle}>DESGLOSE DE PAGOS</Text>
            {payments?.length > 0 ? (
              payments.map((p, i) => {
                const name = p.type || p.payment_method || p.method || 'Medio de pago';
                return (
                  <View key={i} style={st.paymentRow}>
                    <Icon source="credit-card-outline" size={14} color={DGOLD} />
                    <Text style={st.paymentName} numberOfLines={1}>{name}</Text>
                    <Money value={p.value} style={st.paymentValue} />
                  </View>
                );
              })
            ) : (
              <View style={st.paymentRow}>
                <Icon source="credit-card-outline" size={14} color={DGOLD} />
                <Text style={st.paymentName}>{d.paymentType}</Text>
                <Money value={d.paid || d.total} style={st.paymentValue} />
              </View>
            )}
            <View style={st.paymentDivider} />
            <View style={st.paymentRow}>
              <Text style={st.paymentTotalLabel}>TOTAL PAGADO</Text>
              <Money value={totalPaid} style={st.paymentTotalValue} />
            </View>
          </View>
        )}
      </View>
    );
  }

  renderCancelDialog() {
    const {cancelOpen, cancelReason, cancelError} = this.state;
    const d = this.getDetails();
    return (
      <Modal
        visible={cancelOpen}
        transparent
        animationType="fade"
        onRequestClose={() => this.setState({cancelOpen: false})}>
        <View style={st.modalBackdrop}>
          <View style={st.modalCard}>
            <TouchableOpacity
              style={st.modalClose}
              activeOpacity={0.7}
              onPress={() => this.setState({cancelOpen: false})}>
              <Icon source="close" size={18} color={INK} />
            </TouchableOpacity>
            <View style={st.modalIcon}>
              <Icon source="pencil-outline" size={28} color={DGOLD} />
            </View>
            <Text style={st.modalTitle}>Cancelar movimiento</Text>
            <Text style={st.modalSub}>
              El movimiento quedará marcado como cancelado. Se revertirán inventario y caja automáticamente.
            </Text>
            <Text style={st.modalLabel}>Motivo de cancelación *</Text>
            <TextInput
              style={st.modalInput}
              placeholder="Ej: Cliente devolvió el producto"
              placeholderTextColor={SUBTLE}
              value={cancelReason}
              onChangeText={(t) => this.setState({cancelReason: t, cancelError: null})}
              multiline
              maxLength={500}
            />
            {!!cancelError && <Text style={st.modalError}>{cancelError}</Text>}
            <View style={st.modalActions}>
              <TouchableOpacity
                style={[st.modalBtn, st.modalBtnSecondary]}
                activeOpacity={0.85}
                onPress={() => this.setState({cancelOpen: false})}>
                <Text style={st.modalBtnTxtSecondary}>Volver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[st.modalBtn, st.modalBtnDanger]}
                activeOpacity={0.85}
                onPress={() => {
                  const reason = cancelReason.trim();
                  if (reason.length < 3) {
                    this.setState({cancelError: 'Indicá un motivo de al menos 3 caracteres.'});
                    return;
                  }
                  this.setState({cancelOpen: false});
                  this.props.actions.deleteMovement(
                    d.movement_id,
                    this.props.navigation,
                    reason,
                  );
                }}>
                <Text style={st.modalBtnTxtPrimary}>Confirmar cancelación</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  render() {
    return (
      <AppShell active="movimientos">
        <View style={st.body}>
          {this.renderSubHeader()}
          <ScrollView
            contentContainerStyle={{paddingBottom: 28}}
            showsVerticalScrollIndicator={false}>
            <View style={st.split}>
              <View style={st.leftCol}>{this.renderReceiptCard()}</View>
              <View style={st.rightCol}>{this.renderSidebar()}</View>
            </View>
          </ScrollView>
          {this.renderCancelDialog()}
        </View>
      </AppShell>
    );
  }
}

const st = StyleSheet.create({
  body: {flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 12},

  // ── Sub-header ──
  subHeader: {flexDirection: 'row', alignItems: 'center', columnGap: 10, paddingBottom: 14},
  backBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {fontFamily: fonts.bold, fontSize: 22, color: INK, letterSpacing: -0.3},
  subtitle: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},
  headerBtn: {
    flexDirection: 'row', alignItems: 'center', columnGap: 6,
    paddingHorizontal: 14, height: 40,
    borderRadius: 12, backgroundColor: WHITE,
    borderWidth: 1, borderColor: BORDER_SOFT,
  },
  headerBtnDanger: {borderColor: RED_BG},
  headerBtnTxt: {fontFamily: fonts.semiBold, fontSize: 12, color: INK},

  // ── Split body 2-col ──
  split: {flexDirection: 'row', columnGap: 14},
  leftCol: {flex: 1.65},
  rightCol: {flex: 1},

  // ── Card recibo ──
  receiptWrap: {flex: 1},
  // alignItems se quita: los rows con flex:1 deben poder estirarse al ancho
  // del card. Los elementos top (empresa, pill, valor) se centran individualmente.
  receiptCard: {
    backgroundColor: WHITE, borderRadius: 18,
    borderWidth: 1, borderColor: BORDER_SOFT,
    paddingVertical: 22, paddingHorizontal: 24,
  },
  companyName: {fontFamily: fonts.bold, fontSize: 18, color: INK, textAlign: 'center'},
  companyMeta: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 4, textAlign: 'center'},
  phoneRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 4, marginTop: 4},
  companyPhone: {fontFamily: fonts.regular, fontSize: 11, color: MUTED},

  typePill: {
    alignSelf: 'center',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, marginTop: 14,
  },
  typePillExpense: {backgroundColor: RED_BG},
  typePillIncome: {backgroundColor: GREEN_BG},
  typePillTxt: {fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1},

  valueLabel: {
    fontFamily: fonts.bold, fontSize: 10, color: MUTED,
    letterSpacing: 1.2, marginTop: 22, textAlign: 'center',
  },
  valueRow: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
    marginTop: 6, columnGap: 6,
  },
  valueAmount: {fontFamily: fonts.bold, fontSize: 38, letterSpacing: -1},
  valueCop: {fontFamily: fonts.semiBold, fontSize: 13, color: MUTED, marginBottom: 6},

  receiptDivider: {
    width: '100%', height: 1, backgroundColor: BORDER_SOFT, marginVertical: 18,
  },

  kvRow: {flexDirection: 'row', alignSelf: 'stretch', columnGap: 20},
  kvLabel: {
    fontFamily: fonts.bold, fontSize: 10, color: DGOLD,
    letterSpacing: 1, marginBottom: 4,
  },
  kvValueRow: {flexDirection: 'row', alignItems: 'center', columnGap: 6},
  kvValue: {fontFamily: fonts.semiBold, fontSize: 13, color: INK},

  // Ítems
  itemRow: {
    flexDirection: 'row', alignItems: 'center', columnGap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: BORDER_SOFT,
  },
  itemQtyBadge: {
    backgroundColor: ORANGE_BG, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, minWidth: 32, alignItems: 'center',
  },
  itemQtyTxt: {fontFamily: fonts.bold, fontSize: 11, color: ORANGE_TXT},
  itemName: {fontFamily: fonts.semiBold, fontSize: 13, color: INK},
  itemUnit: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginTop: 2},
  itemSubtotal: {fontFamily: fonts.bold, fontSize: 13, color: INK},

  // ── Sidebar ──
  sidebar: {rowGap: 14},
  sideCard: {
    backgroundColor: WHITE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER_SOFT,
    padding: 16,
  },
  sideTitle: {
    fontFamily: fonts.bold, fontSize: 10, color: DGOLD,
    letterSpacing: 1.2, marginBottom: 12,
  },
  sideRow: {marginBottom: 10},
  sideLabel: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginBottom: 2},
  sideValue: {fontFamily: fonts.semiBold, fontSize: 13, color: INK},

  statusPill: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 999, marginTop: 2,
  },
  statusPillActive: {backgroundColor: GREEN_BG},
  statusPillCancelled: {backgroundColor: RED_BG},
  statusPillTxt: {fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.6},

  cancelBox: {
    backgroundColor: RED_BG, borderRadius: 10, padding: 10, marginTop: 6,
  },
  cancelLabel: {fontFamily: fonts.bold, fontSize: 10, color: RED, letterSpacing: 0.5},
  cancelValue: {fontFamily: fonts.regular, fontSize: 12, color: INK, marginTop: 2},
  cancelMeta: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginTop: 4},

  // Payment rows
  paymentRow: {
    flexDirection: 'row', alignItems: 'center', columnGap: 8, paddingVertical: 6,
  },
  paymentName: {flex: 1, fontFamily: fonts.semiBold, fontSize: 13, color: INK},
  paymentValue: {fontFamily: fonts.bold, fontSize: 13, color: INK},
  paymentDivider: {height: 1, backgroundColor: BORDER_SOFT, marginVertical: 6},
  paymentTotalLabel: {flex: 1, fontFamily: fonts.bold, fontSize: 11, color: DGOLD, letterSpacing: 1},
  paymentTotalValue: {fontFamily: fonts.bold, fontSize: 16, color: INK, letterSpacing: -0.3},

  // Modal cancelar movimiento — aplica el patrón unificado de popups.
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(26,19,12,0.45)',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%', maxWidth: 480,
    backgroundColor: WHITE, borderRadius: 22,
    paddingVertical: 24, paddingHorizontal: 26,
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute', top: 14, right: 14,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F7F0E8',
    alignItems: 'center', justifyContent: 'center', zIndex: 2,
  },
  modalIcon: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: '#FFF6E1',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: fonts.bold, fontSize: 18, color: INK,
    textAlign: 'center', marginBottom: 6,
  },
  modalSub: {
    fontFamily: fonts.regular, fontSize: 13, color: MUTED,
    textAlign: 'center', lineHeight: 19, marginBottom: 18,
  },
  modalLabel: {
    alignSelf: 'flex-start',
    fontFamily: fonts.bold, fontSize: 10, color: DGOLD,
    letterSpacing: 1, marginBottom: 6,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1, borderColor: BORDER_SOFT, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    fontFamily: fonts.regular, fontSize: 14, color: INK,
    minHeight: 64, textAlignVertical: 'top',
  },
  modalError: {
    alignSelf: 'flex-start',
    fontFamily: fonts.regular, fontSize: 11, color: RED, marginTop: 6,
  },
  modalActions: {flexDirection: 'row', columnGap: 10, marginTop: 18, width: '100%'},
  modalBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  modalBtnSecondary: {backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT},
  modalBtnDanger: {backgroundColor: '#B73624'},
  modalBtnTxtSecondary: {fontFamily: fonts.bold, fontSize: 13, color: INK},
  modalBtnTxtPrimary: {fontFamily: fonts.bold, fontSize: 13, color: WHITE},
});

export default BuyDetailsScreen;
