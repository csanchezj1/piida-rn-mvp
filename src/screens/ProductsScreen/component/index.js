import React, {Component} from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {Icon, Text} from 'react-native-paper';
import {NumericFormat} from 'react-number-format';
import AppShell from '../../../layouts/AppShell';
import {Shimmer} from '../../../components';
import {fonts} from '../../../styles/basicStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';

const GOLD = '#F7A928';
const DGOLD = '#C66E00';
const TINT_GOLD = '#FFF1D6';
const SOFT_GOLD = '#FFF6E1';
const INK = '#1A130C';
const MUTED = '#7E6A52';
const SUBTLE = '#A89580';
const WHITE = '#FFFFFF';
const BORDER_SOFT = '#EFE3D2';
const PANE_BORDER = '#EAD8B6';
const GREEN_BG = '#E6F4EA';
const GREEN_TXT = '#1F8A4C';
const RED = '#D7263D';
const RED_TINT = '#FBE7EA';

const isLow = (p) => {
  const stock = Number(p?.available ?? p?.stock ?? 0);
  const min = Number(p?.min_stock ?? 5);
  return stock > 0 && stock <= min;
};
const isOut = (p) => Number(p?.available ?? p?.stock ?? 0) <= 0;
const isKit = (p) => (p?.type || '').toLowerCase() === 'kit';

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

class ProductsScreen extends Component {
  state = {selectedId: null, filter: 'all'};

  componentDidMount() {
    this.props.actions.getProducts('', true);
    registerEventScreenMounted(
      this.props,
      'Pantalla listado de productos',
      'ProductsScreen',
    );
  }

  componentDidUpdate(prevProps) {
    if (prevProps.refetchTick !== this.props.refetchTick) {
      this.props.actions.getProducts(this.props.text || '', true);
    }
    // Si el seleccionado ya no existe en la lista (búsqueda/filtros) limpio.
    if (this.state.selectedId && this.props.list !== prevProps.list) {
      const found = (this.props.list || []).find(
        (p) => p.nid === this.state.selectedId,
      );
      if (!found) this.setState({selectedId: null});
    }
  }

  componentWillUnmount() {
    this.props.actions.clear();
  }

  onSearch = (text) => {
    this.props.actions.textChange(text);
  };

  onSubmitSearch = () => {
    this.props.actions.getProducts(this.props.text || '', true);
    this.props.actions.clearSearch();
  };

  onClearSearch = () => {
    this.props.actions.textChange(null);
    this.props.actions.getProducts('', true);
  };

  onEndReached = () => {
    if (!this.props.showLoader) {
      this.props.actions.getProducts(this.props.text || '', false);
    }
  };

  goNewProduct = () => {
    const hasProductionDate = this.props.user.features.includes(
      'product_extra_fields_production_date',
    );
    this.props.navigation.navigate(
      hasProductionDate ? 'CreateProductCategory' : 'CreateProduct',
    );
  };

  editProduct = (product) => {
    this.props.navigation.navigate('CreateProduct', {product});
  };

  applyFilter = (items) => {
    switch (this.state.filter) {
      case 'kits':
        return items.filter(isKit);
      case 'low':
        return items.filter(isLow);
      case 'out':
        return items.filter(isOut);
      default:
        return items;
    }
  };

  filterCounts(items) {
    return {
      all: items.length,
      kits: items.filter(isKit).length,
      low: items.filter(isLow).length,
      out: items.filter(isOut).length,
    };
  }

