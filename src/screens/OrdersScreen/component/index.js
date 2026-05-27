import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {Icon} from 'react-native-paper';
import {NumericFormat} from 'react-number-format';
import AppShell from '../../../layouts/AppShell';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {fonts} from '../../../styles/basicStyles';

// Rediseño tablet (diseño 14 — Órdenes). AppShell (topbar default) + sub-header.
// 2 columnas: izq = lista con tabs Historial/Pagos pendientes + buscador,
// agrupada por día; der = panel "Vista rápida" con el resumen de la orden
// tocada. Toda la lógica de carga/paginación/tabs vive en las actions.

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
const GREEN = '#16A34A';

const MES = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
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

class OrdersScreen extends Component {
  state = {selectedOrder: null};

  componentDidMount() {
    // changeTab dispara getMovements internamente.
    if (this.props.route.params) {
      this.props.actions.changeTab('history');
    } else {
      this.props.actions.changeTab('pending');
    }
    registerEventScreenMounted(this.props, 'Pantalla ordenes', 'OrdersScreen');
    // Refetch al volver a la pantalla (después de crear/cancelar/abonar).
    this._focusListener = this.props.navigation.addListener('focus', () => {
      this.props.actions.getMovements(true);
    });
  }

  componentDidUpdate(prevProps) {
    // Re-fetch al cambiar la sucursal activa.
    if (prevProps.refetchTick !== this.props.refetchTick) {
      this.props.actions.getMovements(true);
    }
  }

  componentWillUnmount() {
    if (this._focusListener) this._focusListener();
  }

  selectTab = (tab) => {
    if (this.props.tabActive === tab) return;
    this.setState({selectedOrder: null});
    this.props.actions.changeTab(tab);
  };

  // 'DD/MM/YYYY' → 'HOY' | 'AYER · D MMM' | 'D MMM YYYY'
  dayLabel(s) {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(s || '');
    if (!m) return s || '';
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return 'HOY';
    if (diff === 1) return `AYER · ${d.getDate()} ${MES[d.getMonth()]}`;
    return `${d.getDate()} ${MES[d.getMonth()]} ${d.getFullYear()}`;
  }

  orderStatus(item) {
    if (item.status === 'CANCELLED') {
      return {key: 'cancelled', label: 'Cancelada', color: RED, bg: '#FBE6E4'};
    }
    const value = Number(item.value || 0);
    const paid = Number(item.paid || 0);
    if (paid >= value) {
      return {key: 'paid', label: 'Pagada', color: GREEN, bg: '#DCFCE7'};
    }
    return {key: 'pending', label: 'Pendiente', color: DGOLD, bg: SOFT};
  }

  statusIcon(key) {
    if (key === 'cancelled') return 'close';
    if (key === 'paid') return 'check';
    return 'clock-outline';
  }

  // ── Sub-header ───────────────────────────────────────────
  renderSubHeader() {
    return (
      <View style={s.subHeader}>
        <TouchableOpacity
          style={s.backBtn}
          activeOpacity={0.7}
          onPress={() => this.props.navigation.goBack()}>
          <Icon source="chevron-left" size={26} color={INK} />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Órdenes</Text>
          <Text style={s.subtitle}>Historial y pagos pendientes</Text>
        </View>
      </View>
    );
  }

