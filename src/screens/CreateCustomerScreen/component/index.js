import React, {Component} from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon, Text} from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import 'moment/locale/es';
import AppShell from '../../../layouts/AppShell';
import {fieldErrors} from '../../../utils/screenFunctions';
import {fonts} from '../../../styles/basicStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';

moment.locale('es');

// Paleta — alineada con el rediseño tablet (warm beige + dorado PIIDA).
const BG = '#FAF5EC';
const INK = '#1A130C';
const GOLD = '#F7A928';
const DGOLD = '#C66E00';
const MUTED = '#7E6A52';
const SUBTLE = '#A89580';
const WHITE = '#FFFFFF';
const BORDER_SOFT = '#EFE3D2';
const RED = '#D7263D';
const SOFT_GOLD = '#FFF6E1';

const CITY_OPTIONS = [
  {label: 'Bogotá', value: 103},
  {label: 'Cali', value: 105},
  {label: 'Otra', value: 104},
];

class CreateCustomerScreen extends Component {
  state = {
    pickerOpen: null, // 'idType' | 'city' | null
    datePickerOpen: false,
  };

  componentDidMount() {
    registerEventScreenMounted(this.props, 'Formulario crear cliente', 'CreateCustomerScreen');
    this.props.actions.getIdTypes();
  }
  componentWillUnmount() {
    this.props.actions.clearScreen();
  }

  // ── Field genérico (card blanca con label uppercase + icon + TextInput) ─
  renderField = ({label, icon, errKey, value, onChangeText, keyboardType, autoCapitalize, placeholder}) => {
    const err = fieldErrors(errKey, this.props.errors);
    return (
      <View style={{marginBottom: 12}}>
        <View style={[st.fieldCard, err && st.fieldCardError]}>
          {!!icon && (
            <View style={st.fieldIcon}>
              <Icon source={icon} size={20} color={DGOLD} />
            </View>
          )}
          <View style={{flex: 1, minWidth: 0}}>
            <Text style={st.fieldLabel}>{label}</Text>
            <TextInput
              style={st.fieldInput}
              placeholder={placeholder || ''}
              placeholderTextColor={SUBTLE}
              value={value || ''}
              onChangeText={onChangeText}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              underlineColorAndroid="transparent"
            />
          </View>
        </View>
        {!!err && <Text style={st.fieldError}>{err}</Text>}
      </View>
    );
  };

