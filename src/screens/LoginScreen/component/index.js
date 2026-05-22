import React, { Component } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, HelperText, Icon, Text, TextInput } from 'react-native-paper';
import { getLoginStyles } from '../../../styles/screenStyles';
import { colors, fonts, normalizeSize } from '../../../styles/basicStyles';
import { registerEventScreenMounted } from '../../../utils/analytics';
import { fieldErrors } from '../../../utils/screenFunctions';
import { Layout } from '../../../layouts';

// Paleta del diseño 02 (Login).
const BG_LEFT = '#FFF1D6';
const INK = '#1A130C';
const GOLD = '#F7A928';
const DGOLD = '#C66E00';
const MUTED = '#7E6A52';
const SUBINK = '#3A2E22';
const FIELD_BORDER = '#EADFC8';
const WHITE = '#FFFFFF';
const PLACEHOLDER = '#B9A48C';
const WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=573212133943';

class LoginScreen extends Component {
  styles = getLoginStyles();
  state = {
    showPass: false,
    emailFocused: false,
    passFocused: false,
    rootW: 0,
    rootH: 0,
  };

  componentDidMount() {
    registerEventScreenMounted(this.props, 'Inicio de sesión', 'LoginScreen');
  }
  componentWillUnmount() {
    this.props.actions.clearScreen();
  }

  togglePass = () => this.setState((s) => ({ showPass: !s.showPass }));

  onRootLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    if (width && height && (width !== this.state.rootW || height !== this.state.rootH)) {
      this.setState({ rootW: width, rootH: height });
    }
  };

  // Decide tablet/phone con el tamaño REAL de la vista (onLayout) en vez de
  // Dimensions.get('window'): en el arranque ese módulo reportaba un valor
  // desactualizado y el login quedaba pegado al layout phone.
  isTabletLayout() {
    const { rootW: w, rootH: h } = this.state;
    if (!w || !h) return false;
    const shortest = Math.min(w, h);
    const longest = Math.max(w, h);
    return shortest >= 500 && longest / shortest < 1.8 && w >= h;
  }

  doLogin = () => {
    this.props.actions.login({
      email: this.props.email,
      password: this.props.password,
    });
  };

  // ─── Tablet (diseño 02) ─────────────────────────────────────
  renderTablet() {
    const emailErr = fieldErrors('email', this.props.errors);
    const passErr = fieldErrors('password', this.props.errors);
    const { showPass, emailFocused, passFocused } = this.state;

    return (
      <View style={t.root}>
        <StatusBar barStyle="dark-content" backgroundColor={BG_LEFT} />

        {/* IZQUIERDA: branding */}
        <View style={t.leftPane}>
          <View style={t.logoRow}>
            <Text style={t.logoText}>piida</Text>
            <View style={t.logoDot} />
          </View>

          <View>
            <Text style={t.heading}>Tu punto de venta{'\n'}simple y confiable.</Text>
            <View style={t.underline} />
            <Text style={t.leftSub}>
              Diseñado para que tus ventas sean rápidas y sin dolores de cabeza.
            </Text>
          </View>

          <View>
            <Text style={t.helpLabel}>¿NECESITAS AYUDA?</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={t.advisorBtn}
              onPress={() => Linking.openURL(WHATSAPP_URL)}>
              <Image
                source={require('../../../assets/images/ic_whatsapp.png')}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />
              <Text style={t.advisorText}>Comunícate con un asesor</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DERECHA: formulario */}
        <View style={t.rightPane}>
          <ScrollView
            contentContainerStyle={t.rightScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={t.formWrap}>
              <Text style={t.title}>Bienvenido de vuelta</Text>
              <Text style={t.titleSub}>
                Ingresa tus datos para iniciar sesión en Piida.
              </Text>

              {/* Correo */}
              <View
                style={[
                  t.field,
                  emailFocused && t.fieldFocused,
                  !!emailErr && t.fieldError,
                ]}>
                <Text style={t.fieldLabel}>Correo</Text>
                <Icon source="email-outline" size={22} color={INK} />
                <RNTextInput
                  style={t.input}
                  value={this.props.email || ''}
                  onChangeText={(e) => this.props.actions.mailChange(e)}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={PLACEHOLDER}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onFocus={() => this.setState({ emailFocused: true })}
                  onBlur={() => this.setState({ emailFocused: false })}
                />
              </View>
              {!!emailErr && <Text style={t.errText}>{emailErr}</Text>}

              {/* Contraseña */}
              <View
                style={[
                  t.field,
                  { marginTop: emailErr ? 6 : 16 },
                  passFocused && t.fieldFocused,
                  !!passErr && t.fieldError,
                ]}>
                <Text style={t.fieldLabel}>Contraseña</Text>
                <Icon source="lock-outline" size={22} color={INK} />
                <RNTextInput
                  style={t.input}
                  value={this.props.password || ''}
                  onChangeText={(p) => this.props.actions.passChange(p)}
                  placeholder="••••••••"
                  placeholderTextColor={PLACEHOLDER}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  autoComplete="password"
                  onFocus={() => this.setState({ passFocused: true })}
                  onBlur={() => this.setState({ passFocused: false })}
                />
                <TouchableOpacity
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={this.togglePass}>
                  <Icon
                    source={showPass ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={MUTED}
                  />
                </TouchableOpacity>
              </View>
              {!!passErr && <Text style={t.errText}>{passErr}</Text>}

              {/* Olvidé contraseña */}
              <TouchableOpacity
                style={t.forgotWrap}
                onPress={() => this.props.navigation.navigate('RecoveryPassGetCode')}>
                <Text style={t.forgotText}>He olvidado mi contraseña</Text>
              </TouchableOpacity>

              {/* Ingresar */}
              <TouchableOpacity
                activeOpacity={0.88}
                style={t.submitBtn}
                onPress={this.doLogin}>
                <Text style={t.submitText}>Ingresar</Text>
              </TouchableOpacity>

              {/* Registro */}
              <View style={t.registerRow}>
                <Text style={t.registerMuted}>¿No tienes cuenta? </Text>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate('Register')}>
                  <Text style={t.registerLink}>Regístrate aquí</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  // ─── Phone (layout previo) ──────────────────────────────────
  renderPhone() {
    const emailErr = fieldErrors('email', this.props.errors);
    const passErr = fieldErrors('password', this.props.errors);

    return (
      <Layout description={'Por favor ingresa tus datos para iniciar sesión'}>
        <View style={{ width: '100%', paddingHorizontal: normalizeSize(20) }}>
          <TextInput
            mode="outlined"
            label="Correo"
            placeholder="Ingresa tu correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            left={<TextInput.Icon icon="email-outline" />}
            value={this.props.email || ''}
            error={!!emailErr}
            onChangeText={(email) => this.props.actions.mailChange(email)}
            style={{ marginBottom: normalizeSize(4) }}
          />
          <HelperText type="error" visible={!!emailErr}>
            {emailErr}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            secureTextEntry={!this.state.showPass}
            autoCapitalize="none"
            autoComplete="password"
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={this.state.showPass ? 'eye-off-outline' : 'eye-outline'}
                onPress={this.togglePass}
              />
            }
            value={this.props.password || ''}
            error={!!passErr}
            onChangeText={(password) => this.props.actions.passChange(password)}
            style={{ marginTop: normalizeSize(8), marginBottom: normalizeSize(4) }}
          />
          <HelperText type="error" visible={!!passErr}>
            {passErr}
          </HelperText>

          <Button
            mode="text"
            compact
            uppercase={false}
            onPress={() => this.props.navigation.navigate('RecoveryPassGetCode')}
            style={{ alignSelf: 'flex-end', marginVertical: normalizeSize(4) }}
            labelStyle={{ color: colors.label }}>
            He olvidado la contraseña
          </Button>

          <Button
            mode="contained"
            onPress={this.doLogin}
            style={{ marginTop: normalizeSize(8), paddingVertical: normalizeSize(4) }}
            contentStyle={{ paddingVertical: normalizeSize(6) }}>
            Ingresar
          </Button>

          <Button
            mode="text"
            uppercase={false}
            onPress={() => this.props.navigation.navigate('Register')}
            style={{ alignSelf: 'center', marginTop: normalizeSize(16) }}
            labelStyle={{ color: colors.label }}>
            ¿No tienes cuenta? Regístrate aquí
          </Button>

          <Button
            mode="outlined"
            uppercase={false}
            icon={() => (
              <Image
                style={{ width: normalizeSize(22), height: normalizeSize(22) }}
                resizeMode="contain"
                source={require('../../../assets/images/ic_whatsapp.png')}
              />
            )}
            onPress={() => Linking.openURL(WHATSAPP_URL)}
            style={{
              marginTop: normalizeSize(28),
              borderColor: colors.purplishGrey,
              alignSelf: 'center',
            }}
            labelStyle={{ color: colors.text }}>
            Comunícate con un asesor
          </Button>
        </View>
      </Layout>
    );
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: WHITE }} onLayout={this.onRootLayout}>
        {this.state.rootW === 0
          ? null
          : this.isTabletLayout()
          ? this.renderTablet()
          : this.renderPhone()}
      </View>
    );
  }
}

