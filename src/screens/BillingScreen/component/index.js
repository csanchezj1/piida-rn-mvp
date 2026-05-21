import React, {Component} from 'react';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  HelperText,
  List,
  Modal,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import {Layout} from '../../../layouts';
import {colors, normalizeSize} from '../../../styles/basicStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';

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
        <Card mode="outlined" style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium" style={{color: colors.purplishGrey}}>
              No tenés suscripción activa. Elegí un plan más abajo.
            </Text>
          </Card.Content>
        </Card>
      );
    }
    const st = STATUS[subscription.status] || {txt: subscription.status, color: '#666'};

    return (
      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <View style={{flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'}}>
            <Text variant="headlineSmall" style={{marginRight: normalizeSize(8)}}>
              {subscription.plan?.name || 'Plan actual'}
            </Text>
            <Chip
              compact
              style={{backgroundColor: st.color + '22'}}
              textStyle={{color: st.color, fontSize: normalizeSize(11)}}>
              {st.txt}
            </Chip>
          </View>
          <List.Item
            title={cop(subscription.currentValue)}
            description="Valor actual"
            left={(p) => <List.Icon {...p} icon="cash" />}
            style={{paddingLeft: 0}}
          />
          <List.Item
            title={fmtDate(subscription.dueAt)}
            description="Próximo cobro"
            left={(p) => <List.Icon {...p} icon="calendar" />}
            style={{paddingLeft: 0}}
          />
          {subscription.creditCard && (
            <List.Item
              title={`${subscription.creditCard.brand || subscription.creditCard.paymentMethod} •••• ${subscription.creditCard.last4}`}
              description="Tarjeta"
              left={(p) => <List.Icon {...p} icon="credit-card-outline" />}
              style={{paddingLeft: 0}}
            />
          )}
          <View style={{flexDirection: 'row', marginTop: normalizeSize(8), gap: normalizeSize(8)}}>
            {subscription.status === 'ACTIVE' &&
              Number(subscription.currentValue) > 0 && (
                <Button
                  mode="outlined"
                  disabled={busy}
                  onPress={this.confirmCancel}>
                  Cancelar
                </Button>
              )}
            {subscription.status === 'CANCELLED_BY_USER' && (
              <Button
                mode="contained"
                disabled={busy}
                onPress={() => this.props.actions.resumeSubscription()}>
                Reanudar
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
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

  renderPlans() {
    const {plans, subscription, busy} = this.props;
    const list = Array.isArray(plans) ? plans : [];
    return (
      <>
        <Text variant="titleSmall" style={styles.section}>
          Planes disponibles
        </Text>
        {list.map((p) => {
          const isCurrent = subscription?.planId === p.id;
          const isFree = Number(p.monthlyPriceCop) === 0;
          return (
            <Card
              key={p.id}
              mode="outlined"
              style={[styles.card, isCurrent && styles.currentPlanCard]}>
              <Card.Content>
                <View style={{flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'}}>
                  <Text variant="titleMedium" style={{marginRight: normalizeSize(8)}}>
                    {p.name}
                  </Text>
                  {isCurrent && (
                    <Chip compact mode="flat" style={styles.currentChip}>
                      Tu plan
                    </Chip>
                  )}
                </View>
                <Text variant="headlineSmall" style={{marginTop: normalizeSize(4)}}>
                  {isFree ? 'Gratis' : `${cop(p.monthlyPriceCop)}/mes`}
                </Text>
                <Text variant="bodySmall" style={{color: colors.purplishGrey, marginTop: normalizeSize(2)}}>
                  {p.maxSalesPerDay
                    ? `Hasta ${p.maxSalesPerDay} ventas/día`
                    : 'Ventas ilimitadas'}
                </Text>
                {!isCurrent && (
                  <Button
                    mode="contained"
                    disabled={busy}
                    onPress={() => this.subscribeTo(p)}
                    style={{marginTop: normalizeSize(12)}}
                    contentStyle={{paddingVertical: normalizeSize(2)}}>
                    {isFree ? 'Cambiar a gratis' : 'Suscribirme'}
                  </Button>
                )}
              </Card.Content>
            </Card>
          );
        })}
      </>
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

  render() {
    const {loading, error} = this.props;
    return (
      <Layout hideLogo title="Suscripción" subtitle="y pagos">
        <ScrollView
          style={{width: '100%'}}
          contentContainerStyle={{
            paddingHorizontal: normalizeSize(16),
            paddingBottom: normalizeSize(40),
          }}>
          {loading && (
            <ActivityIndicator size="small" color={colors.buttonBackground} />
          )}
          {error && (
            <HelperText type="error" visible>
              {error}
            </HelperText>
          )}
          {!loading && (
            <>
              <Text variant="titleSmall" style={styles.section}>
                Tu suscripción
              </Text>
              {this.renderSubscription()}

              <Text variant="titleSmall" style={styles.section}>
                Métodos de pago
              </Text>
              {this.renderCards()}

              {this.renderPlans()}
            </>
          )}
        </ScrollView>
        {this.renderMethodModal()}
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  section: {
    marginTop: normalizeSize(16),
    marginBottom: normalizeSize(6),
  },
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
