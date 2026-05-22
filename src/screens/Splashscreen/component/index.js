import React, { Component } from 'react';
import { Animated, Easing, StatusBar, StyleSheet, Text, View } from 'react-native';
import { fonts } from '../../../styles/basicStyles';
import { registerEventScreenMounted } from '../../../utils/analytics';

// Paleta del splash (diseño 01) — fondo crema, tinta casi negra y dorado PIIDA.
const BG = '#FAF5EC';
const INK = '#1A130C';
const GOLD = '#F7A928';
const MUTED = '#7E6A52';
const RING = '#ECE1CE';

class Splashscreen extends Component {
  spin = new Animated.Value(0);

  componentDidMount() {
    registerEventScreenMounted(this.props, 'Splashscreen', 'Splashscreen');
    Animated.loop(
      Animated.timing(this.spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
    if (this.props.user !== null) {
      this.props.actions.login(this.props.user.email, this.props.password);
    } else {
      this.props.actions.getOperation();
      this.props.actions.getBusinessType();
      this.props.actions.getAppGoals();
      this.props.actions.getFinanceManagement();
      setTimeout(() => {
        this.props.actions.isLoading();
      }, 2000);
    }
  }

  render() {
    const rotate = this.spin.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor={BG} />

        <View style={{ flex: 1 }} />

        {/* Logo + subrayado + tagline */}
        <View style={s.centerBlock}>
          <View style={s.logoRow}>
            <Text style={s.logoText}>piida</Text>
            <View style={s.logoDot} />
          </View>
          <View style={s.underline} />
          <Text style={s.tagline}>Tu punto de venta{'\n'}simple y confiable</Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* Loader */}
        <View style={s.loaderBlock}>
          <Animated.View style={[s.spinner, { transform: [{ rotate }] }]} />
          <Text style={s.loaderText}>Preparando todo…</Text>
        </View>
      </View>
    );
  }
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    paddingVertical: 80,
  },
  centerBlock: {
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  logoText: {
    fontFamily: fonts.bold,
    fontSize: 80,
    letterSpacing: -3,
    color: INK,
    includeFontPadding: false,
  },
  logoDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: GOLD,
    marginLeft: 12,
    marginBottom: 16,
  },
  underline: {
    width: 56,
    height: 5,
    borderRadius: 3,
    backgroundColor: GOLD,
    marginTop: 28,
    marginBottom: 24,
  },
  tagline: {
    fontFamily: fonts.bold,
    fontSize: 28,
    letterSpacing: -0.6,
    lineHeight: 34,
    color: INK,
    textAlign: 'center',
  },
  loaderBlock: {
    alignItems: 'center',
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: RING,
    borderTopColor: GOLD,
  },
  loaderText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    letterSpacing: 0.3,
    color: MUTED,
    marginTop: 14,
  },
});

export default Splashscreen;
