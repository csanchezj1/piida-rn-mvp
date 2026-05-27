import React, {Component} from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon, Text} from 'react-native-paper';
import AppShell from '../../../layouts/AppShell';
import {fonts} from '../../../styles/basicStyles';
import {fieldErrors} from '../../../utils/screenFunctions';
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
const TINT_GOLD = '#FFF6E1';
const RED = '#D7263D';
const GREEN_TXT = '#1F8A4C';
const ACCENT = '#FF5A1F';

class TransferScreen extends Component {
  state = {
    search: '',
  };

  componentDidMount() {
    registerEventScreenMounted(this.props, 'Formulario traslado de inventario', 'TransferScreen');
    this.props.actions.loadOriginInventory();
  }

  componentDidUpdate(prevProps) {
    // Refrescar inventario origen cuando cambia la sucursal activa.
    if (prevProps.refetchTick !== this.props.refetchTick) {
      this.props.actions.loadOriginInventory();
    }
  }

  componentWillUnmount() {
    this.props.actions.clearScreen();
  }

  // Inventario origen: viene del back vía loadOriginInventory. Filtra solo
  // items con stock disponible (available > 0). El destino se elige aparte.
  getOriginInventory() {
    const inv = this.props.originInventory;
    if (!Array.isArray(inv)) return [];
    return inv.filter((it) => Number(it.available ?? it.stock ?? 0) > 0);
  }

  isSelected(item) {
    return (this.props.product || []).some((p) => p.nid === item.nid);
  }

  // ── Sub-header ────────────────────────────────────────────
  renderSubHeader() {
    return (
      <View style={st.subHeader}>
        <TouchableOpacity
          style={st.backBtn}
          activeOpacity={0.85}
          onPress={() => this.props.navigation.goBack()}>
          <Icon source="chevron-left" size={24} color={INK} />
        </TouchableOpacity>
        <View style={{flex: 1, marginLeft: 8}}>
          <Text style={st.title}>Trasladar inventario</Text>
          <Text style={st.subtitle}>Mové productos entre sucursales · queda registrado en movimientos</Text>
        </View>
      </View>
    );
  }

