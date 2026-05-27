import React, {Component} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
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

class AddInventoryScreen extends Component {
  state = {customerDialogOpen: false};

  componentDidMount() {
    registerEventScreenMounted(this.props, 'Surtir inventario', 'AddInventoryScreen');
    this.props.actions.getProducts('', true);
  }

  componentWillUnmount() {
    this.props.actions.clear();
  }

  // Conjunto de nids ya en carrito para marcar AGREGADO en la lista.
  cartIndex() {
    const map = new Map();
    (this.props.product || []).forEach((p) => {
      map.set(String(p.nid), Number(p.qty) || 0);
    });
    return map;
  }

  totals() {
    const items = this.props.product || [];
    let units = 0;
    let cost = 0;
    items.forEach((it) => {
      const qty = Number(it.qty) || 0;
      const c = Number(it.cost) || 0;
      units += qty;
      cost += qty * c;
    });
    return {units, cost, lines: items.length};
  }

  onPickProduct = (item) => {
    if (this.props.user.features.includes('product_extra_fields_production_date')) {
      this.props.navigation.navigate('ProductVariations', {
        cat: item.tid,
        catName: item.name,
        from: 'addInventory',
      });
      return;
    }
    this.props.actions.selectProduct(item);
  };

  onProvider = () => {
    if (this.props.customer) {
      this.setState({customerDialogOpen: true});
    } else {
      this.props.navigation.navigate('Providers', {from: 'providerNew'});
    }
  };

  onSearch = (text) => this.props.actions.textChange(text);
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

  renderSubHeader() {
    return (
      <View style={st.subHeader}>
        <TouchableOpacity
          style={st.backBtn}
          activeOpacity={0.85}
          onPress={() => this.props.navigation.goBack()}>
          <Icon source="chevron-left" size={24} color="#1A130C" />
        </TouchableOpacity>
        <View style={{flex: 1, marginLeft: 8}}>
          <Text style={st.subHeaderTitle}>Surtir inventario</Text>
          <Text style={st.subHeaderSub}>
            Agrega productos al stock de tu sucursal
          </Text>
        </View>
      </View>
    );
  }

  renderToolbar() {
    const text = this.props.text || '';
    return (
      <View style={st.toolbar}>
        <View style={st.searchWrap}>
          <Icon source="magnify" size={18} color={MUTED} />
          <TextInput
            style={st.searchInput}
            placeholder="Buscar producto..."
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
        <TouchableOpacity
          activeOpacity={0.85}
          style={st.scanBtn}
          onPress={() => this.props.navigation.navigate('QRScan')}>
          <Icon source="qrcode-scan" size={20} color={INK} />
        </TouchableOpacity>
      </View>
    );
  }

