import React, {Component} from 'react';
import {Alert, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  HelperText,
  Icon,
  List,
  Modal,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import AppShell from '../../../layouts/AppShell';
import {colors, fonts, normalizeSize} from '../../../styles/basicStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';

// Paleta — alineada con el rediseño tablet.
const BG = '#FAF5EC';
const INK = '#1A130C';
const GOLD = '#F7A928';
const DGOLD = '#C66E00';
const MUTED = '#7E6A52';
const SUBTLE = '#A89580';
const WHITE = '#FFFFFF';
const BORDER_SOFT = '#EFE3D2';
const TINT_GOLD = '#FFF6E1';
const GREEN_BG = '#DCEFE2';
const GREEN_TXT = '#1F8A4C';

/* Datos para pago por transferencia / efectivo. TODO: mover a un endpoint
   de settings editable desde el panel superadmin en vez de hardcodear. */
const PIIDA_BANK_INFO = {
  bank: 'Bancolombia',
  accountType: 'Cuenta de ahorros',
  accountNumber: '123-456789-01',
  holder: 'PIIDA SAS',
  nit: '901.234.567-8',
};
const PIIDA_OFFICE_INFO = {
  address: 'Cra 00 #00-00, Oficina 000',
  city: 'Bogotá',
  hours: 'Lunes a viernes, 8:00 a.m. – 5:00 p.m.',
};

const cop = (v) => {
  const n = Number(v) || 0;
  return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return iso;
  }
};

const STATUS = {
  TRIAL: {txt: 'En prueba', color: '#3B82F6'},
  ACTIVE: {txt: 'Activa', color: '#16A34A'},
  CANCELLED_BY_USER: {txt: 'Cancelada (acceso hasta próximo cobro)', color: '#CA8A04'},
  INACTIVE: {txt: 'Inactiva', color: '#DC2626'},
};

class BillingScreen extends Component {
  state = {
    showAddCard: false,
    cardName: '',
    cardId: '',
    cardMethod: 'VISA',
    cardNumber: '',
    cardExp: '',
    // Modal de método de pago.
    methodPlan: null, // plan elegido para pagar (null = modal cerrado)
    payMethod: 'card', // 'card' | 'transfer' | 'cash'
    intentReference: '',
    intentNotes: '',
    intentDone: false,
  };

  componentDidMount() {
    registerEventScreenMounted(this.props, 'Suscripción', 'BillingScreen');
    this.props.actions.loadAll();
  }

  componentWillUnmount() {
    this.props.actions.clear();
  }

  saveCard = () => {
    const {cardName, cardId, cardMethod, cardNumber, cardExp} = this.state;
    if (!cardName || !cardId || !cardNumber || !cardExp) {
      Alert.alert('Datos faltantes', 'Completá todos los campos.');
      return;
    }
    this.props.actions.tokenizeCard({
      name: cardName,
      identificationNumber: cardId,
      paymentMethod: cardMethod,
      number: cardNumber.replace(/\s+/g, ''),
      expirationDate: cardExp,
    });
    this.setState({
      showAddCard: false,
      cardName: '',
      cardId: '',
      cardNumber: '',
      cardExp: '',
    });
  };

