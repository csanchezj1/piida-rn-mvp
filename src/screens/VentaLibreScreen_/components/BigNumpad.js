// src/screens/VentaLibreScreen/components/BigNumpad.js
//
// Numpad gigante 3 columnas × 4 filas para tablet. Cada tecla ocupa
// ~150-170px (mucho mayor que las recomendaciones POS de 56px) — diseñado
// específicamente para adultos mayores y uso con dedo grande.
//
// Layout:
//   ┌─────┬─────┬─────┐
//   │  1  │  2  │  3  │
//   ├─────┼─────┼─────┤
//   │  4  │  5  │  6  │
//   ├─────┼─────┼─────┤
//   │  7  │  8  │  9  │
//   ├─────┼─────┼─────┤
//   │ Lim │  0  │  + │   ← "+" es el botón de acción primaria
//   └─────┴─────┴─────┘

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { fonts, normalizeSize } from '../../../styles/basicStyles';
import { palette } from '../../../styles/piidaPalette';
import { PlusIcon } from '../../NewSaleScreen/components/Icons';

const BigNumpad = ({
  amount = 0,         // number — para decidir si el botón "+" está disabled
  onKey,              // (digit: '0' | '1' | ... | '9' | 'C') => void
  onAdd,              // () => void — acción del botón "+"
}) => {
  const renderDigit = (k) => (
    <TouchableOpacity
      key={k}
      activeOpacity={0.7}
      onPress={() => onKey(k)}
      style={s.key}
    >
      <Text style={s.keyText}>{k}</Text>
    </TouchableOpacity>
  );

  const hasAmount = amount > 0;

  return (
    <View style={s.grid}>
      <View style={s.row}>{['1', '2', '3'].map(renderDigit)}</View>
      <View style={s.row}>{['4', '5', '6'].map(renderDigit)}</View>
      <View style={s.row}>{['7', '8', '9'].map(renderDigit)}</View>
      <View style={s.row}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onKey('C')}
          style={s.key}
        >
          <Text style={s.clearText}>Limpiar</Text>
        </TouchableOpacity>
        {renderDigit('0')}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={hasAmount ? onAdd : undefined}
          disabled={!hasAmount}
          style={[s.addKey, !hasAmount && s.addKeyDisabled]}
        >
          <PlusIcon
            size={normalizeSize(48)}
            color={hasAmount ? '#fff' : palette.mutedSoft}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BigNumpad;

const s = StyleSheet.create({
  grid: {
    flex: 1,
    justifyContent: 'space-between',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalizeSize(14),
  },
  key: {
    flex: 1,
    marginHorizontal: normalizeSize(7),
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    borderRadius: normalizeSize(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontFamily: fonts.semiBold,
    fontSize: normalizeSize(46),
    color: palette.ink,
  },
  clearText: {
    fontFamily: fonts.semiBold,
    fontSize: normalizeSize(22),
    color: palette.muted,
  },
  addKey: {
    flex: 1,
    marginHorizontal: normalizeSize(7),
    backgroundColor: palette.amber,
    borderRadius: normalizeSize(22),
    alignItems: 'center',
    justifyContent: 'center',
    // shadow
    shadowColor: palette.amber,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 6,
  },
  addKeyDisabled: {
    backgroundColor: palette.surface,
    shadowOpacity: 0,
    elevation: 0,
  },
});
