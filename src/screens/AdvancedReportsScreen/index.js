import React, {useCallback, useEffect, useState} from 'react';
import {Dimensions, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {ActivityIndicator, Icon, Text} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {BarChart, LineChart, PieChart} from 'react-native-chart-kit';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AppShell from '../../layouts/AppShell';
import {fonts} from '../../styles/basicStyles';
import Reports from '../../api/reports';

const INK = '#1A130C';
const DGOLD = '#C66E00';
const MUTED = '#7E6A52';
const GOLD = '#F7A928';
const GREEN = '#36B37E';
const RED = '#E5484D';
const WHITE = '#FFFFFF';
const FIELD_BORDER = '#EFE3D2';
const PIE_COLORS = ['#F7A928', '#4C9AFF', '#36B37E', '#9F7AEA', '#FF8B5A', '#00B8D9', '#FFC400', '#8C6F60'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const cop = (n) => '$' + (Math.round(Number(n) || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const pct = (cur, prev) => (!prev ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100));
const ymd = (d) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const longDate = (d) => `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
const shortDate = (s) => {
  if (!s) return '';
  // Las claves llegan como 'YYYY-MM-DD'. new Date('YYYY-MM-DD') las parsea
  // como UTC: en Colombia (UTC-5) getDate() devolvía el día ANTERIOR y el
  // eje de la gráfica quedaba corrido un día. Parseamos los componentes
  // como fecha local.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  const d = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(s);
  return isNaN(d.getTime()) ? s : `${d.getDate()} ${MESES[d.getMonth()]}`;
};

// Lista de TODOS los días entre dos fechas (YYYY-MM-DD), inclusive.
const eachDay = (from, to) => {
  const out = [];
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const last = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  while (cur <= last) {
    out.push(ymd(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
};

const CHART_W = Dimensions.get('window').width - 88 - 48 - 36;
const chartConfig = {
  backgroundGradientFrom: WHITE,
  backgroundGradientTo: WHITE,
  decimalPlaces: 0,
  color: (o = 1) => `rgba(26, 19, 12, ${o})`,
  labelColor: (o = 1) => `rgba(126, 106, 82, ${o})`,
  propsForBackgroundLines: {stroke: '#F0E8DA'},
  barPercentage: 0.6,
};

const AdvancedReportsScreen = () => {
  const navigation = useNavigation();
  const {user, password} = useSelector((st) => st.userData);

  const today = new Date();
  const [dateFrom, setDateFrom] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [dateTo, setDateTo] = useState(today);
  const [picker, setPicker] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [topSellers, setTopSellers] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [cash, setCash] = useState([]);
  const [tip, setTip] = useState(null); // punto tocado en la gráfica

  const loadSummary = useCallback(() => {
    setLoading(true);
    setError(null);
    Reports.getSummary({email: user?.email, password, dateFrom: ymd(dateFrom), dateTo: ymd(dateTo)})
      .then((res) => setSummary(res))
      .catch((e) => setError(e?.data?.message || 'No se pudo cargar el reporte.'))
      .finally(() => setLoading(false));
  }, [user, password, dateFrom, dateTo]);

  const loadStatic = useCallback(() => {
    Reports.getTopSellers({email: user?.email, password})
      .then((res) => setTopSellers(Array.isArray(res) ? res : []))
      .catch(() => setTopSellers([]));
    Reports.getLowStock({email: user?.email, password})
      .then((res) => setLowStock(Array.isArray(res) ? res : []))
      .catch(() => setLowStock([]));
    Reports.getCashStatus({email: user?.email, password})
      .then((res) => setCash(Array.isArray(res?.history) ? res.history : []))
      .catch(() => setCash([]));
  }, [user, password]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);
  useEffect(() => {
    loadStatic();
  }, [loadStatic]);

  // ─── KPIs ───────────────────────────────────────────────────
  const renderKpis = () => {
    const k = summary?.kpis;
    if (!k) return null;
    const prevNet = (k.prev_total_sales || 0) - (k.prev_total_expenses || 0);
    const prevTicket = k.prev_total_transactions
      ? (k.prev_total_sales || 0) / k.prev_total_transactions
      : 0;
    const items = [
      {label: 'Ventas', value: cop(k.total_sales), icon: 'cash', tint: GREEN, change: pct(k.total_sales, k.prev_total_sales)},
      {label: 'Gastos', value: cop(k.total_expenses), icon: 'receipt', tint: RED, change: pct(k.total_expenses, k.prev_total_expenses), invert: true},
      {label: 'Ganancia neta', value: cop(k.net_profit), icon: 'trending-up', tint: GOLD, change: pct(k.net_profit, prevNet)},
      {label: 'Ticket promedio', value: cop(k.avg_ticket), icon: 'wallet-outline', tint: '#4C9AFF', change: pct(k.avg_ticket, prevTicket)},
      {label: 'Operaciones', value: String(k.total_transactions ?? 0), icon: 'cart-outline', tint: '#9F7AEA', change: pct(k.total_transactions, k.prev_total_transactions)},
    ];
    return (
      <View style={s.kpiGrid}>
        {items.map((it, i) => {
          const good = it.invert ? it.change <= 0 : it.change >= 0;
          return (
            <View key={i} style={s.kpiCard}>
              <View style={[s.kpiIcon, {backgroundColor: it.tint + '22'}]}>
                <Icon source={it.icon} size={18} color={it.tint} />
              </View>
              <Text style={s.kpiLabel}>{it.label}</Text>
              <Text style={s.kpiValue} numberOfLines={1} adjustsFontSizeToFit>
                {it.value}
              </Text>
              <Text style={[s.kpiChange, {color: good ? GREEN : RED}]}>
                {it.change >= 0 ? '▲' : '▼'} {Math.abs(it.change)}% vs anterior
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const card = (title, subtitle, body) => (
    <View style={s.card}>
      <Text style={s.cardTitle}>{title}</Text>
      {!!subtitle && <Text style={s.cardSub}>{subtitle}</Text>}
      <View style={{marginTop: 12}}>{body}</View>
    </View>
  );

  const renderEvolution = () => {
    // Rellenamos TODOS los días del rango: los que no tienen movimientos van en 0.
    const dayMap = {};
    (summary?.sales_by_date || []).forEach((r) => {
      dayMap[r.date] = r;
    });
    const days = eachDay(dateFrom, dateTo).map((key) => ({
      date: key,
      sales: Number(dayMap[key]?.sales) || 0,
      expenses: Number(dayMap[key]?.expenses) || 0,
    }));
    // Índices a etiquetar: hasta 6, repartidos parejo e incluyendo SIEMPRE
    // el primer y el último día — así el día de hoy queda visible en el eje.
    const labelIdx = new Set();
    const labelCount = Math.min(6, days.length);
    for (let k = 0; k < labelCount; k++) {
      labelIdx.add(
        Math.round((k * (days.length - 1)) / Math.max(1, labelCount - 1)),
      );
    }
    return card(
      'Evolución de ventas y gastos',
      'Ventas vs gastos del período · tocá un punto para ver el detalle',
      days.length === 0 ? (
        <Text style={s.empty}>Seleccioná un rango de fechas válido.</Text>
      ) : (
        <View style={{position: 'relative'}}>
          <LineChart
            data={{
              labels: days.map((r, i) => (labelIdx.has(i) ? shortDate(r.date) : '')),
              datasets: [
                {data: days.map((r) => r.sales), color: (o = 1) => `rgba(247,169,40,${o})`, strokeWidth: 2},
                {data: days.map((r) => r.expenses), color: (o = 1) => `rgba(194,66,19,${o})`, strokeWidth: 2},
              ],
              legend: ['Ventas', 'Gastos'],
            }}
            width={CHART_W}
            height={210}
            chartConfig={chartConfig}
            bezier
            style={s.chart}
            onDataPointClick={({index, x, y}) =>
              setTip((p) => (p && p.index === index ? null : {index, x, y}))
            }
          />
          {tip && days[tip.index] && (
            <View
              style={[
                s.tooltip,
                {
                  left: Math.max(0, Math.min(tip.x - 72, CHART_W - 144)),
                  top: Math.max(0, tip.y - 72),
                },
              ]}>
              <Text style={s.tipDay}>{shortDate(days[tip.index].date)}</Text>
              <Text style={s.tipLine}>Ventas: {cop(days[tip.index].sales)}</Text>
              <Text style={s.tipLine}>Gastos: {cop(days[tip.index].expenses)}</Text>
            </View>
          )}
        </View>
      ),
    );
  };

  const renderPayments = () => {
    const rows = summary?.sales_by_payment_method || [];
    return card(
      'Ventas por método de pago',
      'Distribución del período',
      rows.length === 0 ? (
        <Text style={s.empty}>Sin ventas en el período.</Text>
      ) : (
        <PieChart
          data={rows.map((r, i) => ({
            name: r.method,
            total: Number(r.total) || 0,
            color: PIE_COLORS[i % PIE_COLORS.length],
            legendFontColor: MUTED,
            legendFontSize: 12,
          }))}
          width={CHART_W}
          height={200}
          chartConfig={chartConfig}
          accessor="total"
          backgroundColor="transparent"
          paddingLeft="8"
          absolute
        />
      ),
    );
  };

  const renderExpenses = () => {
    const rows = summary?.expenses_by_type || [];
    return card(
      'Gastos por tipo',
      'Total por categoría',
      rows.length === 0 ? (
        <Text style={s.empty}>Sin gastos en el período.</Text>
      ) : (
        <BarChart
          data={{
            labels: rows.map((r) => String(r.type || '').slice(0, 8)),
            datasets: [{data: rows.map((r) => Number(r.total) || 0)}],
          }}
          width={CHART_W}
          height={220}
          chartConfig={{...chartConfig, color: (o = 1) => `rgba(229,72,77,${o})`}}
          fromZero
          showValuesOnTopOfBars
          verticalLabelRotation={20}
          style={s.chart}
        />
      ),
    );
  };

  const renderTopSellers = () =>
    card(
      'Productos más vendidos',
      'Top 10 por unidades',
      topSellers.length === 0 ? (
        <Text style={s.empty}>Sin ventas registradas.</Text>
      ) : (
        <BarChart
          data={{
            labels: topSellers.map((p) => String(p.product_name || '').slice(0, 8)),
            datasets: [{data: topSellers.map((p) => Number(p.quantity_sold) || 0)}],
          }}
          width={CHART_W}
          height={220}
          chartConfig={{...chartConfig, color: (o = 1) => `rgba(247,169,40,${o})`}}
          fromZero
          showValuesOnTopOfBars
          verticalLabelRotation={20}
          style={s.chart}
        />
      ),
    );

  const stockStatus = (it) => {
    const st = Number(it.stock) || 0;
    const th = Number(it.threshold) || 10;
    if (st <= 0) return {label: 'Agotado', color: RED};
    if (st <= th / 2) return {label: 'Crítico', color: '#E8830C'};
    return {label: 'Bajo', color: GOLD};
  };

  const renderLowStock = () =>
    card(
      'Productos con stock bajo',
      'Por debajo del umbral de 10 unidades',
      <>
        {lowStock.length === 0 ? (
          <Text style={s.empty}>Todo el inventario está por encima del umbral.</Text>
        ) : (
          lowStock.map((it, i) => {
            const st = stockStatus(it);
            return (
              <View key={i} style={[s.row, i > 0 && s.rowBorder]}>
                <View style={{flex: 1, paddingRight: 8}}>
                  <Text style={s.rowMain} numberOfLines={1}>{it.product_name}</Text>
                  <Text style={s.rowSub} numberOfLines={1}>{it.branch_name || 'Sucursal'}</Text>
                </View>
                <Text style={s.rowValue}>{it.stock} und</Text>
                <View style={[s.badge, {backgroundColor: st.color + '22'}]}>
                  <Text style={[s.badgeText, {color: st.color}]}>{st.label}</Text>
                </View>
              </View>
            );
          })
        )}
        <TouchableOpacity
          activeOpacity={0.85}
          style={s.inventoryBtn}
          onPress={() => navigation.navigate('InventoryList')}>
          <Icon source="package-variant" size={18} color={DGOLD} />
          <Text style={s.inventoryBtnText}>Ver todo el inventario</Text>
        </TouchableOpacity>
      </>,
    );

  const renderCash = () =>
    card(
      'Historial de cierres de caja',
      'Últimos cierres registrados',
      cash.length === 0 ? (
        <Text style={s.empty}>Sin cierres de caja registrados.</Text>
      ) : (
        cash.map((c, i) => {
          const mismatch = Number(c.mismatch) || 0;
          return (
            <View key={i} style={[s.row, i > 0 && s.rowBorder]}>
              <View style={{flex: 1, paddingRight: 8}}>
                <Text style={s.rowMain} numberOfLines={1}>
                  {shortDate(c.closed_at || c.opened_at)}
                  {c.branch_name ? ` · ${c.branch_name}` : ''}
                </Text>
                <Text style={s.rowSub} numberOfLines={1}>
                  {c.author || 'Cajero'} · cierre {cop(c.closing_money)}
                </Text>
              </View>
              <Text style={[s.rowValue, {color: mismatch === 0 ? GREEN : RED}]}>
                {mismatch === 0 ? 'Cuadrada' : (mismatch > 0 ? '+' : '') + cop(mismatch)}
              </Text>
            </View>
          );
        })
      ),
    );

  return (
    <AppShell active="reportes">
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <View style={{flex: 1, paddingRight: 12}}>
            <Text style={s.title}>Reportes del negocio</Text>
            <Text style={s.subtitle}>
              Ventas, gastos, inventario y cajas en el período seleccionado
            </Text>
          </View>
          <View style={s.dateRow}>
            <TouchableOpacity activeOpacity={0.7} style={s.dateBtn} onPress={() => setPicker('from')}>
              <Icon source="calendar-start" size={18} color={INK} />
              <View>
                <Text style={s.dateLabel}>DESDE</Text>
                <Text style={s.dateValue}>{longDate(dateFrom)}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} style={s.dateBtn} onPress={() => setPicker('to')}>
              <Icon source="calendar-end" size={18} color={INK} />
              <View>
                <Text style={s.dateLabel}>HASTA</Text>
                <Text style={s.dateValue}>{longDate(dateTo)}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <DateTimePickerModal
          isVisible={picker !== null}
          mode="date"
          date={picker === 'to' ? dateTo : dateFrom}
          maximumDate={new Date()}
          onConfirm={(d) => {
            if (picker === 'to') setDateTo(d);
            else setDateFrom(d);
            setPicker(null);
          }}
          onCancel={() => setPicker(null)}
        />

        {loading && <ActivityIndicator size="large" color={GOLD} style={{marginTop: 60}} />}
        {!loading && error && <Text style={[s.empty, {marginTop: 60}]}>{error}</Text>}
        {!loading && !error && summary && (
          <>
            {renderKpis()}
            {renderEvolution()}
            {renderPayments()}
            {renderExpenses()}
            {renderTopSellers()}
            {renderLowStock()}
            {renderCash()}
          </>
        )}
      </ScrollView>
    </AppShell>
  );
};

const s = StyleSheet.create({
  // paddingBottom grande: la sección final (gráfico de pago) quedaba pegada
  // al borde y la última fila se cortaba. flexGrow:1 asegura que la
  // ScrollView siempre ocupe la altura disponible del padre.
  scroll: {padding: 24, paddingBottom: 120, flexGrow: 1},

  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    letterSpacing: -0.6,
    color: INK,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: MUTED,
    marginTop: 4,
  },
  dateRow: {flexDirection: 'row', columnGap: 10},
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dateLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 1,
    color: MUTED,
  },
  dateValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: INK,
    marginTop: 3,
  },

  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 4,
  },
  kpiCard: {
    flexGrow: 1,
    flexBasis: '17%',
    minWidth: 140,
    height: 100,
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#3C1E0A',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  kpiIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  kpiLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: MUTED,
    includeFontPadding: false,
  },
  kpiValue: {
    fontFamily: fonts.bold,
    fontSize: 17,
    letterSpacing: -0.5,
    color: INK,
    marginTop: 1,
    includeFontPadding: false,
  },
  kpiChange: {
    fontFamily: fonts.bold,
    fontSize: 10,
    marginTop: 2,
    includeFontPadding: false,
  },

  card: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 18,
    marginTop: 12,
    shadowColor: '#3C1E0A',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    letterSpacing: -0.2,
    color: DGOLD,
  },
  cardSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -8,
  },
  tooltip: {
    position: 'absolute',
    width: 144,
    backgroundColor: INK,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tipDay: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: GOLD,
    marginBottom: 2,
  },
  tipLine: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: WHITE,
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F1E9DB',
  },
  rowMain: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: INK,
  },
  rowSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: MUTED,
    marginTop: 1,
  },
  rowValue: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: INK,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  inventoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F0E1C8',
    backgroundColor: '#FFF8EC',
  },
  inventoryBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: DGOLD,
  },
});

export default AdvancedReportsScreen;
