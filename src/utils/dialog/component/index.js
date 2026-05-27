import React, {Component} from 'react';
import {Modal, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Icon, Text} from 'react-native-paper';
import {fonts} from '../../../styles/basicStyles';

// Paleta unificada (matching otros popups del rediseño tablet).
const INK = '#1A130C';
const GOLD = '#F7A928';
const DGOLD = '#C66E00';
const MUTED = '#7E6A52';
const WHITE = '#FFFFFF';
const BORDER_SOFT = '#EFE3D2';
const ACCENT = '#FF5A1F';
const RED = '#D7263D';
const GREEN_TXT = '#1F8A4C';

// Decide icon + color del badge del dialog según el título del mensaje.
// Patrón unificado pedido por el equipo: icon circular arriba, título +
// mensaje centrados, X arriba derecha, CTA principal naranja.
const iconForTitle = (title) => {
  const t = String(title || '').toLowerCase();
  if (/(error|falló|fallo|inválid|no se pud|conexión)/.test(t)) {
    return {icon: 'alert-circle-outline', color: RED, bg: '#FBE0DE'};
  }
  if (/(éxito|exito|exitos|correcta|listo|caja abierta)/.test(t)) {
    return {icon: 'check-circle-outline', color: GREEN_TXT, bg: '#DCEFE2'};
  }
  if (/(felicidad|guard|creado|creada|creadas|creados|actualizad|surtid|trasladad|registrad|guardad|completad|cerrad)/.test(t)) {
    return {icon: 'check-circle-outline', color: GREEN_TXT, bg: '#DCEFE2'};
  }
  if (/(cerrar|cancelar|elimin)/.test(t)) {
    return {icon: 'pencil-outline', color: DGOLD, bg: '#FFF6E1'};
  }
  return {icon: 'information-outline', color: DGOLD, bg: '#FFF6E1'};
};

class CommonDialog extends Component {
  onAccept = () => {
    this.props.actions.visible(false);
    if (this.props.acceptAction) this.props.acceptAction();
  };
  onDismiss = () => this.props.actions.visible(false);

  render() {
    const {visible, title, message, acceptTitle, cancelTitle, showCancelButton} = this.props;
    if (!visible) return null;
    const {icon, color, bg} = iconForTitle(title);
    return (
      <Modal
        visible
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={this.onDismiss}>
        <View style={s.backdrop}>
          <View style={s.card}>
            <TouchableOpacity
              style={s.close}
              activeOpacity={0.7}
              onPress={this.onDismiss}>
              <Icon source="close" size={18} color={INK} />
            </TouchableOpacity>
            <View style={[s.iconWrap, {backgroundColor: bg}]}>
              <Icon source={icon} size={28} color={color} />
            </View>
            {!!title && <Text style={s.title}>{title}</Text>}
            {!!message && <Text style={s.message}>{message}</Text>}
            <View style={s.actions}>
              {showCancelButton && (
                <TouchableOpacity
                  style={[s.btn, s.btnSecondary]}
                  activeOpacity={0.85}
                  onPress={this.onDismiss}>
                  <Text style={s.btnSecondaryTxt}>{cancelTitle || 'Cancelar'}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[s.btn, s.btnPrimary]}
                activeOpacity={0.85}
                onPress={this.onAccept}>
                <Text style={s.btnPrimaryTxt}>{acceptTitle || 'Aceptar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,19,12,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: WHITE,
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 26,
    alignItems: 'center',
  },
  close: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7F0E8',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: INK,
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    columnGap: 10,
    marginTop: 18,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {backgroundColor: ACCENT},
  btnSecondary: {backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT},
  btnPrimaryTxt: {fontFamily: fonts.bold, fontSize: 13, color: WHITE},
  btnSecondaryTxt: {fontFamily: fonts.bold, fontSize: 13, color: INK},
});

export default CommonDialog;