  renderSubHeader(counts) {
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
            Productos
          </Text>
          <Text style={st.subHeaderSub} numberOfLines={1}>
            {`${counts.all} producto${counts.all === 1 ? '' : 's'}${
              counts.kits ? ` · ${counts.kits} combo${counts.kits === 1 ? '' : 's'}` : ''
            }`}
          </Text>
        </View>

        <TouchableOpacity style={st.newBtn} activeOpacity={0.85} onPress={this.goNewProduct}>
          <Icon source="plus" size={18} color={WHITE} />
          <Text style={st.newBtnTxt}>Nuevo producto</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderSearch() {
    const text = this.props.text || '';
    return (
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
    );
  }

  renderChips(counts) {
    const chips = [
      {key: 'all', label: 'Todos', n: counts.all},
      {key: 'kits', label: 'Combos', n: counts.kits},
      {key: 'low', label: 'Stock bajo', n: counts.low},
      {key: 'out', label: 'Agotados', n: counts.out},
    ];
    return (
      <View style={st.chipsRow}>
        {chips.map((c) => {
          const on = this.state.filter === c.key;
          return (
            <TouchableOpacity
              key={c.key}
              activeOpacity={0.8}
              onPress={() => this.setState({filter: c.key})}
              style={[st.chip, on && st.chipActive]}>
              <Text style={[st.chipTxt, on && st.chipTxtActive]}>{c.label}</Text>
              <View style={[st.chipBadge, on && st.chipBadgeActive]}>
                <Text style={[st.chipBadgeTxt, on && st.chipBadgeTxtActive]}>{c.n}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  renderRow = ({item}) => {
    const selected = this.state.selectedId === item.nid;
    const stock = Number(item.available ?? item.stock ?? 0);
    const low = isLow(item);
    const out = isOut(item);
    const kit = isKit(item);
    const codeAndCat = [item.code, item.category].filter(Boolean).join(' · ');

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[st.row, selected && st.rowSelected]}
        onPress={() => this.setState({selectedId: item.nid})}>
        <View style={[st.rowIcon, kit && st.rowIconKit]}>
          <Icon
            source={kit ? 'package-variant' : 'cube-outline'}
            size={20}
            color={kit ? '#8A4DFF' : DGOLD}
          />
        </View>
        <View style={st.rowBody}>
          <View style={st.rowNameRow}>
            <Text style={st.rowName} numberOfLines={1}>
              {item.name || item.label || 'Producto'}
            </Text>
            {kit && (
              <View style={st.comboBadge}>
                <Text style={st.comboBadgeTxt}>COMBO</Text>
              </View>
            )}
          </View>
          {!!codeAndCat && (
            <Text style={st.rowMeta} numberOfLines={1}>
              {codeAndCat}
            </Text>
          )}
        </View>
        <View style={st.rowEnd}>
          <Money value={item.price} style={st.rowPrice} />
          {kit ? (
            <Text style={st.rowStockKit}>Calculado</Text>
          ) : (
            <Text
              style={[
                st.rowStock,
                out && st.rowStockOut,
                low && st.rowStockLow,
              ]}
              numberOfLines={1}>
              {out ? '0 en stock · agotado' : `${stock} en stock${low ? ' · bajo' : ''}`}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  renderList(visibleList) {
    if (this.props.list == null) {
      return (
        <View style={st.listPad}>
          {Array.from({length: 8}).map((_, i) => (
            <Shimmer key={i} style={st.shimmer} height={60} width={'100%'} />
          ))}
        </View>
      );
    }
    if (!visibleList.length) {
      return (
        <View style={st.emptyList}>
          <Icon source="package-variant-closed" size={36} color={SUBTLE} />
          <Text style={st.emptyListTxt}>No se encontraron productos</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={visibleList}
        keyExtractor={(it) => String(it.nid)}
        renderItem={this.renderRow}
        ItemSeparatorComponent={() => <View style={st.sep} />}
        onEndReached={this.onEndReached}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{paddingBottom: 24}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={!!this.props.showRrefresh}
            onRefresh={() => this.props.actions.getProducts('', true)}
          />
        }
        ListFooterComponent={
          this.props.showLoader ? (
            <View style={{paddingVertical: 16}}>
              <ActivityIndicator size="small" color={GOLD} />
            </View>
          ) : null
        }
      />
    );
  }

  renderDetail() {
    const selected = (this.props.list || []).find(
      (p) => p.nid === this.state.selectedId,
    );
    if (!selected) {
      return (
        <View style={st.detailEmpty}>
          <View style={st.detailEmptyIcon}>
            <Icon source="cube-outline" size={28} color={SUBTLE} />
          </View>
          <Text style={st.detailEmptyTitle}>Selecciona un producto</Text>
          <Text style={st.detailEmptyTxt}>
            Toca un producto de la lista para ver su detalle, costo, margen y stock.
          </Text>
        </View>
      );
    }

    const price = Number(selected.price) || 0;
    const cost = Number(selected.cost) || 0;
    const stock = Number(selected.available ?? selected.stock ?? 0);
    const margin = price > 0 ? Math.round(((price - cost) / price) * 100) : null;
    const kit = isKit(selected);
    const out = isOut(selected);
    const low = isLow(selected);
    const codeAndCat = [selected.code, selected.category].filter(Boolean).join(' · ');
    const canEdit = !this.props.user.features.includes(
      'product_extra_fields_production_date',
    );

    return (
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={st.detailScroll}
        showsVerticalScrollIndicator={false}>
        <View style={[st.detailIcon, kit && st.detailIconKit]}>
          <Icon
            source={kit ? 'package-variant' : 'cube-outline'}
            size={26}
            color={kit ? '#8A4DFF' : DGOLD}
          />
        </View>

        <Text style={st.detailName} numberOfLines={3}>
          {selected.name || selected.label || 'Producto'}
        </Text>
        {!!codeAndCat && <Text style={st.detailMeta}>{codeAndCat}</Text>}

        <Text style={st.detailKpiLabel}>PRECIO DE VENTA</Text>
        <Money value={price} style={st.detailPrice} />

        {!kit && (
          <View style={st.kpiRow}>
            <View style={st.kpiCard}>
              <Text style={st.kpiLabel}>COSTO</Text>
              <Money value={cost} style={st.kpiValue} />
            </View>
            <View style={[st.kpiCard, st.kpiCardGreen]}>
              <Text style={st.kpiLabel}>MARGEN</Text>
              <Text style={[st.kpiValue, st.kpiValueGreen]}>
                {margin == null ? '—' : `${margin}%`}
              </Text>
            </View>
          </View>
        )}

        {!kit && (
          <View
            style={[
              st.stockCard,
              out && st.stockCardOut,
              low && st.stockCardLow,
            ]}>
            <Text style={st.kpiLabel}>STOCK ACTUAL</Text>
            <Text
              style={[
                st.stockValue,
                out && st.stockValueOut,
                low && st.stockValueLow,
              ]}>
              {`${stock} ${stock === 1 ? 'unidad' : 'unidades'}`}
            </Text>
            {(low || out) && (
              <Text style={st.stockHint}>
                {out ? 'Producto agotado' : 'Stock bajo el mínimo'}
              </Text>
            )}
          </View>
        )}

        {kit && (
          <View style={st.stockCard}>
            <Text style={st.kpiLabel}>STOCK</Text>
            <Text style={st.stockValue}>Calculado por componentes</Text>
          </View>
        )}

        <View style={{flex: 1}} />

        <View style={st.detailActions}>
          {canEdit && (
            <TouchableOpacity
              style={st.editBtn}
              activeOpacity={0.85}
              onPress={() => this.editProduct(selected)}>
              <Icon source="pencil-outline" size={18} color={WHITE} />
              <Text style={st.editBtnTxt}>Editar</Text>
            </TouchableOpacity>
          )}
          {/* Delete: pendiente cablear endpoint en RN — placeholder UI sin acción. */}
        </View>
      </ScrollView>
    );
  }

  render() {
    const list = this.props.list || [];
    const counts = this.filterCounts(list);
    const visible = this.applyFilter(list);

    return (
      <AppShell active="inventario">
        <View style={st.split}>
          <View style={st.leftPane}>
            {this.renderSubHeader(counts)}
            <View style={st.searchAndChips}>
              {this.renderSearch()}
              {this.renderChips(counts)}
            </View>
            <View style={{flex: 1}}>{this.renderList(visible)}</View>
          </View>
          <View style={st.rightPane}>{this.renderDetail()}</View>
        </View>
      </AppShell>
    );
  }
}

const st = StyleSheet.create({
  split: {flex: 1, flexDirection: 'row'},
  leftPane: {flex: 1, paddingHorizontal: 24, paddingTop: 8},
  rightPane: {
    width: 320,
    backgroundColor: WHITE,
    borderLeftWidth: 1,
    borderLeftColor: BORDER_SOFT,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    paddingVertical: 12,
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
  subHeaderTitle: {fontFamily: fonts.bold, fontSize: 20, color: INK},
  subHeaderSub: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 12,
    backgroundColor: GOLD,
  },
  newBtnTxt: {fontFamily: fonts.bold, fontSize: 13, color: WHITE},

  searchAndChips: {marginTop: 4, marginBottom: 8},
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

  chipsRow: {flexDirection: 'row', columnGap: 8, marginTop: 12, flexWrap: 'wrap'},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 17,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
  },
  chipActive: {
    backgroundColor: TINT_GOLD,
    borderColor: GOLD,
  },
  chipTxt: {fontFamily: fonts.semiBold, fontSize: 12, color: MUTED},
  chipTxtActive: {color: DGOLD},
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

  listPad: {paddingTop: 4, rowGap: 8},
  shimmer: {marginBottom: 8, borderRadius: 12},
  sep: {height: 8},
  emptyList: {
    paddingTop: 60,
    alignItems: 'center',
    rowGap: 8,
  },
  emptyListTxt: {fontFamily: fonts.regular, fontSize: 13, color: MUTED},

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowSelected: {
    backgroundColor: SOFT_GOLD,
    borderColor: GOLD,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: TINT_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconKit: {backgroundColor: '#F0E7FF'},
  rowBody: {flex: 1, minWidth: 0},
  rowNameRow: {flexDirection: 'row', alignItems: 'center', columnGap: 8},
  rowName: {fontFamily: fonts.bold, fontSize: 14, color: INK, flexShrink: 1},
  comboBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#EFE3FF',
    borderRadius: 6,
  },
  comboBadgeTxt: {fontFamily: fonts.bold, fontSize: 9, color: '#7032E0', letterSpacing: 0.4},
  rowMeta: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginTop: 2},
  rowEnd: {alignItems: 'flex-end', rowGap: 4, minWidth: 120},
  rowPrice: {fontFamily: fonts.bold, fontSize: 14, color: INK},
  rowStock: {fontFamily: fonts.regular, fontSize: 11, color: GREEN_TXT},
  rowStockLow: {color: '#C66E00'},
  rowStockOut: {color: RED},
  rowStockKit: {fontFamily: fonts.regular, fontSize: 11, color: MUTED},

  detailEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    rowGap: 12,
  },
  detailEmptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F0E9DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailEmptyTitle: {fontFamily: fonts.bold, fontSize: 14, color: INK},
  detailEmptyTxt: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 16,
  },

  detailScroll: {paddingBottom: 24, flexGrow: 1},
  detailIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: TINT_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  detailIconKit: {backgroundColor: '#F0E7FF'},
  detailName: {fontFamily: fonts.bold, fontSize: 20, color: INK, lineHeight: 24},
  detailMeta: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 4},

  detailKpiLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: SUBTLE,
    marginTop: 22,
  },
  detailPrice: {
    fontFamily: fonts.bold,
    fontSize: 30,
    color: INK,
    marginTop: 4,
  },

  kpiRow: {flexDirection: 'row', columnGap: 10, marginTop: 16},
  kpiCard: {
    flex: 1,
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: PANE_BORDER,
  },
  kpiCardGreen: {
    backgroundColor: GREEN_BG,
    borderColor: '#BFE6CD',
  },
  kpiLabel: {fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.8, color: SUBTLE},
  kpiValue: {fontFamily: fonts.bold, fontSize: 16, color: INK, marginTop: 4},
  kpiValueGreen: {color: GREEN_TXT},

  stockCard: {
    marginTop: 12,
    backgroundColor: GREEN_BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#BFE6CD',
  },
  stockCardLow: {backgroundColor: '#FFF4D6', borderColor: '#F0D592'},
  stockCardOut: {backgroundColor: RED_TINT, borderColor: '#F0BCC4'},
  stockValue: {fontFamily: fonts.bold, fontSize: 20, color: GREEN_TXT, marginTop: 4},
  stockValueLow: {color: '#C66E00'},
  stockValueOut: {color: RED},
  stockHint: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginTop: 4},

  detailActions: {flexDirection: 'row', columnGap: 10, marginTop: 24},
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    height: 46,
    borderRadius: 12,
    backgroundColor: GOLD,
  },
  editBtnTxt: {fontFamily: fonts.bold, fontSize: 14, color: WHITE},
});

export default ProductsScreen;
