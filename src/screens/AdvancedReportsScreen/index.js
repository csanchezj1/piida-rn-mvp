import React, {useCallback, useEffect, useState} from 'react';
import {Dimensions, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {ActivityIndicator, Button, Card, Divider, Icon, Text} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {BarChart, LineChart, PieChart} from 'react-native-chart-kit';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {Layout} from '../../layouts';
import {colors, fonts, normalizeSize} from '../../styles/basicStyles';
import Reports from '../../api/reports';

const GOLD = '#F7A928';
const RED = '#E5484D';
const PIE_COLORS = ['#F7A928', '#4C9AFF', '#36B37E', '#9F7AEA', '#FF8B5A', '#00B8D9', '#FFC400', '#8C6F60'];

const cop = (n) => {
  const v = Math.round(Number(n) || 0);
  return '$' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const pct = (cur, prev) => {
  if (!prev) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
};

// Date -> 'YYYY-MM-DD'
const ymd = (d) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const prettyDate = (s) => {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d.getDate()} ${meses[d.getMonth()]}`;
};

const CHART_W = Dimensions.get('window').width - normalizeSize(64);
const chartConfig = {
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  decimalPlaces: 0,
  color: (o = 1) => `rgba(26, 20, 16, ${o})`,
  labelColor: (o = 1) => `rgba(140, 111, 96, ${o})`,
  propsForBackgroundLines: {stroke: '#F0E8DA'},
  barPercentage: 0.6,
};

const AdvancedReportsScreen = () => {
  const navigation = useNavigation();
  const {user, password} = useSelector((s) => s.userData);

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo] = useState(today);
  const [picker, setPicker] = useState(null); // 'from' | 'to' | null

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [topSellers, setTopSellers] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [cash, setCash] = useState([]);

  // Resumen depende del rango de fechas; se recarga al cambiarlas.
  const loadSummary = useCallback(() => {
    setLoading(true);
    setError(null);
    Reports.getSummary({
      email: user?.email,
      password,
      dateFrom: ymd(dateFrom),
      dateTo: ymd(dateTo),
    })
      .then((res) => setSummary(res))
      .catch((e) => setError(e?.data?.message || 'No se pudo cargar el reporte.'))
      .finally(() => setLoading(false));
  }, [user, password, dateFrom, dateTo]);

  // Inventario y caja no dependen del rango — se cargan una vez.
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
      {label: 'Ventas', value: cop(k.total_sales), icon: 'cash', tint: '#36B37E', change: pct(k.total_sales, k.prev_total_sales)},
      {label: 'Gastos', value: cop(k.total_expenses), icon: 'receipt', tint: RED, change: pct(k.total_expenses, k.prev_total_expenses), invert: true},
      {label: 'Ganancia neta', value: cop(k.net_profit), icon: 'trending-up', tint: GOLD, change: pct(k.net_profit, prevNet)},
      {label: 'Ticket promedio', value: cop(k.avg_ticket), icon: 'wallet-outline', tint: '#4C9AFF', change: pct(k.avg_ticket, prevTicket)},
      {label: 'Operaciones', value: String(k.total_transactions ?? 0), icon: 'cart-outline', tint: '#9F7AEA', change: pct(k.total_transactions, k.prev_total_transactions)},
    ];
    return (
      <View style={styles.kpiGrid}>
        {items.map((it, i) => {
          // invert: para gastos, subir es "malo" (rojo).
          const good = it.invert ? it.change <= 0 : it.change >= 0;
          return (
            <View key={i} style={styles.kpiCard}>
              <View style={[styles.kpiIcon, {backgroundColor: it.tint + '22'}]}>
                <Icon source={it.icon} size={18} color={it.tint} />
              </View>
              <Text style={styles.kpiCardLabel}>{it.label}</Text>
              <Text style={styles.kpiCardValue} numberOfLines={1} adjustsFontSizeToFit>
                {it.value}
              </Text>
              <Text style={[styles.kpiCardChange, {color: good ? '#36B37E' : RED}]}>
                {it.change >= 0 ? '▲' : '▼'} {Math.abs(it.change)}% vs anterior
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  // ─── Evolución (línea/área) ─────────────────────────────────
  const renderEvolution = () => {
    const rows = summary?.sales_by_date || [];
    return (
      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Evolución de ventas y gastos</Text>
          {rows.length === 0 ? (
            <Text style={styles.empty}>Sin movimientos en el período.</Text>
          ) : (
            <LineChart
              data={{
                labels: rows.map((r, i) => {
                  const step = Math.ceil(rows.length / 6);
                  return i % step === 0 ? prettyDate(r.date) : '';
                }),
                datasets: [
                  {data: rows.map((r) => Number(r.sales) || 0), color: (o = 1) => `rgba(247,169,40,${o})`, strokeWidth: 2},
                  {data: rows.map((r) => Number(r.expenses) || 0), color: (o = 1) => `rgba(229,72,77,${o})`, strokeWidth: 2},
                ],
                legend: ['Ventas', 'Gastos'],
              }}
              width={CHART_W}
              height={normalizeSize(200)}
              chartConfig={chartConfig}
              bezier
              withInnerLines
              style={styles.chart}
            />
          )}
        </Card.Content>
      </Card>
    );
  };

  // ─── Ventas por método de pago (torta) ──────────────────────
  const renderPayments = () => {
    const rows = summary?.sales_by_payment_method || [];
    return (
      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Ventas por método de pago</Text>
          {rows.length === 0 ? (
            <Text style={styles.empty}>Sin ventas en el período.</Text>
          ) : (
            <PieChart
              data={rows.map((r, i) => ({
                name: r.method,
                total: Number(r.total) || 0,
                color: PIE_COLORS[i % PIE_COLORS.length],
                legendFontColor: colors.text,
                legendFontSize: normalizeSize(12),
              }))}
              width={CHART_W}
              height={normalizeSize(200)}
              chartConfig={chartConfig}
              accessor="total"
              backgroundColor="transparent"
              paddingLeft="8"
              absolute
            />
          )}
        </Card.Content>
      </Card>
    );
  };

  // ─── Gastos por tipo (barras) ───────────────────────────────
  const renderExpenses = () => {
    const rows = summary?.expenses_by_type || [];
    return (
      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Gastos por tipo</Text>
          {rows.length === 0 ? (
            <Text style={styles.empty}>Sin gastos en el período.</Text>
          ) : (
            <BarChart
              data={{
                labels: rows.map((r) => String(r.type || '').slice(0, 8)),
                datasets: [{data: rows.map((r) => Number(r.total) || 0)}],
              }}
              width={CHART_W}
              height={normalizeSize(220)}
              chartConfig={{...chartConfig, color: (o = 1) => `rgba(229,72,77,${o})`}}
              fromZero
              showValuesOnTopOfBars
              verticalLabelRotation={20}
              style={styles.chart}
            />
          )}
        </Card.Content>
      </Card>
    );
  };

  // ─── Top productos (barras) ─────────────────────────────────
  const renderTopSellers = () => (
    <Card mode="outlined" style={styles.card}>
      <Card.Content>
        <Text style={styles.cardTitle}>Productos más vendidos</Text>
        {topSellers.length === 0 ? (
          <Text style={styles.empty}>Sin ventas registradas.</Text>
        ) : (
          <BarChart
            data={{
              labels: topSellers.map((p) => String(p.product_name || '').slice(0, 8)),
              datasets: [{data: topSellers.map((p) => Number(p.quantity_sold) || 0)}],
            }}
            width={CHART_W}
            height={normalizeSize(220)}
            chartConfig={{...chartConfig, color: (o = 1) => `rgba(247,169,40,${o})`}}
            fromZero
            showValuesOnTopOfBars
            verticalLabelRotation={20}
            style={styles.chart}
          />
        )}
      </Card.Content>
    </Card>
  );

  // ─── Stock bajo (tabla + botón) ─────────────────────────────
  const stockStatus = (it) => {
    const s = Number(it.stock) || 0;
    const th = Number(it.threshold) || 10;
    if (s <= 0) return {label: 'Agotado', color: RED};
    if (s <= th / 2) return {label: 'Crítico', color: '#E8830C'};
    return {label: 'Bajo', color: GOLD};
  };
  const renderLowStock = () => (
    <Card mode="outlined" style={styles.card}>
      <Card.Content>
        <Text style={styles.cardTitle}>Productos con stock bajo</Text>
        {lowStock.length === 0 ? (
          <Text style={styles.empty}>Todo el inventario está por encima del umbral.</Text>
        ) : (
          lowStock.map((it, i) => {
            const st = stockStatus(it);
            return (
              <View key={i}>
                {i > 0 && <Divider />}
                <View style={styles.tableRow}>
                  <View style={{flex: 1, paddingRight: normalizeSize(8)}}>
                    <Text style={styles.rowMain} numberOfLines={1}>
                      {it.product_name}
                    </Text>
                    <Text style={styles.rowSub} numberOfLines={1}>
                      {it.branch_name || 'Sucursal'}
                    </Text>
                  </View>
                  <Text style={styles.rowValue}>{it.stock} und</Text>
                  <View style={[styles.badge, {backgroundColor: st.color + '22'}]}>
                    <Text style={[styles.badgeText, {color: st.color}]}>{st.label}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
        <Button
          mode="outlined"
          icon="package-variant"
          onPress={() => navigation.navigate('InventoryList')}
          style={{marginTop: normalizeSize(12)}}
          contentStyle={{paddingVertical: normalizeSize(4)}}>
          Ver todo el inventario
        </Button>
      </Card.Content>
    </Card>
  );

  // ─── Historial de cierres de caja ───────────────────────────
  const renderCash = () => (
    <Card mode="outlined" style={styles.card}>
      <Card.Content>
        <Text style={styles.cardTitle}>Historial de cierres de caja</Text>
        {cash.length === 0 ? (
          <Text style={styles.empty}>Sin cierres de caja registrados.</Text>
        ) : (
          cash.map((c, i) => {
            const mismatch = Number(c.mismatch) || 0;
            return (
              <View key={i}>
                {i > 0 && <Divider />}
                <View style={styles.tableRow}>
                  <View style={{flex: 1, paddingRight: normalizeSize(8)}}>
                    <Text style={styles.rowMain} numberOfLines={1}>
                      {prettyDate(c.closed_at || c.opened_at)}
                      {c.branch_name ? ` · ${c.branch_name}` : ''}
                    </Text>
                    <Text style={styles.rowSub} numberOfLines={1}>
                      {c.author || 'Cajero'} · cierre {cop(c.closing_money)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.rowValue,
                      {color: mismatch === 0 ? '#36B37E' : RED},
                    ]}>
                    {mismatch === 0
                      ? 'Cuadrada'
                      : (mismatch > 0 ? '+' : '') + cop(mismatch)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </Card.Content>
    </Card>
  );

  return (
    <Layout hideLogo title="Reportes" subtitle="del negocio">
      <ScrollView
        style={{width: '100%'}}
        contentContainerStyle={{
          paddingHorizontal: normalizeSize(16),
          paddingBottom: normalizeSize(40),
        }}>
        {/* Filtro de fechas */}
        <View style={styles.dateRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.dateBtn}
            onPress={() => setPicker('from')}>
            <Icon source="calendar-start" size={18} color={colors.purplishGrey} />
            <View>
              <Text style={styles.dateLabel}>Desde</Text>
              <Text style={styles.dateValue}>{ymd(dateFrom)}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.dateBtn}
            onPress={() => setPicker('to')}>
            <Icon source="calendar-end" size={18} color={colors.purplishGrey} />
            <View>
              <Text style={styles.dateLabel}>Hasta</Text>
              <Text style={styles.dateValue}>{ymd(dateTo)}</Text>
            </View>
          </TouchableOpacity>
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

        {loading && (
          <ActivityIndicator
            size="large"
            color={colors.buttonBackground}
            style={{marginTop: normalizeSize(40)}}
          />
        )}
        {!loading && error && (
          <Text style={[styles.empty, {marginTop: normalizeSize(40)}]}>{error}</Text>
        )}
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
    </Layout>
  );
};

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: 'row',
    gap: normalizeSize(10),
    marginTop: normalizeSize(12),
  },
  dateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalizeSize(8),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DCCB',
    borderRadius: normalizeSize(10),
    paddingVertical: normalizeSize(8),
    paddingHorizontal: normalizeSize(12),
  },
  dateLabel: {
    fontFamily: fonts.regular,
    fontSize: normalizeSize(10),
    color: colors.purplishGrey,
  },
  dateValue: {
    fontFamily: fonts.bold,
    fontSize: normalizeSize(13),
    color: colors.text,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalizeSize(10),
    marginTop: normalizeSize(12),
  },
  kpiCard: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: normalizeSize(150),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DCCB',
    borderRadius: normalizeSize(12),
    padding: normalizeSize(12),
  },
  kpiIcon: {
    width: normalizeSize(32),
    height: normalizeSize(32),
    borderRadius: normalizeSize(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalizeSize(8),
  },
  kpiCardLabel: {
    fontFamily: fonts.regular,
    fontSize: normalizeSize(12),
    color: colors.purplishGrey,
  },
  kpiCardValue: {
    fontFamily: fonts.bold,
    fontSize: normalizeSize(18),
    color: colors.text,
    marginTop: 2,
  },
  kpiCardChange: {
    fontFamily: fonts.regular,
    fontSize: normalizeSize(10),
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginTop: normalizeSize(12),
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: normalizeSize(15),
    color: colors.buttonBackground,
    marginBottom: normalizeSize(8),
  },
  chart: {
    borderRadius: normalizeSize(12),
    marginLeft: -normalizeSize(8),
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: normalizeSize(13),
    color: colors.purplishGrey,
    textAlign: 'center',
    paddingVertical: normalizeSize(16),
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalizeSize(8),
  },
  rowMain: {
    fontFamily: fonts.bold,
    fontSize: normalizeSize(13),
    color: colors.text,
  },
  rowSub: {
    fontFamily: fonts.regular,
    fontSize: normalizeSize(11),
    color: colors.purplishGrey,
    marginTop: 1,
  },
  rowValue: {
    fontFamily: fonts.bold,
    fontSize: normalizeSize(13),
    color: colors.text,
    marginRight: normalizeSize(8),
  },
  badge: {
    paddingHorizontal: normalizeSize(8),
    paddingVertical: normalizeSize(3),
    borderRadius: normalizeSize(8),
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: normalizeSize(10),
  },
});

export default AdvancedReportsScreen;
