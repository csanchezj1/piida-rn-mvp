import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { NumericFormat } from "react-number-format";
import { colors, fonts, normalizeSize } from "../styles/basicStyles";

/**
 * Donut chart con leyenda APILADA debajo (chart centrado, Ingresos y
 * Salidas en una fila debajo del donut). Reemplaza el layout horizontal
 * anterior que dejaba mucho espacio en blanco en tablets y truncaba el
 * texto verticalmente en celulares.
 */
const CHART_SIZE = 200;
const STROKE_WIDTH = 22;
const RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CircleChart = ({ style, enter = 0, out = 0, period }) => {
  const enterNum = Number(enter) || 0;
  const outNum = Number(out) || 0;
  const total = enterNum + outNum;

  const enterPct = total > 0 ? enterNum / total : 0;
  const outPct = total > 0 ? outNum / total : 0;

  const enterDash = `${enterPct * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
  const outDash = `${outPct * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
  const outOffset = -enterPct * CIRCUMFERENCE;

  const time =
    period === "all"
      ? "totales"
      : period === "month"
      ? "del mes"
      : period === "day"
      ? "de hoy"
      : "";

  return (
    <View style={[wrapper.container, style]}>
      {/* Chart centrado */}
      <Svg width={CHART_SIZE} height={CHART_SIZE}>
        <G rotation="-90" origin={`${CHART_SIZE / 2}, ${CHART_SIZE / 2}`}>
          <Circle
            cx={CHART_SIZE / 2}
            cy={CHART_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#FFE4B8"
            strokeWidth={STROKE_WIDTH}
          />
          {enterNum > 0 && (
            <Circle
              cx={CHART_SIZE / 2}
              cy={CHART_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={colors.dialogTitle}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={enterDash}
              strokeLinecap="butt"
            />
          )}
          {outNum > 0 && (
            <Circle
              cx={CHART_SIZE / 2}
              cy={CHART_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={colors.buttonBackground}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={outDash}
              strokeDashoffset={outOffset}
              strokeLinecap="butt"
            />
          )}
        </G>
      </Svg>

      {/* Legend abajo: Ingresos | Salidas en fila */}
      <View style={wrapper.legendRow}>
        <View style={wrapper.legendItem}>
          <View style={[wrapper.dot, {backgroundColor: colors.dialogTitle}]} />
          <View style={wrapper.legendText}>
            <Text style={wrapper.label}>Ingresos {time}</Text>
            <NumericFormat
              value={enterNum}
              displayType={"text"}
              thousandSeparator={"."}
              decimalSeparator={","}
              prefix={"$"}
              renderText={(v) => (
                <Text style={[wrapper.value, {color: colors.dialogTitle}]}>{v}</Text>
              )}
            />
          </View>
        </View>

        <View style={wrapper.legendItem}>
          <View style={[wrapper.dot, {backgroundColor: colors.buttonBackground}]} />
          <View style={wrapper.legendText}>
            <Text style={wrapper.label}>Salidas {time}</Text>
            <NumericFormat
              value={outNum}
              displayType={"text"}
              thousandSeparator={"."}
              decimalSeparator={","}
              prefix={"$"}
              renderText={(v) => (
                <Text style={[wrapper.value, {color: colors.buttonBackground}]}>{v}</Text>
              )}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const wrapper = {
  container: {
    alignItems: "center",
    paddingVertical: normalizeSize(10),
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: normalizeSize(16),
    flexWrap: "wrap",
    gap: normalizeSize(16),
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  dot: {
    width: normalizeSize(12),
    height: normalizeSize(12),
    borderRadius: normalizeSize(6),
    marginRight: normalizeSize(8),
  },
  legendText: {
    flexShrink: 1,
  },
  label: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: normalizeSize(13),
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: normalizeSize(16),
    marginTop: normalizeSize(2),
  },
};

export default CircleChart;
