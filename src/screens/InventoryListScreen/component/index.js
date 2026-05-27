import React, {Component} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon, Text} from 'react-native-paper';
import {NumericFormat} from 'react-number-format';
import AppShell from '../../../layouts/AppShell';
import {Shimmer} from '../../../components';
import {fonts} from '../../../styles/basicStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';
import API from '../../../api/api';

const GOLD = '#F7A928';
const DGOLD = '#C66E00';
const TINT_GOLD = '#FFF1D6';
const SOFT_GOLD = '#FFF6E1';
const INK = '#1A130C';
const MUTED = '#7E6A52';
const SUBTLE = '#A89580';
const WHITE = '#FFFFFF';
const BORDER_SOFT = '#EFE3D2';
const GREEN_BG = '#E6F4EA';
const GREEN_TXT = '#1F8A4C';
const GREEN_BORDER = '#BFE6CD';
const RED = '#D7263D';
const RED_BG = '#FBE7EA';
const RED_BORDER = '#F0BCC4';
const AMBER_TXT = '#C66E00';
const AMBER_BG = '#FFF4D6';
const AMBER_BORDER = '#F0D592';

// Paleta para los círculos de categorías (cíclica si hay más categorías).
const CAT_COLORS = [
  '#F7A928', // gold
  '#7032E0', // purple
  '#3B82F6', // blue
  '#10B981', // green
  '#EF4444', // red
  '#0EA5E9', // sky
  '#E11D48', // rose
  '#F59E0B', // amber
  '#22C55E', // green2
  '#8B5CF6', // violet
];
const colorForCat = (key, index) => CAT_COLORS[index % CAT_COLORS.length];

const stockOf = (p) => Number(p?.available ?? p?.stock ?? 0);
const isLow = (p) => {
  const s = stockOf(p);
  const min = Number(p?.min_stock ?? 5);
  return s > 0 && s <= min;
};
const isOut = (p) => stockOf(p) <= 0;

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

class InventoryListScreen extends Component {
  state = {
    selectedCat: 'all', // 'all' | category id (string)
    filter: 'all', // 'all' | 'low' | 'out' | 'movements'
    compact: false, // oculta KPIs + sidebar Categorías para maximizar tabla
    // Pestaña Movimientos:
    movements: null, // null = loading, [] = vacío
    movementsLoading: false,
    movementsOffset: 0,
    movementsHasMore: true,
    movType: 'all', // 'all' | 'in' | 'out' | enum específico
    movFrom: '', // 'YYYY-MM-DD' o ''
    movTo: '',
    movFiltersOpen: false, // Por defecto los chips de tipo + rango fechas
                            // están colapsados para maximizar el área de la
                            // tabla de movimientos. Botón en el panel toggle.
  };

