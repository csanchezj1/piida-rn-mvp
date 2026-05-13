import React, {Component} from 'react';
import {Alert, RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  IconButton,
  List,
  Switch,
  Text,
} from 'react-native-paper';
import {Layout} from '../../../layouts';
import {colors, normalizeSize} from '../../../styles/basicStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';

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

  // Combina paired + found (sin duplicados, paired primero). Cada device
  // queda con flag isPaired para que el tap dispare select o pair-and-select.
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
    // Pull-to-refresh: re-lista paired + corre scan nearby.
    this.props.actions.scanPaired();
    this.props.actions.scanNearby();
  };

  render() {
    const {
      address, name, autoPrintAfterSale, openDrawerOnCashSale,
      loading, scanning, pairingAddress, actions,
    } = this.props;

    const devices = this.buildDeviceList();

    return (
      <Layout
        contentContainerStyle={{justifyContent: 'flex-start'}}
        hideLogo
        title="Configurar"
        subtitle="impresora">
        <ScrollView
          style={{width: '100%'}}
          contentContainerStyle={{paddingHorizontal: normalizeSize(16), paddingBottom: normalizeSize(40)}}
          refreshControl={
            <RefreshControl
              refreshing={!!(loading || scanning)}
              onRefresh={this.onRefresh}
              colors={[colors.buttonBackground]}
              tintColor={colors.buttonBackground}
            />
          }>
          {/* Impresora seleccionada */}
          <Text variant="titleSmall" style={styles.section}>
            Impresora seleccionada
          </Text>
          <Card mode="outlined" style={styles.card}>
            <Card.Content>
              {address ? (
                <>
                  <Text variant="titleMedium">{name || 'Impresora'}</Text>
                  <Text variant="bodySmall" style={{color: colors.purplishGrey}}>
                    {address}
                  </Text>
                </>
              ) : (
                <Text variant="bodyMedium" style={{color: colors.purplishGrey}}>
                  Aún no has seleccionado impresora.
                </Text>
              )}
            </Card.Content>
          </Card>

          {/* Detectadas */}
          <View style={styles.row}>
            <Text variant="titleSmall" style={styles.section}>
              Impresoras detectadas
            </Text>
            <Button
              compact
              uppercase={false}
              loading={scanning}
              disabled={scanning || loading}
              onPress={() => actions.scanNearby()}
              labelStyle={{color: colors.label}}>
              {scanning ? 'Buscando…' : 'Buscar'}
            </Button>
          </View>
          <Card mode="outlined" style={styles.card}>
            {devices.length === 0 ? (
              <Card.Content>
                <Text variant="bodyMedium" style={{color: colors.purplishGrey}}>
                  {scanning
                    ? 'Buscando dispositivos Bluetooth cercanos…'
                    : 'Toca "Buscar" para descubrir impresoras Bluetooth cercanas. La impresora debe estar encendida.'}
                </Text>
              </Card.Content>
            ) : (
              devices.map((dev, idx) => {
                const selected = dev.address === address;
                const isPairing = pairingAddress === dev.address;
                const subtitle = isPairing
                  ? 'Emparejando…'
                  : dev.isPaired
                  ? dev.address
                  : `${dev.address} · sin emparejar`;
                return (
                  <View key={dev.address}>
                    {idx > 0 && <Divider />}
                    <List.Item
                      title={dev.name || 'Sin nombre'}
                      description={subtitle}
                      left={(props) => (
                        <List.Icon
                          {...props}
                          icon={dev.isPaired ? 'bluetooth-connect' : 'bluetooth'}
                          color={selected ? colors.buttonBackground : colors.purplishGrey}
                        />
                      )}
                      right={() =>
                        selected ? (
                          <List.Icon icon="check-circle" color={colors.buttonBackground} />
                        ) : null
                      }
                      onPress={() =>
                        actions.tapDevice({
                          address: dev.address,
                          name: dev.name,
                          isPaired: dev.isPaired,
                        })
                      }
                      onLongPress={() => dev.isPaired && this.confirmForget(dev)}
                      disabled={isPairing}
                      style={selected ? styles.selectedItem : null}
                    />
                  </View>
                );
              })
            )}
          </Card>

          {/* Comportamiento */}
          <Text variant="titleSmall" style={styles.section}>
            Comportamiento
          </Text>
          <Card mode="outlined" style={styles.card}>
            <List.Item
              title="Imprimir automáticamente tras una venta"
              right={() => (
                <Switch
                  value={autoPrintAfterSale}
                  onValueChange={(v) => actions.toggleAutoPrint(v)}
                />
              )}
              onPress={() => actions.toggleAutoPrint(!autoPrintAfterSale)}
            />
            <Divider />
            <List.Item
              title="Abrir cajón en venta en efectivo"
              right={() => (
                <Switch
                  value={openDrawerOnCashSale}
                  onValueChange={(v) => actions.toggleOpenDrawer(v)}
                />
              )}
              onPress={() => actions.toggleOpenDrawer(!openDrawerOnCashSale)}
            />
          </Card>

          {/* Pruebas */}
          <Text variant="titleSmall" style={styles.section}>
            Pruebas
          </Text>
          <Button
            mode="contained"
            icon="printer-outline"
            disabled={loading || !address}
            loading={loading}
            onPress={() => actions.testPrint()}
            style={styles.actionBtn}
            contentStyle={{paddingVertical: normalizeSize(4)}}>
            Imprimir página de prueba
          </Button>
          <Button
            mode="contained-tonal"
            icon="cash-register"
            disabled={loading || !address}
            onPress={() => actions.testDrawer()}
            style={styles.actionBtn}
            contentStyle={{paddingVertical: normalizeSize(4)}}>
            Abrir cajón
          </Button>

          <Text variant="bodySmall" style={styles.hint}>
            Mantené pulsada una impresora emparejada para olvidarla.
          </Text>
        </ScrollView>
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  section: {
    marginTop: normalizeSize(16),
    marginBottom: normalizeSize(6),
  },
  card: {
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: 'rgba(247,169,40,0.10)',
  },
  actionBtn: {
    marginTop: normalizeSize(8),
  },
  hint: {
    textAlign: 'center',
    color: colors.purplishGrey,
    marginTop: normalizeSize(16),
  },
});

export default PrinterSettingsScreen;
