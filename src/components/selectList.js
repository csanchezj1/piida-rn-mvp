import React, {useRef} from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {HelperText, TextInput} from 'react-native-paper';
import RBSheet from 'react-native-raw-bottom-sheet';
import {colors, fonts, normalizeSize} from '../styles/basicStyles';

// SelectList — visual outlined-Paper, bottom-sheet RBSheet para el picker.
// Mantiene la API antigua (icon como require(...) se ignora ahora; el
// chevron-down de Paper sirve como hint de dropdown).
const SelectList = (props) => {
  const {style, value, label, errorText, isError, variables, onValueChange, onPress} = props;
  const refRBSheet = useRef();
  const open = () => refRBSheet.current && refRBSheet.current.open();
  const close = () => refRBSheet.current && refRBSheet.current.close();

  return (
    <View style={[{marginTop: normalizeSize(6)}, style]}>
      <TouchableOpacity activeOpacity={0.8} onPress={variables ? open : onPress}>
        {/* pointerEvents none — el TextInput es solo visual; el tap lo captura
            el TouchableOpacity de arriba. */}
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            // Coercemos a string: paymentsQty.label es número (1,2,3) y Paper
            // TextInput muestra vacío con valores no-string en algunos RN.
            value={value != null && value !== '' ? String(value) : ''}
            placeholder={label ? `Selecciona ${String(label).toLowerCase()}` : 'Selecciona'}
            error={!!isError}
            editable={false}
            right={<TextInput.Icon icon="menu-down" />}
          />
        </View>
      </TouchableOpacity>
      <HelperText type="error" visible={!!isError}>
        {Array.isArray(errorText) ? errorText[0] : errorText || 'Este campo es requerido'}
      </HelperText>

      {variables && (
        <RBSheet
          ref={refRBSheet}
          minClosingHeight={50}
          height={normalizeSize(120) + variables.length * normalizeSize(40)}
          customStyles={{container: sheet.container}}
          draggable
          openDuration={400}
          closeDuration={400}
          dragFromTopOnly>
          <View style={sheet.inner}>
            <Text style={sheet.title}>Selecciona una opción</Text>
            <ScrollView>
              {variables.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.6}
                  style={[
                    sheet.option,
                    index === variables.length - 1 &&
                      variables.length > 10 && {marginBottom: normalizeSize(120)},
                  ]}
                  onPress={() => {
                    onValueChange(item);
                    close();
                  }}>
                  <Text style={sheet.optionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </RBSheet>
      )}
    </View>
  );
};

const sheet = StyleSheet.create({
  container: {
    borderTopLeftRadius: normalizeSize(16),
    borderTopRightRadius: normalizeSize(16),
  },
  inner: {flex: 1, paddingTop: normalizeSize(8)},
  title: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: normalizeSize(15),
    textAlign: 'center',
    paddingVertical: normalizeSize(10),
  },
  option: {
    paddingVertical: normalizeSize(12),
    paddingHorizontal: normalizeSize(20),
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  optionText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: normalizeSize(14),
  },
});

export default SelectList;
