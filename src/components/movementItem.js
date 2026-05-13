import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { getMovementStyles } from '../styles/componentStyles';
import { NumericFormat } from 'react-number-format';
import { colors, fonts } from "../styles/basicStyles";
import Svg, { Path } from 'react-native-svg';

// Ícono de caneca/basurero minimalista
const TrashIcon = ({ size = 17, color = '#E53935' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 11v5M14 11v5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const MovementItem = ({
  style,
  type,
  title,
  product,
  status,            // hora del movimiento (display)
  value,
  qty,
  from,
  onDelete,           // callback para abrir modal de cancelación
  cancelled,          // bool: status backend === 'CANCELLED'
  cancellationReason, // string: motivo registrado en el back
  cancelledByName,    // string: autor de la cancelación
  image,
  ...otherProps
}) => {
  const [pressed, setPressed] = useState(false);
  const styles = getMovementStyles();

  // sign='-$' → salida (egreso o descuento de stock) → flecha roja ↓
  // sign='$'  → entrada (ingreso o aumento de stock)  → flecha verde ↑
  let sign = '$';
  if (from === 'purchase') {
    // Movimientos: 'Salida' = gasto (rojo). Sales son ingresos (verde).
    if (type === 'Salida') sign = '-$';
  } else if (from === 'warehouse') {
    // Inventario: solo 'Salida de inventario' baja el stock (rojo).
    // Todo lo demás — incluido 'Entrada de inventario', PURCHASE, ADJUSTMENT_PLUS,
    // TRANSFER_IN — suma stock y va con flecha verde ↑.
    if (type === 'Salida de inventario') sign = '-$';
  }

  const valueColor = cancelled
    ? '#9E9E9E'
    : sign === '-$' ? colors.error : colors.success;
  const titleStyle = cancelled
    ? [styles.product, { color: '#9E9E9E', textDecorationLine: 'line-through' }]
    : styles.product;
  const valueStyle = cancelled
    ? [
        sign === '-$' ? styles.value : styles.value,
        { color: '#9E9E9E', textDecorationLine: 'line-through' },
      ]
    : [styles.value, { color: valueColor }];

  const showCancelInfo = () => {
    const lines = [];
    if (cancelledByName) lines.push(`Cancelado por: ${cancelledByName}`);
    if (cancellationReason) lines.push(`Motivo: ${cancellationReason}`);
    Alert.alert(
      'Movimiento cancelado',
      lines.join('\n') || 'Este movimiento fue cancelado.',
    );
  };

  return(
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.container,
        pressed ? styles.pressed : styles.notPressed,
        style,
        { flexDirection: 'row', alignItems: 'center' },
        cancelled ? { backgroundColor: '#FFF6F6' } : null,
      ]}
      {...otherProps}>

      {/* Flecha de dirección — verde ↑ entrada, rojo ↓ salida.
          NO usamos styles.in/styles.out: esos legacy traían un
          transform: rotate(180deg) propio (eran wrappers de Image), que
          cancelaba la rotación que aplicaríamos acá. Construimos el badge
          completo aquí mismo. */}
      {type && (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: cancelled ? 0.4 : 1,
            backgroundColor: sign === '-$' ? '#FEE2E2' : '#DCFCE7',
            borderRadius: 999,
            width: 26,
            height: 26,
            // Rotamos el badge entero 180° en salidas — es deterministic
            // (transform de RN) y no depende del parser SVG.
            transform: [{ rotate: sign === '-$' ? '180deg' : '0deg' }],
          }}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24">
            <Path
              d="M12 20 L12 4 M6 10 L12 4 L18 10"
              stroke={sign === '-$' ? colors.error : colors.success}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </View>
      )}

      {/* Contenido central */}
      <View style={[styles.center, { flex: 1 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          <Text style={titleStyle} numberOfLines={1}>{title}</Text>
          {cancelled && (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); showCancelInfo(); }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              activeOpacity={0.7}
              style={{
                marginLeft: 6,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                backgroundColor: '#FEE2E2',
                borderWidth: 1,
                borderColor: '#FCA5A5',
              }}
            >
              <Text style={{ color: '#B91C1C', fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.4 }}>
                CANCELADO
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {status && (
          <Text style={styles.status}>{status.replace(/\n/g, '')}</Text>
        )}
        {cancelled && cancellationReason ? (
          <Text
            numberOfLines={1}
            style={{ color: '#B91C1C', fontSize: 11, fontFamily: fonts.regular, marginTop: 2 }}
          >
            Motivo: {cancellationReason}
          </Text>
        ) : null}
      </View>

      {/* Valor / cantidad */}
      <View>
        {from === 'warehouse' ? (
          <NumericFormat
            value={qty}
            displayType={'text'}
            thousandSeparator={'.'}
            decimalSeparator={','}
            renderText={
              (formatted) =>
              <Text style={[styles.qty, { color: valueColor, textDecorationLine: cancelled ? 'line-through' : 'none' }]}>
                {formatted}
              </Text>
            }
          />
        ) : (
          <NumericFormat
            value={(value * qty).toString()}
            displayType={'text'}
            thousandSeparator={'.'}
            decimalSeparator={','}
            allowNegative={false}
            prefix={sign}
            renderText={
              (formatted) =>
              <Text style={valueStyle}>
                {formatted}
              </Text>
            }
          />
        )}
        {from === 'pending' && !cancelled && (
          <Text style={styles.payTxt}>Abonar</Text>
        )}
      </View>

      {/* Botón cancelar — solo si onDelete y NO está ya cancelado */}
      {onDelete && !cancelled && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            onDelete();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
          activeOpacity={0.7}
          style={{
            padding: 7,
            marginLeft: 6,
            borderRadius: 7,
            backgroundColor: '#FEE2E2',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TrashIcon size={17} color="#E53935" />
        </TouchableOpacity>
      )}

    </TouchableOpacity>
  );
};

export default MovementItem;