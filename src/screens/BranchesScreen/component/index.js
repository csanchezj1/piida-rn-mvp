import React, {Component} from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon, Text} from 'react-native-paper';
import AppShell from '../../../layouts/AppShell';
import {Shimmer} from '../../../components';
import {fonts} from '../../../styles/basicStyles';
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
const PURPLE_BG = '#EBE3FB';
const PURPLE_TXT = '#5C3FB8';

class BranchesScreen extends Component {
  state = {
    search: '',
  };

  componentDidMount() {
    registerEventScreenMounted(this.props, 'Sucursales', 'BranchesScreen');
  }

  // Comportamiento del tap:
  //   - Si vinimos de Transfer (route.params.from === 'transfer-destination'),
  //     seleccionamos esa branch como destino y volvemos.
  //   - Si no, solo navegamos al edit/detalle (futuro).
  onSelect = (branch) => {
    const from = this.props.route?.params?.from;
    if (from === 'transfer-destination') {
      // El reducer transferData / la UI esperan el shape SelectList legacy
      // (label/value) — sin esto la card "DESTINO" mostraba "Seleccionar
      // sucursal..." aunque hubiéramos dispatcheado el cambio.
      this.props.actions.branchChange?.({
        ...branch,
        label: branch.name,
        value: branch.id,
      });
      this.props.navigation.goBack();
      return;
    }
    // Fallback: gestión — no-op por ahora.
  };

  getBranches() {
    const list = Array.isArray(this.props.branches) ? this.props.branches : [];
    const activeId = this.props.activeBranchId;
    const fromTransfer = this.props.route?.params?.from === 'transfer-destination';
    const search = this.state.search.trim().toLowerCase();
    let out = list;
    // En picker de destino para traslado, excluir la branch origen (= activa).
    if (fromTransfer && activeId) {
      out = out.filter((b) => b.id !== activeId);
    }
    if (search) {
      out = out.filter((b) =>
        (b.name || '').toLowerCase().includes(search) ||
        (b.address || '').toLowerCase().includes(search),
      );
    }
    return out;
  }

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
          <Text style={st.title}>Sucursales</Text>
          <Text style={st.subtitle}>
            {this.props.route?.params?.from === 'transfer-destination'
              ? 'Selecciona la sucursal de destino'
              : 'Tu red de sucursales'}
          </Text>
        </View>
      </View>
    );
  }

  renderSearch() {
    return (
      <View style={st.searchWrap}>
        <Icon source="magnify" size={20} color={MUTED} />
        <TextInput
          style={st.searchInput}
          placeholder="Buscar sucursales..."
          placeholderTextColor={SUBTLE}
          value={this.state.search}
          onChangeText={(t) => this.setState({search: t})}
          underlineColorAndroid="transparent"
          allowFontScaling={false}
        />
        {!!this.state.search && (
          <TouchableOpacity onPress={() => this.setState({search: ''})}>
            <Icon source="close-circle" size={16} color={MUTED} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  renderCard = ({item}) => {
    const activeId = this.props.activeBranchId;
    const isActive = item.id === activeId;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[st.card, isActive && st.cardActive]}
        onPress={() => this.onSelect(item)}>
        <View style={st.iconWrap}>
          <Icon source="map-marker-outline" size={24} color={PURPLE_TXT} />
        </View>
        <View style={{flex: 1, minWidth: 0}}>
          <Text style={st.cardName} numberOfLines={1} allowFontScaling={false}>
            {item.name}
          </Text>
          {!!item.address && (
            <View style={st.metaRow}>
              <Icon source="card-account-details-outline" size={12} color={MUTED} />
              <Text style={st.metaTxt} numberOfLines={1}>{item.address}</Text>
            </View>
          )}
          {!!item.phone && (
            <View style={st.metaRow}>
              <Icon source="phone-outline" size={12} color={MUTED} />
              <Text style={st.metaTxt} numberOfLines={1}>{item.phone}</Text>
            </View>
          )}
          {!!item.email && (
            <View style={st.metaRow}>
              <Icon source="email-outline" size={12} color={MUTED} />
              <Text style={st.metaTxt} numberOfLines={1}>{item.email}</Text>
            </View>
          )}
        </View>
        <Icon source="chevron-right" size={20} color={SUBTLE} />
      </TouchableOpacity>
    );
  };

  render() {
    const branches = this.getBranches();
    const empty = branches.length === 0;
    return (
      <AppShell active="venta">
        <View style={st.body}>
          {this.renderSubHeader()}
          {this.renderSearch()}
          <View style={{flex: 1, marginTop: 14}}>
            {empty ? (
              <View style={st.empty}>
                <Icon source="store-search-outline" size={42} color={SUBTLE} />
                <Text style={st.emptyTxt}>
                  {this.state.search ? 'No se encontraron sucursales' : 'Aún no tenés sucursales para mover stock'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={branches}
                keyExtractor={(it) => String(it.id)}
                renderItem={this.renderCard}
                numColumns={2}
                columnWrapperStyle={{columnGap: 14}}
                ItemSeparatorComponent={() => <View style={{height: 14}} />}
                contentContainerStyle={{paddingBottom: 24}}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </AppShell>
    );
  }
}

const st = StyleSheet.create({
  body: {flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 12},

  subHeader: {flexDirection: 'row', alignItems: 'center', paddingBottom: 14},
  backBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {fontFamily: fonts.bold, fontSize: 22, color: INK, letterSpacing: -0.3},
  subtitle: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', columnGap: 10,
    backgroundColor: WHITE, borderRadius: 14,
    paddingHorizontal: 16, height: 50,
    borderWidth: 1, borderColor: BORDER_SOFT,
  },
  searchInput: {flex: 1, fontFamily: fonts.regular, fontSize: 14, color: INK, padding: 0},

  card: {
    flex: 1, flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: WHITE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER_SOFT,
    padding: 16, columnGap: 14,
  },
  cardActive: {borderColor: GOLD, borderWidth: 1.5},
  iconWrap: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: PURPLE_BG,
    alignItems: 'center', justifyContent: 'center',
  },
  cardName: {fontFamily: fonts.bold, fontSize: 14, color: INK, marginBottom: 6},
  metaRow: {flexDirection: 'row', alignItems: 'center', columnGap: 6, marginBottom: 3},
  metaTxt: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, flex: 1},

  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60},
  emptyTxt: {fontFamily: fonts.regular, fontSize: 14, color: MUTED, marginTop: 10, textAlign: 'center'},
});

export default BranchesScreen;