  renderProductRow = ({item}) => {
    const cart = this.cartIndex();
    const inCart = cart.has(String(item.nid));
    const codeAndCat = [item.code, item.category]
      .filter(Boolean)
      .join(' · ');

    return (
      <TouchableOpacity
        style={[st.prodRow, inCart && st.prodRowOn]}
        activeOpacity={0.8}
        onPress={() => this.onPickProduct(item)}>
        <View style={[st.prodIcon, inCart && st.prodIconOn]}>
          <Icon source="cube-outline" size={20} color={inCart ? DGOLD : MUTED} />
        </View>
        <View style={{flex: 1, minWidth: 0}}>
          <Text style={st.prodName} numberOfLines={1}>
            {item.name || item.label || 'Producto'}
          </Text>
          {!!codeAndCat && (
            <Text style={st.prodMeta} numberOfLines={1}>
              {codeAndCat}
            </Text>
          )}
        </View>
        {inCart ? (
          <View style={st.addedBadge}>
            <Icon source="check" size={12} color={WHITE} />
            <Text style={st.addedBadgeTxt}>AGREGADO</Text>
          </View>
        ) : (
          <View style={st.addBtn}>
            <Icon source="plus" size={18} color={INK} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  renderLeftPane() {
    const list = this.props.list;
    return (
      <View style={st.leftPane}>
        {this.renderToolbar()}
        <Text style={st.catalogLabel}>
          CATÁLOGO COMPLETO ·{' '}
          <Text style={st.catalogCount}>
            {list ? `${list.length} productos` : 'cargando…'}
          </Text>
        </Text>
        <View style={{flex: 1}}>
          {list == null ? (
            <View style={{rowGap: 8, paddingTop: 4}}>
              {Array.from({length: 8}).map((_, i) => (
                <Shimmer
                  key={i}
                  style={{marginBottom: 6, borderRadius: 12}}
                  height={56}
                  width={'100%'}
                />
              ))}
            </View>
          ) : list.length === 0 ? (
            <View style={st.emptyList}>
              <Icon source="package-variant-closed" size={36} color={SUBTLE} />
              <Text style={st.emptyListTxt}>No se encontraron productos</Text>
            </View>
          ) : (
            <FlatList
              data={list}
              keyExtractor={(it, i) => String(it.nid ?? i)}
              renderItem={this.renderProductRow}
              ItemSeparatorComponent={() => <View style={st.rowSep} />}
              onEndReached={this.onEndReached}
              onEndReachedThreshold={0.4}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={
                this.props.showLoader ? (
                  <View style={{paddingVertical: 12}}>
                    <ActivityIndicator size="small" color={GOLD} />
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </View>
    );
  }

  renderCartItem = ({item}) => {
    const qty = Number(item.qty) || 0;
    return (
      <View style={st.cartItem}>
        <View style={st.cartIcon}>
          <Icon source="cube-outline" size={16} color={DGOLD} />
        </View>
        <View style={{flex: 1, minWidth: 0}}>
          <Text style={st.cartName} numberOfLines={1}>
            {item.label || item.name || 'Producto'}
          </Text>
          {!!item.code && (
            <Text style={st.cartMeta} numberOfLines={1}>
              {item.code}
            </Text>
          )}
        </View>
        <View style={st.stepper}>
          <TouchableOpacity
            style={st.stepBtn}
            activeOpacity={0.7}
            onPress={() => this.props.actions.removeProduct(item)}>
            <Icon source="minus" size={14} color={INK} />
          </TouchableOpacity>
          <Text style={st.stepQty}>{qty}</Text>
          <TouchableOpacity
            style={st.stepBtn}
            activeOpacity={0.7}
            onPress={() => this.props.actions.addProduct(item)}>
            <Icon source="plus" size={14} color={INK} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  renderProviderCard() {
    const customer = this.props.customer;
    if (!customer) {
      return (
        <TouchableOpacity
          activeOpacity={0.85}
          style={st.providerEmpty}
          onPress={this.onProvider}>
          <View style={st.providerIcon}>
            <Icon source="truck-outline" size={20} color={DGOLD} />
          </View>
          <View style={{flex: 1}}>
            <Text style={st.providerLabel}>PROVEEDOR</Text>
            <Text style={st.providerNamePlaceholder}>Agregar proveedor</Text>
          </View>
          <Icon source="chevron-right" size={20} color={MUTED} />
        </TouchableOpacity>
      );
    }
    return (
      <View style={st.providerFilled}>
        <View style={st.providerIcon}>
          <Icon source="truck-outline" size={20} color={DGOLD} />
        </View>
        <View style={{flex: 1, minWidth: 0}}>
          <Text style={st.providerLabel}>PROVEEDOR</Text>
          <Text style={st.providerName} numberOfLines={1}>
            {customer.label}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            this.props.navigation.navigate('Providers', {from: 'providerNew'})
          }>
          <Text style={st.providerChange}>Cambiar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderRightPane() {
    const items = this.props.product || [];
    const totals = this.totals();
    const canSubmit = items.length > 0;
    return (
      <View style={st.rightPane}>
        {this.renderProviderCard()}

        <View style={st.cartHeader}>
          <Text style={st.cartHeaderTitle}>PRODUCTOS A SURTIR</Text>
          <Text style={st.cartHeaderSub}>
            {totals.units.toLocaleString('es-CO')}{' '}
            {totals.units === 1 ? 'unidad' : 'unidades'}
          </Text>
        </View>

        <View style={{flex: 1}}>
          {items.length === 0 ? (
            <View style={st.cartEmpty}>
              <Icon source="cart-outline" size={32} color={SUBTLE} />
              <Text style={st.cartEmptyTxt}>
                Toca un producto del catálogo para agregarlo
              </Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(it, i) => String(it.nid ?? i)}
              renderItem={this.renderCartItem}
              ItemSeparatorComponent={() => <View style={st.cartSep} />}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <View style={st.totalsBlock}>
          <View style={st.totalsRow}>
            <Text style={st.totalsLabel}>Unidades totales</Text>
            <Text style={st.totalsValue}>{totals.units.toLocaleString('es-CO')}</Text>
          </View>
          <View style={st.totalsRow}>
            <Text style={st.totalsLabel}>Costo total</Text>
            <Money value={totals.cost} style={st.totalsValueBig} />
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={!canSubmit}
            onPress={() => this.props.actions.createPurchase()}
            style={[st.submitBtn, !canSubmit && st.submitBtnDisabled]}>
            <Icon
              source="upload"
              size={20}
              color={canSubmit ? WHITE : SUBTLE}
            />
            <Text
              style={[
                st.submitBtnTxt,
                !canSubmit && st.submitBtnTxtDisabled,
              ]}>
              Completar carga
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderCustomerDialog() {
    const customer = this.props.customer;
    if (!customer) return null;
    return (
      <Modal
        visible={!!this.props.customerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => this.props.actions.customerVisible(false)}>
        <TouchableOpacity
          activeOpacity={1}
          style={st.modalBackdrop}
          onPress={() => this.props.actions.customerVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={st.modalPanel}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>Datos del proveedor</Text>
              <TouchableOpacity
                onPress={() => this.props.actions.customerVisible(false)}
                style={st.modalClose}>
                <Icon source="close" size={20} color={INK} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{maxHeight: 360}}>
              {customer.label && this.renderDialogRow('Nombre', customer.label)}
              {customer.phone &&
                this.renderDialogRow('Número telefónico', customer.phone)}
              {customer.id_number &&
                this.renderDialogRow(
                  'Número de identificación',
                  customer.id_number,
                )}
              {customer.address &&
                this.renderDialogRow('Dirección', customer.address)}
              {customer.email &&
                this.renderDialogRow('Correo electrónico', customer.email)}
            </ScrollView>
            <TouchableOpacity
              activeOpacity={0.8}
              style={st.modalRemove}
              onPress={() => this.props.actions.removeCustomer()}>
              <Icon source="close-circle-outline" size={16} color={'#D7263D'} />
              <Text style={st.modalRemoveTxt}>Remover proveedor</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }

  renderDialogRow(label, value) {
    return (
      <View key={label} style={st.dlgRow}>
        <Text style={st.dlgLabel}>{label}</Text>
        <Text style={st.dlgValue}>{value}</Text>
      </View>
    );
  }

  render() {
    return (
      <AppShell active="inventario">
        <View style={st.body}>
          {this.renderSubHeader()}
          <View style={st.split}>
            {this.renderLeftPane()}
            {this.renderRightPane()}
          </View>
        </View>
        {this.renderCustomerDialog()}
      </AppShell>
    );
  }
}

const st = StyleSheet.create({
  body: {flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16},

  subHeader: {flexDirection: 'row', alignItems: 'center', paddingVertical: 6, marginBottom: 10},
  backBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EFE3D2',
    alignItems: 'center', justifyContent: 'center',
  },
  subHeaderTitle: {fontFamily: fonts.bold, fontSize: 22, color: INK},
  subHeaderSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },

  split: {flex: 1, flexDirection: 'row', columnGap: 16},

  // ── Left pane (catálogo) ──
  leftPane: {
    flex: 1.5,
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  toolbar: {flexDirection: 'row', columnGap: 10},
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    backgroundColor: '#FAF5EC',
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
  scanBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  catalogLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: SUBTLE,
    marginTop: 14,
    marginBottom: 10,
  },
  catalogCount: {color: INK},

  rowSep: {height: 8},
  prodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  prodRowOn: {
    backgroundColor: SOFT_GOLD,
    borderColor: GOLD,
  },
  prodIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodIconOn: {backgroundColor: TINT_GOLD, borderColor: PANE_BORDER},
  prodName: {fontFamily: fonts.bold, fontSize: 13, color: INK},
  prodMeta: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: MUTED,
    marginTop: 2,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: GOLD,
  },
  addedBadgeTxt: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: WHITE,
  },

  emptyList: {paddingTop: 40, alignItems: 'center', rowGap: 8},
  emptyListTxt: {fontFamily: fonts.regular, fontSize: 13, color: MUTED},

  // ── Right pane (carrito) ──
  rightPane: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  providerEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  providerFilled: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    backgroundColor: SOFT_GOLD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GOLD,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  providerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: TINT_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerLabel: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0.8,
    color: DGOLD,
  },
  providerName: {fontFamily: fonts.bold, fontSize: 14, color: INK, marginTop: 2},
  providerNamePlaceholder: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: MUTED,
    marginTop: 2,
  },
  providerChange: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: DGOLD,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  cartHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  cartHeaderTitle: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: SUBTLE,
  },
  cartHeaderSub: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: MUTED,
  },

  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    paddingVertical: 8,
  },
  cartIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: TINT_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartName: {fontFamily: fonts.bold, fontSize: 13, color: INK},
  cartMeta: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: MUTED,
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    paddingHorizontal: 4,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepQty: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: INK,
    minWidth: 28,
    textAlign: 'center',
  },
  cartSep: {height: 1, backgroundColor: '#F4EBD8'},

  cartEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 8,
    paddingHorizontal: 16,
  },
  cartEmptyTxt: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
    textAlign: 'center',
  },

  totalsBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER_SOFT,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalsLabel: {fontFamily: fonts.regular, fontSize: 13, color: MUTED},
  totalsValue: {fontFamily: fonts.bold, fontSize: 14, color: INK},
  totalsValueBig: {fontFamily: fonts.bold, fontSize: 18, color: INK},

  submitBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    height: 52,
    borderRadius: 14,
    backgroundColor: GOLD,
  },
  submitBtnDisabled: {
    backgroundColor: '#F0E9DB',
  },
  submitBtnTxt: {fontFamily: fonts.bold, fontSize: 15, color: WHITE},
  submitBtnTxtDisabled: {color: SUBTLE},

  // Modal proveedor
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,19,12,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalPanel: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_SOFT,
  },
  modalTitle: {flex: 1, fontFamily: fonts.bold, fontSize: 15, color: INK},
  modalClose: {padding: 4},
  dlgRow: {paddingHorizontal: 18, paddingVertical: 12},
  dlgLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: SUBTLE,
  },
  dlgValue: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: INK,
    marginTop: 4,
  },
  modalRemove: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 6,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER_SOFT,
  },
  modalRemoveTxt: {fontFamily: fonts.bold, fontSize: 13, color: '#D7263D'},
});

export default AddInventoryScreen;
