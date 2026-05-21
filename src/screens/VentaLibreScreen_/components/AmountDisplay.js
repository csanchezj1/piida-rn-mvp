// src/screens/VentaLibreScreen/components/AmountDisplay.js
//
// Muestra el monto que el cajero está ingresando, con un botón para
// agregar una nota opcional (que se usará como nombre del item).
// El monto se renderiza tabular-nums + tipografía display para evitar
// que los dígitos "bailen" al teclear — crítico para adultos mayores.

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { NumericFormat } from 'react-number-format';
import { fonts, normalizeSize } from '../../../styles/basicStyles';
import { palette } from '../../../styles/piidaPalette';

const AmountDisplay = ({
  amount,           // number — el monto actual
  note,             // string — el texto de la nota (puede ser vacío)
  showNote,         // boolean — si el input de nota está expandido
  onNoteChange,     // (text) => void
  onToggleNote,     // () => void
}) => {
  const hasAmount = amount > 0;

  return (
    <View>
      <View style={s.card}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>VALOR DEL ARTÍCULO</Text>
          <View style={s.amountRow}>
            <Text style={[s.dollar, hasAmount && s.dollarActive]}>$</Text>
            <NumericFormat
              value={amount}
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              renderText={(v) => (
                <Text style={[s.amount, !hasAmount && s.amountInactive]}>
                  {v || '0'}
                </Text>
              )}
            />
            <Text style={s.cop}>COP</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onToggleNote}
          style={[s.noteBtn, showNote && s.noteBtnActive]}
        >
          <Text
            style={[
              s.noteBtnText,
              showNote && s.noteBtnTextActive,
            ]}
          >
            {note ? 'Editar nota' : 'Agregar nota'}
          </Text>
        </TouchableOpacity>
      </View>

      {showNote && (
        <TextInput
          autoFocus
          value={note}
          onChangeText={onNoteChange}
          placeholder="Ej: 2 panes blancos, sin queso…"
          placeholderTextColor={palette.muted}
          style={s.noteInput}
        />
      )}
    </View>
  );
};

export default AmountDisplay;

const s = StyleSheet.create({
  card: {
    paddingVertical: normalizeSize(18),
    paddingHorizontal: normalizeSize(24),
    backgroundColor: palette.panel,
    borderRadius: normalizeSize(22),
    borderWidth: 1,
    borderColor: palette.borderSoft,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: normalizeSize(11),
    letterSpacing: 1,
    color: palette.muted,
    marginBottom: normalizeSize(4),
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  dollar: {
    fontFamily: fonts.semiBold,
    fontSize: normalizeSize(24),
    color: palette.mutedSoft,
    marginRight: normalizeSize(8),
  },
  dollarActive: {
    color: palette.amber,
  },
  amount: {
    fontFamily: fonts.bold,
    fontSize: normalizeSize(52),
    color: palette.ink,
    letterSpacing: -1.6,
    lineHeight: normalizeSize(56),
  },
  amountInactive: {
    color: palette.mutedSoft,
  },
  cop: {
    fontFamily: fonts.semiBold,
    fontSize: normalizeSize(15),
    color: palette.muted,
    marginLeft: normalizeSize(8),
  },
  noteBtn: {
    paddingHorizontal: normalizeSize(16),
    paddingVertical: normalizeSize(10),
    borderRadius: normalizeSize(14),
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panel,
    marginLeft: normalizeSize(16),
  },
  noteBtnActive: {
    borderColor: palette.amber,
    backgroundColor: palette.amberWash,
  },
  noteBtnText: {
    fontFamily: fonts.bold,
    fontSize: normalizeSize(14),
    color: palette.ink2,
  },
  noteBtnTextActive: {
    color: palette.amberDark,
  },
  noteInput: {
    marginTop: normalizeSize(14),
    paddingHorizontal: normalizeSize(18),
    paddingVertical: normalizeSize(14),
    borderRadius: normalizeSize(14),
    borderWidth: 1.5,
    borderColor: palette.amber,
    backgroundColor: palette.panel,
    fontFamily: fonts.medium,
    fontSize: normalizeSize(15),
    color: palette.ink,
  },
});