  componentDidMount() {
    registerEventScreenMounted(
      this.props,
      'Listado de inventario por producto',
      'InventoryListScreen',
    );
    this.props.actions.getProducts(true);
    // Refresca al volver a la pantalla (tras crear/cancelar/trasladar) —
    // sin esto, el cliente RN mostraba la lista cacheada y los movimientos
    // recién creados (ej. traslado a las 7pm) no aparecían hasta cerrar y
    // abrir la app.
    this._focusListener = this.props.navigation.addListener('focus', () => {
      this.props.actions.getProducts(true);
      if (this.state.filter === 'movements') {
        this.fetchMovements(true);
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.refetchTick !== this.props.refetchTick) {
      this.props.actions.getProducts(true);
      if (this.state.filter === 'movements' && this.state.movements != null) {
        this.fetchMovements(true);
      }
    }
  }

  componentWillUnmount() {
    if (this._focusListener) this._focusListener();
  }

  onSearch = (text) => this.props.actions.textChange(text);
  onSubmitSearch = () => {
    this.props.actions.getProducts(true);
    this.props.actions.clearSearch();
  };
  onClearSearch = () => {
    this.props.actions.textChange(null);
    this.props.actions.getProducts(true);
  };

  onEndReached = () => {
    if (!this.props.showLoader) {
      this.props.actions.getProducts(false);
    }
  };

  // Agrupa categorías presentes en la lista cargada.
  buildCategories(list) {
    const map = new Map();
    list.forEach((p) => {
      const id = p.cat ?? null;
      const key = id == null ? 'null' : String(id);
      const name = p.category || 'Sin categoría';
      if (!map.has(key)) map.set(key, {key, id, name, count: 0});
      map.get(key).count += 1;
    });
    return [...map.values()].sort((a, b) => b.count - a.count);
  }

  applyFilters(list) {
    let out = list;
    if (this.state.selectedCat !== 'all') {
      out = out.filter((p) => {
        const id = p.cat ?? null;
        const key = id == null ? 'null' : String(id);
        return key === this.state.selectedCat;
      });
    }
    if (this.state.filter === 'low') out = out.filter(isLow);
    if (this.state.filter === 'out') out = out.filter(isOut);
    return out;
  }

  computeKpis(list) {
    const products = list.length;
    let units = 0;
    let value = 0;
    let alerts = 0;
    list.forEach((p) => {
      const s = stockOf(p);
      const cost = Number(p?.cost) || 0;
      units += s;
      value += s * cost;
      if (isLow(p) || isOut(p)) alerts += 1;
    });
    return {products, units, value, alerts};
  }

  renderSubHeader() {
    const branch =
      this.props.user?.branch_office_name ||
      this.props.user?.company_name ||
      'Sucursal';
    return (
      <View style={st.subHeader}>
        <View style={{flex: 1}}>
          <Text style={st.subHeaderTitle}>Inventario</Text>
          <Text style={st.subHeaderSub}>{branch}</Text>
        </View>
        <TouchableOpacity
          style={st.iconBtn}
          activeOpacity={0.85}
          onPress={() => this.setState((s) => ({compact: !s.compact}))}>
          <Icon
            source={this.state.compact ? 'arrow-expand' : 'arrow-collapse'}
            size={18}
            color={INK}
          />
          <Text style={st.outlineBtnTxt}>{this.state.compact ? 'Mostrar' : 'Compactar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={st.outlineBtn}
          activeOpacity={0.85}
          onPress={() => this.props.navigation.navigate('Transfer')}>
          <Icon source="swap-horizontal" size={18} color={INK} />
          <Text style={st.outlineBtnTxt}>Trasladar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={st.primaryBtn}
          activeOpacity={0.85}
          onPress={() => this.props.navigation.navigate('AddInventory')}>
          <Icon source="plus" size={18} color={WHITE} />
          <Text style={st.primaryBtnTxt}>Surtir inventario</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderKpis(kpis) {
    const cards = [
      {
        label: 'PRODUCTOS',
        value: String(kpis.products),
        hint: 'distintos en catálogo',
        tone: 'neutral',
      },
      {
        label: 'UNIDADES TOTAL',
        value: kpis.units.toLocaleString('es-CO'),
        hint: 'en stock',
        tone: 'neutral',
      },
      {
        label: 'VALOR INVENTARIO',
        money: kpis.value,
        hint: 'al costo',
        tone: 'gold',
      },
      {
        label: 'ALERTAS',
        value: String(kpis.alerts),
        hint:
          kpis.alerts === 1
            ? 'producto bajo umbral'
            : 'productos bajo umbral',
        tone: kpis.alerts > 0 ? 'red' : 'neutral',
      },
    ];
    return (
      <View style={st.kpisRow}>
        {cards.map((c, i) => (
          <View
            key={i}
            style={[
              st.kpiCard,
              c.tone === 'gold' && st.kpiCardGold,
              c.tone === 'red' && st.kpiCardRed,
            ]}>
            <Text style={st.kpiLabel}>{c.label}</Text>
            {c.money != null ? (
              <Money
                value={c.money}
                style={[
                  st.kpiValue,
                  c.tone === 'gold' && st.kpiValueGold,
                  c.tone === 'red' && st.kpiValueRed,
                ]}
              />
            ) : (
              <Text
                style={[
                  st.kpiValue,
                  c.tone === 'gold' && st.kpiValueGold,
                  c.tone === 'red' && st.kpiValueRed,
                ]}>
                {c.value}
              </Text>
            )}
            <Text style={st.kpiHint}>{c.hint}</Text>
          </View>
        ))}
      </View>
    );
  }

  renderCategories(categories, totalLoaded) {
    return (
      <View style={st.catCol}>
        <Text style={st.catColTitle}>CATEGORÍAS</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => this.setState({selectedCat: 'all'})}
            style={[
              st.catItem,
              this.state.selectedCat === 'all' && st.catItemActive,
            ]}>
            <View style={[st.catDot, {backgroundColor: GOLD}]} />
            <Text
              style={[
                st.catName,
                this.state.selectedCat === 'all' && st.catNameActive,
              ]}>
              Todas
            </Text>
            <View style={st.catBadge}>
              <Text style={st.catBadgeTxt}>{totalLoaded}</Text>
            </View>
          </TouchableOpacity>
          {categories.map((c, idx) => {
            const on = this.state.selectedCat === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                activeOpacity={0.8}
                onPress={() => this.setState({selectedCat: c.key})}
                style={[st.catItem, on && st.catItemActive]}>
                <View
                  style={[st.catDot, {backgroundColor: colorForCat(c.key, idx)}]}
                />
                <Text
                  style={[st.catName, on && st.catNameActive]}
                  numberOfLines={1}>
                  {c.name}
                </Text>
                <View style={st.catBadge}>
                  <Text style={st.catBadgeTxt}>{c.count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // ── Movimientos ──────────────────────────────────────────
  fetchMovements = (reset = false) => {
    const branch = this.props.user?.branch_office;
    if (!branch) return;
    if (this.state.movementsLoading) return;
    if (!reset && !this.state.movementsHasMore) return;
    const offset = reset ? 0 : this.state.movementsOffset;
    this.setState({
      movementsLoading: true,
      ...(reset ? {movements: null, movementsOffset: 0, movementsHasMore: true} : {}),
    });
    const opts = {
      type: this.state.movType,
      from: this.state.movFrom || undefined,
      to: this.state.movTo || undefined,
      limit: 20,
    };
    API.getMovementsWarehouse(branch, offset, opts)
      .then((res) => {
        const items = Array.isArray(res) ? res : [];
        this.setState((s) => ({
          movements: reset ? items : [...(s.movements || []), ...items],
          movementsOffset: (reset ? 0 : s.movementsOffset) + items.length,
          movementsHasMore: items.length >= 20,
          movementsLoading: false,
        }));
      })
      .catch(() => {
        this.setState({movementsLoading: false, movements: this.state.movements || []});
      });
  };

  onChangeMovType = (type) => {
    this.setState({movType: type}, () => this.fetchMovements(true));
  };

  onChangeMovDate = (key, value) => {
    this.setState({[key]: value}, () => this.fetchMovements(true));
  };

  renderToolbar(visibleCount, alertsCount, outCount) {
    const text = this.props.text || '';
    const chips = [
      {key: 'all', label: 'Todos', n: visibleCount},
      {key: 'low', label: 'Stock bajo', n: alertsCount},
      {key: 'out', label: 'Agotados', n: outCount},
      {key: 'movements', label: 'Movimientos'},
    ];
    return (
      <View style={st.toolbar}>
        <View style={st.searchWrap}>
          <Icon source="magnify" size={18} color={MUTED} />
          <TextInput
            style={st.searchInput}
            placeholder="Buscar por nombre o código..."
            placeholderTextColor={SUBTLE}
            value={text}
            onChangeText={this.onSearch}
            onSubmitEditing={this.onSubmitSearch}
            returnKeyType="search"
          />
          {!!text && (
            <TouchableOpacity onPress={this.onClearSearch} style={st.searchClear}>
              <Icon source="close-circle" size={16} color={MUTED} />
            </TouchableOpacity>
          )}
        </View>
        <View style={st.chipsRow}>
          {chips.map((c) => {
            const on = this.state.filter === c.key;
            const showBadge = typeof c.n === 'number';
            return (
              <TouchableOpacity
                key={c.key}
                activeOpacity={0.8}
                onPress={() => {
                  this.setState({filter: c.key});
                  if (c.key === 'movements' && this.state.movements == null) {
                    this.fetchMovements(true);
                  }
                }}
                style={[st.chip, on && st.chipActive]}>
                <Text style={[st.chipTxt, on && st.chipTxtActive]}>
                  {c.label}
                </Text>
                {showBadge && (
                  <View style={[st.chipBadge, on && st.chipBadgeActive]}>
                    <Text style={[st.chipBadgeTxt, on && st.chipBadgeTxtActive]}>
                      {c.n}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Toggle "Mostrar filtros" — solo cuando estamos en pestaña
              Movimientos. flex:1 + alignItems:flex-end lo empuja al borde
              derecho del row sin afectar el wrap. */}
          {this.state.filter === 'movements' && (
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              {this.renderMovFiltersToggle()}
            </View>
          )}
        </View>
      </View>
    );
  }

  renderMovFiltersToggle() {
    const {movFiltersOpen, movType, movFrom, movTo} = this.state;
    const hasActiveFilter = movType !== 'all' || !!movFrom || !!movTo;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => this.setState({movFiltersOpen: !movFiltersOpen})}
        style={[st.movFiltersToggleBtn, hasActiveFilter && st.movFiltersToggleBtnActive]}>
        <Icon
          source={movFiltersOpen ? 'filter-variant-remove' : 'filter-variant'}
          size={16}
          color={hasActiveFilter ? DGOLD : INK}
        />
        <Text style={[st.movFiltersToggleTxt, hasActiveFilter && {color: DGOLD}]}>
          {movFiltersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
        </Text>
        {hasActiveFilter && (
          <View style={st.movFiltersBadge}>
            <Text style={st.movFiltersBadgeTxt}>●</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  renderHeaderRow() {
    return (
      <View style={st.tableHead}>
        <Text style={[st.tableHeadTxt, st.colProduct]}>PRODUCTO</Text>
        <Text style={[st.tableHeadTxt, st.colCode]}>CÓDIGO</Text>
        <Text style={[st.tableHeadTxt, st.colStock]}>STOCK</Text>
        <Text style={[st.tableHeadTxt, st.colValue]}>VALOR</Text>
        <Text style={[st.tableHeadTxt, st.colStatus]}>ESTADO</Text>
      </View>
    );
  }

  renderRow = ({item}) => {
    const stock = stockOf(item);
    const low = isLow(item);
    const out = isOut(item);
    const cost = Number(item.cost) || 0;
    const value = stock * cost;
    const status = out ? 'out' : low ? 'low' : 'ok';
    const onPress = this.props.user.features.includes(
      'product_extra_fields_production_date',
    )
      ? () =>
          this.props.navigation.navigate('InventoryCategory', {
            cat: item.product_id ?? item.nid,
            name: item.product_name || item.name,
          })
      : undefined;

    return (
      <TouchableOpacity
        style={st.tableRow}
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}>
        <View style={[st.colProduct, st.productCell]}>
          <View style={st.rowIcon}>
            <Icon source="cube-outline" size={18} color={DGOLD} />
          </View>
          <View style={{flex: 1, minWidth: 0}}>
            <Text style={st.productName} numberOfLines={1}>
              {item.product_name || item.name || item.label || 'Producto'}
            </Text>
            {!!item.category && (
              <Text style={st.productCat} numberOfLines={1}>
                {item.category}
              </Text>
            )}
          </View>
        </View>
        <Text style={[st.tableCellTxt, st.colCode]} numberOfLines={1}>
          {item.code || '—'}
        </Text>
        <Text style={[st.tableCellTxt, st.colStock, st.stockTxt]}>
          {stock.toLocaleString('es-CO')}
        </Text>
        <Money value={value} style={[st.tableCellTxt, st.colValue, st.valueTxt]} />
        <View style={st.colStatus}>
          <View
            style={[
              st.statusPill,
              status === 'ok' && st.statusOk,
              status === 'low' && st.statusLow,
              status === 'out' && st.statusOut,
            ]}>
            <Text
              style={[
                st.statusTxt,
                status === 'ok' && st.statusOkTxt,
                status === 'low' && st.statusLowTxt,
                status === 'out' && st.statusOutTxt,
              ]}>
              {status === 'ok' ? 'OK' : status === 'low' ? 'BAJO' : 'AGOTADO'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  renderList(visible) {
    if (this.props.list == null) {
      return (
        <View style={{paddingTop: 8, rowGap: 8}}>
          {Array.from({length: 8}).map((_, i) => (
            <Shimmer
              key={i}
              style={{marginBottom: 6, borderRadius: 10}}
              height={48}
              width={'100%'}
            />
          ))}
        </View>
      );
    }
    if (!visible.length) {
      return (
        <View style={st.emptyList}>
          <Icon source="package-variant-closed" size={36} color={SUBTLE} />
          <Text style={st.emptyListTxt}>No se encontraron productos</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={visible}
        keyExtractor={(it) => String(it.nid ?? it.product_id)}
        renderItem={this.renderRow}
        ItemSeparatorComponent={() => <View style={st.tableSep} />}
        ListHeaderComponent={this.renderHeaderRow()}
        stickyHeaderIndices={[0]}
        onEndReached={this.onEndReached}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 24}}
        refreshControl={
          <RefreshControl
            refreshing={!!this.props.showRrefresh}
            onRefresh={() => this.props.actions.getProducts(true)}
          />
        }
        ListFooterComponent={
          this.props.showLoader ? (
            <View style={{paddingVertical: 12}}>
              <ActivityIndicator size="small" color={GOLD} />
            </View>
          ) : null
        }
      />
    );
  }

  // ── Panel Movimientos ────────────────────────────────────
  renderMovementsPanel() {
    const TYPE_OPTS = [
      {key: 'all', label: 'Todos'},
      {key: 'in', label: 'Entradas'},
      {key: 'out', label: 'Salidas'},
      {key: 'PURCHASE', label: 'Compras'},
      {key: 'SALE', label: 'Ventas'},
      {key: 'TRANSFER_OUT', label: 'Traslado salida'},
      {key: 'TRANSFER_IN', label: 'Traslado entrada'},
      {key: 'ADJUSTMENT_PLUS', label: 'Ajuste +'},
      {key: 'ADJUSTMENT_MINUS', label: 'Ajuste -'},
      {key: 'LOSS', label: 'Pérdida'},
    ];
    const {movFiltersOpen} = this.state;
    return (
      <View style={{flex: 1, paddingTop: 6}}>
        {/* Filtros: tipo + rango de fechas (toggle controlado desde la
            chipsRow superior — botón "Mostrar/Ocultar filtros") */}
        {movFiltersOpen && (
          <>
            <View style={st.movFilters}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{columnGap: 6, paddingRight: 8}}>
                {TYPE_OPTS.map((opt) => {
                  const on = this.state.movType === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      activeOpacity={0.8}
                      onPress={() => this.onChangeMovType(opt.key)}
                      style={[st.movTypeChip, on && st.movTypeChipActive]}>
                      <Text style={[st.movTypeTxt, on && st.movTypeTxtActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={st.movDateRow}>
              <View style={st.movDateField}>
                <Text style={st.movDateLabel}>Desde</Text>
                <TextInput
                  style={st.movDateInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={SUBTLE}
                  value={this.state.movFrom}
                  onChangeText={(t) => this.setState({movFrom: t})}
                  onEndEditing={() => this.fetchMovements(true)}
                />
              </View>
              <View style={st.movDateField}>
                <Text style={st.movDateLabel}>Hasta</Text>
                <TextInput
                  style={st.movDateInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={SUBTLE}
                  value={this.state.movTo}
                  onChangeText={(t) => this.setState({movTo: t})}
                  onEndEditing={() => this.fetchMovements(true)}
                />
              </View>
            </View>
          </>
        )}

        {/* Header de tabla */}
        <View style={[st.tableHead, {marginTop: 6}]}>
          <Text style={[st.tableHeadTxt, st.movColDate]}>FECHA</Text>
          <Text style={[st.tableHeadTxt, st.movColProduct]}>PRODUCTO</Text>
          <Text style={[st.tableHeadTxt, st.movColType]}>TIPO</Text>
          <Text style={[st.tableHeadTxt, st.movColQty]}>CANT.</Text>
          <Text style={[st.tableHeadTxt, st.movColValue]}>VALOR</Text>
        </View>

        {this.renderMovementsList()}
      </View>
    );
  }

  renderMovementsList() {
    const {movements, movementsLoading, movementsHasMore} = this.state;
    if (movements == null) {
      return (
        <View style={{paddingTop: 8, rowGap: 8}}>
          {Array.from({length: 6}).map((_, i) => (
            <Shimmer key={i} style={{marginBottom: 6, borderRadius: 10}} height={48} width={'100%'} />
          ))}
        </View>
      );
    }
    if (!movements.length) {
      return (
        <View style={st.emptyList}>
          <Icon source="swap-horizontal" size={36} color={SUBTLE} />
          <Text style={st.emptyListTxt}>No hay movimientos en este rango</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={movements}
        keyExtractor={(m) => String(m.id ?? m.nid)}
        renderItem={this.renderMovementRow}
        ItemSeparatorComponent={() => <View style={st.tableSep} />}
        onEndReached={() => movementsHasMore && !movementsLoading && this.fetchMovements(false)}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 24}}
        ListFooterComponent={
          movementsLoading ? (
            <View style={{paddingVertical: 12}}>
              <ActivityIndicator size="small" color={GOLD} />
            </View>
          ) : null
        }
      />
    );
  }

  renderMovementRow = ({item}) => {
    const isIn = ['PURCHASE', 'TRANSFER_IN', 'ADJUSTMENT_PLUS', 'CANCELLED_SALE_REVERSAL'].includes(item.movement);
    const date = item.created || '';
    const hour = item.hour || '';
    const qty = Number(item.qty) || 0;
    const value = (Number(item.value) || 0) * qty;
    return (
      <View style={st.tableRow}>
        <View style={st.movColDate}>
          <Text style={st.movDateMain}>{date}</Text>
          {!!hour && <Text style={st.movDateSub}>{hour}</Text>}
        </View>
        <View style={[st.movColProduct, {paddingRight: 8}]}>
          <Text style={st.productName} numberOfLines={1}>
            {item.product || '—'}
          </Text>
          {!!item.observations && (
            <Text style={st.productCat} numberOfLines={1}>{item.observations}</Text>
          )}
        </View>
        <View style={st.movColType}>
          <View style={[st.movTypePill, isIn ? st.movTypePillIn : st.movTypePillOut]}>
            <Text style={[st.movTypePillTxt, isIn ? st.movTypePillTxtIn : st.movTypePillTxtOut]}>
              {isIn ? 'Entrada' : 'Salida'}
            </Text>
          </View>
        </View>
        <Text style={[st.tableCellTxt, st.movColQty, st.stockTxt]}>
          {isIn ? '+' : '−'}{qty.toLocaleString('es-CO')}
        </Text>
        <Money value={value} style={[st.tableCellTxt, st.movColValue, st.valueTxt]} />
      </View>
    );
  };

  render() {
    const list = this.props.list || [];
    const kpis = this.computeKpis(list);
    const categories = this.buildCategories(list);
    const visible = this.applyFilters(list);
    // Conteos por chip dentro del scope (categoría seleccionada).
    const scope =
      this.state.selectedCat === 'all'
        ? list
        : list.filter((p) => {
            const id = p.cat ?? null;
            const key = id == null ? 'null' : String(id);
            return key === this.state.selectedCat;
          });
    const chipAll = scope.length;
    const chipLow = scope.filter(isLow).length;
    const chipOut = scope.filter(isOut).length;
    const inMovements = this.state.filter === 'movements';

    const compact = this.state.compact;
    return (
      <AppShell active="inventario">
        <View style={st.body}>
          {this.renderSubHeader()}
          {!compact && this.renderKpis(kpis)}

          <View style={st.split}>
            {!compact && this.renderCategories(categories, list.length)}
            <View style={st.listCol}>
              {this.renderToolbar(chipAll, chipLow, chipOut)}
              <View style={{flex: 1}}>
                {inMovements ? this.renderMovementsPanel() : this.renderList(visible)}
              </View>
            </View>
          </View>
        </View>
      </AppShell>
    );
  }
}

const st = StyleSheet.create({
  body: {flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 12},

  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    paddingVertical: 4,
    marginBottom: 14,
  },
  subHeaderTitle: {fontFamily: fonts.bold, fontSize: 22, color: INK},
  subHeaderSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 12,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
  },
  // Variante compacta para botones secundarios (toggle compact).
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    backgroundColor: SOFT_GOLD,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    marginRight: 8,
  },
  outlineBtnTxt: {fontFamily: fonts.semiBold, fontSize: 13, color: INK},
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 12,
    backgroundColor: GOLD,
  },
  primaryBtnTxt: {fontFamily: fonts.bold, fontSize: 13, color: WHITE},

  kpisRow: {flexDirection: 'row', columnGap: 12, marginBottom: 14},
  kpiCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  kpiCardGold: {backgroundColor: SOFT_GOLD, borderColor: TINT_GOLD},
  kpiCardRed: {backgroundColor: RED_BG, borderColor: RED_BORDER},
  kpiLabel: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0.8,
    color: SUBTLE,
  },
  kpiValue: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: INK,
    marginTop: 6,
  },
  kpiValueGold: {color: DGOLD},
  kpiValueRed: {color: RED},
  kpiHint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: MUTED,
    marginTop: 4,
  },

  split: {flex: 1, flexDirection: 'row', columnGap: 16},
  catCol: {
    width: 200,
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  catColTitle: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: SUBTLE,
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  catItemActive: {backgroundColor: TINT_GOLD},
  catDot: {width: 10, height: 10, borderRadius: 5},
  catName: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: INK,
  },
  catNameActive: {color: DGOLD},
  catBadge: {
    minWidth: 22,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F0E9DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catBadgeTxt: {fontFamily: fonts.bold, fontSize: 10, color: MUTED},

  listCol: {flex: 1},

  toolbar: {marginBottom: 10, rowGap: 10},
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: INK,
    paddingVertical: 0,
  },
  searchClear: {padding: 4},
  chipsRow: {flexDirection: 'row', columnGap: 8, flexWrap: 'wrap'},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
  },
  chipActive: {backgroundColor: INK, borderColor: INK},
  chipTxt: {fontFamily: fonts.semiBold, fontSize: 12, color: MUTED},
  chipTxtActive: {color: WHITE},
  chipBadge: {
    minWidth: 18,
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F0E9DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipBadgeActive: {backgroundColor: GOLD},
  chipBadgeTxt: {fontFamily: fonts.bold, fontSize: 10, color: MUTED},
  chipBadgeTxtActive: {color: WHITE},

  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F1E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_SOFT,
  },
  tableHeadTxt: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: SUBTLE,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: WHITE,
  },
  tableSep: {height: 1, backgroundColor: '#F4EBD8'},

  colProduct: {flex: 2.4, minWidth: 0},
  colCode: {flex: 1, minWidth: 0},
  colStock: {width: 70, textAlign: 'right'},
  colValue: {width: 110, textAlign: 'right'},
  colStatus: {width: 80, alignItems: 'flex-end'},

  productCell: {flexDirection: 'row', alignItems: 'center', columnGap: 10},
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: TINT_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {fontFamily: fonts.bold, fontSize: 13, color: INK},
  productCat: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginTop: 2},

  tableCellTxt: {fontFamily: fonts.regular, fontSize: 13, color: INK},
  stockTxt: {fontFamily: fonts.bold},
  valueTxt: {fontFamily: fonts.semiBold},

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusOk: {backgroundColor: GREEN_BG, borderColor: GREEN_BORDER},
  statusLow: {backgroundColor: AMBER_BG, borderColor: AMBER_BORDER},
  statusOut: {backgroundColor: RED_BG, borderColor: RED_BORDER},
  statusTxt: {fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.6},
  statusOkTxt: {color: GREEN_TXT},
  statusLowTxt: {color: AMBER_TXT},
  statusOutTxt: {color: RED},

  emptyList: {paddingTop: 40, alignItems: 'center', rowGap: 8},
  emptyListTxt: {fontFamily: fonts.regular, fontSize: 13, color: MUTED},

  // ── Movimientos ───────────────────────────────────────
  movFiltersToggleRow: {
    flexDirection: 'row', alignItems: 'center', columnGap: 10,
    paddingVertical: 4, marginBottom: 4,
    justifyContent: 'flex-end',
  },
  movFiltersToggleBtn: {
    flexDirection: 'row', alignItems: 'center', columnGap: 6,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  movFiltersToggleBtnActive: {borderColor: GOLD, backgroundColor: SOFT_GOLD},
  movFiltersToggleTxt: {fontFamily: fonts.semiBold, fontSize: 12, color: INK},
  movFiltersBadge: {
    backgroundColor: DGOLD, borderRadius: 999, paddingHorizontal: 5,
    alignItems: 'center', justifyContent: 'center',
  },
  movFiltersBadgeTxt: {fontFamily: fonts.bold, fontSize: 8, color: WHITE},

  movFilters: {paddingVertical: 6},
  movTypeChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT,
  },
  movTypeChipActive: {backgroundColor: INK, borderColor: INK},
  movTypeTxt: {fontFamily: fonts.semiBold, fontSize: 12, color: MUTED},
  movTypeTxtActive: {color: WHITE},

  movDateRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    columnGap: 10, paddingTop: 6, paddingBottom: 8,
  },
  movDateField: {flex: 1},
  movDateLabel: {
    fontFamily: fonts.semiBold, fontSize: 10, color: MUTED,
    letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase',
  },
  movDateInput: {
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    fontFamily: fonts.regular, fontSize: 13, color: INK,
  },
  movClearBtn: {
    flexDirection: 'row', alignItems: 'center', columnGap: 4,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  movClearTxt: {fontFamily: fonts.semiBold, fontSize: 12, color: MUTED},

  movColDate: {flex: 1.2},
  movColProduct: {flex: 2.2},
  movColType: {flex: 1.2, alignItems: 'flex-start'},
  movColQty: {flex: 0.9, textAlign: 'right'},
  movColValue: {flex: 1.2, textAlign: 'right'},

  movDateMain: {fontFamily: fonts.semiBold, fontSize: 12, color: INK},
  movDateSub: {fontFamily: fonts.regular, fontSize: 10, color: MUTED, marginTop: 2},

  movTypePill: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, borderWidth: 1,
  },
  movTypePillIn: {backgroundColor: GREEN_BG, borderColor: GREEN_BORDER},
  movTypePillOut: {backgroundColor: RED_BG, borderColor: RED_BORDER},
  movTypePillTxt: {fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.3},
  movTypePillTxtIn: {color: GREEN_TXT},
  movTypePillTxtOut: {color: RED},
});

export default InventoryListScreen;
