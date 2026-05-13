import React, {Component} from 'react';
import {View, SafeAreaView, Vibration, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import {colors, normalizeSize} from '../../../styles/basicStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {QRScanner} from '../../../components';
import {Camera} from 'react-native-vision-camera';

class QRScanScreen extends Component {
  componentWillUnmount() {
    this.props.actions.clear();
  }
  async componentDidMount() {
    registerEventScreenMounted(this.props, 'Scanner', 'QRScanScreen');
    const status = await Camera.requestCameraPermission();
    if (status === 'granted') {
      this.props.actions.setPermission();
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.codeScanned != this.props.codeScanned) {
      if (this.props.codeScanned) {
        this.props.actions.product(this.props.codeScanned, this.props.navigation);
      }
    }
  }
  render() {
    return (
      <View style={styles.container}>
        {this.props.hasPermission ? (
          <QRScanner
            onRead={(code) => {
              this.props.actions.codeScanned(code.value), Vibration.vibrate();
            }}
            isActive={this.props.cameraActive}
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              paddingHorizontal: normalizeSize(20),
            }}>
            <Text
              variant="bodyLarge"
              style={{color: '#FFFFFF', textAlign: 'center'}}>
              Debes conceder el permiso de uso de camara para poder escanear el código
            </Text>
          </View>
        )}

        <SafeAreaView style={styles.header}>
          <Text
            variant="headlineSmall"
            style={{color: '#FFFFFF'}}>
            Escanea el
          </Text>
          <Text
            variant="headlineMedium"
            style={{color: colors.buttonBackground, fontWeight: '700'}}>
            código del producto
          </Text>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: normalizeSize(20),
    paddingTop: normalizeSize(12),
  },
});

export default QRScanScreen;
