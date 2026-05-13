import React, { useState } from "react";
import {Text, StyleSheet, View, TouchableOpacity, SafeAreaView} from "react-native";
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { QRScannerStyles } from '../styles/componentStyles';

const QRScanner = ({
  style,
  onRead,
  ...otherProps
}) => {
  const styles = QRScannerStyles();
  const device = useCameraDevice('back')
  const [flash, setFlash] = useState('off'); 
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if(codes.length > 0){
        onRead(codes[0])
      }
    },
  });
  if (!device) return <Text style={styles.link}>Cargando cámara...</Text>;

  return(
    <View
      style={StyleSheet.absoluteFill}>
      <Camera 
        style={StyleSheet.absoluteFill}
        device={device} 
        codeScanner={codeScanner}
        torch={flash}
        {...otherProps}/>
      <SafeAreaView
        style={styles.flashButton} >
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => setFlash((prev) => (prev === 'off' ? 'on' : 'off'))}>
          <Text 
            style={styles.link}>
            {flash === 'off' ? 'Presiona aquí para encender la luz' : 'Presiona aquí para apagar la luz'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default QRScanner;