  // ── Banner Origen → Destino ──────────────────────────────
  renderRouteBanner() {
    const origin = this.props.user?.branch_office_name || 'Sucursal activa';
    const dest = this.props.branch;
    const branchErr = fieldErrors('branch', this.props.errors);
    return (
      <View>
        <View style={st.routeRow}>
          <View style={[st.routeCard, st.routeOrigin]}>
            <View style={st.routeIconWrap}>
              <Icon source="store-outline" size={18} color={GREEN_TXT} />
            </View>
            <View style={{flex: 1, minWidth: 0}}>
              <Text style={st.routeLabel}>ORIGEN</Text>
              <Text style={st.routeName} numberOfLines={1}>{origin}</Text>
              <Text style={st.routeSub} numberOfLines={1}>Sucursal activa</Text>
            </View>
          </View>

          <View style={st.arrowChip}>
            <Icon source="arrow-right" size={18} color={WHITE} />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[st.routeCard, st.routeDest, branchErr && st.fieldCardError]}
            onPress={() =>
              this.props.navigation.navigate('Branches', {from: 'transfer-destination'})
            }>
            <View style={[st.routeIconWrap, st.routeIconWrapDest]}>
              <Icon source="store-marker-outline" size={18} color={DGOLD} />
            </View>
            <View style={{flex: 1, minWidth: 0}}>
              <Text style={[st.routeLabel, {color: DGOLD}]}>DESTINO</Text>
              <Text style={st.routeName} numberOfLines={1}>
                {dest?.label || 'Seleccionar sucursal...'}
              </Text>
              <Text style={st.routeSub} numberOfLines={1}>
                {dest ? 'Tocá para cambiar' : 'Elegí a dónde mover el stock'}
              </Text>
            </View>
            <Icon source="chevron-down" size={20} color={MUTED} />
          </TouchableOpacity>
        </View>
        {!!branchErr && <Text style={st.fieldError}>{branchErr}</Text>}
      </View>
    );
  }

  // ── LEFT panel: buscador + lista del origen ──
  renderOriginPanel() {
    const productErr = fieldErrors('product', this.props.errors);
    const items = this.getOriginInventory();
    const search = this.state.search.trim().toLowerCase();
    const visible = search
      ? items.filter((it) => (it.label || '').toLowerCase().includes(search))
      : items;

    return (
      <View style={st.leftCol}>
        <View style={st.searchWrap}>
          <Icon source="magnify" size={18} color={MUTED} />
          <TextInput
            style={st.searchInput}
            placeholder="Buscar producto en sucursal origen..."
            placeholderTextColor={SUBTLE}
            value={this.state.search}
            onChangeText={(t) => this.setState({search: t})}
            underlineColorAndroid="transparent"
          />
          {!!this.state.search && (
            <TouchableOpacity onPress={() => this.setState({search: ''})}>
              <Icon source="close-circle" size={16} color={MUTED} />
            </TouchableOpacity>
          )}
        </View>

        {visible.length > 0 && (
          <View style={{flex: 1, marginTop: 12}}>
            <Text style={st.sectionLabel}>
              STOCK DISPONIBLE EN ORIGEN · {visible.length} PRODUCTO{visible.length === 1 ? '' : 'S'}
            </Text>
            {/* ScrollView con flex:1 + contentContainer rowGap:0 +
                showsVerticalScrollIndicator garantiza que listas largas
                (catálogos grandes) sean recorribles. Antes la lista estaba
                en un View static y no scrolleaba. */}
            <ScrollView
              style={{flex: 1}}
              contentContainerStyle={st.list}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {visible.map((it, idx) => {
                const sel = this.isSelected(it);
                return (
                  <TouchableOpacity
                    key={`${it.nid}_${idx}`}
                    activeOpacity={0.85}
                    onPress={() => this.props.actions.addProduct(it)}
                    style={[st.row, sel && st.rowSelected, idx === visible.length - 1 && {borderBottomWidth: 0}]}>
                    <View style={st.rowIcon}>
                      <Icon source="cube-outline" size={18} color={DGOLD} />
                    </View>
                    <View style={{flex: 1, minWidth: 0}}>
                      <Text style={st.rowName} numberOfLines={1}>{it.label}</Text>
                      {!!it.code && (
                        <Text style={st.rowMeta} numberOfLines={1}>{it.code}{it.category ? ` · ${it.category}` : ''}</Text>
                      )}
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                      <Text style={st.stockBig}>{it.available ?? it.stock ?? 0}</Text>
                      <Text style={st.stockSub}>EN STOCK</Text>
                    </View>
                    {sel && (
                      <View style={st.addedPill}>
                        <Text style={st.addedPillTxt}>AGREGADO</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
        {!!productErr && <Text style={st.fieldError}>{productErr}</Text>}
      </View>
    );
  }

  // ── RIGHT panel: productos a trasladar ──
  renderCartPanel() {
    const items = this.props.product || [];
    const totalUnits = items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
    return (
      <View style={st.rightCol}>
        <Text style={st.sectionLabel}>PRODUCTOS A TRASLADAR</Text>
        <Text style={st.cartHeader}>
          {items.length} producto{items.length === 1 ? '' : 's'} · {totalUnits} unidad{totalUnits === 1 ? '' : 'es'}
        </Text>

        <View style={{flex: 1, marginTop: 8}}>
          {items.length === 0 ? (
            <View style={st.emptyWrap}>
              <Icon source="package-variant-closed" size={28} color={SUBTLE} />
              <Text style={st.emptyTxt}>Aún no agregaste productos al traslado</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{rowGap: 10}} showsVerticalScrollIndicator={false}>
              {items.map((item, index) => {
                const qty = Number(item.qty) || 0;
                const available = Number(item.available ?? item.stock ?? 0);
                const remaining = Math.max(0, available - qty);
                return (
                  <View key={item.nid || index} style={st.cartCard}>
                    <View style={st.cartHead}>
                      <View style={{flex: 1, minWidth: 0}}>
                        <Text style={st.cartName} numberOfLines={1}>{item.label}</Text>
                        {available > 0 && (
                          <Text style={st.cartSub}>Disponible: {available}</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => this.props.actions.deleteProduct(item)}
                        style={st.cartDelete}>
                        <Icon source="close" size={16} color={MUTED} />
                      </TouchableOpacity>
                    </View>
                    <View style={st.cartFoot}>
                      <View style={st.stepper}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => this.props.actions.removeProduct(item)}
                          style={st.stepBtn}>
                          <Icon source="minus" size={14} color={INK} />
                        </TouchableOpacity>
                        <Text style={st.stepQty}>{qty}</Text>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => this.props.actions.addProduct(item)}
                          style={st.stepBtn}>
                          <Icon source="plus" size={14} color={INK} />
                        </TouchableOpacity>
                      </View>
                      {available > 0 && (
                        <Text style={st.remaining}>Queda en origen: {remaining}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Observaciones */}
        <View style={[st.fieldCard, {marginTop: 10}]}>
          <Text style={st.fieldLabel}>OBSERVACIONES (OPCIONAL)</Text>
          <TextInput
            style={st.obsInput}
            placeholder="Detalle del traslado..."
            placeholderTextColor={SUBTLE}
            value={this.props.obs || ''}
            onChangeText={(t) => this.props.actions.obsChange(t)}
            multiline
            underlineColorAndroid="transparent"
          />
        </View>

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={items.length === 0 || !this.props.branch}
          style={[
            st.ctaBtn,
            (items.length === 0 || !this.props.branch) && st.ctaBtnDisabled,
          ]}
          onPress={() => this.props.actions.createTransfer({navigation: this.props.navigation})}>
          <Icon source="check" size={18} color={WHITE} />
          <Text style={st.ctaTxt} numberOfLines={1}>
            {this.props.branch
              ? `Confirmar traslado a ${this.props.branch.label}`
              : 'Selecciona una sucursal destino'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <AppShell active="movimientos">
        <View style={st.body}>
          {this.renderSubHeader()}
          {this.renderRouteBanner()}
          <View style={st.split}>
            {this.renderOriginPanel()}
            {this.renderCartPanel()}
          </View>
        </View>
      </AppShell>
    );
  }
}

const st = StyleSheet.create({
  body: {flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8},

  // Sub-header
  subHeader: {flexDirection: 'row', alignItems: 'center', paddingBottom: 14},
  backBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {fontFamily: fonts.bold, fontSize: 22, color: INK, letterSpacing: -0.3},
  subtitle: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},

  // Route banner
  routeRow: {flexDirection: 'row', alignItems: 'center', columnGap: 10},
  routeCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', columnGap: 12,
    backgroundColor: WHITE, borderRadius: 14,
    borderWidth: 1.5, borderColor: BORDER_SOFT,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  routeOrigin: {borderColor: '#BFE6CD', backgroundColor: '#E6F4EA'},
  routeDest: {borderColor: BORDER_SOFT, backgroundColor: TINT_GOLD},
  routeIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center',
  },
  routeIconWrapDest: {backgroundColor: WHITE},
  routeLabel: {fontFamily: fonts.bold, fontSize: 9, color: GREEN_TXT, letterSpacing: 1.1, marginBottom: 2},
  routeName: {fontFamily: fonts.bold, fontSize: 14, color: INK},
  routeSub: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginTop: 1},
  arrowChip: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: INK, alignItems: 'center', justifyContent: 'center',
  },

  // Split body
  split: {flex: 1, flexDirection: 'row', columnGap: 14, marginTop: 14},
  leftCol: {flex: 1.4},
  rightCol: {flex: 1},

  // Search + addMore
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', columnGap: 8,
    backgroundColor: WHITE, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER_SOFT,
    paddingHorizontal: 14, height: 46,
  },
  searchInput: {flex: 1, fontFamily: fonts.regular, fontSize: 13, color: INK, padding: 0},
  addMoreBtn: {
    flexDirection: 'row', alignItems: 'center', columnGap: 6,
    backgroundColor: WHITE, borderRadius: 12,
    borderWidth: 1.5, borderColor: GOLD, borderStyle: 'dashed',
    paddingHorizontal: 14, paddingVertical: 10, marginTop: 10,
    alignSelf: 'flex-start',
  },
  addMoreTxt: {fontFamily: fonts.bold, fontSize: 12, color: DGOLD},

  sectionLabel: {
    fontFamily: fonts.bold, fontSize: 10, color: DGOLD,
    letterSpacing: 1, marginBottom: 8,
  },
  list: {
    backgroundColor: WHITE, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER_SOFT, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', columnGap: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: BORDER_SOFT,
  },
  rowSelected: {backgroundColor: TINT_GOLD},
  rowIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#FFF6E1', alignItems: 'center', justifyContent: 'center',
  },
  rowName: {fontFamily: fonts.bold, fontSize: 13, color: INK},
  rowMeta: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginTop: 2},
  stockBig: {fontFamily: fonts.bold, fontSize: 14, color: INK},
  stockSub: {fontFamily: fonts.regular, fontSize: 9, color: MUTED, letterSpacing: 0.5},
  addedPill: {
    position: 'absolute', right: 14, top: -6,
    backgroundColor: GOLD, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999,
  },
  addedPillTxt: {fontFamily: fonts.bold, fontSize: 9, color: WHITE, letterSpacing: 0.4},

  // Cart right panel
  cartHeader: {fontFamily: fonts.semiBold, fontSize: 12, color: MUTED, marginBottom: 6},
  cartCard: {
    backgroundColor: WHITE, borderRadius: 12,
    borderWidth: 1, borderColor: BORDER_SOFT,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  cartHead: {flexDirection: 'row', alignItems: 'center', columnGap: 6},
  cartName: {fontFamily: fonts.bold, fontSize: 13, color: INK},
  cartSub: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginTop: 2},
  cartDelete: {width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  cartFoot: {flexDirection: 'row', alignItems: 'center', columnGap: 12, marginTop: 8},
  stepper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F7F0E8', borderRadius: 999, padding: 2,
  },
  stepBtn: {width: 28, height: 28, borderRadius: 14, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center'},
  stepQty: {fontFamily: fonts.bold, fontSize: 13, color: INK, paddingHorizontal: 12, minWidth: 36, textAlign: 'center'},
  remaining: {flex: 1, fontFamily: fonts.regular, fontSize: 11, color: MUTED, textAlign: 'right'},

  emptyWrap: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 30, rowGap: 8},
  emptyTxt: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, textAlign: 'center'},

  // Field card (obs)
  fieldCard: {
    backgroundColor: WHITE, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER_SOFT,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  fieldCardError: {borderColor: RED},
  fieldLabel: {fontFamily: fonts.bold, fontSize: 10, color: DGOLD, letterSpacing: 1, marginBottom: 6},
  obsInput: {
    fontFamily: fonts.regular, fontSize: 13, color: INK,
    paddingVertical: 0, padding: 0, minHeight: 40,
  },
  fieldError: {fontFamily: fonts.regular, fontSize: 11, color: RED, marginTop: 4, marginLeft: 4},

  // CTA: el `marginBottom` evita que quede pegado al borde inferior del
  // viewport (gesture bar / safe area de Android).
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    columnGap: 10, backgroundColor: GOLD, borderRadius: 14,
    paddingVertical: 16, marginTop: 10, marginBottom: 22,
  },
  ctaBtnDisabled: {backgroundColor: SUBTLE},
  ctaTxt: {fontFamily: fonts.bold, fontSize: 14, color: WHITE},
});

export default TransferScreen;
