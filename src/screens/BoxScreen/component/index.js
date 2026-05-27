import React, {Component} from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon, Text} from 'react-native-paper';
import {NumericFormat} from 'react-number-format';
import AppShell from '../../../layouts/AppShell';
import {Shimmer} from '../../../components';
import {fonts} from '../../../styles/basicStyles';
import {fieldErrors} from '../../../utils/screenFunctions';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {fmtDayMonthHourCO} from '../../../utils/dateCO';

// Paleta — alineada con el rediseño tablet.
const BG = '#FAF5EC';
const INK = '#1A130C';
const GOLD = '#F7A928';
const DGOLD = '#C66E00';
const MUTED = '#7E6A52';
const SUBTLE = '#A89580';
const WHITE = '#FFFFFF';
const BORDER_SOFT = '#EFE3D2';
const GREEN_TXT = '#1F8A4C';
const RED = '#D7263D';
const RED_BG = '#FBE0DE';
const SOFT_GOLD = '#FFF1D6';
const TINT_GOLD = '#FFF6E1';

const fmtMoney = (n) =>
  Number(n || 0).toLocaleString('es-CO', {maximumFractionDigits: 0});
const parseMoney = (s) => Number(String(s || '').replace(/[^0-9]/g, '')) || 0;

class BoxScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(this.props, 'Abrir / Cerrar caja', 'BoxScreen');
    this.props.actions.getHistory();
    // Si entramos en modo closeBox sin selección, pre-cargar la tab "Cerrar
    // caja" (es lo más común). Eso dispara getBalance() para mostrar KPIs.
    if (!this.isOpenMode && !this.props.select) {
      this.setMode('close');
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.cashShiftActiveId !== this.props.cashShiftActiveId) {
      this.props.actions.getHistory();
    }
  }

  componentWillUnmount() {
    this.props.actions.clearScreen();
  }

  get isOpenMode() {
    return this.props.route.params?.type === 'openBox';
  }

  get mode() {
    // 'open' | 'close' | 'loan'
    if (this.isOpenMode) return 'open';
    return this.props.select?.value || null; // null hasta que el cajero elige tab
  }

  setMode = (value) => {
    // En closeBox, el componente arranca sin select. Al tocar una tab,
    // dispatch selectChange(option) para que las actions submit() reciban
    // el tipo correcto.
    this.props.actions.selectChange({
      label: value === 'close' ? 'Cerrar caja' : 'Agregar dinero a la caja',
      value,
    });
  };

  // ── Submit ────────────────────────────────────────────────
  submit = () => {
    const type = this.props.route.params?.type;
    this.props.actions.submit({
      money: this.props.money,
      navigation: this.props.navigation,
      uid: this.props.user.uid,
      nid: type === 'openBox' ? null : this.props.cashShiftActiveId,
      type: type === 'openBox' ? 'open' : this.props.select?.value,
    });
  };

  // ── Sub-header ────────────────────────────────────────────
  renderSubHeader() {
    const isOpen = this.isOpenMode;
    const fullName = `${this.props.user?.names || ''} ${this.props.user?.last_names || ''}`.trim();
    const branch = this.props.user?.branch_office_name || '';
    const sub = isOpen
      ? 'Iniciá un nuevo turno'
      : [branch && `Cuadrá el turno · ${branch}`, fullName].filter(Boolean).join(' · ');
    return (
      <View style={st.subHeader}>
        <TouchableOpacity
          style={st.backBtn}
          activeOpacity={0.85}
          onPress={() => this.props.navigation.goBack()}>
          <Icon source="chevron-left" size={24} color={INK} />
        </TouchableOpacity>
        <View style={{flex: 1, marginLeft: 8}}>
          <Text style={st.title}>{isOpen ? 'Abrir caja' : 'Cerrar caja'}</Text>
          {!!sub && <Text style={st.subtitle} numberOfLines={1}>{sub}</Text>}
        </View>
      </View>
    );
  }

  // ── Tabs (sólo closeBox) ─────────────────────────────────
  renderTabs() {
    if (this.isOpenMode) return null;
    const m = this.mode;
    return (
      <View style={st.tabsRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[st.tab, m === 'close' && st.tabActive]}
          onPress={() => this.setMode('close')}>
          <Text style={[st.tabTitle, m === 'close' && st.tabTitleActive]}>Cerrar caja</Text>
          <Text style={[st.tabSub, m === 'close' && st.tabSubActive]}>Finalizar el turno</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[st.tab, m === 'loan' && st.tabActive]}
          onPress={() => this.setMode('loan')}>
          <Text style={[st.tabTitle, m === 'loan' && st.tabTitleActive]}>Agregar dinero</Text>
          <Text style={[st.tabSub, m === 'loan' && st.tabSubActive]}>Préstamo a la caja</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── KPIs del cierre (solo close + balance cargado) ───────
  renderKpis() {
    const b = this.props.balance?.cash;
    if (!b) return null;
    const cards = [
      {label: 'BASE', value: b.base_money, color: GREEN_TXT},
      {label: 'VENTAS', value: b.sales, color: GREEN_TXT},
      {label: 'GASTOS', value: b.expenses, color: (b.expenses || 0) > 0 ? RED : INK},
      {label: 'PRÉSTAMOS', value: b.loans, color: GREEN_TXT},
    ];
    return (
      <View style={st.kpiRow}>
        {cards.map((c) => (
          <View key={c.label} style={st.kpi}>
            <Text style={st.kpiLabel}>{c.label}</Text>
            <NumericFormat
              value={c.value || 0}
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="$"
              renderText={(v) => <Text style={[st.kpiValue, {color: c.color}]}>{v}</Text>}
            />
          </View>
        ))}
      </View>
    );
  }

  // ── Card de descuadre (solo close + monto ingresado) ────
  renderMismatch() {
    if (this.mode !== 'close') return null;
    const expected = Number(this.props.balance?.cash?.total) || 0;
    const entered = parseMoney(this.props.money);
    if (!this.props.money || entered === 0 || expected === 0) return null;
    const diff = entered - expected;
    if (diff === 0) {
      return (
        <View style={[st.alert, {backgroundColor: '#DCEFE2', borderColor: '#B7DEC4'}]}>
          <Icon source="check-circle-outline" size={20} color={GREEN_TXT} />
          <View style={{flex: 1}}>
            <Text style={[st.alertTitle, {color: GREEN_TXT}]}>No hay descuadres</Text>
            <Text style={st.alertSub}>El efectivo coincide con el balance esperado.</Text>
          </View>
        </View>
      );
    }
    const short = diff < 0;
    return (
      <View style={[st.alert, short ? st.alertShort : st.alertOver]}>
        <Icon source="alert-circle-outline" size={20} color={short ? RED : DGOLD} />
        <View style={{flex: 1}}>
          <NumericFormat
            value={Math.abs(diff)}
            displayType="text"
            thousandSeparator="."
            decimalSeparator=","
            prefix="$"
            renderText={(v) => (
              <Text style={[st.alertTitle, {color: short ? RED : DGOLD}]}>
                {short ? `Faltan ${v}` : `Sobran ${v}`}
              </Text>
            )}
          />
          <Text style={st.alertSub}>
            {short
              ? 'El efectivo es menor al esperado. Podés cerrar igual.'
              : 'El efectivo es mayor al esperado. Podés cerrar igual.'}
          </Text>
        </View>
      </View>
    );
  }

  // ── Input efectivo ───────────────────────────────────────
  renderMoneyInput(labelOverride) {
    const err = fieldErrors('money', this.props.errors);
    const isClose = this.mode === 'close';
    const label =
      labelOverride ||
      (this.isOpenMode
        ? 'Ingresá la cantidad de dinero con la que iniciás tu turno'
        : isClose
        ? 'Ingresá el monto en efectivo que tenés en caja'
        : 'Ingresá el monto que querés agregar a la caja');
    return (
      <View>
        <Text style={st.inputLabel}>{label}</Text>
        <View style={[st.moneyInputWrap, err && {borderColor: RED}]}>
          <Text style={st.moneyPrefix}>$</Text>
          <TextInput
            style={st.moneyInput}
            placeholder="0"
            placeholderTextColor={SUBTLE}
            value={this.props.money ? String(this.props.money).replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
            onChangeText={(t) => this.props.actions.moneyChange(t)}
            keyboardType="numeric"
            underlineColorAndroid="transparent"
          />
        </View>
        {!!err && <Text style={st.fieldError}>{err}</Text>}
      </View>
    );
  }

  // ── Botón principal ──────────────────────────────────────
  renderCTA() {
    let label = 'Iniciar turno';
    if (!this.isOpenMode) {
      if (this.mode === 'loan') label = 'Agregar dinero';
      else if (this.mode === 'close') label = 'Finalizar turno';
      else return null; // sin select aún
    }
    return (
      <TouchableOpacity activeOpacity={0.9} style={st.ctaBtn} onPress={this.submit}>
        <Icon source="check" size={20} color={WHITE} />
        <Text style={st.ctaTxt}>{label}</Text>
      </TouchableOpacity>
    );
  }

  // ── Panel principal ─────────────────────────────────────
  renderMainPanel() {
    const isOpen = this.isOpenMode;
    const m = this.mode;
    const balanceLoading = !isOpen && m === 'close' && !this.props.balance;

    return (
      <View style={st.mainPanel}>
        {this.renderTabs()}

        {/* Open box: input + CTA */}
        {isOpen && (
          <View style={{rowGap: 20}}>
            {this.renderMoneyInput()}
            {this.renderCTA()}
          </View>
        )}

        {/* Close box: balance esperado + KPIs + input + alerta + CTA */}
        {!isOpen && m === 'close' && (
          balanceLoading ? (
            <View style={{rowGap: 12}}>
              <Shimmer style={{borderRadius: 12}} height={80} width={'100%'} />
              <Shimmer style={{borderRadius: 12}} height={120} width={'100%'} />
              <Shimmer style={{borderRadius: 12}} height={80} width={'100%'} />
            </View>
          ) : (
            <View style={{rowGap: 18}}>
              <View>
                <Text style={st.balanceLabel}>BALANCE ESPERADO EN EFECTIVO</Text>
                <NumericFormat
                  value={this.props.balance?.cash?.total || 0}
                  displayType="text"
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="$"
                  renderText={(v) => <Text style={st.balanceValue}>{v}</Text>}
                />
              </View>
              {this.renderKpis()}
              {this.renderMoneyInput()}
              {this.renderMismatch()}
              {this.renderCTA()}
            </View>
          )
        )}

        {/* Loan: input + CTA */}
        {!isOpen && m === 'loan' && (
          <View style={{rowGap: 20, marginTop: 4}}>
            {this.renderMoneyInput()}
            {this.renderCTA()}
          </View>
        )}

        {/* closeBox sin select: hint */}
        {!isOpen && !m && (
          <View style={st.hint}>
            <Icon source="hand-pointing-up" size={28} color={DGOLD} />
            <Text style={st.hintTxt}>Elegí una opción arriba para continuar</Text>
          </View>
        )}
      </View>
    );
  }

  // ── Sidebar derecho: historial de turnos ─────────────────
  renderHistoryItem(r, i) {
    // Fechas forzadas a TZ Colombia — el back devuelve ISO UTC y la tablet
    // podría tener TZ stale del dispositivo.
    const opened = r.opened_at ? fmtDayMonthHourCO(r.opened_at) : '—';
    const closed = r.closed_at ? fmtDayMonthHourCO(r.closed_at) : null;
    const active = !r.closed_at;
    const mismatch = Number(r.mismatch || 0);
    return (
      <View key={`h_${i}`} style={st.histCard}>
        <View style={{flex: 1, minWidth: 0}}>
          <Text style={st.histTitle}>Turno #{r.nid}</Text>
          <Text style={st.histMeta} numberOfLines={1}>{r.author || 'Cajero'}</Text>
          <Text style={st.histDates}>
            Apertura {opened}{closed ? ` · Cierre ${closed}` : ''}
          </Text>
        </View>
        {active ? (
          <View style={st.histBadgeActive}>
            <Text style={st.histBadgeActiveTxt}>EN CURSO</Text>
          </View>
        ) : mismatch === 0 ? (
          <View style={st.histBadgeOk}>
            <Text style={st.histBadgeOkTxt}>Cuadrada</Text>
          </View>
        ) : (
          <NumericFormat
            value={Math.abs(mismatch)}
            displayType="text"
            thousandSeparator="."
            decimalSeparator=","
            prefix={mismatch < 0 ? '−$' : '+$'}
            renderText={(v) => (
              <Text style={[st.histAmount, {color: mismatch < 0 ? RED : GREEN_TXT}]}>
                {v}
              </Text>
            )}
          />
        )}
      </View>
    );
  }

  renderSidebar() {
    const list = this.props.history;
    const count = list?.length || 0;
    return (
      <View style={st.sidebar}>
        <Text style={st.sideTitle}>HISTORIAL DE TURNOS</Text>
        <Text style={st.sideSub}>{count > 0 ? `Últimos ${Math.min(count, 4)}` : 'Sin turnos'}</Text>
        <View style={{marginTop: 12, rowGap: 10}}>
          {list == null ? (
            Array.from({length: 4}).map((_, i) => (
              <Shimmer key={i} style={{borderRadius: 12}} height={68} width={'100%'} />
            ))
          ) : list.length === 0 ? (
            <View style={st.sideEmpty}>
              <Icon source="history" size={28} color={SUBTLE} />
              <Text style={st.sideEmptyTxt}>No hay turnos registrados</Text>
            </View>
          ) : (
            list.slice(0, 4).map((r, i) => this.renderHistoryItem(r, i))
          )}
        </View>
      </View>
    );
  }

  render() {
    return (
      <AppShell active="venta">
        <View style={st.body}>
          {this.renderSubHeader()}
          <ScrollView
            contentContainerStyle={{paddingBottom: 28}}
            showsVerticalScrollIndicator={false}>
            <View style={st.split}>
              <View style={st.leftCol}>{this.renderMainPanel()}</View>
              <View style={st.rightCol}>{this.renderSidebar()}</View>
            </View>
          </ScrollView>
        </View>
      </AppShell>
    );
  }
}

const st = StyleSheet.create({
  body: {flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 12},

  // ── Sub-header ──
  subHeader: {flexDirection: 'row', alignItems: 'center', paddingBottom: 14},
  backBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {fontFamily: fonts.bold, fontSize: 22, color: INK, letterSpacing: -0.3},
  subtitle: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},

  // ── Split ──
  split: {flexDirection: 'row', columnGap: 14},
  leftCol: {flex: 1.6},
  rightCol: {flex: 1},

  // ── Main panel ──
  mainPanel: {
    backgroundColor: WHITE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER_SOFT,
    padding: 18,
  },

  // Tabs Cerrar caja / Agregar dinero
  tabsRow: {flexDirection: 'row', columnGap: 10, marginBottom: 18},
  tab: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 12, borderWidth: 1.5, borderColor: BORDER_SOFT,
    paddingVertical: 12, paddingHorizontal: 14,
  },
  tabActive: {borderColor: GOLD, backgroundColor: TINT_GOLD},
  tabTitle: {fontFamily: fonts.bold, fontSize: 13, color: INK},
  tabTitleActive: {color: DGOLD},
  tabSub: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginTop: 2},
  tabSubActive: {color: DGOLD},

  // Balance esperado
  balanceLabel: {
    fontFamily: fonts.bold, fontSize: 10, color: MUTED, letterSpacing: 1.2,
  },
  balanceValue: {
    fontFamily: fonts.bold, fontSize: 34, color: INK, letterSpacing: -1, marginTop: 4,
  },

  // KPIs
  kpiRow: {flexDirection: 'row', columnGap: 14},
  kpi: {flex: 1},
  kpiLabel: {fontFamily: fonts.bold, fontSize: 10, color: MUTED, letterSpacing: 0.8, marginBottom: 3},
  kpiValue: {fontFamily: fonts.bold, fontSize: 15, color: INK},

  // Input efectivo
  inputLabel: {fontFamily: fonts.semiBold, fontSize: 13, color: INK, marginBottom: 8},
  moneyInputWrap: {
    flexDirection: 'row', alignItems: 'center', columnGap: 8,
    backgroundColor: WHITE, borderRadius: 14, borderWidth: 2, borderColor: GOLD,
    paddingHorizontal: 18, height: 64,
  },
  moneyPrefix: {fontFamily: fonts.bold, fontSize: 26, color: DGOLD},
  moneyInput: {
    flex: 1, fontFamily: fonts.bold, fontSize: 30, color: INK,
    paddingVertical: 0, padding: 0,
  },
  fieldError: {fontFamily: fonts.regular, fontSize: 11, color: RED, marginTop: 6, marginLeft: 4},

  // Alerta descuadre
  alert: {
    flexDirection: 'row', alignItems: 'center', columnGap: 12,
    borderRadius: 12, borderWidth: 1, padding: 14,
  },
  alertShort: {backgroundColor: RED_BG, borderColor: '#F1B4B0'},
  alertOver: {backgroundColor: SOFT_GOLD, borderColor: '#F0D08A'},
  alertTitle: {fontFamily: fonts.bold, fontSize: 14},
  alertSub: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},

  // CTA finalizar
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    columnGap: 10, backgroundColor: INK, borderRadius: 14, paddingVertical: 16,
  },
  ctaTxt: {fontFamily: fonts.bold, fontSize: 15, color: WHITE},

  hint: {
    flexDirection: 'row', alignItems: 'center', columnGap: 10,
    backgroundColor: TINT_GOLD, borderRadius: 12, padding: 14,
  },
  hintTxt: {flex: 1, fontFamily: fonts.semiBold, fontSize: 13, color: DGOLD},

  // ── Sidebar histórico ──
  sidebar: {
    backgroundColor: WHITE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER_SOFT,
    padding: 18,
  },
  sideTitle: {fontFamily: fonts.bold, fontSize: 10, color: DGOLD, letterSpacing: 1.2},
  sideSub: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},

  histCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: BG, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, columnGap: 10,
  },
  histTitle: {fontFamily: fonts.bold, fontSize: 13, color: INK},
  histMeta: {fontFamily: fonts.regular, fontSize: 11, color: MUTED, marginTop: 2},
  histDates: {fontFamily: fonts.regular, fontSize: 10, color: SUBTLE, marginTop: 2},

  histBadgeActive: {
    backgroundColor: GOLD, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  histBadgeActiveTxt: {fontFamily: fonts.bold, fontSize: 10, color: WHITE, letterSpacing: 0.6},
  histBadgeOk: {
    backgroundColor: '#DCEFE2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  histBadgeOkTxt: {fontFamily: fonts.bold, fontSize: 10, color: GREEN_TXT, letterSpacing: 0.4},
  histAmount: {fontFamily: fonts.bold, fontSize: 13},

  sideEmpty: {alignItems: 'center', paddingVertical: 24, rowGap: 8},
  sideEmptyTxt: {fontFamily: fonts.regular, fontSize: 12, color: MUTED},
});

export default BoxScreen;
