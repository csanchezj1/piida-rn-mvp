import React, {Component} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {NumericFormat} from 'react-number-format';
import {Icon, Text} from 'react-native-paper';
import {Button, HelperText, TextInput as PaperInput} from 'react-native-paper';
import RBSheet from 'react-native-raw-bottom-sheet';
import AppShell from '../../../layouts/AppShell';
import {Shimmer} from '../../../components';
import {fonts} from '../../../styles/basicStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {fmtDayHeaderCO} from '../../../utils/dateCO';

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

const MIN_REASON_LENGTH = 3;

// Header del grupo (HOY / AYER · 13 MAY / 13 MAY). Acepta tanto el formato
// "DD/MM/YYYY" del back legacy como ISO. Convierte forzando America/Bogota
// para que tablets con TZ stale no muestren días desplazados.
const formatDayHeader = (raw) => {
  if (!raw) return '';
  const s = String(raw).replace(/\n/g, '').trim();
  // Si viene "DD/MM/YYYY" del back legacy, lo parseamos asumiendo Colombia.
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (m) {
    const [, dd, mm, yyyy] = m;
    // Construimos un ISO local Colombia para el helper.
    return fmtDayHeaderCO(`${yyyy}-${mm}-${dd}T12:00:00`);
  }
  return fmtDayHeaderCO(s);
};

const Money = ({value, color, prefix}) => (
  <NumericFormat
    value={Math.abs(Number(value) || 0)}
    displayType="text"
    thousandSeparator="."
    decimalSeparator=","
    prefix={(prefix || '') + '$'}
    renderText={(v) => (
      <Text style={[st.amount, color && {color}]}>{v}</Text>
    )}
  />
);

class BalanceScreen extends Component {
  state = {
    cancelTarget: null,
    cancelReason: '',
    cancelError: null,
    cancelling: false,
    filterType: 'all', // 'all' | 'income' | 'expense'
  };

