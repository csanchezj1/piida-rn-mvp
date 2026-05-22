import React, { Component } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import RBSheet from 'react-native-raw-bottom-sheet';
import { getLoginStyles } from '../../../styles/screenStyles';
import { fonts } from '../../../styles/basicStyles';
import { registerEventScreenMounted } from '../../../utils/analytics';
import { ActionButton, TextInput, SelectList } from '../../../components';
import { fieldErrors } from '../../../utils/screenFunctions';
import { Layout } from '../../../layouts';

// Paleta del diseño 04 (RegisterCompany).
const BG_LEFT = '#FFF1D6';
const INK = '#1A130C';
const GOLD = '#F7A928';
const DGOLD = '#C66E00';
const MUTED = '#7E6A52';
const SUBINK = '#3A2E22';
const FIELD_BORDER = '#EADFC8';
const WHITE = '#FFFFFF';
const PLACEHOLDER = '#B9A48C';

const ROLE_OPTIONS = [
  { label: 'Propietario', value: 'owner' },
  { label: 'Colaborador', value: 'collaborator' },
];

class RegisterCompanyScreen extends Component {
  styles = getLoginStyles();
  state = {
    rootW: 0,
    rootH: 0,
    focused: null,
    sheetTitle: '',
    sheetOptions: [],
    sheetOnSelect: null,
  };

  componentDidMount() {
    registerEventScreenMounted(this.props, 'Crear empresa', 'RegisterCompanyScreen');
  }
  componentWillUnmount() {
    this.props.actions.clearScreen();
  }

  goalValue() {
    let goal = [];
    if (this.props.appGoal && this.props.appGoal.length > 0) {
      this.props.appGoal.map((item) => {
        goal.push(item.label);
      });
    }
    return goal;
  }
  checkOtherGoal() {
    if (this.props.appGoal && this.props.appGoal.length > 0) {
      return this.props.appGoal.findIndex((e) => e.label == 'Otro') !== -1;
    }
    return false;
  }

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

  openSheet = (title, options, onSelect) => {
    this.setState(
      { sheetTitle: title, sheetOptions: options || [], sheetOnSelect: () => onSelect },
      () => this.sheet && this.sheet.open(),
    );
  };

  submit = () => {
    this.props.actions.register({
      name: this.props.name,
      lastName: this.props.lastName,
      email: this.props.email,
      idNumber: this.props.idNumber,
      phone: this.props.phone,
      company: this.props.company,
      operation: this.props.operation,
      business: this.props.business,
      web: this.props.web,
      finance: this.props.finance,
      appGoal: this.props.appGoal,
      role: this.props.role,
      password: this.props.password,
      businessText: this.props.businessText,
    });
  };

  // ─── Tablet (diseño 04) ─────────────────────────────────────
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

