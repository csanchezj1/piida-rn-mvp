import React, {Component} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Icon, Text} from 'react-native-paper';
import {NumericFormat} from 'react-number-format';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import AppShell from '../../../layouts/AppShell';
import {fonts} from '../../../styles/basicStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {PRINTING_IS_AVAILABLE} from '../../../utils/printing/printerService';

const GOLD = '#F7A928';
const DGOLD = '#C66E00';
const TINT_GOLD = '#FFF1D6';
const INK = '#1A130C';
const MUTED = '#7E6A52';
const SUBTLE = '#A89580';
const WHITE = '#FFFFFF';
const DIVIDER = '#E5D6B8';
const SALDO_DIV = '#F0E5CC';
const BORDER_SOFT = '#EFE3D2';
const BORDER_BTN = '#E2D6BF';

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

// El back devuelve created como ISO UTC; lo mostramos como HH:MM en hora CO.
const formatHourCO = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const co = new Date(d.getTime() - 5 * 3600 * 1000);
  const hh = String(co.getUTCHours()).padStart(2, '0');
  const mm = String(co.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

const Money = ({value, style}) => (
  <NumericFormat
    value={Number(value) || 0}
    displayType="text"
    thousandSeparator="."
    decimalSeparator=","
    prefix="$"
    renderText={(v) => <Text style={style}>{v}</Text>}
  />
);

class OrderDetailsScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(this.props, 'Detalles de la orden', 'OrderDetailsScreen');
    const order = this.props.route?.params?.details?.order;
    if (order) this.props.actions.getItems(order);
  }

  componentWillUnmount() {
    this.props.actions.clear();
  }

  onShare = () => {
    if (!this.viewShot) return;
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

  onPrint = () => {
    const details = this.props.route.params?.details || {};
    this.props.actions.printOrder(details);
  };

  renderSubHeader(details) {
    return (
      <View style={st.subHeader}>
        <TouchableOpacity
          style={st.backBtn}
          activeOpacity={0.7}
          onPress={() => this.props.navigation.goBack()}>
          <Icon source="arrow-left" size={22} color={INK} />
        </TouchableOpacity>

        <View style={st.subHeaderText}>
          <Text style={st.subHeaderTitle} numberOfLines={1}>
            Detalles de la orden
          </Text>
          <Text style={st.subHeaderSub} numberOfLines={1}>
            {`No. ${details.consecutive ?? '—'}${details.date ? ' · ' + details.date : ''}`}
          </Text>
        </View>

        {PRINTING_IS_AVAILABLE && (
          <TouchableOpacity style={st.printBtn} activeOpacity={0.85} onPress={this.onPrint}>
            <Icon source="printer-outline" size={18} color={INK} />
            <Text style={st.printBtnTxt}>Imprimir</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={st.shareBtn} activeOpacity={0.85} onPress={this.onShare}>
          <Icon source="share-variant-outline" size={18} color={WHITE} />
          <Text style={st.shareBtnTxt}>Compartir</Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    const {user, items, route} = this.props;
    const details = route.params?.details || {};
    const lineItems = items?.items || [];
    const payments = items?.payments || [];
    const saldo = (Number(details.value) || 0) - (Number(details.paid) || 0);

    return (
      <AppShell active="movimientos">
        <ScrollView
          contentContainerStyle={st.scroll}
          showsVerticalScrollIndicator={false}>
          {this.renderSubHeader(details)}

          <View style={st.cardWrap}>
            <ViewShot
              ref={(ref) => (this.viewShot = ref)}
              options={{
                fileName: 'Orden de venta ' + (user?.company_name || 'Piida'),
                format: 'png',
                quality: 1,
              }}
              style={st.card}>
              <View style={st.companyHead}>
                <Text style={st.companyName}>
                  {items?.company_name || user?.company_name || 'Piida'}
                </Text>
                {(items?.branch_office_name || user?.branch_office_name) && (
                  <Text style={st.companyAddr}>
                    {items?.branch_office_name || user?.branch_office_name}
                  </Text>
                )}
                {details.consecutive != null && (
                  <View style={st.orderBadge}>
                    <Icon source="file-document-outline" size={14} color={DGOLD} />
                    <Text style={st.orderBadgeTxt}>ORDEN No. {details.consecutive}</Text>
                  </View>
                )}
                {details.date && <Text style={st.companyDate}>{details.date}</Text>}
              </View>

              <View style={st.dashed} />

              {(details.customer || details.observations) && (
                <View style={st.metaRow}>
                  {details.customer && (
                    <View style={st.metaCustomer}>
                      <Text style={st.metaLabel}>CLIENTE</Text>
                      <Text style={st.metaValue} numberOfLines={2}>
                        {details.customer}
                      </Text>
                    </View>
                  )}
                  {details.observations && (
                    <View style={st.metaObs}>
                      <Text style={st.metaLabel}>OBSERVACIONES</Text>
                      <Text style={[st.metaValue, st.italic]} numberOfLines={6}>
                        "{details.observations}"
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {lineItems.length > 0 && (
                <View style={st.section}>
                  <Text style={st.sectionLabel}>ÍTEMS COMPRADOS</Text>
                  {lineItems.map((it) => {
                    const qty = Number(it.qty) || 1;
                    const price = Number(it.price) || 0;
                    const total = Number(it.subtotal) || price * qty;
                    const unit = price || (qty ? total / qty : total);
                    return (
                      <View key={it.nid} style={st.itemRow}>
                        <View style={st.qtyBadge}>
                          <Text style={st.qtyBadgeTxt}>×{qty}</Text>
                        </View>
                        <View style={st.itemBody}>
                          <Text style={st.itemName} numberOfLines={2}>
                            {it.name || it.product || 'Producto'}
                          </Text>
                          <Money value={unit} style={st.itemUnit} />
                          {it.products && it.products.length > 0 && (
                            <View style={st.subItems}>
                              {it.products.map((sp, idx) => (
                                <Text key={idx} style={st.subItemTxt} numberOfLines={1}>
                                  · {sp.name || sp.product} × {sp.qty}
                                </Text>
                              ))}
                            </View>
                          )}
                        </View>
                        <Money value={total} style={st.itemTotal} />
                      </View>
                    );
                  })}
                </View>
              )}

              {payments.length > 0 && (
                <View style={st.section}>
                  <Text style={st.sectionLabel}>PAGOS</Text>
                  {payments.map((p, i) => {
                    const name =
                      p.payment_method ||
                      (typeof p.type === 'string' ? p.type : p.type?.label) ||
                      'Pago';
                    const when = p.date || formatHourCO(p.created);
                    return (
                      <View key={p.nid ?? i} style={st.payRow}>
                        <View style={st.payIcon}>
                          <Icon source={methodIcon(name)} size={18} color={INK} />
                        </View>
                        <View style={st.payBody}>
                          <Text style={st.payName} numberOfLines={1}>
                            {name}
                          </Text>
                          {when ? <Text style={st.payDate}>{when}</Text> : null}
                        </View>
                        <Money value={p.value} style={st.payValue} />
                      </View>
                    );
                  })}
                </View>
              )}

              {(details.value != null || details.paid != null) && (
                <View style={st.totals}>
                  {details.value != null && (
                    <View style={st.totalRow}>
                      <Text style={st.totalLabel}>Total</Text>
                      <Money value={details.value} style={st.totalValue} />
                    </View>
                  )}
                  {details.paid != null && (
                    <View style={st.totalRow}>
                      <Text style={st.totalLabel}>Pagado</Text>
                      <Money value={details.paid} style={st.totalValue} />
                    </View>
                  )}
                  {details.value != null && details.paid != null && saldo > 0 && (
                    <View style={[st.totalRow, st.saldoRow]}>
                      <Text style={st.saldoLabel}>SALDO</Text>
                      <Money value={saldo} style={st.saldoValue} />
                    </View>
                  )}
                </View>
              )}
            </ViewShot>
          </View>
        </ScrollView>
      </AppShell>
    );
  }
}

const st = StyleSheet.create({
  scroll: {paddingHorizontal: 24, paddingBottom: 40},

  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subHeaderText: {flex: 1, marginLeft: 4},
  subHeaderTitle: {fontFamily: fonts.bold, fontSize: 18, color: INK},
  subHeaderSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 12,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER_BTN,
  },
  printBtnTxt: {fontFamily: fonts.semiBold, fontSize: 13, color: INK},
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 12,
    backgroundColor: GOLD,
  },
  shareBtnTxt: {fontFamily: fonts.bold, fontSize: 13, color: WHITE},

  cardWrap: {alignItems: 'center'},
  card: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: WHITE,
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 28,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 4},
    elevation: 1,
  },

  companyHead: {alignItems: 'center'},
  companyName: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: INK,
    textAlign: 'center',
  },
  companyAddr: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
    marginTop: 4,
    textAlign: 'center',
  },
  orderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: TINT_GOLD,
    borderRadius: 18,
  },
  orderBadgeTxt: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.4,
    color: DGOLD,
  },
  companyDate: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
    marginTop: 6,
  },

  dashed: {
    marginVertical: 20,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: DIVIDER,
  },

  metaRow: {flexDirection: 'row', alignItems: 'flex-start'},
  metaCustomer: {flex: 1, paddingRight: 16},
  metaObs: {flex: 1.4},
  metaLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: SUBTLE,
  },
  metaValue: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: INK,
    marginTop: 4,
  },
  italic: {fontStyle: 'italic', fontFamily: fonts.regular},

  section: {marginTop: 22},
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: SUBTLE,
    marginBottom: 12,
  },
  itemRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 10},
  qtyBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: TINT_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBadgeTxt: {fontFamily: fonts.bold, fontSize: 13, color: DGOLD},
  itemBody: {flex: 1, marginLeft: 12},
  itemName: {fontFamily: fonts.bold, fontSize: 14, color: INK},
  itemUnit: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  itemTotal: {fontFamily: fonts.bold, fontSize: 15, color: INK},
  subItems: {marginTop: 4},
  subItemTxt: {fontFamily: fonts.regular, fontSize: 11, color: MUTED},

  payRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 10},
  payIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F6EFE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBody: {flex: 1, marginLeft: 12},
  payName: {fontFamily: fonts.semiBold, fontSize: 14, color: INK},
  payDate: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: MUTED,
    marginTop: 2,
  },
  payValue: {fontFamily: fonts.bold, fontSize: 14, color: INK},

  totals: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: DIVIDER,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  totalLabel: {fontFamily: fonts.regular, fontSize: 13, color: MUTED},
  totalValue: {fontFamily: fonts.semiBold, fontSize: 14, color: INK},
  saldoRow: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: SALDO_DIV,
  },
  saldoLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    color: INK,
  },
  saldoValue: {fontFamily: fonts.bold, fontSize: 16, color: DGOLD},
});

export default OrderDetailsScreen;
