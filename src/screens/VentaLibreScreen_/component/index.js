// src/screens/VentaLibreScreen/component/index.js
//
// ⚠️ REDISEÑO V6 · Venta Libre — tablet 10" landscape (1280×800).
//
// Ingreso manual de montos sin catálogo. Layout dos paneles:
//   · IZQ: AmountDisplay (monto + nota) + BigNumpad
//   · DER: CartPanel (mismo del handoff de Nueva Venta)
//
// Mantiene el contrato Redux existente: usa los mismos actions/selectors
// que NewSaleScreen (product, customer, total, addProduct, etc.).
// Si tu container/index.js anterior ya cableaba esos selectors al store,
// el mismo container funciona tal cual.

import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { registerEventScreenMounted } from '../../../utils/analytics';
import { DialogContainer } from '../../../layouts';
import { fonts, normalizeSize } from '../../../styles/basicStyles';
import { palette } from '../../../styles/piidaPalette';

// Shared components (del handoff de Nueva Venta)
import CartPanel from '../../NewSaleScreen/components/CartPanel';
import { BackIcon, CloseIcon } from '../../NewSaleScreen/components/Icons';

// Componentes propios de Venta Libre
import AmountDisplay from '../components/AmountDisplay';
import BigNumpad from '../components/BigNumpad';
import { ventaLibreStyles } from '../components/styles';

class VentaLibreScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amountStr: '',
      note: '',
      showNote: false,
    };
  }

  styles = ventaLibreStyles();

  componentDidMount() {
    registerEventScreenMounted(this.props, 'Venta libre', 'VentaLibreScreen');
  }

  // ─── Amount handling ───────────────────────────────────────
  pressKey = (k) => {
    if (k === 'C') {
      this.setState({ amountStr: '' });
      return;
    }
    this.setState((state) => {
      const next = (state.amountStr + k)
        .replace(/^0+(?=\d)/, '')
        .slice(0, 9);
      return { amountStr: next };
    });
  };

  getAmount = () => parseInt(this.state.amountStr || '0', 10);

  // ─── Add item to cart ──────────────────────────────────────
  addItem = () => {
    const amount = this.getAmount();
    if (!amount) return;

    const freeCount = (this.props.product || [])
      .filter((p) => p.type === 'free').length + 1;
    const itemName = this.state.note ? this.state.note : 'Item ' + freeCount;

    this.props.actions.selectProduct({
      nid: 'free_sale_' + Date.now(),
      name: itemName,
      label: itemName,
      price: amount,
      qty: 1,
      type: 'free',
      available: 9999,
      body: '',
      code: '',
    });

    this.setState({ amountStr: '', note: '', showNote: false });
  };

  // ─── Customer ──────────────────────────────────────────────
  onAddCustomer = () => {
    if (this.props.customer) {
      this.props.actions.customerVisible(true);
    } else {
      this.props.navigation.navigate('Provider', { from: 'customer' });
    }
  };

  // ─── Navigation ────────────────────────────────────────────
  proceedToCheckout = (route) => {
    // Si el numpad tiene un monto pendiente sin "+" presionado, lo
    // agregamos automáticamente antes de navegar al checkout.
    const amount = this.getAmount();
    if (amount > 0) this.addItem();
    setTimeout(() => {
      this.props.navigation.navigate(route);
    }, 100);
  };

  render() {
    const styles = this.styles;
    const amount = this.getAmount();

    return (
      <View style={styles.root}>
        {/* App bar */}
        <View style={styles.appBar}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => this.props.navigation.goBack()}
            style={styles.iconBtn}
          >
            <BackIcon size={normalizeSize(24)} color={palette.ink} />
          </TouchableOpacity>

          <Text style={styles.appBarTitle}>Venta libre</Text>

          <View style={styles.saleChip}>
            <Text style={styles.saleChipText}>
              {(this.props.product || []).length} {(this.props.product || []).length === 1 ? 'ÍTEM' : 'ÍTEMS'}
            </Text>
          </View>

          <View style={{ flex: 1 }} />

          <Text style={styles.terminalText}>Terminal · Mostrador 1</Text>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* LEFT — amount + numpad */}
          <View style={styles.leftPane}>
            <AmountDisplay
              amount={amount}
              note={this.state.note}
              showNote={this.state.showNote}
              onNoteChange={(text) => this.setState({ note: text })}
              onToggleNote={() =>
                this.setState((state) => ({ showNote: !state.showNote }))
              }
            />

            <View style={{ height: normalizeSize(16) }} />

            <BigNumpad
              amount={amount}
              onKey={this.pressKey}
              onAdd={this.addItem}
            />
          </View>

          {/* RIGHT — cart panel */}
          <CartPanel
            items={this.props.product || []}
            customer={this.props.customer}
            total={this.props.total || 0}
            onAddCustomer={this.onAddCustomer}
            onIncrement={(item) => this.props.actions.addProduct(item)}
            onDecrement={(item) => this.props.actions.removeProduct(item)}
            onRemove={(item) => this.props.actions.deleteProduct(item)}
            onPayCash={() => this.proceedToCheckout('ConfirmCashOrder')}
            onPayOther={() => this.proceedToCheckout('ConfirmOrder')}
          />
        </View>

        {/* Customer dialog — mismo del NewSaleScreen */}
        {this.props.customer && (
          <DialogContainer
            visible={this.props.customerVisible}
            style={customerDialogStyles.dialog}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => this.props.actions.customerVisible(false)}
              style={customerDialogStyles.closeBtn}
            >
              <CloseIcon size={normalizeSize(22)} color={palette.ink} />
            </TouchableOpacity>
            <Text style={customerDialogStyles.title}>Datos del cliente</Text>
            {this.props.customer.label && (
              <CustomerRow label="Nombre" value={this.props.customer.label} />
            )}
            {this.props.customer.phone && (
              <CustomerRow label="Teléfono" value={this.props.customer.phone} />
            )}
            {this.props.customer.id_number && (
              <CustomerRow label="Identificación" value={this.props.customer.id_number} />
            )}
            {this.props.customer.address && (
              <CustomerRow label="Dirección" value={this.props.customer.address} />
            )}
            {this.props.customer.email && (
              <CustomerRow label="Correo" value={this.props.customer.email} />
            )}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => this.props.actions.removeCustomer()}
              style={customerDialogStyles.removeBtn}
            >
              <Text style={customerDialogStyles.removeBtnText}>
                Remover cliente de la venta
              </Text>
            </TouchableOpacity>
          </DialogContainer>
        )}
      </View>
    );
  }
}