  dropdownField = ({ label, icon, value, errorKey, onPress }) => {
    const err = fieldErrors(errorKey, this.props.errors);
    return (
      <View key={label}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[t.field, !!err && t.fieldError]}
          onPress={onPress}>
          <Text style={t.fieldLabel}>{label}</Text>
          <Icon source={icon} size={22} color={INK} />
          <Text
            style={[t.input, t.dropdownValue, !value && t.dropdownPlaceholder]}
            numberOfLines={1}>
            {value || 'Selecciona una opción'}
          </Text>
          <Icon source="chevron-down" size={22} color={MUTED} />
        </TouchableOpacity>
        {!!err && <Text style={t.errText}>{err}</Text>}
      </View>
    );
  };

  renderTablet() {
    const goals = this.goalValue();
    const goalsStr = goals.length ? goals.join(', ') : '';
    const isOtroBusiness = this.props.business && this.props.business.label === 'Otro';
    const isOtroFinance = this.props.finance && this.props.finance.label === 'Otro';
    const isColaborador = this.props.role && this.props.role.label === 'Colaborador';

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
              <Text style={t.title}>Cuéntanos de tu negocio</Text>
              <Text style={t.titleSub}>
                Estos datos nos ayudan a configurar Piida para tu tipo de operación.
              </Text>

              {this.tabletField({
                fieldKey: 'company',
                label: 'Empresa',
                icon: 'storefront-outline',
                errorKey: 'company',
                value: this.props.company,
                onChangeText: this.props.actions.companyChange,
                autoCapitalize: 'none',
              })}

              {this.dropdownField({
                label: 'Tiempo de operación',
                icon: 'calendar-outline',
                errorKey: 'operation',
                value: this.props.operation ? this.props.operation.label : null,
                onPress: () =>
                  this.openSheet(
                    'Tiempo de operación',
                    this.props.operationTime,
                    this.props.actions.operationChange,
                  ),
              })}

              {this.dropdownField({
                label: 'Tipo de negocio',
                icon: 'storefront-outline',
                errorKey: 'business',
                value: this.props.business ? this.props.business.label : null,
                onPress: () =>
                  this.openSheet(
                    'Tipo de negocio',
                    this.props.businessType,
                    this.props.actions.businessChange,
                  ),
              })}

              {isOtroBusiness &&
                this.tabletField({
                  fieldKey: 'businessText',
                  label: 'Especifica el tipo de negocio',
                  icon: 'storefront-outline',
                  errorKey: 'businessText',
                  value: this.props.businessText,
                  onChangeText: this.props.actions.businessTextChange,
                  autoCapitalize: 'none',
                })}

              {this.tabletField({
                fieldKey: 'web',
                label: 'Sitio web',
                icon: 'web',
                errorKey: 'web',
                value: this.props.web,
                onChangeText: this.props.actions.webChange,
                autoCapitalize: 'none',
                keyboardType: 'url',
              })}

              {this.dropdownField({
                label: '¿Cómo manejas las finanzas y/o inventario?',
                icon: 'wallet-outline',
                errorKey: 'finance',
                value: this.props.finance ? this.props.finance.label : null,
                onPress: () =>
                  this.openSheet(
                    '¿Cómo manejas las finanzas?',
                    this.props.financeManagement,
                    this.props.actions.financeChange,
                  ),
              })}

              {isOtroFinance &&
                this.tabletField({
                  fieldKey: 'financeText',
                  label: 'Especifica el manejo de finanzas',
                  icon: 'wallet-outline',
                  errorKey: 'financeText',
                  value: this.props.financeText,
                  onChangeText: this.props.actions.financeTextChange,
                  autoCapitalize: 'none',
                })}

              {this.dropdownField({
                label: '¿Qué te gustaría lograr con la app?',
                icon: 'format-list-bulleted',
                errorKey: 'appGoal',
                value: goalsStr,
                onPress: () => this.props.navigation.navigate('Options'),
              })}

              {this.checkOtherGoal() &&
                this.tabletField({
                  fieldKey: 'appGoalText',
                  label: 'Especifica qué quieres lograr',
                  icon: 'format-list-bulleted',
                  errorKey: 'appGoalText',
                  value: this.props.appGoalText,
                  onChangeText: this.props.actions.appGoalTextChange,
                  autoCapitalize: 'none',
                })}

              {this.dropdownField({
                label: 'Del negocio eres...',
                icon: 'account-tie-outline',
                errorKey: 'role',
                value: this.props.role ? this.props.role.label : null,
                onPress: () =>
                  this.openSheet('Del negocio eres...', ROLE_OPTIONS, this.props.actions.roleChange),
              })}

              {isColaborador &&
                this.tabletField({
                  fieldKey: 'position',
                  label: 'Cargo',
                  icon: 'account-tie-outline',
                  errorKey: 'position',
                  value: this.props.position,
                  onChangeText: this.props.actions.positionChange,
                  autoCapitalize: 'none',
                })}

              <TouchableOpacity
                activeOpacity={0.88}
                style={t.submitBtn}
                onPress={this.submit}>
                <Text style={t.submitText}>Registrarme</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Picker genérico */}
        <RBSheet
          ref={(r) => (this.sheet = r)}
          height={Math.min(520, 130 + this.state.sheetOptions.length * 56)}
          customStyles={{ container: t.sheetContainer }}
          draggable
          dragFromTopOnly
          openDuration={300}
          closeDuration={300}>
          <View style={t.sheetInner}>
            <Text style={t.sheetTitle}>{this.state.sheetTitle}</Text>
            <ScrollView>
              {this.state.sheetOptions.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.6}
                  style={t.sheetOption}
                  onPress={() => {
                    const sel = this.state.sheetOnSelect;
                    if (sel) sel()(item);
                    this.sheet && this.sheet.close();
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
  renderPhone() {
    return (
      <Layout hideLogo title={'Crea una cuenta'}>
        <View>
          <Text style={this.styles.subtitle}>Ingresa los datos de tu negocio</Text>
          <TextInput
            label={'Empresa'}
            style={this.styles.input}
            icon={require('../../../assets/images/ic_business.png')}
            placeholder={'Nombre de tu negocio'}
            autoCapitalize="none"
            value={this.props.company}
            isError={fieldErrors('company', this.props.errors) != ''}
            onChangeText={(company) => this.props.actions.companyChange(company)}
          />
          <SelectList
            style={this.styles.input}
            label={'Tiempo de operación'}
            isError={fieldErrors('operation', this.props.errors) != ''}
            value={this.props.operation ? this.props.operation.label : null}
            variables={this.props.operationTime}
            icon={require('../../../assets/images/ic_calendar.png')}
            onValueChange={(operation) => this.props.actions.operationChange(operation)}
          />
          <SelectList
            style={this.styles.input}
            label={'Tipo de negocio'}
            isError={fieldErrors('business', this.props.errors) != ''}
            value={this.props.business ? this.props.business.label : null}
            variables={this.props.businessType}
            icon={require('../../../assets/images/partner.png')}
            onValueChange={(business) => this.props.actions.businessChange(business)}
          />
          {this.props.business &&
            this.props.business.label == 'Otro' && (
              <TextInput
                label={'Tipo de negocio'}
                style={this.styles.input}
                icon={require('../../../assets/images/partner.png')}
                placeholder={'Escribe el tipo de negocio'}
                autoCapitalize="none"
                value={this.props.businessText}
                isError={fieldErrors('businessText', this.props.errors) != ''}
                onChangeText={(businessText) =>
                  this.props.actions.businessTextChange(businessText)
                }
              />
            )}
          <TextInput
            label={'Sitio web'}
            style={this.styles.input}
            icon={require('../../../assets/images/ic_web.png')}
            placeholder={'Sitio web (Opcional)'}
            autoCapitalize="none"
            value={this.props.web}
            isError={fieldErrors('web', this.props.errors) != ''}
            onChangeText={(web) => this.props.actions.webChange(web)}
          />
          <SelectList
            style={this.styles.input}
            label={'¿Cómo manejas las finanzas y/o inventario actualmente?'}
            isError={fieldErrors('finance', this.props.errors) != ''}
            value={this.props.finance ? this.props.finance.label : null}
            variables={this.props.financeManagement}
            icon={require('../../../assets/images/ic_money.png')}
            onValueChange={(finance) => this.props.actions.financeChange(finance)}
          />
          {this.props.finance &&
            this.props.finance.label == 'Otro' && (
              <TextInput
                label={'Manejo de finanzas'}
                style={this.styles.input}
                icon={require('../../../assets/images/ic_money.png')}
                placeholder={'Escribe como manejas tus finanzas'}
                autoCapitalize="none"
                value={this.props.financeText}
                isError={fieldErrors('financeText', this.props.errors) != ''}
                onChangeText={(financeText) =>
                  this.props.actions.financeTextChange(financeText)
                }
              />
            )}
          <SelectList
            style={this.styles.input}
            label={'¿Qué te gustaría lograr con la app?'}
            isError={fieldErrors('appGoal', this.props.errors) != ''}
            value={this.goalValue() ? this.goalValue().join(', ') : null}
            onPress={() => this.props.navigation.navigate('Options')}
            icon={require('../../../assets/images/ic_list.png')}
          />
          {this.checkOtherGoal() && (
            <TextInput
              label={'¿Qué te gustaría lograr con la app?'}
              style={this.styles.input}
              icon={require('../../../assets/images/ic_money.png')}
              placeholder={'Escribe que más te gustaría lograr con la app'}
              autoCapitalize="none"
              value={this.props.appGoalText}
              isError={fieldErrors('appGoalText', this.props.errors) != ''}
              onChangeText={(appGoalText) =>
                this.props.actions.appGoalTextChange(appGoalText)
              }
            />
          )}
          <SelectList
            style={this.styles.input}
            label={'Del negocio eres...'}
            isError={fieldErrors('role', this.props.errors) != ''}
            value={this.props.role ? this.props.role.label : null}
            variables={ROLE_OPTIONS}
            icon={require('../../../assets/images/ic_org.png')}
            onValueChange={(role) => this.props.actions.roleChange(role)}
          />
          {this.props.role &&
            this.props.role.label == 'Colaborador' && (
              <TextInput
                label={'Cargo'}
                style={this.styles.input}
                icon={require('../../../assets/images/ic_org.png')}
                placeholder={'¿Cual es tu cargo?'}
                autoCapitalize="none"
                value={this.props.position}
                isError={fieldErrors('position', this.props.errors) != ''}
                onChangeText={(position) => this.props.actions.positionChange(position)}
              />
            )}
        </View>
        <ActionButton
          title={'Registrarme'}
          style={this.styles.button}
          onPress={this.submit}
        />
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
    marginBottom: 24,
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

  // ── Bottom sheet ────────────────────────────────────────────
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

export default RegisterCompanyScreen;
