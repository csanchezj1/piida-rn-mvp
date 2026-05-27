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
import AppShell from '../../../layouts/AppShell';
import {fonts} from '../../../styles/basicStyles';
import {fieldErrors} from '../../../utils/screenFunctions';
import {registerEventScreenMounted} from '../../../utils/analytics';

// Paleta — alineada con el rediseño tablet.
const BG = '#FAF5EC';
const INK = '#1A130C';
const GOLD = '#F7A928';
const DGOLD = '#C66E00';
const MUTED = '#7E6A52';
const SUBTLE = '#A89580';
const WHITE = '#FFFFFF';
const BORDER_SOFT = '#EFE3D2';
const TINT_GOLD = '#FFF6E1';
const ACCENT = '#FF5A1F';
const RED = '#D7263D';
const GREEN_TXT = '#1F8A4C';

const ID_TYPES_DEFAULT = [
  {label: 'NIT', value: 'NIT'},
  {label: 'CC', value: 'CC'},
  {label: 'CE', value: 'CE'},
  {label: 'Pasaporte', value: 'Pasaporte'},
  {label: 'RUT', value: 'RUT'},
];

class CreateProviderScreen extends Component {
  state = {
    pickerOpen: false,
    // Algunos campos no existen aún en el reducer; los mantenemos como
    // state local hasta que el back los acepte.
    idType: {label: 'NIT', value: 'NIT'},
    digit: '',
    email: '',
    whatsapp: '',
  };

  componentDidMount() {
    this.props.actions.getFieldsData(this.props.user.company);
    registerEventScreenMounted(this.props, 'Formulario crear proveedor', 'CreateProviderScreen');
  }

  componentWillUnmount() {
    this.props.actions.clearScreen();
  }