  // ── Field tipo selector (dropdown). Abre Modal con opciones. ─
  renderSelectField = ({label, icon, value, options, onSelect, pickerKey, errKey}) => {
    const err = errKey ? fieldErrors(errKey, this.props.errors) : '';
    return (
      <View style={{marginBottom: 12}}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[st.fieldCard, err && st.fieldCardError]}
          onPress={() => this.setState({pickerOpen: pickerKey, pickerOptions: options, pickerOnSelect: onSelect})}>
          {!!icon && (
            <View style={st.fieldIcon}>
              <Icon source={icon} size={20} color={DGOLD} />
            </View>
          )}
          <View style={{flex: 1, minWidth: 0}}>
            <Text style={st.fieldLabel}>{label}</Text>
            <Text style={[st.fieldInput, !value && {color: SUBTLE}]} numberOfLines={1}>
              {value || 'Seleccionar...'}
            </Text>
          </View>
          <Icon source="chevron-down" size={20} color={MUTED} />
        </TouchableOpacity>
        {!!err && <Text style={st.fieldError}>{err}</Text>}
      </View>
    );
  };

  // ── Field tipo fecha. Abre DateTimePickerModal. ─
  renderDateField = ({label, icon, value, onChange, errKey, hint}) => {
    const err = errKey ? fieldErrors(errKey, this.props.errors) : '';
    return (
      <View style={{marginBottom: 12}}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[st.fieldCard, err && st.fieldCardError]}
          onPress={() => this.setState({datePickerOpen: true, dateOnChange: onChange, dateValue: value})}>
          {!!icon && (
            <View style={st.fieldIcon}>
              <Icon source={icon} size={20} color={DGOLD} />
            </View>
          )}
          <View style={{flex: 1, minWidth: 0}}>
            <Text style={st.fieldLabel}>{label}</Text>
            <Text style={[st.fieldInput, !value && {color: SUBTLE}]} numberOfLines={1}>
              {value ? moment(value).format('D MMM YYYY') : 'DD MMM AAAA'}
            </Text>
          </View>
          <Icon source="calendar" size={20} color={MUTED} />
        </TouchableOpacity>
        {!!hint && <Text style={st.fieldHint}>{hint}</Text>}
        {!!err && <Text style={st.fieldError}>{err}</Text>}
      </View>
    );
  };

  renderPickerModal() {
    const {pickerOpen, pickerOptions, pickerOnSelect} = this.state;
    if (!pickerOpen) return null;
    const titleMap = {idType: 'Tipo de identificación', city: 'Ciudad'};
    return (
      <Modal
        visible
        transparent
        animationType="fade"
        onRequestClose={() => this.setState({pickerOpen: null})}>
        <TouchableOpacity
          activeOpacity={1}
          style={st.modalBackdrop}
          onPress={() => this.setState({pickerOpen: null})}>
          <View style={st.modalPanel}>
            <Text style={st.modalTitle}>{titleMap[pickerOpen] || 'Seleccionar'}</Text>
            <ScrollView style={{maxHeight: 320}}>
              {(pickerOptions || []).map((opt) => (
                <TouchableOpacity
                  key={String(opt.value)}
                  activeOpacity={0.7}
                  style={st.modalItem}
                  onPress={() => {
                    this.setState({pickerOpen: null});
                    pickerOnSelect && pickerOnSelect(opt);
                  }}>
                  <Text style={st.modalItemTxt}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  renderDatePicker() {
    const {datePickerOpen, dateOnChange, dateValue} = this.state;
    return (
      <DateTimePickerModal
        isVisible={!!datePickerOpen}
        mode="date"
        date={dateValue ? new Date(dateValue) : new Date()}
        maximumDate={new Date()}
        onConfirm={(date) => {
          this.setState({datePickerOpen: false});
          dateOnChange && dateOnChange(date);
        }}
        onCancel={() => this.setState({datePickerOpen: false})}
      />
    );
  }

  // ── Sub-header (back + título + subtítulo, igual a ClientsScreen) ─
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
          <Text style={st.title}>Nuevo cliente</Text>
          <Text style={st.subtitle}>Agregá un cliente al sistema</Text>
        </View>
      </View>
    );
  }

  renderSectionLabel(label) {
    return <Text style={st.sectionLabel}>{label}</Text>;
  }

  render() {
    const {props} = this;
    const showBirthday = props.user?.features?.includes('clients_birthday');
    const isNIT = props.idType?.label === 'NIT';
    const isOtherCity = props.city?.value === 104;

    return (
      <AppShell active="venta">
        <View style={st.body}>
          {this.renderSubHeader()}

          <ScrollView
            style={{flex: 1}}
            contentContainerStyle={{paddingBottom: 120}}
            showsVerticalScrollIndicator={false}>

            {/* DATOS PERSONALES */}
            {this.renderSectionLabel('DATOS PERSONALES')}
            {this.renderField({
              label: 'NOMBRE COMPLETO',
              icon: 'account-outline',
              errKey: 'name',
              value: props.name,
              onChangeText: props.actions.nameChange,
              placeholder: 'Ej: Camila Rojas Martínez',
            })}
            <View style={st.row2}>
              <View style={{flex: 1}}>
                {this.renderField({
                  label: 'TELÉFONO',
                  icon: 'phone-outline',
                  errKey: 'phone',
                  value: props.phone,
                  onChangeText: props.actions.phoneChange,
                  keyboardType: 'phone-pad',
                  placeholder: '300 123 4567',
                })}
              </View>
              <View style={{flex: 1}}>
                {this.renderField({
                  label: 'CORREO ELECTRÓNICO',
                  icon: 'email-outline',
                  errKey: 'email',
                  value: props.email,
                  onChangeText: props.actions.emailChange,
                  keyboardType: 'email-address',
                  autoCapitalize: 'none',
                  placeholder: 'cliente@example.com',
                })}
              </View>
            </View>

            {/* IDENTIFICACIÓN */}
            {this.renderSectionLabel('IDENTIFICACIÓN')}
            <View style={st.row2}>
              <View style={{flex: 1}}>
                {this.renderSelectField({
                  label: 'TIPO',
                  icon: 'card-account-details-outline',
                  value: props.idType?.label,
                  options: props.idTypes || [],
                  onSelect: (opt) => props.actions.idTypeChange(opt),
                  pickerKey: 'idType',
                })}
              </View>
              <View style={{flex: 1}}>
                {this.renderField({
                  label: 'NÚMERO DE IDENTIFICACIÓN',
                  icon: 'pound',
                  errKey: 'idNumber',
                  value: props.idNumber,
                  onChangeText: props.actions.idNumberChange,
                  keyboardType: 'number-pad',
                  placeholder: '1.045.678.901',
                })}
              </View>
            </View>
            {isNIT && this.renderField({
              label: 'DÍGITO DE VERIFICACIÓN',
              icon: 'pound',
              errKey: 'digit',
              value: props.digit,
              onChangeText: props.actions.digitChange,
              keyboardType: 'number-pad',
            })}
            {showBirthday && this.renderDateField({
              label: 'FECHA DE NACIMIENTO',
              icon: 'cake-variant-outline',
              value: props.birthday,
              onChange: props.actions.birthdayChange,
              errKey: 'birthday',
              hint: 'Le enviamos un saludo en su cumpleaños',
            })}

            {/* UBICACIÓN */}
            {this.renderSectionLabel('UBICACIÓN')}
            {this.renderField({
              label: 'DIRECCIÓN',
              icon: 'map-marker-outline',
              errKey: 'address',
              value: props.address,
              onChangeText: props.actions.addressChange,
              placeholder: 'Ej: Cra 13 # 27 — apto 401',
            })}
            {this.renderSelectField({
              label: 'CIUDAD',
              icon: 'city-variant-outline',
              value: props.city?.label,
              options: CITY_OPTIONS,
              onSelect: (opt) => props.actions.cityChange(opt),
              pickerKey: 'city',
            })}
            {isOtherCity && this.renderField({
              label: 'NOMBRE DE LA CIUDAD',
              icon: 'city-variant-outline',
              errKey: 'cityName',
              value: props.cityName,
              onChangeText: props.actions.cityNameChange,
              placeholder: 'Escribe el nombre de la ciudad',
            })}

            {/* OTROS */}
            {this.renderSectionLabel('OTROS')}
            {this.renderField({
              label: 'CÓDIGO INTERNO',
              icon: 'pound',
              errKey: 'code',
              value: props.code,
              onChangeText: props.actions.codeChange,
              placeholder: 'Opcional',
            })}
          </ScrollView>

          {/* CTA sticky */}
          <View style={st.ctaWrap}>
            <TouchableOpacity
              style={st.ctaBtn}
              activeOpacity={0.85}
              onPress={() => props.actions.createCustomer({navigation: props.navigation})}>
              <Icon source="check" size={20} color={WHITE} />
              <Text style={st.ctaTxt}>Crear cliente</Text>
            </TouchableOpacity>
          </View>

          {this.renderPickerModal()}
          {this.renderDatePicker()}
        </View>
      </AppShell>
    );
  }
}

const st = StyleSheet.create({
  body: {flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 12},

  // ── Sub-header ──
  subHeader: {flexDirection: 'row', alignItems: 'center', paddingBottom: 18},
  backBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {fontFamily: fonts.bold, fontSize: 22, color: INK, letterSpacing: -0.3},
  subtitle: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},

  // ── Section label (DATOS PERSONALES, IDENTIFICACIÓN, etc.) ──
  sectionLabel: {
    fontFamily: fonts.bold, fontSize: 11, color: DGOLD,
    letterSpacing: 1.2, marginTop: 14, marginBottom: 8, marginLeft: 4,
  },

  // ── Field card ──
  fieldCard: {
    flexDirection: 'row', alignItems: 'center', columnGap: 12,
    backgroundColor: WHITE, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER_SOFT,
    paddingHorizontal: 14, paddingVertical: 10, minHeight: 64,
  },
  fieldCardError: {borderColor: RED},
  fieldIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: SOFT_GOLD,
    alignItems: 'center', justifyContent: 'center',
  },
  fieldLabel: {
    fontFamily: fonts.bold, fontSize: 10, color: DGOLD,
    letterSpacing: 1, marginBottom: 2,
  },
  fieldInput: {
    fontFamily: fonts.semiBold, fontSize: 15, color: INK,
    paddingVertical: 0, padding: 0, margin: 0,
  },
  fieldError: {fontFamily: fonts.regular, fontSize: 11, color: RED, marginTop: 4, marginLeft: 4},
  fieldHint: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginTop: 6, marginLeft: 14},

  // ── Row 2-columnas ──
  row2: {flexDirection: 'row', columnGap: 12},

  // ── Sticky CTA ──
  ctaWrap: {
    position: 'absolute', left: 20, right: 20, bottom: 20,
  },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    columnGap: 10, backgroundColor: GOLD, borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#3C1E0A', shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 4,
  },
  ctaTxt: {fontFamily: fonts.bold, fontSize: 15, color: WHITE},

  // ── Picker modal ──
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(26,19,12,0.45)',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20,
  },
  modalPanel: {
    width: '100%', maxWidth: 380, backgroundColor: WHITE,
    borderRadius: 18, paddingVertical: 14, paddingHorizontal: 8,
  },
  modalTitle: {
    fontFamily: fonts.bold, fontSize: 14, color: INK,
    textAlign: 'center', paddingHorizontal: 12, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: BORDER_SOFT, marginBottom: 4,
  },
  modalItem: {
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10,
  },
  modalItemTxt: {fontFamily: fonts.semiBold, fontSize: 15, color: INK},
});

export default CreateCustomerScreen;
