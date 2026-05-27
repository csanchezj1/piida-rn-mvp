import React, {Component} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Icon, Text} from 'react-native-paper';
import AppShell from '../../../layouts/AppShell';
import {fonts} from '../../../styles/basicStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {fmtDateTimeCO} from '../../../utils/dateCO';

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
const GREEN_BORDER = '#B7DEC4';
const PURPLE_BG = '#EBE3FB';
const PURPLE_TXT = '#5C3FB8';

class TransferDetailsScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(this.props, 'Detalles de traslado de inventario', 'TransferDetailsScreen');
  }

  getDetails() {
    return this.props.route.params?.details || {};
  }

  totalUnits() {
    const d = this.getDetails();
    return (d.product || []).reduce((s, p) => s + (Number(p.qty) || 0), 0);
  }

  // ── Sub-header ────────────────────────────────────────────
  renderSubHeader() {
    const d = this.getDetails();
    const trId = d.movement_in || d.movement_out;
    const txnLabel = trId ? `Transacción TR-${String(trId).padStart(8, '0')}` : '';
    const dateLabel = d.date ? fmtDateTimeCO(d.date) : '';
    const sub = [txnLabel, dateLabel].filter(Boolean).join(' · ');
    return (
      <View style={st.subHeader}>
        <TouchableOpacity
          style={st.backBtn}
          activeOpacity={0.85}
          onPress={() => this.props.navigation.goBack()}>
          <Icon source="chevron-left" size={24} color={INK} />
        </TouchableOpacity>
        <View style={{flex: 1, marginLeft: 8}}>
          <Text style={st.title}>Detalle del traslado</Text>
          {!!sub && (
            <Text style={st.subtitle} numberOfLines={1}>{sub}</Text>
          )}
        </View>
      </View>
    );
  }

  renderReceiptCard() {
    const d = this.getDetails();
    const company = this.props.user?.company_name || '';
    return (
      <View style={st.receiptCard}>
        <Text style={st.receiptTitle}>Traslado de inventario</Text>
        {!!company && (
          <Text style={st.receiptCompany}>
            {company} · Movimiento interno
          </Text>
        )}

        <View style={st.typePill}>
          <Icon source="swap-horizontal" size={12} color={PURPLE_TXT} />
          <Text style={st.typePillTxt}>TRASLADO ENTRE SUCURSALES</Text>
        </View>

        {/* Origen → Destino */}
        <View style={st.routeRow}>
          <View style={[st.routeCard, st.routeOrigin]}>
            <Text style={st.routeLabel}>SALIÓ DE</Text>
            <Text style={st.routeName} numberOfLines={1}>
              {d.branch_out || 'Origen'}
            </Text>
          </View>
          <View style={st.arrowChip}>
            <Icon source="arrow-right" size={18} color={WHITE} />
          </View>
          <View style={[st.routeCard, st.routeDest]}>
            <Text style={[st.routeLabel, {color: DGOLD}]}>LLEGÓ A</Text>
            <Text style={st.routeName} numberOfLines={1}>
              {d.branch_in || 'Destino'}
            </Text>
          </View>
        </View>

        {/* Total unidades */}
        <View style={st.totalBox}>
          <Text style={st.totalLabel}>UNIDADES TRASLADADAS</Text>
          <Text style={st.totalValue}>
            {this.totalUnits()} <Text style={st.totalUnitTxt}>unidades</Text>
          </Text>
          {(d.product || []).length > 0 && (
            <Text style={st.totalSub}>
              Distribuidas en {d.product.length} producto{d.product.length === 1 ? '' : 's'} diferente{d.product.length === 1 ? '' : 's'}
            </Text>
          )}
        </View>

        {/* Items */}
        {(d.product || []).length > 0 && (
          <View style={{marginTop: 18, alignSelf: 'stretch'}}>
            <Text style={st.itemsLabel}>PRODUCTOS TRASLADADOS</Text>
            <View style={{marginTop: 8}}>
              {d.product.map((it, i) => (
                <View key={i} style={st.itemRow}>
                  <View style={st.qtyBadge}>
                    <Text style={st.qtyBadgeTxt}>×{Number(it.qty) || 0}</Text>
                  </View>
                  <View style={{flex: 1, minWidth: 0}}>
                    <Text style={st.itemName} numberOfLines={1}>
                      {it.label || it.name || 'Producto'}
                    </Text>
                    {!!it.code && (
                      <Text style={st.itemMeta} numberOfLines={1}>{it.code}</Text>
                    )}
                  </View>
                  <Text style={st.itemUnits}>{Number(it.qty) || 0} und</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Observaciones */}
        {!!d.observations && (
          <View style={{marginTop: 16, alignSelf: 'stretch'}}>
            <Text style={st.itemsLabel}>OBSERVACIONES</Text>
            <Text style={st.obsTxt}>{d.observations}</Text>
          </View>
        )}
      </View>
    );
  }

  renderSidebar() {
    const d = this.getDetails();
    const {user} = this.props;
    const fullName = `${user?.names || ''} ${user?.last_names || ''}`.trim() || '—';
    const date = d.date ? fmtDateTimeCO(d.date) : '—';
    return (
      <View style={st.sidebar}>
        <View style={[st.sideCard, st.statusCard]}>
          <View style={st.statusIcon}>
            <Icon source="check-circle" size={28} color={GREEN_TXT} />
          </View>
          <View style={{flex: 1, minWidth: 0}}>
            <Text style={st.statusTag}>ESTADO</Text>
            <Text style={st.statusTitle}>Recibido completo</Text>
          </View>
        </View>

        <View style={st.sideCard}>
          <Text style={st.sideTitle}>REGISTRO</Text>
          <View style={st.sideRow}>
            <Text style={st.sideLabel}>Autorizó traslado</Text>
            <Text style={st.sideValue}>{fullName}</Text>
          </View>
          <View style={st.sideRow}>
            <Text style={st.sideLabel}>Fecha de envío</Text>
            <Text style={st.sideValue}>{date}</Text>
          </View>
          {!!d.recibido_por && (
            <View style={st.sideRow}>
              <Text style={st.sideLabel}>Recibió en destino</Text>
              <Text style={st.sideValue}>{d.recibido_por}</Text>
            </View>
          )}
        </View>

        <View style={st.sideCard}>
          <Text style={st.sideTitle}>IMPACTO EN INVENTARIO</Text>
          <View style={[st.impactRow, st.impactNeg]}>
            <Icon source="trending-down" size={14} color={GREEN_TXT} />
            <Text style={st.impactTxt} numberOfLines={1}>
              {d.branch_out || 'Origen'}: −{this.totalUnits()} und
            </Text>
          </View>
          <View style={[st.impactRow, st.impactPos]}>
            <Icon source="trending-up" size={14} color={GREEN_TXT} />
            <Text style={st.impactTxt} numberOfLines={1}>
              {d.branch_in || 'Destino'}: +{this.totalUnits()} und
            </Text>
          </View>
        </View>
      </View>
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
        </View>
      </AppShell>
    );
  }
}

const st = StyleSheet.create({
  body: {flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 12},

  // Sub-header
  subHeader: {flexDirection: 'row', alignItems: 'center', paddingBottom: 14},
  backBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {fontFamily: fonts.bold, fontSize: 22, color: INK, letterSpacing: -0.3},
  subtitle: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},

  // Split
  split: {flexDirection: 'row', columnGap: 14},
  leftCol: {flex: 1.65},
  rightCol: {flex: 1},

  // Receipt
  receiptCard: {
    backgroundColor: WHITE, borderRadius: 18,
    borderWidth: 1, borderColor: BORDER_SOFT,
    paddingVertical: 22, paddingHorizontal: 24,
  },
  receiptTitle: {fontFamily: fonts.bold, fontSize: 18, color: INK, textAlign: 'center'},
  receiptCompany: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, textAlign: 'center', marginTop: 4},
  typePill: {
    alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', columnGap: 5,
    backgroundColor: PURPLE_BG, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 5, marginTop: 14,
  },
  typePillTxt: {fontFamily: fonts.bold, fontSize: 10, color: PURPLE_TXT, letterSpacing: 0.8},

  // Origen/Destino
  routeRow: {
    flexDirection: 'row', alignItems: 'center', columnGap: 10,
    marginTop: 18, alignSelf: 'stretch',
  },
  routeCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 14, borderWidth: 1.5,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  routeOrigin: {borderColor: GREEN_BORDER, backgroundColor: GREEN_BG},
  routeDest: {borderColor: '#F0D592', backgroundColor: '#FFF6E1'},
  routeLabel: {fontFamily: fonts.bold, fontSize: 9, color: GREEN_TXT, letterSpacing: 1, marginBottom: 4},
  routeName: {fontFamily: fonts.bold, fontSize: 14, color: INK},
  arrowChip: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: INK, alignItems: 'center', justifyContent: 'center',
  },

  // Total
  totalBox: {alignItems: 'center', marginTop: 22},
  totalLabel: {fontFamily: fonts.bold, fontSize: 10, color: MUTED, letterSpacing: 1.2},
  totalValue: {fontFamily: fonts.bold, fontSize: 40, color: PURPLE_TXT, letterSpacing: -1, marginTop: 4},
  totalUnitTxt: {fontFamily: fonts.regular, fontSize: 16, color: MUTED},
  totalSub: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 4},

  // Items
  itemsLabel: {fontFamily: fonts.bold, fontSize: 10, color: DGOLD, letterSpacing: 1},
  itemRow: {
    flexDirection: 'row', alignItems: 'center', columnGap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: BORDER_SOFT,
  },
  qtyBadge: {
    backgroundColor: PURPLE_BG, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, minWidth: 36, alignItems: 'center',
  },
  qtyBadgeTxt: {fontFamily: fonts.bold, fontSize: 11, color: PURPLE_TXT},
  itemName: {fontFamily: fonts.semiBold, fontSize: 13, color: INK},
  itemMeta: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginTop: 2},
  itemUnits: {fontFamily: fonts.bold, fontSize: 13, color: INK},
  obsTxt: {fontFamily: fonts.regular, fontSize: 13, color: INK, marginTop: 6},

  // Sidebar
  sidebar: {rowGap: 14},
  sideCard: {
    backgroundColor: WHITE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER_SOFT,
    padding: 16,
  },
  statusCard: {flexDirection: 'row', alignItems: 'center', columnGap: 12, backgroundColor: GREEN_BG, borderColor: GREEN_BORDER},
  statusIcon: {width: 42, height: 42, borderRadius: 21, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center'},
  statusTag: {fontFamily: fonts.bold, fontSize: 10, color: GREEN_TXT, letterSpacing: 0.8},
  statusTitle: {fontFamily: fonts.bold, fontSize: 15, color: INK, marginTop: 2},
  sideTitle: {fontFamily: fonts.bold, fontSize: 10, color: DGOLD, letterSpacing: 1.2, marginBottom: 12},
  sideRow: {marginBottom: 10},
  sideLabel: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginBottom: 2},
  sideValue: {fontFamily: fonts.semiBold, fontSize: 13, color: INK},

  // Impacto
  impactRow: {
    flexDirection: 'row', alignItems: 'center', columnGap: 8,
    paddingVertical: 6,
  },
  impactNeg: {},
  impactPos: {},
  impactTxt: {flex: 1, fontFamily: fonts.semiBold, fontSize: 12, color: INK},
});

export default TransferDetailsScreen;