const CustomerRow = ({ label, value }) => (
  <View style={customerDialogStyles.row}>
    <Text style={customerDialogStyles.rowLabel}>{label}</Text>
    <Text style={customerDialogStyles.rowValue}>{value}</Text>
  </View>
);

export default VentaLibreScreen;

// ─── Customer dialog styles ───────────────────────────────────
import { StyleSheet } from 'react-native';
const customerDialogStyles = StyleSheet.create({
  dialog: {
    backgroundColor: palette.panel,
    borderRadius: normalizeSize(20),
    padding: normalizeSize(24),
    maxWidth: normalizeSize(560),
    alignSelf: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: normalizeSize(16),
    right: normalizeSize(16),
    width: normalizeSize(40),
    height: normalizeSize(40),
    borderRadius: normalizeSize(12),
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: normalizeSize(22),
    color: palette.ink,
    marginBottom: normalizeSize(20),
  },
  row: { marginBottom: normalizeSize(14) },
  rowLabel: {
    fontFamily: fonts.bold,
    fontSize: normalizeSize(12),
    color: palette.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: normalizeSize(4),
  },
  rowValue: {
    fontFamily: fonts.regular,
    fontSize: normalizeSize(16),
    color: palette.ink,
  },
  removeBtn: {
    marginTop: normalizeSize(16),
    paddingVertical: normalizeSize(14),
    borderRadius: normalizeSize(12),
    borderWidth: 1.5,
    borderColor: palette.terracotta,
    alignItems: 'center',
  },
  removeBtnText: {
    fontFamily: fonts.bold,
    fontSize: normalizeSize(15),
    color: palette.terracotta,
  },
});
