import React, {Component} from 'react';
import {
  ActivityIndicator,
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

// Paleta — alineada con el rediseño tablet (warm beige + dorado PIIDA).
const BG = '#FAF5EC';
const INK = '#1A130C';
const GOLD = '#F7A928';
const MUTED = '#7E6A52';
const SUBTLE = '#A89580';
const WHITE = '#FFFFFF';
const BORDER_SOFT = '#EFE3D2';
const GREEN_BG = '#E6F4EA';
const GREEN_TXT = '#1F8A4C';
const GREEN_BORDER = '#BFE6CD';

// Paleta de avatares — colores menta/durazno/lavanda suaves para las
// iniciales. Cíclica por hash del nombre.
const AVATAR_COLORS = [
  {bg: '#D9F0E0', fg: '#1F8A4C'},
  {bg: '#FFEAD2', fg: '#C66E00'},
  {bg: '#E6E1F8', fg: '#5C3FB8'},
  {bg: '#FCE0E4', fg: '#C44569'},
  {bg: '#D6EAFB', fg: '#1F5BBF'},
  {bg: '#FBF1C8', fg: '#9C7400'},
];
const colorForName = (name = '') => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};
const initialsOf = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase().slice(0, 2);
};

class ClientsScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(this.props, 'Clientes', 'ClientsScreen');
    this.fetch(true);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.refetchTick !== this.props.refetchTick) {
      this.fetch(true);
    }
  }

  componentWillUnmount() {
    this.props.actions.clearSearch?.();
  }

  fetch = (reset) => {
    const {user} = this.props;
    if (!user?.company) return;
    this.props.actions.getCustomer(user.company, this.props.text || '', !!reset);
  };

  onSearch = (text) => {
    this.props.actions.textChange(text);
  };

  onSubmit = () => this.fetch(true);
  onClearSearch = () => {
    this.props.actions.textChange('');
    this.fetch(true);
  };

  onEndReached = () => {
    const {requestMade, showLoader, list} = this.props;
    if (requestMade || showLoader || !list || list.length < 20) return;
    this.fetch(false);
  };

  onSelect = (item) => {
    // Si la pantalla se abrió como picker (desde "Agregar cliente" en
    // VentaLibre/NewSale), tap selecciona el cliente y vuelve atrás.
    // Si no, es vista de gestión y no hace nada (futuro: detalle cliente).
    const from = this.props.route?.params?.from;
    if (from === 'customer' && this.props.actions.selectProvider) {
      this.props.actions.selectProvider(item, 'customer');
      this.props.navigation.goBack();
    }
  };

  // ─── Sub-header ──────────────────────────────────────────
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
          <Text style={st.title}>Clientes</Text>
          <Text style={st.subtitle}>Selecciona un cliente o creá uno nuevo</Text>
        </View>
        <TouchableOpacity
          style={st.primaryBtn}
          activeOpacity={0.85}
          onPress={() => this.props.navigation.navigate('CreateCustomer')}>
          <Icon source="plus" size={18} color={WHITE} />
          <Text style={st.primaryBtnTxt}>Nuevo cliente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderSearch() {
    const text = this.props.text || '';
    return (
      <View style={st.searchWrap}>
        <Icon source="magnify" size={20} color={MUTED} />
        <TextInput
          style={st.searchInput}
          placeholder="Buscar clientes..."
          placeholderTextColor={SUBTLE}
          value={text}
          onChangeText={this.onSearch}
          onSubmitEditing={this.onSubmit}
          returnKeyType="search"
        />
        {!!text && (
          <TouchableOpacity onPress={this.onClearSearch} style={st.searchClear}>
            <Icon source="close-circle" size={18} color={MUTED} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  renderCard = ({item}) => {
    const name = item.label || item.title || 'Sin nombre';
    const id = item.id_number || item.nid_number || '';
    const phone = item.phone || '';
    const email = item.email || '';
    const purchases = item.purchases_count ?? item.orders_count ?? null;
    const av = colorForName(name);
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={st.card}
        onPress={() => this.onSelect(item)}>
        <View style={[st.avatar, {backgroundColor: av.bg}]}>
          <Text style={[st.avatarTxt, {color: av.fg}]}>{initialsOf(name)}</Text>
        </View>
        <View style={{flex: 1, minWidth: 0}}>
          <Text style={st.cardName} numberOfLines={1}>{name}</Text>
          {!!id && (
            <View style={st.row}>
              <Icon source="card-account-details-outline" size={14} color={MUTED} />
              <Text style={st.rowTxt} numberOfLines={1}>{id}</Text>
            </View>
          )}
          {!!phone && (
            <View style={st.row}>
              <Icon source="phone-outline" size={14} color={MUTED} />
              <Text style={st.rowTxt} numberOfLines={1}>{phone}</Text>
            </View>
          )}
          {!!email && (
            <View style={st.row}>
              <Icon source="email-outline" size={14} color={MUTED} />
              <Text style={st.rowTxt} numberOfLines={1}>{email}</Text>
            </View>
          )}
          {purchases != null && (
            <View style={st.badge}>
              <Text style={st.badgeTxt}>{purchases} compras</Text>
            </View>
          )}
        </View>
        <Icon source="chevron-right" size={20} color={SUBTLE} />
      </TouchableOpacity>
    );
  };

  renderList() {
    const {list, showLoader, requestMade} = this.props;
    if (list == null) {
      return (
        <View style={{paddingTop: 8}}>
          {Array.from({length: 4}).map((_, i) => (
            <View key={i} style={{flexDirection: 'row', columnGap: 12, marginBottom: 10}}>
              <Shimmer height={100} width={'48%'} style={{borderRadius: 14}} />
              <Shimmer height={100} width={'48%'} style={{borderRadius: 14}} />
            </View>
          ))}
        </View>
      );
    }
    if (!list.length) {
      return (
        <View style={st.empty}>
          <Icon source="account-search-outline" size={42} color={SUBTLE} />
          <Text style={st.emptyTxt}>No se encontraron clientes</Text>
          <TouchableOpacity
            style={[st.primaryBtn, {marginTop: 14}]}
            activeOpacity={0.85}
            onPress={() => this.props.navigation.navigate('CreateCustomer')}>
            <Icon source="plus" size={18} color={WHITE} />
            <Text style={st.primaryBtnTxt}>Crear cliente</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <FlatList
        data={list}
        keyExtractor={(it, idx) => String(it.nid ?? it.uid ?? idx)}
        renderItem={this.renderCard}
        numColumns={2}
        columnWrapperStyle={{columnGap: 14}}
        ItemSeparatorComponent={() => <View style={{height: 14}} />}
        contentContainerStyle={{paddingBottom: 28, paddingTop: 4}}
        onEndReached={this.onEndReached}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={!!showLoader && list.length === 0} onRefresh={() => this.fetch(true)} />
        }
        ListFooterComponent={
          showLoader && list.length > 0 ? (
            <View style={{paddingVertical: 12}}>
              <ActivityIndicator size="small" color={GOLD} />
            </View>
          ) : null
        }
      />
    );
  }

  render() {
    return (
      <AppShell active="venta">
        <View style={st.body}>
          {this.renderSubHeader()}
          {this.renderSearch()}
          <View style={{flex: 1, marginTop: 12}}>{this.renderList()}</View>
        </View>
      </AppShell>
    );
  }
}

const st = StyleSheet.create({
  body: {flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 12},

  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {fontFamily: fonts.bold, fontSize: 22, color: INK, letterSpacing: -0.3},
  subtitle: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', columnGap: 8,
    paddingHorizontal: 16, height: 44,
    borderRadius: 14, backgroundColor: GOLD,
  },
  primaryBtnTxt: {fontFamily: fonts.bold, fontSize: 13, color: WHITE},

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', columnGap: 10,
    backgroundColor: WHITE, borderRadius: 14,
    paddingHorizontal: 16, height: 50,
    borderWidth: 1, borderColor: BORDER_SOFT,
  },
  searchInput: {flex: 1, fontFamily: fonts.regular, fontSize: 14, color: INK, padding: 0},
  searchClear: {padding: 4},

  card: {
    flex: 1, flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: WHITE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER_SOFT,
    padding: 16, columnGap: 14,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: {fontFamily: fonts.bold, fontSize: 14, letterSpacing: 0.3},
  cardName: {fontFamily: fonts.bold, fontSize: 14, color: INK, marginBottom: 6},
  row: {
    flexDirection: 'row', alignItems: 'center', columnGap: 6, marginBottom: 3,
  },
  rowTxt: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, flex: 1},
  badge: {
    alignSelf: 'flex-start', marginTop: 6,
    backgroundColor: GREEN_BG, borderColor: GREEN_BORDER, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
  },
  badgeTxt: {fontFamily: fonts.semiBold, fontSize: 10, color: GREEN_TXT},

  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60,
  },
  emptyTxt: {fontFamily: fonts.regular, fontSize: 14, color: MUTED, marginTop: 10},
});

export default ClientsScreen;
