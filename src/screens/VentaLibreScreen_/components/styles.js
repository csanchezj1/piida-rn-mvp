// src/screens/VentaLibreScreen/components/styles.js
// StyleSheet del rediseño Venta Libre. Sigue el patrón de NewSaleScreen.

import { StyleSheet } from 'react-native';
import { fonts, normalizeSize } from '../../../styles/basicStyles';
import { palette } from '../../../styles/piidaPalette';

export const ventaLibreStyles = () => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },

  // ─── App bar ───────────────────────────────────────────────
  appBar: {
    height: normalizeSize(64),
    paddingHorizontal: normalizeSize(22),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.panel,
    borderBottomWidth: 1.5,
    borderBottomColor: palette.borderSoft,
  },
  iconBtn: {
    width: normalizeSize(48),
    height: normalizeSize(48),
    borderRadius: normalizeSize(12),
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    fontFamily: fonts.bold,
    fontSize: normalizeSize(22),
    color: palette.ink,
    letterSpacing: -0.4,
    marginLeft: normalizeSize(18),
  },
  saleChip: {
    marginLeft: normalizeSize(12),
    paddingHorizontal: normalizeSize(14),
    paddingVertical: normalizeSize(6),
    borderRadius: 999,
    backgroundColor: palette.surface,
  },
  saleChipText: {
    fontFamily: fonts.bold,
    fontSize: normalizeSize(11),
    color: palette.muted,
    letterSpacing: 0.5,
  },
  terminalText: {
    fontFamily: fonts.semiBold,
    fontSize: normalizeSize(13),
    color: palette.muted,
    marginLeft: normalizeSize(12),
  },

  // ─── Body ──────────────────────────────────────────────────
  body: {
    flex: 1,
    flexDirection: 'row',
  },

  // ─── Left pane (amount + note + numpad) ────────────────────
  leftPane: {
    flex: 1,
    paddingHorizontal: normalizeSize(32),
    paddingVertical: normalizeSize(20),
  },
});