  componentDidMount() {
    this.props.actions.getMovements(this.props.user.branch_office, true);
    this.props.actions.getBalance(this.props.user.uid);
    registerEventScreenMounted(this.props, 'Pantalla saldo y listado de movimientos', 'BalanceScreen');
    this._focusListener = this.props.navigation.addListener('focus', () => {
      this.props.actions.getMovements(this.props.user.branch_office, true);
      this.props.actions.getBalance(this.props.user.uid);
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.refetchTick !== this.props.refetchTick) {
      this.props.actions.getMovements(this.props.user.branch_office, true);
      this.props.actions.getBalance(this.props.user.uid);
    }
  }

  componentWillUnmount() {
    if (this._focusListener) this._focusListener();
  }

  // ── Filtros y conteos ─────────────────────────────────────
  isExpense = (item) => item?.movement === 'expense';
  isIncome = (item) => !this.isExpense(item);

  countByType() {
    const {list} = this.props;
    if (!list) return {all: 0, income: 0, expense: 0};
    let income = 0, expense = 0;
    list.forEach((g) => g.children.forEach((it) => {
      if (this.isExpense(it)) expense += 1;
      else income += 1;
    }));
    return {all: income + expense, income, expense};
  }

  getFilteredList() {
    const {list} = this.props;
    const {filterType} = this.state;
    if (!list || filterType === 'all') return list;
    return list
      .map((group) => ({
        ...group,
        children: group.children.filter((it) =>
          filterType === 'expense' ? this.isExpense(it) : this.isIncome(it),
        ),
      }))
      .filter((g) => g.children.length > 0);
  }

  // ── Cancelación inline (sheet) ────────────────────────────
  openCancelSheet = (item) => {
    if (item.status === 'CANCELLED') return;
    const nid = item.movement_id || item.id;
    const label = item.expense_type ? 'Pago ' + item.expense_type : (item.title || 'este registro');
    this.setState(
      {cancelTarget: {nid, label}, cancelReason: '', cancelError: null},
      () => this.RBSheet && this.RBSheet.open(),
    );
  };

  closeCancelSheet = () => {
    if (this.RBSheet) this.RBSheet.close();
    this.setState({cancelTarget: null, cancelReason: '', cancelError: null, cancelling: false});
  };

  confirmCancel = () => {
    const {cancelTarget, cancelReason} = this.state;
    if (!cancelTarget) return;
    const trimmed = cancelReason.trim();
    if (trimmed.length < MIN_REASON_LENGTH) {
      this.setState({cancelError: `Indica un motivo de al menos ${MIN_REASON_LENGTH} caracteres.`});
      return;
    }
    this.setState({cancelling: true, cancelError: null});
    this.props.actions.deleteMovementInline(cancelTarget.nid, trimmed, () => this.closeCancelSheet());
  };

  // ── Sub-header ────────────────────────────────────────────
  renderSubHeader() {
    return (
      <View style={st.subHeader}>
        <View style={{flex: 1}}>
          <Text style={st.title}>Movimientos</Text>
          <Text style={st.subtitle}>Libro mayor de la sucursal</Text>
        </View>
        <View style={st.totalBox}>
          <Text style={st.totalLabel}>SALDO TOTAL</Text>
          {/* El back devuelve un string ya formateado (ej: "$1.240.447").
              Lo mostramos crudo; si llega numérico/null, formateamos con
              NumericFormat como fallback. */}
          {typeof this.props.total === 'string' ? (
            <Text style={st.totalValue}>{this.props.total}</Text>
          ) : (
            <NumericFormat
              value={Number(this.props.total) || 0}
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="$"
              renderText={(v) => <Text style={st.totalValue}>{v}</Text>}
            />
          )}
        </View>
      </View>
    );
  }

  // ── Pills filtro ──────────────────────────────────────────
  renderFilters() {
    const counts = this.countByType();
    const opts = [
      {id: 'all', label: 'Todos', n: counts.all},
      {id: 'income', label: 'Ingresos', n: counts.income},
      {id: 'expense', label: 'Gastos', n: counts.expense},
    ];
    const {filterType} = this.state;
    return (
      <View style={st.filtersRow}>
        {opts.map((o) => {
          const on = filterType === o.id;
          return (
            <TouchableOpacity
              key={o.id}
              activeOpacity={0.8}
              onPress={() => this.setState({filterType: o.id})}
              style={[st.chip, on && st.chipActive]}>
              <Text style={[st.chipTxt, on && st.chipTxtActive]}>{o.label}</Text>
              <View style={[st.chipBadge, on && st.chipBadgeActive]}>
                <Text style={[st.chipBadgeTxt, on && st.chipBadgeTxtActive]}>{o.n}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // ── Render movimiento (fila) ──────────────────────────────
  renderItem = (item, idx) => {
    const expense = this.isExpense(item);
    const title = item.expense_type ? 'Pago ' + item.expense_type : (item.title || 'Movimiento');
    const personLabel = item.customer || item.provider || item.cashier_name || '';
    const hour = (item.hour || '').replace(/\n/g, '').trim();
    const subParts = [personLabel, hour].filter(Boolean);
    const total = item.total ? item.total : item.value * (item.qty || 1);
    const isCancelled = item.status === 'CANCELLED';
    const amountColor = expense ? RED : GREEN_TXT;
    const prefix = expense ? '−' : '+';

    let product = null;
    if (item.product) {
      product = [{label: item.product, nid: idx, price: total / (item.qty || 1), qty: item.qty || 1}];
    } else if (item.product_item) {
      product = [{label: item.product_item, nid: idx, price: total / (item.qty || 1), qty: item.qty || 1}];
    }

    return (
      <TouchableOpacity
        key={`${item.id || item.movement_id || idx}`}
        activeOpacity={0.85}
        style={[st.row, isCancelled && st.rowCancelled]}
        onPress={() =>
          this.props.navigation.navigate('BuyDetails', {
            details: {
              customer: item.customer,
              provider: item.provider,
              movementType: item.expense_type ? item.expense_type : item.title,
              paymentType: item.payment,
              value: item.expense_type ? total : item.value,
              paid: item.paid,
              observations: item.observations,
              total: total,
              order: item.order,
              orderConsecutive: item.consecutive,
              movement: item.movement,
              movement_id: item.movement_id,
              date: item.created.replace(/\n/g, '') + ' ' + hour,
              product,
              status: item.status,
              cancellationReason: item.cancellation_reason,
              cancelledByName: item.cancelled_by_name,
              cancelledAt: item.cancelled_at,
            },
          })
        }
        onLongPress={isCancelled ? null : () => this.openCancelSheet(item)}>
        <View style={[st.rowIcon, expense ? st.rowIconRed : st.rowIconGreen]}>
          <Icon
            source={expense ? 'arrow-down' : 'arrow-up'}
            size={20}
            color={expense ? RED : GREEN_TXT}
          />
        </View>
        <View style={{flex: 1, minWidth: 0}}>
          <Text style={[st.rowTitle, isCancelled && st.rowTitleCancelled]} numberOfLines={1}>
            {title}
            {isCancelled ? ' · Cancelado' : ''}
          </Text>
          {!!subParts.length && (
            <Text style={st.rowSub} numberOfLines={1}>
              {subParts.join(' · ')}
            </Text>
          )}
        </View>
        <Money value={total} color={isCancelled ? SUBTLE : amountColor} prefix={prefix} />
      </TouchableOpacity>
    );
  };

  // ── Body ──────────────────────────────────────────────────
  renderBody() {
    if (!this.props.list) {
      return (
        <View style={st.shimmerWrap}>
          {Array.from({length: 8}).map((_, i) => (
            <Shimmer key={i} style={{marginBottom: 10, borderRadius: 12}} height={56} width={'100%'} />
          ))}
        </View>
      );
    }
    if (this.props.list.length === 0) {
      return (
        <View style={st.empty}>
          <Icon source="swap-vertical" size={42} color={SUBTLE} />
          <Text style={st.emptyTxt}>Aún no tienes movimientos registrados</Text>
        </View>
      );
    }
    const filtered = this.getFilteredList() || [];
    if (filtered.length === 0) {
      return (
        <View style={st.empty}>
          <Icon source="filter-variant-remove" size={42} color={SUBTLE} />
          <Text style={st.emptyTxt}>No hay movimientos de este tipo</Text>
        </View>
      );
    }
    return (
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        onScrollEndDrag={({nativeEvent}) => {
          if (
            nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
            nativeEvent.contentSize.height - 1
          ) {
            this.props.actions.getMovements(this.props.user.branch_office, false);
          }
        }}
        refreshControl={
          <RefreshControl
            refreshing={!!this.props.showRrefresh}
            onRefresh={() => {
              this.props.actions.getMovements(this.props.user.branch_office, true);
              this.props.actions.getBalance(this.props.user.uid);
            }}
            progressViewOffset={10}
          />
        }
        showsVerticalScrollIndicator={false}>
        {filtered.map((group, gi) => (
          <View key={gi} style={{marginBottom: 14}}>
            <Text style={st.dayLabel}>{formatDayHeader(group.date)}</Text>
            <View style={st.groupCard}>
              {group.children.map((it, idx) => (
                <React.Fragment key={`${it.id || it.movement_id || idx}`}>
                  {idx > 0 && <View style={st.divider} />}
                  {this.renderItem(it, idx)}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}
        {this.props.showLoader && (
          <View style={{paddingVertical: 12}}>
            <ActivityIndicator size="small" color={GOLD} />
          </View>
        )}
      </ScrollView>
    );
  }

  render() {
    const {cancelTarget, cancelReason, cancelError, cancelling} = this.state;
    return (
      <AppShell active="movimientos">
        <View style={st.body}>
          {this.renderSubHeader()}
          {this.renderFilters()}
          <View style={{flex: 1, marginTop: 10}}>{this.renderBody()}</View>
        </View>

        <RBSheet
          ref={(ref) => {this.RBSheet = ref;}}
          height={360}
          openDuration={300}
          closeDuration={250}
          customStyles={{
            container: {
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              paddingHorizontal: 20,
              paddingTop: 18,
              paddingBottom: 24,
            },
          }}
          closeOnPressMask={!cancelling}
          onClose={() => {
            if (!cancelling) this.setState({cancelTarget: null, cancelReason: '', cancelError: null});
          }}>
          <Text style={{fontFamily: fonts.bold, fontSize: 18, color: INK, marginBottom: 6}}>
            Cancelar movimiento
          </Text>
          {cancelTarget && (
            <Text style={{fontFamily: fonts.regular, fontSize: 13, color: MUTED, marginBottom: 14}} numberOfLines={2}>
              {cancelTarget.label}
            </Text>
          )}
          <Text style={{fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginBottom: 6}}>
            El movimiento quedará marcado como Cancelado. Se revertirán inventario y caja automáticamente.
          </Text>
          <PaperInput
            mode="outlined"
            label="Motivo de cancelación *"
            placeholder="Ej: Cliente devolvió el producto"
            value={cancelReason}
            onChangeText={(t) => this.setState({cancelReason: t, cancelError: null})}
            multiline
            numberOfLines={3}
            maxLength={500}
            editable={!cancelling}
            error={!!cancelError}
            style={{marginTop: 8, backgroundColor: WHITE}}
          />
          <HelperText type="error" visible={!!cancelError}>
            {cancelError}
          </HelperText>
          <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18, columnGap: 10}}>
            <Button mode="outlined" onPress={this.closeCancelSheet} disabled={cancelling}>
              Volver
            </Button>
            <Button
              mode="contained"
              buttonColor="#E53935"
              textColor={WHITE}
              onPress={this.confirmCancel}
              loading={cancelling}
              disabled={cancelling || cancelReason.trim().length < MIN_REASON_LENGTH}>
              Confirmar cancelación
            </Button>
          </View>
        </RBSheet>
      </AppShell>
    );
  }
}

const st = StyleSheet.create({
  body: {flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 12},

  // ── Sub-header ──
  subHeader: {flexDirection: 'row', alignItems: 'center', paddingBottom: 12},
  backBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {fontFamily: fonts.bold, fontSize: 22, color: INK, letterSpacing: -0.3},
  subtitle: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},
  totalBox: {alignItems: 'flex-end'},
  totalLabel: {fontFamily: fonts.bold, fontSize: 10, color: DGOLD, letterSpacing: 1.2},
  totalValue: {fontFamily: fonts.bold, fontSize: 22, color: INK, marginTop: 2, letterSpacing: -0.3},

  // ── Filters (pills) ──
  filtersRow: {flexDirection: 'row', columnGap: 8, paddingVertical: 4},
  chip: {
    flexDirection: 'row', alignItems: 'center', columnGap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999, backgroundColor: WHITE,
    borderWidth: 1, borderColor: BORDER_SOFT,
  },
  chipActive: {backgroundColor: GOLD, borderColor: GOLD},
  chipTxt: {fontFamily: fonts.semiBold, fontSize: 13, color: INK},
  chipTxtActive: {color: WHITE},
  chipBadge: {
    minWidth: 22, paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: 999, backgroundColor: BORDER_SOFT, alignItems: 'center', justifyContent: 'center',
  },
  chipBadgeActive: {backgroundColor: 'rgba(255,255,255,0.32)'},
  chipBadgeTxt: {fontFamily: fonts.bold, fontSize: 10, color: MUTED},
  chipBadgeTxtActive: {color: WHITE},

  // ── Day header (HOY, AYER · 13 MAY) ──
  dayLabel: {
    fontFamily: fonts.bold, fontSize: 11, color: MUTED,
    letterSpacing: 1.2, marginBottom: 8, marginLeft: 4,
  },

  // ── Group card (envuelve todas las filas de un día) ──
  groupCard: {
    backgroundColor: WHITE, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER_SOFT,
    overflow: 'hidden',
  },
  divider: {height: 1, backgroundColor: BORDER_SOFT, marginLeft: 60},

  // ── Row (un movimiento) ──
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14, columnGap: 12,
  },
  rowCancelled: {opacity: 0.6},
  rowIcon: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  rowIconGreen: {backgroundColor: GREEN_BG},
  rowIconRed: {backgroundColor: RED_BG},
  rowTitle: {fontFamily: fonts.bold, fontSize: 14, color: INK},
  rowTitleCancelled: {textDecorationLine: 'line-through'},
  rowSub: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginTop: 2},
  amount: {fontFamily: fonts.bold, fontSize: 14, color: INK},

  // ── Estados ──
  shimmerWrap: {paddingTop: 4},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60},
  emptyTxt: {fontFamily: fonts.regular, fontSize: 14, color: MUTED, marginTop: 10, textAlign: 'center'},
});

export default BalanceScreen;