  subscribeTo = (plan) => {
    const isFree = Number(plan.monthlyPriceCop) === 0;
    // Plan gratis: cambio directo con confirmación. Planes pagos: abrir el
    // modal de método de pago (tarjeta / transferencia / efectivo).
    if (isFree) {
      Alert.alert('Cambiar a plan Gratis', '¿Confirmás el cambio a plan Gratis?', [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Continuar',
          onPress: () => this.props.actions.subscribe({planId: plan.id}),
        },
      ]);
      return;
    }
    this.setState({
      methodPlan: plan,
      payMethod: 'card',
      intentReference: '',
      intentNotes: '',
      intentDone: false,
    });
  };

  closeMethodModal = () => this.setState({methodPlan: null});

  payWithCard = () => {
    const {methodPlan} = this.state;
    if (!methodPlan) return;
    if ((this.props.cards || []).length === 0) {
      Alert.alert('Sin tarjeta', "Agregá primero una tarjeta en 'Métodos de pago'.");
      return;
    }
    this.props.actions.subscribe({
      planId: methodPlan.id,
      creditCardId: this.props.cards[0].id,
    });
    this.closeMethodModal();
  };

  submitIntent = (method) => {
    const {methodPlan, intentReference, intentNotes} = this.state;
    if (!methodPlan) return;
    this.props.actions.createPaymentIntent(
      {
        planSlug: methodPlan.slug,
        amount: Number(methodPlan.monthlyPriceCop),
        method,
        reference: intentReference.trim() || undefined,
        notes: intentNotes.trim() || undefined,
      },
      () => this.setState({intentDone: true}),
    );
  };

  confirmCancel = () =>
    Alert.alert(
      'Cancelar suscripción',
      'Conservás acceso hasta el próximo cobro. Después pasás a plan Gratis.',
      [
        {text: 'Volver', style: 'cancel'},
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => this.props.actions.cancelSubscription(),
        },
      ],
    );

  confirmRemove = (card) =>
    Alert.alert(
      'Eliminar tarjeta',
      `¿Eliminar ${card.brand || card.paymentMethod} •••• ${card.last4}?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => this.props.actions.removeCard(card.id),
        },
      ],
    );

  renderSubscription() {
    const {subscription, busy} = this.props;
    if (!subscription) {
      return (
        <View style={styles.heroCard}>
          <Text style={styles.heroEmpty}>
            No tenés suscripción activa. Elegí un plan más abajo.
          </Text>
        </View>
      );
    }
    const st = STATUS[subscription.status] || {txt: subscription.status, color: '#666'};
    const isActive = subscription.status === 'ACTIVE';

    return (
      <View style={styles.heroCard}>
        {/* Pill PLAN ACTIVO / estado */}
        <View style={[styles.heroPill, !isActive && {backgroundColor: st.color}]}>
          <Icon source={isActive ? 'star-four-points' : 'information-outline'} size={12} color={WHITE} />
          <Text style={styles.heroPillTxt}>{isActive ? 'PLAN ACTIVO' : st.txt.toUpperCase()}</Text>
        </View>

        <View style={styles.heroRow}>
          <View style={{flex: 1}}>
            <Text style={styles.heroPlan}>{subscription.plan?.name || 'Plan actual'}</Text>
            <Text style={styles.heroPrice}>
              {cop(subscription.currentValue)}
              <Text style={styles.heroPriceUnit}>/mes</Text>
              {subscription.dueAt ? ` · Próximo cobro ${fmtDate(subscription.dueAt)}` : ''}
            </Text>
          </View>
          <View style={styles.heroActions}>
            <Button
              mode="outlined"
              disabled={busy}
              onPress={() => {
                // Scroll a planes (anchor visual) — el ScrollView ya los muestra.
              }}
              labelStyle={{fontSize: 13}}>
              Cambiar plan
            </Button>
          </View>
        </View>

        {/* Tarjeta asociada */}
        {subscription.creditCard && (
          <View style={styles.heroCardRow}>
            <View style={styles.heroCardIcon}>
              <Icon source="credit-card-outline" size={20} color={DGOLD} />
            </View>
            <View style={{flex: 1, minWidth: 0}}>
              <Text style={styles.heroCardName}>
                {subscription.creditCard.brand || subscription.creditCard.paymentMethod} •••• {subscription.creditCard.last4}
              </Text>
              <Text style={styles.heroCardMeta} numberOfLines={1}>
                Vence {String(subscription.creditCard.expirationMonth || '').padStart(2, '0')}/{subscription.creditCard.expirationYear || ''}
                {subscription.creditCard.cardHolderName ? ` · ${subscription.creditCard.cardHolderName}` : ''}
              </Text>
            </View>
            {isActive && Number(subscription.currentValue) > 0 && (
              <Button
                mode="outlined"
                compact
                disabled={busy}
                onPress={this.confirmCancel}
                labelStyle={{fontSize: 12}}>
                Cancelar suscripción
              </Button>
            )}
          </View>
        )}

        {/* Si fue cancelada, mostrar reanudar */}
        {subscription.status === 'CANCELLED_BY_USER' && (
          <Button
            mode="contained"
            disabled={busy}
            style={{marginTop: 12, alignSelf: 'flex-start'}}
            onPress={() => this.props.actions.resumeSubscription()}>
            Reanudar suscripción
          </Button>
        )}
      </View>
    );
  }

  renderCards() {
    const {cards, busy} = this.props;
    const list = Array.isArray(cards) ? cards : [];
    return (
      <Card mode="outlined" style={styles.card}>
        <Card.Title
          title="Mis tarjetas"
          right={() => (
            <Button
              compact
              uppercase={false}
              icon={this.state.showAddCard ? 'close' : 'plus'}
              disabled={busy}
              onPress={() =>
                this.setState((s) => ({showAddCard: !s.showAddCard}))
              }
              labelStyle={{color: colors.label}}>
              {this.state.showAddCard ? 'Cerrar' : 'Agregar'}
            </Button>
          )}
        />
        <Card.Content>
          {this.state.showAddCard && this.renderAddCardForm()}
          {list.length === 0 ? (
            <Text variant="bodyMedium" style={{color: colors.purplishGrey}}>
              No tenés tarjetas guardadas.
            </Text>
          ) : (
            list.map((c, idx) => (
              <View key={c.id}>
                {idx > 0 && <Divider />}
                <List.Item
                  title={`${c.brand || c.paymentMethod} •••• ${c.last4}`}
                  description={`${c.cardHolderName} · vence ${String(c.expirationMonth).padStart(2, '0')}/${c.expirationYear}`}
                  left={(p) => <List.Icon {...p} icon="credit-card-outline" />}
                  onLongPress={() => this.confirmRemove(c)}
                />
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    );
  }

  renderAddCardForm() {
    const {cardName, cardId, cardMethod, cardNumber, cardExp} = this.state;
    return (
      <View style={styles.addForm}>
        <TextInput
          mode="outlined"
          label="Nombre en la tarjeta"
          value={cardName}
          onChangeText={(v) => this.setState({cardName: v})}
          style={styles.field}
        />
        <TextInput
          mode="outlined"
          label="Cédula"
          keyboardType="number-pad"
          value={cardId}
          onChangeText={(v) => this.setState({cardId: v})}
          style={styles.field}
        />
        <Text variant="bodySmall" style={{marginTop: normalizeSize(8), color: colors.purplishGrey}}>
          Tipo de tarjeta
        </Text>
        <View style={styles.chipsRow}>
          {[
            {value: 'VISA', label: 'Visa'},
            {value: 'MASTERCARD', label: 'Mastercard'},
            {value: 'AMEX', label: 'Amex'},
            {value: 'DINERS', label: 'Diners'},
          ].map((opt) => {
            const active = cardMethod === opt.value;
            return (
              <Chip
                key={opt.value}
                compact
                showSelectedCheck={false}
                onPress={() => this.setState({cardMethod: opt.value})}
                style={[
                  styles.chip,
                  active && {backgroundColor: colors.buttonBackground},
                ]}
                textStyle={{
                  color: active ? '#FFFFFF' : colors.text,
                  fontWeight: active ? 'bold' : 'normal',
                }}>
                {opt.label}
              </Chip>
            );
          })}
        </View>
        <TextInput
          mode="outlined"
          label="Número de tarjeta"
          keyboardType="number-pad"
          value={cardNumber}
          onChangeText={(v) => this.setState({cardNumber: v})}
          style={styles.field}
        />
        <TextInput
          mode="outlined"
          label="Vencimiento (AAAA/MM)"
          placeholder="2030/12"
          value={cardExp}
          onChangeText={(v) => this.setState({cardExp: v})}
          style={styles.field}
        />
        <Button
          mode="contained"
          disabled={this.props.busy}
          loading={this.props.busy}
          onPress={this.saveCard}
          style={{marginTop: normalizeSize(8)}}>
          Guardar tarjeta
        </Button>
      </View>
    );
  }

  // Genera la lista de features visibles para una card del plan.
  // Si el back devuelve `features` (array), lo usa. Si no, deriva del
  // monthly price + maxSalesPerDay (legible para el cajero).
  featuresForPlan(p) {
    if (Array.isArray(p.features) && p.features.length > 0) return p.features;
    const price = Number(p.monthlyPriceCop);
    if (price === 0) {
      return [
        `Hasta ${p.maxSalesPerDay || 30} ventas/día`,
        '1 sucursal',
        'Reportes básicos',
        'Soporte por WhatsApp',
      ];
    }
    if (price < 35000) {
      // Plan Básico
      return [
        'Ventas ilimitadas',
        '1 sucursal',
        'Reportes avanzados',
        'Soporte prioritario',
      ];
    }
    // Plan Estándar
    return [
      'Ventas ilimitadas',
      'Hasta 3 sucursales',
      'Reportes avanzados',
      'Factura electrónica',
      'Soporte prioritario',
    ];
  }

  renderPlans() {
    const {plans, subscription, busy} = this.props;
    const list = Array.isArray(plans) ? plans : [];
    if (list.length === 0) return null;
    return (
      <View>
        <Text style={styles.section}>Planes disponibles</Text>
        <View style={styles.plansRow}>
          {list.map((p) => {
            const isCurrent = subscription?.planId === p.id;
            const price = Number(p.monthlyPriceCop) || 0;
            const isFree = price === 0;
            // Nombres pedidos por el equipo: Gratis (0), Básico (<35k),
            // Estándar (>=35k). No usamos más "Premium" / "Empresa".
            const isBasic = !isFree && price < 35000;
            const isStandard = price >= 35000;
            const features = this.featuresForPlan(p);
            const planLabel = isFree
              ? 'PLAN GRATIS'
              : isBasic
              ? 'PLAN BÁSICO'
              : 'PLAN ESTÁNDAR';

            return (
              <View
                key={p.id}
                style={[
                  styles.planCard,
                  isCurrent && styles.planCardCurrent,
                ]}>
                <Text style={styles.planTag}>{planLabel}</Text>
                <View style={styles.planPriceRow}>
                  <Text style={styles.planPrice}>
                    {isFree ? 'Gratis' : cop(price)}
                  </Text>
                  {!isFree && <Text style={styles.planPriceUnit}>/mes</Text>}
                </View>

                <View style={styles.planFeatures}>
                  {features.map((f, i) => (
                    <View key={i} style={styles.planFeatureRow}>
                      <View style={styles.planCheck}>
                        <Icon source="check" size={12} color={GREEN_TXT} />
                      </View>
                      <Text style={styles.planFeatureTxt}>{f}</Text>
                    </View>
                  ))}
                </View>

                {/* spacer para que los botones queden alineados al fondo */}
                <View style={{flex: 1}} />

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={busy || isCurrent}
                  onPress={() => this.subscribeTo(p)}
                  style={[
                    styles.planBtn,
                    isCurrent ? styles.planBtnCurrent : styles.planBtnAccent,
                  ]}>
                  <Text
                    style={[
                      styles.planBtnTxt,
                      isCurrent ? {color: GREEN_TXT} : {color: WHITE},
                    ]}>
                    {isCurrent ? 'Tu plan actual' : isFree ? 'Cambiar a gratis' : 'Suscribirme'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  renderMethodModal() {
    const {methodPlan, payMethod, intentReference, intentNotes, intentDone} = this.state;
    const {busy, cards} = this.props;
    if (!methodPlan) return null;
    const amount = Number(methodPlan.monthlyPriceCop);
    const cardList = Array.isArray(cards) ? cards : [];

    return (
      <Portal>
        <Modal
          visible
          onDismiss={this.closeMethodModal}
          contentContainerStyle={styles.modalContainer}>
          <ScrollView>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text variant="titleMedium">Pagar {methodPlan.name}</Text>
              <Button compact onPress={this.closeMethodModal} labelStyle={{color: colors.purplishGrey}}>
                Cerrar
              </Button>
            </View>
            <Text variant="bodySmall" style={{color: colors.purplishGrey, marginBottom: normalizeSize(12)}}>
              {cop(amount)} / mes
            </Text>

            {intentDone ? (
              <View style={{alignItems: 'center', paddingVertical: normalizeSize(16)}}>
                <Text variant="bodyMedium" style={{textAlign: 'center', marginBottom: normalizeSize(16)}}>
                  Registramos tu pago. El equipo PIIDA lo verificará y activará tu plan en
                  breve. Te llegará una notificación.
                </Text>
                <Button
                  mode="contained"
                  onPress={() => {
                    this.closeMethodModal();
                    this.props.actions.loadAll();
                  }}>
                  Entendido
                </Button>
              </View>
            ) : (
              <>
                {/* Tabs de método */}
                <View style={styles.chipsRow}>
                  {[
                    {id: 'card', label: 'Tarjeta'},
                    {id: 'transfer', label: 'Transferencia'},
                    {id: 'cash', label: 'Efectivo'},
                  ].map((m) => {
                    const active = payMethod === m.id;
                    return (
                      <Chip
                        key={m.id}
                        compact
                        showSelectedCheck={false}
                        onPress={() => this.setState({payMethod: m.id})}
                        style={[
                          styles.chip,
                          active && {backgroundColor: colors.buttonBackground},
                        ]}
                        textStyle={{
                          color: active ? '#FFFFFF' : colors.text,
                          fontWeight: active ? 'bold' : 'normal',
                        }}>
                        {m.label}
                      </Chip>
                    );
                  })}
                </View>

                {/* Tarjeta */}
                {payMethod === 'card' && (
                  <View style={{marginTop: normalizeSize(8)}}>
                    <Text variant="bodySmall" style={{color: colors.purplishGrey, marginBottom: normalizeSize(12)}}>
                      {cardList.length === 0
                        ? "No tenés tarjetas guardadas. Agregá una en 'Métodos de pago' y volvé a intentar."
                        : `Se cobrará a tu tarjeta ${cardList[0].brand || cardList[0].paymentMethod} •••• ${cardList[0].last4}. El cobro es inmediato.`}
                    </Text>
                    <Button
                      mode="contained"
                      disabled={busy || cardList.length === 0}
                      loading={busy}
                      onPress={this.payWithCard}>
                      Pagar {cop(amount)} con tarjeta
                    </Button>
                  </View>
                )}

                {/* Transferencia */}
                {payMethod === 'transfer' && (
                  <View style={{marginTop: normalizeSize(8)}}>
                    <View style={styles.infoBox}>
                      <Text variant="bodySmall" style={{fontWeight: 'bold'}}>Transferí a esta cuenta:</Text>
                      <Text variant="bodySmall">{PIIDA_BANK_INFO.bank} · {PIIDA_BANK_INFO.accountType}</Text>
                      <Text variant="bodyMedium" style={{fontWeight: 'bold'}}>{PIIDA_BANK_INFO.accountNumber}</Text>
                      <Text variant="bodySmall">{PIIDA_BANK_INFO.holder} · NIT {PIIDA_BANK_INFO.nit}</Text>
                      <Text variant="bodyMedium" style={{fontWeight: 'bold', marginTop: normalizeSize(4)}}>
                        Monto: {cop(amount)}
                      </Text>
                    </View>
                    <TextInput
                      mode="outlined"
                      label="Número de referencia / comprobante"
                      value={intentReference}
                      onChangeText={(v) => this.setState({intentReference: v})}
                      style={styles.field}
                    />
                    <TextInput
                      mode="outlined"
                      label="Nota (opcional)"
                      value={intentNotes}
                      onChangeText={(v) => this.setState({intentNotes: v})}
                      multiline
                      numberOfLines={2}
                      style={styles.field}
                    />
                    <Button
                      mode="contained"
                      disabled={busy}
                      loading={busy}
                      onPress={() => this.submitIntent('TRANSFER')}
                      style={{marginTop: normalizeSize(8)}}>
                      Ya transferí, registrar pago
                    </Button>
                  </View>
                )}

                {/* Efectivo */}
                {payMethod === 'cash' && (
                  <View style={{marginTop: normalizeSize(8)}}>
                    <View style={styles.infoBox}>
                      <Text variant="bodySmall" style={{fontWeight: 'bold'}}>
                        Pagá en efectivo en nuestra oficina:
                      </Text>
                      <Text variant="bodyMedium" style={{fontWeight: 'bold'}}>{PIIDA_OFFICE_INFO.address}</Text>
                      <Text variant="bodySmall">{PIIDA_OFFICE_INFO.city}</Text>
                      <Text variant="bodySmall">{PIIDA_OFFICE_INFO.hours}</Text>
                      <Text variant="bodyMedium" style={{fontWeight: 'bold', marginTop: normalizeSize(4)}}>
                        Monto: {cop(amount)}
                      </Text>
                    </View>
                    <TextInput
                      mode="outlined"
                      label="Nota (opcional)"
                      value={intentNotes}
                      onChangeText={(v) => this.setState({intentNotes: v})}
                      multiline
                      numberOfLines={2}
                      style={styles.field}
                    />
                    <Button
                      mode="contained"
                      disabled={busy}
                      loading={busy}
                      onPress={() => this.submitIntent('CASH')}
                      style={{marginTop: normalizeSize(8)}}>
                      Registrar intención de pago
                    </Button>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </Modal>
      </Portal>
    );
  }

  renderSubHeader() {
    return (
      <View style={styles.subHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.85}
          onPress={() => this.props.navigation.goBack()}>
          <Icon source="chevron-left" size={24} color={INK} />
        </TouchableOpacity>
        <View style={{flex: 1, marginLeft: 8}}>
          <Text style={styles.titleHead}>Suscripción y pagos</Text>
          <Text style={styles.subtitleHead}>Tu plan, tarjetas y facturación</Text>
        </View>
      </View>
    );
  }

  render() {
    const {loading, error} = this.props;
    return (
      <AppShell active="venta">
        <View style={styles.body}>
          {this.renderSubHeader()}
          <ScrollView
            style={{flex: 1}}
            contentContainerStyle={{paddingBottom: 28}}
            showsVerticalScrollIndicator={false}>
            {loading && (
              <ActivityIndicator size="small" color={GOLD} />
            )}
            {error && (
              <HelperText type="error" visible>
                {error}
              </HelperText>
            )}
            {!loading && (
              <>
                {this.renderSubscription()}
                <Text style={styles.section}>Métodos de pago</Text>
                {this.renderCards()}
                {this.renderPlans()}
              </>
            )}
          </ScrollView>
          {this.renderMethodModal()}
        </View>
      </AppShell>
    );
  }
}

const styles = StyleSheet.create({
  body: {flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 12},

  subHeader: {flexDirection: 'row', alignItems: 'center', paddingBottom: 14},
  backBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER_SOFT,
    alignItems: 'center', justifyContent: 'center',
  },
  titleHead: {fontFamily: fonts.bold, fontSize: 22, color: INK, letterSpacing: -0.3},
  subtitleHead: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},

  section: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: INK,
    marginTop: 18,
    marginBottom: 8,
  },

  // Hero card del plan activo (mockup 34)
  heroCard: {
    backgroundColor: TINT_GOLD,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: GOLD,
    padding: 20,
  },
  heroPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    backgroundColor: GOLD,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  heroPillTxt: {fontFamily: fonts.bold, fontSize: 10, color: WHITE, letterSpacing: 0.6},
  heroRow: {flexDirection: 'row', alignItems: 'center', columnGap: 12},
  heroPlan: {fontFamily: fonts.bold, fontSize: 26, color: INK, letterSpacing: -0.5},
  heroPrice: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: DGOLD,
    marginTop: 4,
  },
  heroPriceUnit: {fontFamily: fonts.regular},
  heroActions: {flexDirection: 'row', columnGap: 8},
  heroEmpty: {fontFamily: fonts.regular, fontSize: 14, color: DGOLD},

  heroCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    padding: 12,
    marginTop: 14,
  },
  heroCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: TINT_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCardName: {fontFamily: fonts.bold, fontSize: 14, color: INK},
  heroCardMeta: {fontFamily: fonts.regular, fontSize: 12, color: MUTED, marginTop: 2},

  // Planes disponibles (mockup ref: 3 cards en fila, premium destacado)
  plansRow: {flexDirection: 'row', columnGap: 14, marginTop: 6, marginBottom: 10},
  planCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: BORDER_SOFT,
    padding: 22,
    // flexDirection: 'column' implícito + spacer interno hace que los botones
    // de las tres cards queden alineados en el fondo aunque las listas de
    // features tengan tamaños distintos.
    minHeight: 360,
  },
  planCardCurrent: {
    borderColor: GREEN_TXT,
    borderWidth: 2,
  },
  planTag: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: DGOLD,
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  planPriceRow: {flexDirection: 'row', alignItems: 'baseline', columnGap: 4, marginBottom: 16},
  planPrice: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: INK,
    letterSpacing: -0.5,
  },
  planPriceUnit: {fontFamily: fonts.regular, fontSize: 14, color: MUTED},
  planFeatures: {rowGap: 8, marginBottom: 18},
  planFeatureRow: {flexDirection: 'row', alignItems: 'center', columnGap: 8},
  planCheck: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: GREEN_BG, alignItems: 'center', justifyContent: 'center',
  },
  planFeatureTxt: {flex: 1, fontFamily: fonts.regular, fontSize: 13, color: INK},
  planBtn: {
    paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  planBtnAccent: {backgroundColor: '#FF5A1F'},
  planBtnCurrent: {backgroundColor: GREEN_BG, borderWidth: 1, borderColor: GREEN_TXT},
  planBtnTxt: {fontFamily: fonts.bold, fontSize: 13, color: WHITE},
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: normalizeSize(4),
  },
  currentPlanCard: {
    borderColor: colors.buttonBackground,
    borderWidth: 2,
    backgroundColor: 'rgba(247,169,40,0.06)',
  },
  currentChip: {
    backgroundColor: 'rgba(247,169,40,0.20)',
  },
  addForm: {
    backgroundColor: 'rgba(247,169,40,0.04)',
    padding: normalizeSize(8),
    borderRadius: normalizeSize(6),
    marginBottom: normalizeSize(8),
  },
  field: {
    marginVertical: normalizeSize(4),
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalizeSize(8),
    marginTop: normalizeSize(6),
    marginBottom: normalizeSize(8),
  },
  chip: {
    backgroundColor: '#FFFFFF',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: normalizeSize(20),
    borderRadius: normalizeSize(14),
    padding: normalizeSize(20),
    maxHeight: '85%',
  },
  infoBox: {
    backgroundColor: 'rgba(247,169,40,0.06)',
    borderRadius: normalizeSize(8),
    padding: normalizeSize(12),
    marginBottom: normalizeSize(10),
    gap: normalizeSize(2),
  },
});

export default BillingScreen;