  // ── Tabs ─────────────────────────────────────────────────
  renderTabs() {
    const {tabActive, list} = this.props;
    const count = list
      ? list.reduce((sum, g) => sum + (g.children ? g.children.length : 0), 0)
      : null;
    const tab = (key, label) => {
      const on = tabActive === key;
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          style={[s.tab, on && s.tabOn]}
          onPress={() => this.selectTab(key)}>
          <Text style={[s.tabTxt, on && s.tabTxtOn]}>{label}</Text>
          {on && count != null && (
            <View style={s.tabBadge}>
              <Text style={s.tabBadgeTxt}>{count}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    };
    return (
      <View style={s.tabsRow}>
        {tab('history', 'Historial')}
        {tab('pending', 'Pagos pendientes')}
      </View>
    );
  }

  // ── Buscador ─────────────────────────────────────────────
  renderSearch() {
    const {autoValue} = this.props;
    return (
      <View style={s.searchBox}>
        <Icon source="magnify" size={20} color={MUTED} />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar por cliente o No. de orden..."
          placeholderTextColor={MUTED}
          value={autoValue || ''}
          returnKeyType="search"
          onChangeText={(t) => this.props.actions.autocompleteChange(t)}
        />
        {!!autoValue && (
          <TouchableOpacity
            onPress={() => this.props.actions.autocompleteChange('')}>
            <Icon source="close-circle" size={18} color={MUTED} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── Lista ────────────────────────────────────────────────
  renderList() {
    const {list, tabActive, showLoader, showRrefresh} = this.props;
    if (list == null) {
      return (
        <View style={s.centerBox}>
          <ActivityIndicator size="large" color={GOLD} />
        </View>
      );
    }
    if (list.length === 0) {
      return (
        <View style={s.centerBox}>
          <Icon source="receipt" size={48} color={BORDER} />
          <Text style={s.emptyTxt}>
            {tabActive === 'pending'
              ? 'No tienes pagos pendientes por cobrar'
              : 'Aún no tienes órdenes registradas'}
          </Text>
        </View>
      );
    }
    return (
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 16}}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={({nativeEvent}) => {
          if (
            nativeEvent.layoutMeasurement.height +
              nativeEvent.contentOffset.y >=
            nativeEvent.contentSize.height - 1
          ) {
            this.props.actions.getMovements(false);
          }
        }}
        refreshControl={
          <RefreshControl
            refreshing={!!showRrefresh}
            colors={[GOLD]}
            tintColor={GOLD}
            onRefresh={() => this.props.actions.getMovements(true)}
          />
        }>
        {list.map((group, gi) => (
          <View key={gi}>
            <Text style={s.dayLabel}>{this.dayLabel(group.date)}</Text>
            {(group.children || []).map((item, ii) =>
              this.renderOrderRow(item, `${gi}-${ii}`),
            )}
          </View>
        ))}
        {showLoader && (
          <View style={{paddingVertical: 16, alignItems: 'center'}}>
            <ActivityIndicator size="small" color={GOLD} />
          </View>
        )}
      </ScrollView>
    );
  }

  renderOrderRow(item, key) {
    const st = this.orderStatus(item);
    const value = Number(item.value || 0);
    const paid = Number(item.paid || 0);
    const falta = value - paid;
    const nItems = (item.items || []).length;
    const sel =
      this.state.selectedOrder && this.state.selectedOrder.nid === item.nid;
    return (
      <TouchableOpacity
        key={key}
        activeOpacity={0.85}
        style={[s.row, sel && s.rowSel]}
        onPress={() => this.setState({selectedOrder: item})}>
        <View style={[s.rowIcon, {backgroundColor: st.bg}]}>
          <Icon source={this.statusIcon(st.key)} size={18} color={st.color} />
        </View>
        <View style={{flex: 1}}>
          <View style={s.rowLine1}>
            <Text style={s.orderNum}>Orden #{item.consecutive}</Text>
            <Text style={s.orderTime}>{item.hour}</Text>
            {st.key === 'pending' && (
              <View style={s.pendBadge}>
                <Text style={s.pendBadgeTxt}>PENDIENTE</Text>
              </View>
            )}
            {st.key === 'cancelled' && (
              <View style={s.cancBadge}>
                <Text style={s.cancBadgeTxt}>CANCELADA</Text>
              </View>
            )}
          </View>
          <Text style={s.rowSub} numberOfLines={1}>
            {item.customer || 'Sin cliente'} · {nItems}{' '}
            {nItems === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Money
            value={value}
            style={[s.rowAmount, st.key === 'cancelled' && s.rowAmountCanc]}
          />
          {st.key === 'pending' && (
            <View style={s.rowFaltaRow}>
              <Text style={s.rowFalta}>Falta </Text>
              <Money value={falta} style={s.rowFalta} />
            </View>
          )}
        </View>
        <Icon source="chevron-right" size={20} color={MUTED} />
      </TouchableOpacity>
    );
  }

  // ── Vista rápida (panel derecho) ─────────────────────────
  renderQuickView() {
    const o = this.state.selectedOrder;
    if (!o) {
      return (
        <View style={s.qvCard}>
          <Text style={s.qvLabel}>VISTA RÁPIDA</Text>
          <View style={s.qvEmpty}>
            <View style={s.qvEmptyIcon}>
              <Icon source="receipt" size={32} color={DGOLD} />
            </View>
            <Text style={s.qvEmptyTitle}>Toca una orden para ver detalle</Text>
            <Text style={s.qvEmptySub}>
              Verás el cliente, los totales y podrás abrir el detalle completo.
            </Text>
          </View>
        </View>
      );
    }
    const st = this.orderStatus(o);
    const value = Number(o.value || 0);
    const paid = Number(o.paid || 0);
    const falta = value - paid;
    return (
      <View style={s.qvCard}>
        <Text style={s.qvLabel}>VISTA RÁPIDA</Text>
        <Text style={s.qvOrderNum}>Orden #{o.consecutive}</Text>
        <View style={[s.qvStatus, {backgroundColor: st.bg}]}>
          <Icon source={this.statusIcon(st.key)} size={14} color={st.color} />
          <Text style={[s.qvStatusTxt, {color: st.color}]}>{st.label}</Text>
        </View>

        <View style={s.qvBlock}>
          {this.qvRow('Cliente', o.customer || 'Sin cliente')}
          {this.qvRow('Fecha', `${o.created || ''}  ${o.hour || ''}`.trim())}
          {this.qvRow('Productos', String((o.items || []).length))}
        </View>

        <View style={s.qvBlock}>
          {this.qvMoneyRow('Total', value)}
          {this.qvMoneyRow('Pagado', paid)}
          {st.key === 'pending' && this.qvMoneyRow('Falta', falta, true)}
        </View>

        <View style={{flex: 1}} />

        {st.key === 'pending' && (
          <TouchableOpacity
            style={s.qvPrimary}
            activeOpacity={0.85}
            onPress={() =>
              this.props.navigation.navigate('PayOrder', {order: o})
            }>
            <Icon source="cash-plus" size={18} color={WHITE} />
            <Text style={s.qvPrimaryTxt}>Registrar abono</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            st.key === 'pending' ? s.qvSecondary : s.qvPrimary,
          ]}
          activeOpacity={0.85}
          onPress={() =>
            this.props.navigation.navigate('OrderDetails', {
              details: {
                order: o.nid,
                consecutive: o.consecutive,
                customer: o.customer,
                value: o.value,
                paid: o.paid,
                observations: o.observations,
                date: `${(o.created || '').replace(/\n/g, '')} ${(o.hour || '').replace(/\n/g, '')}`.trim(),
              },
            })
          }>
          <Icon
            source="file-document-outline"
            size={18}
            color={st.key === 'pending' ? DGOLD : WHITE}
          />
          <Text
            style={
              st.key === 'pending' ? s.qvSecondaryTxt : s.qvPrimaryTxt
            }>
            Ver detalle completo
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  qvRow(label, value) {
    return (
      <View style={s.qvRow}>
        <Text style={s.qvRowLabel}>{label}</Text>
        <Text style={s.qvRowValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    );
  }

  qvMoneyRow(label, value, emphasis) {
    return (
      <View style={s.qvRow}>
        <Text style={[s.qvRowLabel, emphasis && {color: DGOLD}]}>{label}</Text>
        <Money
          value={value}
          style={[s.qvRowValue, emphasis && {color: DGOLD}]}
        />
      </View>
    );
  }

  render() {
    return (
      <AppShell active="movimientos">
        {this.renderSubHeader()}
        <View style={s.body}>
          <View style={s.leftCol}>
            {this.renderTabs()}
            {this.renderSearch()}
            {this.renderList()}
          </View>
          <View style={s.rightCol}>{this.renderQuickView()}</View>
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
  title: {
    fontFamily: fonts.bold,
    fontSize: 19,
    color: INK,
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
    padding: 14,
    columnGap: 14,
  },
  leftCol: {flex: 2.3},
  rightCol: {flex: 1},

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    columnGap: 8,
    marginBottom: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 11,
  },
  tabOn: {backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER},
  tabTxt: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: MUTED,
  },
  tabTxtOn: {color: INK, fontFamily: fonts.bold},
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeTxt: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: WHITE,
  },

  // Buscador
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: INK,
    padding: 0,
  },

  // Lista
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
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  dayLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: MUTED,
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 6,
  },

  // Fila de orden
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
  },
  rowSel: {borderColor: GOLD, backgroundColor: TINT},
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLine1: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  orderNum: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: INK,
  },
  orderTime: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
  },
  rowSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  rowAmount: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: INK,
  },
  rowAmountCanc: {
    color: MUTED,
    textDecorationLine: 'line-through',
  },
  rowFaltaRow: {flexDirection: 'row', alignItems: 'center', marginTop: 1},
  rowFalta: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: DGOLD,
  },
  pendBadge: {
    backgroundColor: SOFT,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pendBadgeTxt: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: DGOLD,
    letterSpacing: 0.4,
  },
  cancBadge: {
    backgroundColor: '#FBE6E4',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cancBadgeTxt: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: RED,
    letterSpacing: 0.4,
  },

  // Vista rápida
  qvCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 16,
  },
  qvLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: MUTED,
    letterSpacing: 1,
  },
  qvEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 10,
    paddingHorizontal: 12,
  },
  qvEmptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  qvEmptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: INK,
    textAlign: 'center',
  },
  qvEmptySub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 17,
  },
  qvOrderNum: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: INK,
    marginTop: 8,
  },
  qvStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    columnGap: 5,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginTop: 8,
  },
  qvStatusTxt: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  qvBlock: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F4ECDD',
    paddingTop: 10,
    rowGap: 8,
  },
  qvRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 12,
  },
  qvRowLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: MUTED,
  },
  qvRowValue: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: INK,
    flexShrink: 1,
    textAlign: 'right',
  },
  qvPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    backgroundColor: INK,
    borderRadius: 12,
    height: 48,
    marginTop: 10,
  },
  qvPrimaryTxt: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: WHITE,
  },
  qvSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    height: 48,
    marginTop: 10,
  },
  qvSecondaryTxt: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: DGOLD,
  },
});

export default OrdersScreen;
