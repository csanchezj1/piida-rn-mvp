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
import { fonts, normalizeSize } from '../../../styles/basicStyles';
import { fieldErrors } from '../../../utils/screenFunctions';
import { Layout } from '../../../layouts';
import { registerEventScreenMounted } from '../../../utils/analytics';

// Paleta del diseño 06 (Verifica tu código).
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

class RecoveryPassSendCodeScreen extends Component {
  state = { codeFocused: false, rootW: 0, rootH: 0 };

  componentDidMount() {
    registerEventScreenMounted(
      this.props,
      'Formulario enviar código recuperación contraseña',
      'RecoveryPassSendCodeScreen',
    );
  }
  componentWillUnmount() {
    this.props.actions.clearScreen();
  }

  onRootLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    if (width && height && (width !== this.state.rootW || height !== this.state.rootH)) {
      this.setState({ rootW: width, rootH: height });
    }
  };

  isTabletLayout() {
    const { rootW: w, rootH: h } = this.state;
    if (!w || !h) return false;
    const shortest = Math.min(w, h);
    const longest = Math.max(w, h);
    return shortest >= 500 && longest / shortest < 1.8 && w >= h;
  }

  submit = () => {
    this.props.actions.validateCode({
      code: this.props.code,
      navigation: this.props.navigation,
    });
  };

  // ─── Tablet (diseño 06) ─────────────────────────────────────
  renderTablet() {
    const err = fieldErrors('code', this.props.errors);
    const { codeFocused } = this.state;

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
              <Text style={t.title}>Verifica tu código</Text>
              <Text style={t.titleSub}>
                Te enviamos un código de 5 caracteres por correo. Ingrésalo aquí para
                continuar.
              </Text>

              <View
                style={[
                  t.field,
                  codeFocused && t.fieldFocused,
                  !!err && t.fieldError,
                ]}>
                <Text style={t.fieldLabel}>Código de seguridad</Text>
                <Icon source="key-outline" size={22} color={INK} />
                <RNTextInput
                  style={t.input}
                  value={this.props.code || ''}
                  onChangeText={(code) => this.props.actions.codeChange(code)}
                  placeholder="Ingresa el código"
                  placeholderTextColor={PLACEHOLDER}
                  autoCapitalize="characters"
                  maxLength={5}
                  onFocus={() => this.setState({ codeFocused: true })}
                  onBlur={() => this.setState({ codeFocused: false })}
                />
              </View>
              {!!err ? (
                <Text style={t.errText}>{err}</Text>
              ) : (
                <Text style={t.hintText}>Revisa también tu carpeta de spam.</Text>
              )}

              <TouchableOpacity
                activeOpacity={0.88}
                style={t.submitBtn}
                onPress={this.submit}>
                <Text style={t.submitText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  // ─── Phone (layout previo) ──────────────────────────────────
  renderPhone() {
    const err = fieldErrors('code', this.props.errors);
    return (
      <Layout
        title={'Recuperar contraseña'}
        description={
          'Ingresa el código enviado a tu correo electrónico para que puedas cambiar tu contraseña.'
        }>
        <View style={{ width: '100%', paddingHorizontal: normalizeSize(20) }}>
          <TextInput
            mode="outlined"
            label="Código"
            placeholder="Código de seguridad"
            autoCapitalize="characters"
            maxLength={5}
            left={<TextInput.Icon icon="lock-outline" />}
            value={this.props.code || ''}
            error={!!err}
            onChangeText={(code) => this.props.actions.codeChange(code)}
          />
          <HelperText type="error" visible={!!err}>
            {err}
          </HelperText>

          <Button
            mode="contained"
            onPress={this.submit}
            style={{ marginTop: normalizeSize(12) }}
            contentStyle={{ paddingVertical: normalizeSize(6) }}>
            Enviar
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
    marginTop: 6,
    marginLeft: 4,
  },
  hintText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
    marginTop: 6,
    marginLeft: 4,
  },
  submitBtn: {
    height: 64,
    borderRadius: 18,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
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
});

export default RecoveryPassSendCodeScreen;
