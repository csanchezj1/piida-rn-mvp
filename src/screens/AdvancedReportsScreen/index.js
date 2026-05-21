import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View, Alert} from 'react-native';
import {ActivityIndicator, Button, Card, Divider, Text} from 'react-native-paper';
import {useSelector} from 'react-redux';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {Layout} from '../../layouts';
import {colors, fonts, normalizeSize} from '../../styles/basicStyles';
import Reports from '../../api/reports';

const cop = (n) => {
  const v = Math.round(Number(n) || 0);
  return '$' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Variación porcentual entre el período actual y el anterior.
const pct = (cur, prev) => {
  if (!prev) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
};

const AdvancedReportsScreen = () => {
  const {user, password} = useSelector((s) => s.userData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [exporting, setExporting] = useState(false);
  // Tips IA: fetch separado porque la llamada a Claude tarda unos segundos.
  const [aiTips, setAiTips] = useState(null); // {available, tips} | null
  const [aiLoading, setAiLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Reports.getAdvanced({email: user?.email, password})
      .then((res) => setData(res))
      .catch((e) => setError(e?.data?.message || 'No se pudo cargar el reporte.'))
      .finally(() => setLoading(false));

    setAiLoading(true);
    Reports.getAiTips({email: user?.email, password})
      .then((res) => setAiTips(res))
      .catch(() => setAiTips({available: false, tips: null}))
      .finally(() => setAiLoading(false));
  }, [user, password]);

  useEffect(() => {
    load();
  }, [load]);

  // F4.14 — exporta el reporte como CSV y abre el share sheet.
  const exportCsv = async () => {
    if (!data) return;
    setExporting(true);
    try {
      const lines = [];
      lines.push('PIIDA — Reporte avanzado');
      const k = data.kpis || {};
      lines.push('');
      lines.push('INDICADOR,VALOR,PERIODO ANTERIOR');
      lines.push(`Ventas,${k.total_sales ?? 0},${k.prev_total_sales ?? 0}`);
      lines.push(`Gastos,${k.total_expenses ?? 0},${k.prev_total_expenses ?? 0}`);
      lines.push(`Utilidad,${k.net_profit ?? 0},`);
      lines.push(`Ticket promedio,${k.avg_ticket ?? 0},`);
      lines.push(`Transacciones,${k.total_transactions ?? 0},${k.prev_total_transactions ?? 0}`);
      lines.push('');
      lines.push('TOP PRODUCTOS,UNIDADES VENDIDAS');
      (data.top_products || []).forEach((p) => {
        lines.push(`${(p.product_name || '').replace(/,/g, ' ')},${p.quantity_sold}`);
      });
      lines.push('');
      lines.push('CATEGORIA,INGRESO,COSTO,MARGEN,MARGEN %');
      (data.margin_by_category || []).forEach((c) => {
        lines.push(
          `${(c.category || '').replace(/,/g, ' ')},${c.revenue},${c.cost},${c.margin},${c.margin_pct}`,
        );
      });
      // BOM UTF-8 para que Excel respete tildes.
      const csv = '﻿' + lines.join('\n');
      const path = `${RNFS.CachesDirectoryPath}/reporte-piida-${Date.now()}.csv`;
      await RNFS.writeFile(path, csv, 'utf8');
      await Share.open({
        url: 'file://' + path,
        type: 'text/csv',
        filename: 'reporte-piida',
        failOnCancel: false,
      });
    } catch (e) {
      // El usuario puede cancelar el share — no es un error real.
      if (!String(e?.message || '').includes('User did not share')) {
        Alert.alert('Error', 'No se pudo exportar el reporte.');
      }
    } finally {
      setExporting(false);
    }
  };

  // F4.14 — exporta el reporte como PDF y abre el share sheet.
  const exportPdf = async () => {
    if (!data) return;
    setExporting(true);
    try {
      const k = data.kpis || {};
      const row = (label, val, extra) =>
        `<tr><td>${label}</td><td style="text-align:right;font-weight:bold">${val}</td><td style="text-align:right;color:#888">${extra || ''}</td></tr>`;
      const topRows = (data.top_products || [])
        .map((p) => `<tr><td>${p.rank}. ${p.product_name}</td><td style="text-align:right">${p.quantity_sold} und</td></tr>`)
        .join('');
      const marginRows = (data.margin_by_category || [])
        .map((c) => `<tr><td>${c.category}</td><td style="text-align:right">${cop(c.margin)}</td><td style="text-align:right">${c.margin_pct}%</td></tr>`)
        .join('');
      const cohortRows = (data.cohorts || [])
        .map((c) => {
          const n = c.retention?.[1];
          return `<tr><td>${c.cohort}</td><td style="text-align:right">${c.size}</td><td style="text-align:right">${n ? n.pct + '%' : '—'}</td></tr>`;
        })
        .join('');
      const aiBlock =
        aiTips && aiTips.tips
          ? `<div style="background:#FFF6E5;border-left:4px solid #F7A928;padding:10px;margin:12px 0;font-size:12px">${aiTips.tips.replace(/\n/g, '<br/>')}</div>`
          : '';
      const html = `<html><head><meta charset="utf-8"/><style>
        body{font-family:Helvetica,Arial,sans-serif;color:#1A1410;padding:24px}
        h1{font-size:20px;margin:0 0 2px} h2{font-size:14px;color:#E88304;margin:18px 0 6px}
        .sub{color:#888;font-size:11px;margin-bottom:8px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        td{padding:6px 4px;border-bottom:1px solid #eee}
      </style></head><body>
        <h1>PIIDA — Reporte avanzado</h1>
        <div class="sub">Generado ${new Date().toLocaleString('es-CO')}</div>
        ${aiBlock}
        <h2>Resumen del período</h2>
        <table>
          ${row('Ventas', cop(k.total_sales), 'ant: ' + cop(k.prev_total_sales))}
          ${row('Gastos', cop(k.total_expenses), 'ant: ' + cop(k.prev_total_expenses))}
          ${row('Utilidad', cop(k.net_profit), '')}
          ${row('Ticket promedio', cop(k.avg_ticket), '')}
          ${row('Transacciones', k.total_transactions ?? 0, '')}
        </table>
        <h2>Productos más vendidos</h2>
        <table>${topRows || '<tr><td>Sin datos</td></tr>'}</table>
        <h2>Margen por categoría</h2>
        <table>${marginRows || '<tr><td>Sin datos</td></tr>'}</table>
        <h2>Retención de clientes (cohortes)</h2>
        <table><tr><td><b>Cohorte</b></td><td style="text-align:right"><b>Nuevos</b></td><td style="text-align:right"><b>Mes+1</b></td></tr>${cohortRows || '<tr><td>Sin datos</td></tr>'}</table>
      </body></html>`;

      const pdf = await RNHTMLtoPDF.convert({
        html,
        fileName: 'reporte-piida-' + Date.now(),
        directory: 'Documents',
      });
      if (!pdf.filePath) throw new Error('No se generó el PDF');
      await Share.open({
        url: 'file://' + pdf.filePath,
        type: 'application/pdf',
        filename: 'reporte-piida',
        failOnCancel: false,
      });
    } catch (e) {
      if (!String(e?.message || '').includes('User did not share')) {
        Alert.alert('Error', 'No se pudo exportar el PDF.');
      }
    } finally {
      setExporting(false);
    }
  };

  const renderKpis = () => {
    const k = data?.kpis;
    if (!k) return null;
    const rows = [
      {label: 'Ventas', value: k.total_sales, prev: k.prev_total_sales},
      {label: 'Gastos', value: k.total_expenses, prev: k.prev_total_expenses},
      {label: 'Utilidad', value: k.net_profit, prev: null},
      {label: 'Ticket promedio', value: k.avg_ticket, prev: null},
    ];
    return (
      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.cardTitle}>
            Resumen del período
          </Text>
          {rows.map((r, i) => {
            const variation = r.prev != null ? pct(r.value, r.prev) : null;
            return (
              <View key={i}>
                {i > 0 && <Divider />}
                <View style={styles.kpiRow}>
                  <Text style={styles.kpiLabel}>{r.label}</Text>
                  <View style={{alignItems: 'flex-end'}}>
                    <Text style={styles.kpiValue}>{cop(r.value)}</Text>
                    {variation != null && (
                      <Text
                        style={[
                          styles.kpiVariation,
                          {color: variation >= 0 ? colors.success : colors.carmine},
                        ]}>
                        {variation >= 0 ? '▲' : '▼'} {Math.abs(variation)}% vs período anterior
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </Card.Content>
      </Card>
    );
  };

  const renderTopProducts = () => {
    const list = data?.top_products || [];
    return (
      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.cardTitle}>
            Productos más vendidos
          </Text>
          {list.length === 0 ? (
            <Text style={styles.empty}>Sin ventas en el período.</Text>
          ) : (
            list.map((p, i) => (
              <View key={i}>
                {i > 0 && <Divider />}
                <View style={styles.kpiRow}>
                  <Text style={styles.kpiLabel} numberOfLines={1}>
                    {p.rank}. {p.product_name}
                  </Text>
                  <Text style={styles.kpiValue}>{p.quantity_sold} und</Text>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderMargin = () => {
    const list = data?.margin_by_category || [];
    return (
      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.cardTitle}>
            Margen por categoría
          </Text>
          {list.length === 0 ? (
            <Text style={styles.empty}>Sin datos de margen.</Text>
          ) : (
            list.map((c, i) => (
              <View key={i}>
                {i > 0 && <Divider />}
                <View style={styles.marginRow}>
                  <Text style={styles.kpiLabel} numberOfLines={1}>
                    {c.category}
                  </Text>
                  <View style={{alignItems: 'flex-end'}}>
                    <Text style={styles.kpiValue}>{cop(c.margin)}</Text>
                    <Text style={styles.kpiVariation}>
                      {c.margin_pct}% margen · {cop(c.revenue)} ingreso
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    );
  };

  // Resumen del período generado por IA (Claude). Card destacada arriba.
  const renderAiTips = () => {
    if (aiLoading) {
      return (
        <Card mode="outlined" style={[styles.card, styles.aiCard]}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.aiTitle}>✨ Resumen inteligente</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: normalizeSize(6)}}>
              <ActivityIndicator size="small" color={colors.buttonBackground} />
              <Text style={[styles.kpiVariation, {marginLeft: normalizeSize(8)}]}>
                Analizando tu período…
              </Text>
            </View>
          </Card.Content>
        </Card>
      );
    }
    // Si no hay API key configurada, ocultamos la card (no estorba).
    if (!aiTips || !aiTips.available || !aiTips.tips) return null;
    return (
      <Card mode="outlined" style={[styles.card, styles.aiCard]}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.aiTitle}>✨ Resumen inteligente</Text>
          <Text style={styles.aiText}>{aiTips.tips}</Text>
        </Card.Content>
      </Card>
    );
  };

  // Análisis de cohortes: por cada mes de alta de clientes, qué % volvió.
  const renderCohorts = () => {
    const list = data?.cohorts || [];
    const monthName = (ym) => {
      const [y, m] = (ym || '').split('-');
      const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return m ? `${meses[parseInt(m, 10) - 1]} ${y}` : ym;
    };
    return (
      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.cardTitle}>
            Retención de clientes (cohortes)
          </Text>
          {list.length === 0 ? (
            <Text style={styles.empty}>
              Sin datos. Las cohortes se calculan con ventas que tienen cliente asignado.
            </Text>
          ) : (
            list.map((c, i) => {
              // retention[0] = mes de alta (100%); el siguiente es la retención.
              const next = c.retention?.[1];
              const m2 = c.retention?.[2];
              return (
                <View key={i}>
                  {i > 0 && <Divider />}
                  <View style={styles.kpiRow}>
                    <Text style={styles.kpiLabel} numberOfLines={1}>
                      {monthName(c.cohort)}
                    </Text>
                    <View style={{alignItems: 'flex-end'}}>
                      <Text style={styles.kpiValue}>{c.size} clientes nuevos</Text>
                      <Text style={styles.kpiVariation}>
                        {next ? `${next.pct}% volvió al mes siguiente` : 'aún sin mes siguiente'}
                        {m2 ? ` · ${m2.pct}% a los 2 meses` : ''}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <Layout hideLogo title="Reportes" subtitle="avanzados">
      <ScrollView
        style={{width: '100%'}}
        contentContainerStyle={{
          paddingHorizontal: normalizeSize(16),
          paddingBottom: normalizeSize(40),
        }}>
        {loading && (
          <ActivityIndicator
            size="large"
            color={colors.buttonBackground}
            style={{marginTop: normalizeSize(40)}}
          />
        )}
        {!loading && error && (
          <Text style={[styles.empty, {marginTop: normalizeSize(40)}]}>{error}</Text>
        )}
        {!loading && !error && data && (
          <>
            {renderAiTips()}
            {renderKpis()}
            {renderTopProducts()}
            {renderMargin()}
            {renderCohorts()}
            <View style={{flexDirection: 'row', gap: normalizeSize(10), marginTop: normalizeSize(12)}}>
              <Button
                mode="outlined"
                icon="file-delimited"
                loading={exporting}
                disabled={exporting}
                onPress={exportCsv}
                style={{flex: 1}}
                contentStyle={{paddingVertical: normalizeSize(4)}}>
                CSV
              </Button>
              <Button
                mode="contained"
                icon="file-pdf-box"
                loading={exporting}
                disabled={exporting}
                onPress={exportPdf}
                style={{flex: 1}}
                contentStyle={{paddingVertical: normalizeSize(4)}}>
                PDF
              </Button>
            </View>
          </>
        )}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginTop: normalizeSize(12),
  },
  cardTitle: {
    fontFamily: fonts.bold,
    color: colors.buttonBackground,
    marginBottom: normalizeSize(8),
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalizeSize(8),
  },
  marginRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalizeSize(8),
  },
  kpiLabel: {
    fontFamily: fonts.regular,
    fontSize: normalizeSize(14),
    color: colors.text,
    flex: 1,
    paddingRight: normalizeSize(8),
  },
  kpiValue: {
    fontFamily: fonts.bold,
    fontSize: normalizeSize(14),
    color: colors.text,
  },
  kpiVariation: {
    fontFamily: fonts.regular,
    fontSize: normalizeSize(11),
    color: colors.purplishGrey,
    marginTop: 2,
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: normalizeSize(13),
    color: colors.purplishGrey,
    textAlign: 'center',
    paddingVertical: normalizeSize(12),
  },
  aiCard: {
    backgroundColor: 'rgba(247,169,40,0.08)',
    borderColor: colors.buttonBackground,
  },
  aiTitle: {
    fontFamily: fonts.bold,
    color: colors.buttonBackground,
    marginBottom: normalizeSize(4),
  },
  aiText: {
    fontFamily: fonts.regular,
    fontSize: normalizeSize(13),
    color: colors.text,
    lineHeight: normalizeSize(20),
  },
});

export default AdvancedReportsScreen;
