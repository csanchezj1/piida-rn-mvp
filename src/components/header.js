import React from "react";
import {TouchableOpacity, View, Image, Text, StatusBar} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import {getHeaderStyles} from '../styles/componentStyles';
import { normalizeSize } from "../styles/basicStyles";

const Header = ({
  style,
  onBack,
  onSupport,
  onMore,
  showHeader
}) => {
  const styles = getHeaderStyles();
  return(
    <>
    <SafeAreaView 
      edges={['top']}
      style={{
        backgroundColor:showHeader ? 'white' : 'rgba(68,68,68,0.9)',
        paddingTop:normalizeSize(10)
      }}/>
    <StatusBar 
      barStyle="dark-content" 
      backgroundColor={showHeader ? 'white' : 'rgba(68,68,68,0.9)'}/>
    {showHeader && (
      <View
        style={[styles.container, style]}>
        {onBack && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onBack}>
            <Image
              style={styles.backImage}
              resizeMode={'contain'}
              source={require('../assets/images/back.png')}
            />
          </TouchableOpacity>
        )}
        <View
          style={styles.logoCont}>
          <Image
            style={[styles.logo, {
              marginStart:onBack ? 0 : normalizeSize(33)
            }]}
            resizeMode={'contain'}
            source={require('../assets/images/logo.png')}
          />
        </View>
        {onSupport && (
          <TouchableOpacity
            style={styles.supportCont}
            activeOpacity={0.9}
            onPress={onSupport}>
            <Text
              style={styles.link}>
              Ya tengo código
            </Text>
          </TouchableOpacity>
        )}
        {onMore && (
          <TouchableOpacity
            testID="header-drawer-toggle"
            accessibilityLabel="Abrir menú"
            style={styles.supportCont}
            activeOpacity={0.9}
            onPress={onMore}>
            <Image
              resizeMode='cover'
              style={styles.more}
              source={require('../assets/images/ic_menu_more.png')}
            />
          </TouchableOpacity>
        )}
      </View> 
    )}
    </>
  );
};

export default Header;