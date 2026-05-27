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
const SOFT_GOLD = '#FFF6E1';

class ProvidersScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(this.props, 'Proveedores', 'ProvidersScreen');
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
    if (!user) return;
    this.props.actions.getProviders(user.uid, this.props.text || '', !!reset);
  };

  onSearch = (text) => this.props.actions.textChange(text);
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
    // Si vino como picker (route.params.from), seleccionamos y volvemos.
    const from = this.props.route?.params?.from;
    if (from && this.props.actions.selectProvider) {
      this.props.actions.selectProvider(item, from);
      this.props.navigation.goBack();
    }
  };

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
          <Text style={st.title} allowFontScaling={false}>Proveedores</Text>
          <Text style={st.subtitle}>Selecciona un proveedor o creá uno nuevo</Text>
        </View>
        <TouchableOpacity
          style={st.primaryBtn}
          activeOpacity={0.85}
          onPress={() => this.props.navigation.navigate('CreateProvider')}>
          <Icon source="plus" size={18} color={WHITE} />
          <Text style={st.primaryBtnTxt}>Nuevo proveedor</Text>
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
          placeholder="Buscar proveedores..."
          placeholderTextColor={SUBTLE}
          value={text}
          onChangeText={this.onSearch}
          onSubmitEditing={this.onSubmit}
          returnKeyType="search"
          allowFontScaling={false}
        />
        {!!text && (
          <TouchableOpacity onPress={this.onClearSearch} style={{padding: 4}}>
            <Icon source="close-circle" size={18} color={MUTED} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  renderCard = ({item}) => {
    const name = item.label || item.title || 'Proveedor';
    const nit = item.id_number || item.nid_number || '';
    const phone = item.phone || '';
    const email = item.email || '';
    const orders = item.purchases_count ?? item.orders_count ?? null;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={st.card}
        onPress={() => this.onSelect(item)}>
        <View style={st.iconWrap}>
          <Icon source="truck-outline" size={24} color={DGOLD} />
        </View>
        <View style={{flex: 1, minWidth: 0}}>
          <Text style={st.cardName} numberOfLines={1} allowFontScaling={false}>{name}</Text>
          {!!nit && (
            <View style={st.metaRow}>
              <Icon source="card-account-details-outline" size={12} color={MUTED} />
              <Text style={st.metaTxt} numberOfLines={1}>{nit}</Text>
            </View>
          )}
          {!!phone && (
            <View style={st.metaRow}>
              <Icon source="phone-outline" size={12} color={MUTED} />
              <Text style={st.metaTxt} numberOfLines={1}>{phone}</Text>
            </View>
          )}
          {!!email && (
            <View style={st.metaRow}>
              <Icon source="email-outline" size={12} color={MUTED} />
              <Text style={st.metaTxt} numberOfLines={1}>{email}</Text>
            </View>
          )}
          {orders != null && (
            <View style={st.badge}>
              <Text style={st.badgeTxt}>{orders} pedidos</Text>
            </View>
          )}
        </View>
        <Icon source="chevron-right" size={20} color={SUBTLE} />
      </TouchableOpacity>
    );
  };

  renderList() {
    const {list, showLoader} = this.props;
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
          <Icon source="truck-fast-outline" size={42} color={SUBTLE} />
          <Text style={st.emptyTxt}>No se encontraron proveedores</Text>
          <TouchableOpacity
            style={[st.primaryBtn, {marginTop: 14}]}
            activeOpacity={0.85}
            onPress={() => this.props.navigation.navigate('CreateProvider')}>
            <Icon source="plus" size={18} color={WHITE} />
            <Text style={st.primaryBtnTxt}>Crear proveedor</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <FlatList
        data={list}
        keyExtractor={(it, idx) => String(it.nid ?? idx)}
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
      />
    );
  }

  render() {
    return (
      <AppShell active="movimientos">
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
  subHeader: {flexDirection: 'row', alignItems: 'center', paddingBottom: 14},
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

  card: {
    flex: 1, flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: WHITE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER_SOFT,
    padding: 16, columnGap: 14,
  },
  iconWrap: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: SOFT_GOLD,
    alignItems: 'center', justifyContent: 'center',
  },
  cardName: {fontFamily: fonts.bold, fontSize: 14, color: INK, marginBottom: 6},
  metaRow: {flexDirection: 'row', alignItems: 'center', columnGap: 6, marginBottom: 3},
  metaTxt: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, flex: 1},
  badge: {
    alignSelf: 'flex-start', marginTop: 6,
    backgroundColor: SOFT_GOLD, borderColor: '#F0D592', borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
  },
  badgeTxt: {fontFamily: fonts.semiBold, fontSize: 10, color: DGOLD},

  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60},
  emptyTxt: {fontFamily: fonts.regular, fontSize: 14, color: MUTED, marginTop: 10},
});

export default ProvidersScreen;