const t = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: WHITE,
  },

  // ── Panel izquierdo ─────────────────────────────────────────
  leftPane: {
    flex: 504,
    backgroundColor: BG_LEFT,
    paddingHorizontal: 48,
    paddingVertical: 48,
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  logoText: {
    fontFamily: fonts.bold,
    fontSize: 38,
    letterSpacing: -1.5,
    color: INK,
    includeFontPadding: false,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GOLD,
    marginLeft: 6,
    marginBottom: 8,
  },
  heading: {
    fontFamily: fonts.bold,
    fontSize: 36,
    letterSpacing: -1,
    lineHeight: 41,
    color: INK,
  },
  underline: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: GOLD,
    marginTop: 24,
    marginBottom: 20,
  },
  leftSub: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: SUBINK,
    maxWidth: 320,
  },
  helpLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: DGOLD,
    marginBottom: 10,
  },
  advisorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    columnGap: 10,
    backgroundColor: WHITE,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#3C1E0A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  advisorText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: INK,
  },

  // ── Panel derecho ───────────────────────────────────────────
  rightPane: {
    flex: 756,
    backgroundColor: WHITE,
  },
  rightScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  formWrap: {
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 32,
    letterSpacing: -0.8,
    color: INK,
    marginBottom: 8,
  },
  titleSub: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: MUTED,
    marginBottom: 28,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    height: 64,
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: FIELD_BORDER,
    paddingHorizontal: 18,
    position: 'relative',
  },
  fieldFocused: {
    borderColor: GOLD,
    borderWidth: 2,
  },
  fieldError: {
    borderColor: '#E5484D',
  },
  fieldLabel: {
    position: 'absolute',
    top: -9,
    left: 14,
    paddingHorizontal: 6,
    backgroundColor: WHITE,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: DGOLD,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: INK,
  },
  errText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#E5484D',
    marginTop: 4,
    marginLeft: 4,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 4,
    marginBottom: 8,
  },
  forgotText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: DGOLD,
  },
  submitBtn: {
    height: 64,
    borderRadius: 18,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 5,
  },
  submitText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    letterSpacing: 0.3,
    color: WHITE,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerMuted: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: MUTED,
  },
  registerLink: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: DGOLD,
  },
});

export default LoginScreen;