  // ── Sub-header ────────────────────────────────────────────
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
          <Text style={st.title}>Nuevo proveedor</Text>
          <Text style={st.subtitle}>Agregá un proveedor a tu base · podrás usarlo al surtir inventario</Text>
        </View>
      </View>
    );
  }

  // ── Field genérico (card blanca + label uppercase + input) ─
  renderField({label, value, onChangeText, placeholder, keyboardType, errKey, hint}) {
    const err = errKey ? fieldErrors(errKey, this.props.errors) : '';
    return (
      <View style={{marginBottom: 12}}>
        <View style={[st.fieldCard, err && st.fieldCardError]}>
          <Text style={st.fieldLabel}>{label}</Text>
          <TextInput
            style={st.fieldInput}
            placeholder={placeholder || ''}
            placeholderTextColor={SUBTLE}
            value={value || ''}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            underlineColorAndroid="transparent"
            allowFontScaling={false}
          />
        </View>
        {!!err && <Text style={st.fieldError}>{err}</Text>}
        {!!hint && !err && <Text style={st.fieldHint}>{hint}</Text>}
      </View>
    );
  }

  // ── Field tipo selector (Tipo de ID) ──
  renderSelectField({label, value, onPress}) {
    return (
      <View style={{marginBottom: 12}}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={st.fieldCard}
          onPress={onPress}>
          <Text style={st.fieldLabel}>{label}</Text>
          <View style={st.fieldRow}>
            <Text style={[st.fieldValue, !value && {color: SUBTLE}]} numberOfLines={1}>
              {value || 'Seleccionar...'}
            </Text>
            <Icon source="chevron-down" size={20} color={MUTED} />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  renderPickerModal() {
    if (!this.state.pickerOpen) return null;
    return (
      <Modal
        visible
        transparent
        animationType="fade"
        onRequestClose={() => this.setState({pickerOpen: false})}>
        <TouchableOpacity
          activeOpacity={1}
          style={st.modalBackdrop}
          onPress={() => this.setState({pickerOpen: false})}>
          <View style={st.modalPanel}>
            <Text style={st.modalTitle}>Tipo de identificación</Text>
            <ScrollView style={{maxHeight: 320}}>
              {ID_TYPES_DEFAULT.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  activeOpacity={0.7}
                  style={st.modalItem}
                  onPress={() => this.setState({pickerOpen: false, idType: opt})}>
                  <Text style={st.modalItemTxt}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  // ── Vista previa ──
  renderPreview() {
    const name = this.props.names || 'Nombre del proveedor';
    const contact = this.props.lastNames || '';
    const id = this.props.idNumber || '';
    const phone = this.props.phone || '';
    const email = this.state.email || '';
    const whatsapp = this.state.whatsapp || '';

    return (
      <View style={st.sidebar}>
        <View style={st.sideCard}>
          <Text style={st.sideTitle}>VISTA PREVIA</Text>
          <View style={st.previewRow}>
            <View style={st.previewIcon}>
              <Icon source="truck-outline" size={26} color={DGOLD} />
            </View>
            <View style={{flex: 1, minWidth: 0}}>
              <Text style={st.previewName} numberOfLines={2}>
                {name}
              </Text>
              {!!contact && (
                <Text style={st.previewMeta} numberOfLines={1}>
                  Contacto: {contact}
                </Text>
              )}
            </View>
          </View>

          <View style={{marginTop: 12, rowGap: 6}}>
            {!!id && (
              <View style={st.metaRow}>
                <Icon source="card-account-details-outline" size={14} color={MUTED} />
                <Text style={st.metaTxt} numberOfLines={1}>
                  {this.state.idType.label} {id}
                </Text>
              </View>
            )}
            {!!phone && (
              <View style={st.metaRow}>
                <Icon source="phone-outline" size={14} color={MUTED} />
                <Text style={st.metaTxt} numberOfLines={1}>{phone}</Text>
              </View>
            )}
            {!!email && (
              <View style={st.metaRow}>
                <Icon source="email-outline" size={14} color={MUTED} />
                <Text style={st.metaTxt} numberOfLines={1}>{email}</Text>
              </View>
            )}
            {!!whatsapp && (
              <View style={st.metaRow}>
                <Icon source="whatsapp" size={14} color={GREEN_TXT} />
                <Text style={st.metaTxt} numberOfLines={1}>{whatsapp}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={st.hintBox}>
          Así verás al proveedor en el listado y al surtir inventario.
        </Text>
      </View>
    );
  }

  render() {
    const props = this.props;
    const isNIT = this.state.idType.value === 'NIT';

    return (
      <AppShell active="movimientos">
        <View style={st.body}>
          {this.renderSubHeader()}

          <ScrollView
            style={{flex: 1}}
            contentContainerStyle={{paddingBottom: 120}}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            <View style={st.split}>
              {/* Form */}
              <View style={st.leftCol}>
                {/* DATOS DEL NEGOCIO */}
                <Text style={st.sectionLabel}>DATOS DEL NEGOCIO</Text>

                {this.renderField({
                  label: 'NOMBRE O RAZÓN SOCIAL *',
                  errKey: 'names',
                  value: props.names,
                  onChangeText: props.actions.namesChange,
                  placeholder: 'Ej: Ferretería Mayorista Bogotá',
                })}

                <View style={st.row2}>
                  <View style={{flex: 1}}>
                    {this.renderSelectField({
                      label: 'TIPO DE IDENTIFICACIÓN *',
                      value: this.state.idType.label,
                      onPress: () => this.setState({pickerOpen: true}),
                    })}
                  </View>
                  <View style={{flex: 1.4}}>
                    {this.renderField({
                      label: 'NÚMERO DE IDENTIFICACIÓN *',
                      errKey: 'idNumber',
                      value: props.idNumber,
                      onChangeText: props.actions.idNumberChange,
                      keyboardType: 'number-pad',
                      placeholder: '900.123.456',
                    })}
                  </View>
                </View>

                {isNIT && this.renderField({
                  label: 'DÍGITO DE VERIFICACIÓN',
                  value: this.state.digit,
                  onChangeText: (t) => this.setState({digit: t.replace(/[^0-9]/g, '')}),
                  keyboardType: 'number-pad',
                  hint: 'Opcional · solo si tu proveedor es NIT',
                })}

                {/* CONTACTO */}
                <Text style={[st.sectionLabel, {marginTop: 18}]}>CONTACTO</Text>

                <View style={st.row2}>
                  <View style={{flex: 1}}>
                    {this.renderField({
                      label: 'PERSONA DE CONTACTO',
                      errKey: 'lastNames',
                      value: props.lastNames,
                      onChangeText: props.actions.lastNamesChange,
                      placeholder: 'Ej: Carlos Méndez',
                    })}
                  </View>
                  <View style={{flex: 1}}>
                    {this.renderField({
                      label: 'NÚMERO TELEFÓNICO',
                      errKey: 'phone',
                      value: props.phone,
                      onChangeText: props.actions.phoneChange,
                      keyboardType: 'phone-pad',
                      placeholder: '601 234 5678',
                    })}
                  </View>
                </View>

                {this.renderField({
                  label: 'CORREO ELECTRÓNICO',
                  value: this.state.email,
                  onChangeText: (t) => this.setState({email: t}),
                  placeholder: 'pedidos@ferremayor.co',
                })}

                {this.renderField({
                  label: 'WHATSAPP',
                  value: this.state.whatsapp,
                  onChangeText: (t) => this.setState({whatsapp: t}),
                  keyboardType: 'phone-pad',
                  placeholder: '300 555 9999',
                  hint: 'Opcional · si lo agregás aparece un botón de pedido rápido',
                })}
              </View>

              {/* Vista previa */}
              <View style={st.rightCol}>{this.renderPreview()}</View>
            </View>
          </ScrollView>

          {/* CTA sticky */}
          <View style={st.ctaWrap}>
            <TouchableOpacity
              style={st.ctaBtn}
              activeOpacity={0.85}
              onPress={() =>
                props.actions.createProvider({
                  names: props.names,
                  lastNames: props.lastNames,
                  idNumber: props.idNumber,
                  gender: props.gender,
                  phone: props.phone,
                  city: props.city,
                  code: props.code,
                  navigation: props.navigation,
                })
              }>
              <Icon source="check" size={20} color={WHITE} />
              <Text style={st.ctaTxt}>Crear proveedor</Text>
            </TouchableOpacity>
          </View>

          {this.renderPickerModal()}
        </View>
      </AppShell>
    );
  }
}

const st = StyleSheet.create({
  body: {flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 12},

  // Sub-header
  subHeader: {flexDirection: 'row', alignItems: 'center', paddingBottom: 14},
  backBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {fontFamily: fonts.bold, fontSize: 22, color: INK, letterSpacing: -0.3},
  subtitle: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},

  // Split
  split: {flexDirection: 'row', columnGap: 14},
  leftCol: {flex: 2},
  rightCol: {flex: 1},

  // Sections
  sectionLabel: {
    fontFamily: fonts.bold, fontSize: 11, color: DGOLD,
    letterSpacing: 1.2, marginBottom: 8, marginLeft: 4,
  },
  row2: {flexDirection: 'row', columnGap: 12},

  // Fields
  fieldCard: {
    backgroundColor: WHITE, borderRadius: 14,
    borderWidth: 1.5, borderColor: BORDER_SOFT,
    paddingHorizontal: 14, paddingVertical: 10, minHeight: 64, justifyContent: 'center',
  },
  fieldCardError: {borderColor: RED},
  fieldLabel: {
    fontFamily: fonts.bold, fontSize: 10, color: DGOLD,
    letterSpacing: 1, marginBottom: 4,
  },
  fieldInput: {
    fontFamily: fonts.semiBold, fontSize: 15, color: INK,
    paddingVertical: 0, padding: 0, margin: 0,
  },
  fieldRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  fieldValue: {flex: 1, fontFamily: fonts.semiBold, fontSize: 15, color: INK},
  fieldError: {fontFamily: fonts.regular, fontSize: 11, color: RED, marginTop: 4, marginLeft: 4},
  fieldHint: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginTop: 6, marginLeft: 14},

  // CTA sticky
  ctaWrap: {position: 'absolute', left: 20, right: 20, bottom: 20},
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    columnGap: 10, backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 16,
    shadowColor: '#3C1E0A', shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 4,
  },
  ctaTxt: {fontFamily: fonts.bold, fontSize: 15, color: WHITE},

  // Sidebar preview
  sidebar: {rowGap: 10},
  sideCard: {
    backgroundColor: WHITE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER_SOFT,
    padding: 16,
  },
  sideTitle: {fontFamily: fonts.bold, fontSize: 10, color: DGOLD, letterSpacing: 1.2, marginBottom: 12},
  previewRow: {flexDirection: 'row', alignItems: 'center', columnGap: 12},
  previewIcon: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: TINT_GOLD, alignItems: 'center', justifyContent: 'center',
  },
  previewName: {fontFamily: fonts.bold, fontSize: 14, color: INK},
  previewMeta: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 4},
  metaRow: {flexDirection: 'row', alignItems: 'center', columnGap: 6},
  metaTxt: {flex: 1, fontFamily: fonts.regular, fontSize: 12, color: INK},
  hintBox: {
    fontFamily: fonts.regular, fontSize: 11, color: MUTED,
    paddingHorizontal: 8, lineHeight: 16,
  },

  // Modal picker
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
  modalItem: {paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10},
  modalItemTxt: {fontFamily: fonts.semiBold, fontSize: 15, color: INK},
});

export default CreateProviderScreen;
