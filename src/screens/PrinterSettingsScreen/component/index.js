import React, {Component} from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {ActivityIndicator, Icon, Switch, Text} from 'react-native-paper';
import AppShell from '../../../layouts/AppShell';
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
const TINT_GOLD = '#FFF6E1';
const GREEN_BG = '#DCEFE2';
const GREEN_TXT = '#1F8A4C';
const RED = '#D7263D';

class PrinterSettingsScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(this.props, 'Configurar impresora', 'PrinterSettingsScreen');
    this.props.actions.loadPrefs();
    this.props.actions.scanPaired();
  }

  componentWillUnmount() {
    this.props.actions.clear();
  }

  confirmForget = (dev) => {
    Alert.alert(
      'Olvidar impresora',
      `¿Olvidar "${dev.name || 'Sin nombre'}"?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Olvidar',
          style: 'destructive',
          onPress: () => this.props.actions.forgetPrinter({address: dev.address}),
        },
      ],
    );
  };

  buildDeviceList() {
    const seen = new Set();
    const out = [];
    const paired = this.props.paired || [];
    const found = this.props.found || [];
    for (const d of paired) {
      if (!seen.has(d.address)) {
        seen.add(d.address);
        out.push({...d, isPaired: true});
      }
    }
    for (const d of found) {
      if (!seen.has(d.address)) {
        seen.add(d.address);
        out.push({...d, isPaired: d.isPaired ?? false});
      }
    }
    return out;
  }

  onRefresh = () => {
    this.props.actions.scanPaired();
    this.props.actions.scanNearby();
  };

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
          <Text style={st.title}>Configurar impresora</Text>
          <Text style={st.subtitle}>Conectá una impresora térmica Bluetooth</Text>
        </View>
      </View>
    );
  }

  // ── Card "Impresora seleccionada" ─────────────────────────
  renderSelectedCard() {
    const {address, name} = this.props;
    if (!address) {
      return (
        <View style={st.selectedEmpty}>
          <View style={st.selectedIconEmpty}>
            <Icon source="printer-off" size={24} color={MUTED} />
          </View>
          <View style={{flex: 1, minWidth: 0}}>
            <Text style={st.selectedTitle}>Sin impresora</Text>
            <Text style={st.selectedSub}>
              Buscá y seleccioná una impresora de la lista debajo.
            </Text>
          </View>
        </View>
      );
    }
    return (
      <View style={st.selectedCard}>
        <View style={st.selectedIcon}>
          <Icon source="printer" size={28} color={DGOLD} />
        </View>
        <View style={{flex: 1, minWidth: 0}}>
          <Text style={st.selectedTag}>IMPRESORA SELECCIONADA</Text>
          <Text style={st.selectedTitle} numberOfLines={1}>{name || 'Impresora'}</Text>
          <Text style={st.selectedSub} numberOfLines={1}>
            {address} · Emparejada
          </Text>
        </View>
        <View style={st.connectedPill}>
          <Icon source="check-circle" size={14} color={WHITE} />
          <Text style={st.connectedPillTxt}>CONECTADA</Text>
        </View>
      </View>
    );
  }

  // ── Botones de acción (página de prueba / abrir cajón) ──
  renderActionRow() {
    const {loading, address, actions} = this.props;
    const disabled = !!loading || !address;
    return (
      <View style={st.actionRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={disabled}
          onPress={() => actions.testPrint()}
          style={[st.actionBtnPrimary, disabled && {opacity: 0.5}]}>
          <Icon source="printer-outline" size={18} color={WHITE} />
          <Text style={st.actionBtnTxt}>Imprimir página de prueba</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={disabled}
          onPress={() => actions.testDrawer()}
          style={[st.actionBtnSecondary, disabled && {opacity: 0.5}]}>
          <Icon source="cash-register" size={18} color={INK} />
          <Text style={[st.actionBtnTxt, {color: INK}]}>Abrir cajón</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Lista de impresoras detectadas ──
  renderDevicesCard() {
    const {scanning, pairingAddress, address, actions} = this.props;
    const devices = this.buildDeviceList();

    return (
      <View style={st.section}>
        <View style={st.sectionHead}>
          <View style={{flex: 1, minWidth: 0}}>
            <Text style={st.sectionTitle}>Impresoras detectadas</Text>
            <Text style={st.sectionSub}>
              {scanning
                ? 'Buscando...'
                : `${devices.length} dispositivo${devices.length === 1 ? '' : 's'} cerca`}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={scanning}
            onPress={() => actions.scanNearby()}
            style={st.scanBtn}>
            <Icon source="bluetooth" size={14} color={INK} />
            <Text style={st.scanBtnTxt}>
              {scanning ? 'Buscando...' : 'Buscar de nuevo'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={st.devicesList}>
          {devices.length === 0 ? (
            <View style={st.emptyDevices}>
              {scanning ? (
                <ActivityIndicator size="small" color={GOLD} />
              ) : (
                <Icon source="bluetooth-off" size={28} color={SUBTLE} />
              )}
              <Text style={st.emptyDevicesTxt}>
                {scanning
                  ? 'Buscando dispositivos Bluetooth cercanos...'
                  : 'Tocá "Buscar de nuevo" para descubrir impresoras. Verificá que la impresora esté encendida.'}
              </Text>
            </View>
          ) : (
            devices.map((dev, idx) => {
              const selected = dev.address === address;
              const isPairing = pairingAddress === dev.address;
              const isLast = idx === devices.length - 1;
              return (
                <TouchableOpacity
                  key={dev.address}
                  activeOpacity={0.85}
                  disabled={isPairing}
                  onPress={() =>
                    actions.tapDevice({
                      address: dev.address,
                      name: dev.name,
                      isPaired: dev.isPaired,
                    })
                  }
                  onLongPress={() => dev.isPaired && this.confirmForget(dev)}
                  style={[
                    st.deviceRow,
                    !isLast && st.deviceRowBorder,
                    selected && st.deviceRowSelected,
                  ]}>
                  <View style={[st.deviceIcon, selected && st.deviceIconSelected]}>
                    <Icon
                      source="bluetooth"
                      size={16}
                      color={selected ? DGOLD : MUTED}
                    />
                  </View>
                  <View style={{flex: 1, minWidth: 0}}>
                    <Text style={st.deviceName} numberOfLines={1}>
                      {dev.name || 'Sin nombre'}
                    </Text>
                    <Text style={st.deviceMeta} numberOfLines={1}>
                      {isPairing
                        ? 'Emparejando...'
                        : dev.isPaired
                        ? dev.address
                        : `${dev.address} · sin emparejar`}
                    </Text>
                  </View>
                  {selected && (
                    <Icon source="check" size={20} color={GOLD} />
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </View>
    );
  }

  // ── Comportamiento (switches) ──
  renderBehaviorCard() {
    const {autoPrintAfterSale, openDrawerOnCashSale, actions} = this.props;
    const Row = ({title, desc, value, onChange}) => (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onChange(!value)}
        style={st.behaviorRow}>
        <View style={{flex: 1, minWidth: 0, paddingRight: 12}}>
          <Text style={st.behaviorTitle}>{title}</Text>
          <Text style={st.behaviorDesc}>{desc}</Text>
        </View>
        <Switch value={!!value} onValueChange={onChange} color={GOLD} />
      </TouchableOpacity>
    );
    return (
      <View style={st.section}>
        <Text style={st.sectionTitle}>Comportamiento</Text>
        <View style={st.behaviorCard}>
          <Row
            title="Imprimir automáticamente tras una venta"
            desc="El recibo se imprime al confirmar el cobro."
            value={autoPrintAfterSale}
            onChange={(v) => actions.toggleAutoPrint(v)}
          />
          <View style={st.divider} />
          <Row
            title="Abrir cajón en ventas en efectivo"
            desc="Dispara el pulso eléctrico del cajón solo si la venta fue efectivo."
            value={openDrawerOnCashSale}
            onChange={(v) => actions.toggleOpenDrawer(v)}
          />
        </View>
        <Text style={st.hint}>
          Tip: mantené pulsada una impresora emparejada para olvidarla.
        </Text>
      </View>
    );
  }

  render() {
    const {loading, scanning} = this.props;
    return (
      <AppShell active="venta">
        <View style={st.body}>
          {this.renderSubHeader()}
          <ScrollView
            style={{flex: 1}}
            contentContainerStyle={{paddingBottom: 28, rowGap: 16}}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={!!(loading || scanning)}
                onRefresh={this.onRefresh}
                colors={[GOLD]}
                tintColor={GOLD}
              />
            }>
            {this.renderSelectedCard()}
            {this.renderActionRow()}
            {this.renderDevicesCard()}
            {this.renderBehaviorCard()}
          </ScrollView>
        </View>
      </AppShell>
    );
  }
}

const st = StyleSheet.create({
  body: {flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 12},

  // Sub-header
  subHeader: {flexDirection: 'row', alignItems: 'center', paddingBottom: 14},
  backBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {fontFamily: fonts.bold, fontSize: 22, color: INK, letterSpacing: -0.3},
  subtitle: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},

  // Card "Impresora seleccionada"
  selectedCard: {
    flexDirection: 'row', alignItems: 'center', columnGap: 14,
    backgroundColor: TINT_GOLD,
    borderWidth: 1.5, borderColor: GOLD, borderRadius: 16,
    paddingHorizontal: 18, paddingVertical: 16,
  },
  selectedIcon: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center',
  },
  selectedTag: {fontFamily: fonts.bold, fontSize: 10, color: DGOLD, letterSpacing: 1, marginBottom: 2},
  selectedTitle: {fontFamily: fonts.bold, fontSize: 17, color: INK},
  selectedSub: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},
  connectedPill: {
    flexDirection: 'row', alignItems: 'center', columnGap: 4,
    backgroundColor: GREEN_TXT, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  connectedPillTxt: {fontFamily: fonts.bold, fontSize: 10, color: WHITE, letterSpacing: 0.5},

  selectedEmpty: {
    flexDirection: 'row', alignItems: 'center', columnGap: 14,
    backgroundColor: WHITE,
    borderWidth: 1, borderColor: BORDER_SOFT, borderRadius: 16,
    paddingHorizontal: 18, paddingVertical: 16,
  },
  selectedIconEmpty: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: BG, alignItems: 'center', justifyContent: 'center',
  },

  // Action row (Imprimir prueba / Abrir cajón)
  actionRow: {flexDirection: 'row', columnGap: 10},
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 8,
    backgroundColor: GOLD, borderRadius: 14, paddingVertical: 14,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 8,
    backgroundColor: WHITE, borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: BORDER_SOFT,
  },
  actionBtnTxt: {fontFamily: fonts.bold, fontSize: 13, color: WHITE},

  // Section header
  section: {rowGap: 8},
  sectionHead: {flexDirection: 'row', alignItems: 'flex-end', columnGap: 12},
  sectionTitle: {fontFamily: fonts.bold, fontSize: 16, color: INK},
  sectionSub: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},
  scanBtn: {
    flexDirection: 'row', alignItems: 'center', columnGap: 6,
    backgroundColor: WHITE, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: BORDER_SOFT,
  },
  scanBtnTxt: {fontFamily: fonts.semiBold, fontSize: 12, color: INK},

  // Devices list
  devicesList: {
    backgroundColor: WHITE, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER_SOFT, overflow: 'hidden',
  },
  emptyDevices: {alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20, rowGap: 8},
  emptyDevicesTxt: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, textAlign: 'center'},
  deviceRow: {
    flexDirection: 'row', alignItems: 'center', columnGap: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  deviceRowBorder: {borderBottomWidth: 1, borderBottomColor: BORDER_SOFT},
  deviceRowSelected: {backgroundColor: TINT_GOLD},
  deviceIcon: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: '#FFF6E1', alignItems: 'center', justifyContent: 'center',
  },
  deviceIconSelected: {backgroundColor: WHITE, borderWidth: 1, borderColor: GOLD},
  deviceName: {fontFamily: fonts.bold, fontSize: 14, color: INK},
  deviceMeta: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginTop: 2},

  // Behavior switches
  behaviorCard: {
    backgroundColor: WHITE, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER_SOFT, overflow: 'hidden',
  },
  behaviorRow: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14},
  behaviorTitle: {fontFamily: fonts.bold, fontSize: 13, color: INK},
  behaviorDesc: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginTop: 2},
  divider: {height: 1, backgroundColor: BORDER_SOFT, marginHorizontal: 14},
  hint: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, textAlign: 'center', marginTop: 4},
});

export default PrinterSettingsScreen;
