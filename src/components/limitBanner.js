import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {colors, fonts, normalizeSize} from '../styles/basicStyles';

/**
 * Banner reutilizable para situaciones de límite o alerta con CTA.
 *
 * Variants:
 *  - 'warning' (default): naranja PIIDA. Para límites de plan (30 ventas/día).
 *  - 'error'  : rojo carmesí. Para mora / suspensión.
 *  - 'info'   : amarillo suave. Para informativos.
 *
 * Uso típico:
 *   <LimitBanner
 *     title="Has alcanzado tu límite"
 *     message="Plan Gratis: 30 ventas/día"
 *     ctaLabel="Mejorar plan"
 *     onPress={() => navigation.navigate('Billing')}
 *     variant="warning"
 *   />
 */
const VARIANTS = {
  warning: {
    bg: '#FFF4E5',
    border: '#FF8A1F',
    title: '#7A3D00',
    text: '#5C2E00',
    cta: '#FF6D09',
    ctaText: '#FFFFFF',
  },
  error: {
    bg: '#FEECEC',
    border: '#D14343',
    title: '#7A1010',
    text: '#5C0808',
    cta: '#AC231B',
    ctaText: '#FFFFFF',
  },
  info: {
    bg: '#F5F1E3',
    border: '#C9B96A',
    title: '#3F3700',
    text: '#5C4D00',
    cta: '#736226',
    ctaText: '#FFFFFF',
  },
};

const LimitBanner = ({
  title,
  message,
  ctaLabel,
  onPress,
  variant = 'warning',
  compact = false,
  style,
}) => {
  const v = VARIANTS[variant] ?? VARIANTS.warning;
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          padding: compact ? normalizeSize(12) : normalizeSize(16),
        },
        style,
      ]}>
      {title ? (
        <Text style={[styles.title, {color: v.title, fontSize: normalizeSize(compact ? 14 : 16)}]}>
          {title}
        </Text>
      ) : null}
      {message ? (
        <Text style={[styles.message, {color: v.text, fontSize: normalizeSize(compact ? 12 : 13)}]}>
          {message}
        </Text>
      ) : null}
      {ctaLabel && onPress ? (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.cta, {backgroundColor: v.cta, paddingVertical: compact ? normalizeSize(8) : normalizeSize(10)}]}
          onPress={onPress}>
          <Text style={[styles.ctaText, {color: v.ctaText, fontSize: normalizeSize(compact ? 13 : 14)}]}>
            {ctaLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: normalizeSize(12),
    borderLeftWidth: 4,
    marginHorizontal: normalizeSize(16),
    marginVertical: normalizeSize(8),
  },
  title: {
    fontFamily: fonts.bold,
    marginBottom: normalizeSize(4),
  },
  message: {
    fontFamily: fonts.regular,
    lineHeight: normalizeSize(18),
  },
  cta: {
    marginTop: normalizeSize(10),
    borderRadius: normalizeSize(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: fonts.bold,
  },
});

export default LimitBanner;
