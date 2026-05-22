import React, { Component } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, HelperText, Icon, Text, TextInput } from 'react-native-paper';
import RBSheet from 'react-native-raw-bottom-sheet';
import { getLoginStyles } from '../../../styles/screenStyles';
import { colors, fonts, normalizeSize } from '../../../styles/basicStyles';
import { registerEventScreenMounted } from '../../../utils/analytics';
import { SelectList } from '../../../components';
import { fieldErrors } from '../../../utils/screenFunctions';
import { Layout } from '../../../layouts';

// Paleta del diseño 03 (Register).
const BG_LEFT = '#FFF1D6';
const INK = '#1A130C';
const GOLD = '#F7A928';
const DGOLD = '#C66E00';
const MUTED = '#7E6A52';
const SUBINK = '#3A2E22';
const FIELD_BORDER = '#EADFC8';
const WHITE = '#FFFFFF';
const PLACEHOLDER = '#B9A48C';

class RegisterScreen extends Component {
  styles = getLoginStyles();
  state = { showPass: false, focused: null, rootW: 0, rootH: 0 };

  componentDidMount() {
    registerEventScreenMounted(this.props, 'Crear cuenta', 'RegisterScreen');
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

  // Tablet/phone según el tamaño REAL de la vista (onLayout), no
  // Dimensions.get('window') — que en el arranque reporta valores stale.
  isTabletLayout() {
    const { rootW: w, rootH: h } = this.state;
    if (!w || !h) return false;
    const shortest = Math.min(w, h);
    const longest = Math.max(w, h);
    return shortest >= 500 && longest / shortest < 1.8 && w >= h;
  }

  submit = () => {
    this.props.actions.verify({
      name: this.props.name,
      lastName: this.props.lastName,
      email: this.props.email,
      phone: this.props.phone,
      password: this.props.password,
      company: this.props.company,
      business: this.props.business,
      businessText: this.props.businessText,
      navigation: this.props.navigation,
    });
  };

  // ─── Tablet (diseño 03) ─────────────────────────────────────
  tabletField = ({ fieldKey, label, icon, value, onChangeText, errorKey, ...rest }) => {
    const err = fieldErrors(errorKey, this.props.errors);
    const focused = this.state.focused === fieldKey;
    return (
      <View key={fieldKey}>
        <View style={[t.field, focused && t.fieldFocused, !!err && t.fieldError]}>
          <Text style={t.fieldLabel}>{label}</Text>
          <Icon source={icon} size={22} color={INK} />
          <RNTextInput
            style={t.input}
            value={value || ''}
            onChangeText={onChangeText}
            placeholderTextColor={PLACEHOLDER}
            onFocus={() => this.setState({ focused: fieldKey })}
            onBlur={() => this.setState({ focused: null })}
            {...rest}
          />
        </View>
        {!!err && <Text style={t.errText}>{err}</Text>}
      </View>
    );
  };

  renderTablet() {
    const { showPass } = this.state;
    const passErr = fieldErrors('password', this.props.errors);
    const businessErr = fieldErrors('business', this.props.errors);
    const businessTypes = this.props.businessType || [];
    const isOtro = this.props.business && this.props.business.label === 'Otro';

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
        </View>

        {/* DERECHA: formulario */}
        <View style={t.rightPane}>
          <ScrollView
            contentContainerStyle={t.rightScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={t.formWrap}>
              <Text style={t.title}>Crea tu cuenta</Text>
              <Text style={t.titleSub}>
                Ingresa tus datos personales. Luego te pediremos los de tu negocio.
              </Text>

              <Text style={[t.sectionLabel, { marginTop: 4 }]}>DATOS PERSONALES</Text>
              {this.tabletField({
                fieldKey: 'name',
                label: 'Nombres',
                icon: 'account-outline',
                errorKey: 'name',
                value: this.props.name,
                onChangeText: this.props.actions.nameChange,
                autoCapitalize: 'words',
              })}
              {this.tabletField({
                fieldKey: 'lastName',
                label: 'Apellidos',
                icon: 'account-outline',
                errorKey: 'lastName',
                value: this.props.lastName,
                onChangeText: this.props.actions.lastNameChange,
                autoCapitalize: 'words',
              })}
              {this.tabletField({
                fieldKey: 'email',
                label: 'Correo',
                icon: 'email-outline',
                errorKey: 'email',
                value: this.props.email,
                onChangeText: this.props.actions.mailChange,
                keyboardType: 'email-address',
                autoCapitalize: 'none',
                autoComplete: 'email',
              })}
              {this.tabletField({
                fieldKey: 'phone',
                label: 'Número telefónico',
                icon: 'cellphone',
                errorKey: 'phone',
                value: this.props.phone,
                onChangeText: this.props.actions.phoneChange,
                keyboardType: 'phone-pad',
              })}

              <Text style={[t.sectionLabel, { marginTop: 24 }]}>DATOS DEL NEGOCIO</Text>
              {this.tabletField({
                fieldKey: 'company',
                label: 'Empresa',
                icon: 'storefront-outline',
                errorKey: 'company',
                value: this.props.company,
                onChangeText: this.props.actions.companyChange,
              })}

              {/* Tipo de negocio — dropdown */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={[t.field, !!businessErr && t.fieldError]}
                onPress={() => this.bizSheet && this.bizSheet.open()}>
                <Text style={t.fieldLabel}>Tipo de negocio</Text>
                <Icon source="storefront-outline" size={22} color={INK} />
                <Text
                  style={[
                    t.input,
                    t.dropdownValue,
                    !this.props.business && t.dropdownPlaceholder,
                  ]}
                  numberOfLines={1}>
                  {this.props.business ? this.props.business.label : 'Selecciona el tipo'}
                </Text>
                <Icon source="chevron-down" size={22} color={MUTED} />
              </TouchableOpacity>
              {!!businessErr && <Text style={t.errText}>{businessErr}</Text>}

              {isOtro &&
                this.tabletField({
                  fieldKey: 'businessText',
                  label: 'Especifica el tipo de negocio',
                  icon: 'briefcase-edit-outline',
                  errorKey: 'businessText',
                  value: this.props.businessText,
                  onChangeText: this.props.actions.businessTextChange,
                })}

              <Text style={[t.sectionLabel, { marginTop: 24 }]}>SEGURIDAD</Text>
              <View
                style={[
                  t.field,
                  this.state.focused === 'password' && t.fieldFocused,
                  !!passErr && t.fieldError,
                ]}>
                <Text style={t.fieldLabel}>Contraseña</Text>
                <Icon source="lock-outline" size={22} color={INK} />
                <RNTextInput
                  style={t.input}
                  value={this.props.password || ''}
                  onChangeText={this.props.actions.passChange}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  placeholder="••••••••"
                  placeholderTextColor={PLACEHOLDER}
                  onFocus={() => this.setState({ focused: 'password' })}
                  onBlur={() => this.setState({ focused: null })}
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

              <TouchableOpacity
                activeOpacity={0.88}
                style={t.submitBtn}
                onPress={this.submit}>
                <Text style={t.submitText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Picker de tipo de negocio */}
        <RBSheet
          ref={(r) => (this.bizSheet = r)}
          height={Math.min(520, 130 + businessTypes.length * 56)}
          customStyles={{ container: t.sheetContainer }}
          draggable
          dragFromTopOnly
          openDuration={300}
          closeDuration={300}>
          <View style={t.sheetInner}>
            <Text style={t.sheetTitle}>Tipo de negocio</Text>
            <ScrollView>
              {businessTypes.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.6}
                  style={t.sheetOption}
                  onPress={() => {
                    this.props.actions.businessChange(item);
                    this.bizSheet && this.bizSheet.close();
                  }}>
                  <Text style={t.sheetOptionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </RBSheet>
      </View>
    );
  }

  // ─── Phone (layout previo) ──────────────────────────────────
  renderField = ({ label, placeholder, icon, errorKey, value, onChangeText, ...rest }) => {
    const err = fieldErrors(errorKey, this.props.errors);
    return (
      <>
        <TextInput
          mode="outlined"
          label={label}
          placeholder={placeholder}
          left={icon ? <TextInput.Icon icon={icon} /> : undefined}
          value={value || ''}
          error={!!err}
          onChangeText={onChangeText}
          style={{ marginTop: normalizeSize(8) }}
          {...rest}
        />
        <HelperText type="error" visible={!!err}>
          {err}
        </HelperText>
      </>
    );
  };

  renderPhone() {
    const passErr = fieldErrors('password', this.props.errors);
    const businessErr = fieldErrors('business', this.props.errors);

    return (
      <Layout
        hideLogo
        contentContainerStyle={{ justifyContent: 'flex-start' }}
        title={'Crea una cuenta'}>
        <View style={{ width: '100%', paddingHorizontal: normalizeSize(20) }}>
          <Text variant="bodyMedium" style={{ marginVertical: normalizeSize(8) }}>
            Ingresa tus datos personales
          </Text>

          {this.renderField({
            label: 'Nombres',
            placeholder: 'Tus nombres',
            icon: 'account-outline',
            errorKey: 'name',
            value: this.props.name,
            onChangeText: this.props.actions.nameChange,
            autoCapitalize: 'words',
          })}

          {this.renderField({
            label: 'Apellidos',
            placeholder: 'Tus apellidos',
            icon: 'account-multiple-outline',
            errorKey: 'lastName',
            value: this.props.lastName,
            onChangeText: this.props.actions.lastNameChange,
            autoCapitalize: 'words',
          })}

          {this.renderField({
            label: 'Correo',
            placeholder: 'Tu correo electrónico',
            icon: 'email-outline',
            errorKey: 'email',
            value: this.props.email,
            onChangeText: this.props.actions.mailChange,
            keyboardType: 'email-address',
            autoCapitalize: 'none',
            autoComplete: 'email',
          })}

          {this.renderField({
            label: 'Número telefónico',
            placeholder: 'Tu número telefónico',
            icon: 'cellphone',
            errorKey: 'phone',
            value: this.props.phone,
            onChangeText: this.props.actions.phoneChange,
            keyboardType: 'phone-pad',
          })}

          {this.renderField({
            label: 'Empresa',
            placeholder: 'Nombre de tu negocio',
            icon: 'briefcase-outline',
            errorKey: 'company',
            value: this.props.company,
            onChangeText: this.props.actions.companyChange,
          })}

          <SelectList
            style={[this.styles.input, { marginTop: normalizeSize(8) }]}
            label={'Tipo de negocio'}
            isError={!!businessErr}
            value={this.props.business ? this.props.business.label : null}
            variables={this.props.businessType}
            icon={require('../../../assets/images/partner.png')}
            onValueChange={(business) => this.props.actions.businessChange(business)}
          />
          <HelperText type="error" visible={!!businessErr}>
            {businessErr}
          </HelperText>

          {this.props.business &&
            this.props.business.label == 'Otro' &&
            this.renderField({
              label: 'Tipo de negocio',
              placeholder: 'Escribe el tipo de negocio',
              icon: 'briefcase-edit-outline',
              errorKey: 'businessText',
              value: this.props.businessText,
              onChangeText: this.props.actions.businessTextChange,
            })}

          <TextInput
            mode="outlined"
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            secureTextEntry={!this.state.showPass}
            autoCapitalize="none"
            autoComplete="password-new"
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={this.state.showPass ? 'eye-off-outline' : 'eye-outline'}
                onPress={this.togglePass}
              />
            }
            value={this.props.password || ''}
            error={!!passErr}
            onChangeText={this.props.actions.passChange}
            style={{ marginTop: normalizeSize(8) }}
          />
          <HelperText type="error" visible={!!passErr}>
            {passErr}
          </HelperText>

          <Button
            mode="contained"
            onPress={this.submit}
            style={{ marginTop: normalizeSize(16), marginBottom: normalizeSize(24) }}
            contentStyle={{ paddingVertical: normalizeSize(6) }}>
            Continuar
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

  // ── Panel derecho ───────────────────────────────────────────
  rightPane: {
    flex: 756,
    backgroundColor: WHITE,
  },
  rightScroll: {
    paddingHorizontal: 40,
    paddingVertical: 44,
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
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: MUTED,
    marginBottom: 12,
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
    marginBottom: 12,
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
  dropdownValue: {
    fontFamily: fonts.regular,
  },
  dropdownPlaceholder: {
    color: PLACEHOLDER,
  },
  errText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#E5484D',
    marginTop: -6,
    marginBottom: 8,
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

  // ── Bottom sheet (tipo de negocio) ──────────────────────────
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: WHITE,
  },
  sheetInner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  sheetTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: INK,
    marginBottom: 8,
  },
  sheetOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1E9DB',
  },
  sheetOptionText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: INK,
  },
});

export default RegisterScreen;
