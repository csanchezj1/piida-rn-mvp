import React, { Component } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import RBSheet from 'react-native-raw-bottom-sheet';
import { getBalanceStyles } from '../../../styles/screenStyles';
import { colors, fonts, normalizeSize } from '../../../styles/basicStyles';
import { registerEventScreenMounted } from '../../../utils/analytics';
import { MovementItem, Shimmer } from '../../../components';

const MIN_REASON_LENGTH = 3;

class BalanceScreen extends Component {
  styles = getBalanceStyles();

  state = {
    cancelTarget: null, // { nid, label }
    cancelReason: '',
    cancelError: null,
    cancelling: false,
    // F4.12 libro mayor: filtro de tipo client-side.
    filterType: 'all', // 'all' | 'income' | 'expense'
  };

  // Filtra la lista agrupada según el tipo elegido. Un movimiento es
  // 'expense' si item.movement === 'expense'; cualquier otra cosa es ingreso.
  getFilteredList() {
    const { list } = this.props;
    const { filterType } = this.state;
    if (!list || filterType === 'all') return list;
    return list
      .map((group) => ({
        ...group,
        children: group.children.filter((item) =>
          filterType === 'expense'
            ? item.movement === 'expense'
            : item.movement !== 'expense',
        ),
      }))
      .filter((group) => group.children.length > 0);
  }

  renderTypeFilter() {
    const { filterType } = this.state;
    const opts = [
      { id: 'all', label: 'Todos' },
      { id: 'income', label: 'Ingresos' },
      { id: 'expense', label: 'Gastos' },
    ];
    return (
      <View style={{ flexDirection: 'row', paddingHorizontal: normalizeSize(16), paddingVertical: normalizeSize(8), gap: normalizeSize(8) }}>
        {opts.map((o) => {
          const active = filterType === o.id;
          return (
            <TouchableOpacity
              key={o.id}
              activeOpacity={0.8}
              onPress={() => this.setState({ filterType: o.id })}
              style={{
                paddingHorizontal: normalizeSize(14),
                paddingVertical: normalizeSize(6),
                borderRadius: normalizeSize(16),
                backgroundColor: active ? colors.buttonBackground : '#F0F0F0',
              }}>
              <Text style={{
                fontFamily: active ? fonts.bold : fonts.regular,
                fontSize: normalizeSize(13),
                color: active ? '#FFFFFF' : colors.text,
              }}>
                {o.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  componentDidMount() {
    this.props.actions.getMovements(this.props.user.branch_office, true);
    this.props.actions.getBalance(this.props.user.uid);
    registerEventScreenMounted(this.props, 'Pantalla saldo y listado de movimientos', 'BalanceScreen');
    this._focusListener = this.props.navigation.addListener('focus', () => {
      this.props.actions.getMovements(this.props.user.branch_office, true);
      this.props.actions.getBalance(this.props.user.uid);
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.refetchTick !== this.props.refetchTick) {
      this.props.actions.getMovements(this.props.user.branch_office, true);
      this.props.actions.getBalance(this.props.user.uid);
    }
  }

  componentWillUnmount() {
    if (this._focusListener) {
      this._focusListener();
    }
  }

  openCancelSheet = (item) => {
    if (item.status === 'CANCELLED') return;
    const nid = item.movement_id || item.id;
    const label = item.expense_type
      ? 'Pago ' + item.expense_type
      : (item.title || 'este registro');
    this.setState(
      { cancelTarget: { nid, label }, cancelReason: '', cancelError: null },
      () => this.RBSheet && this.RBSheet.open(),
    );
  };

  closeCancelSheet = () => {
    if (this.RBSheet) this.RBSheet.close();
    this.setState({ cancelTarget: null, cancelReason: '', cancelError: null, cancelling: false });
  };

  confirmCancel = () => {
    const { cancelTarget, cancelReason } = this.state;
    if (!cancelTarget) return;
    const trimmed = cancelReason.trim();
    if (trimmed.length < MIN_REASON_LENGTH) {
      this.setState({ cancelError: `Indica un motivo de al menos ${MIN_REASON_LENGTH} caracteres.` });
      return;
    }
    this.setState({ cancelling: true, cancelError: null });
    // El action se encarga de cerrar el sheet on success/error vía dialog.
    this.props.actions.deleteMovementInline(cancelTarget.nid, trimmed, () => {
      this.closeCancelSheet();
    });
  };

  renderItem = (item, index) => {
    const qty = item.qty ? item.qty : 1;
    const total = item.total ? item.total : item.value * qty;
    let product = null;
    if (item.product) {
      product = [{ label: item.product, nid: index, price: total / qty, qty }];
    } else if (item.product_item) {
      product = [{ label: item.product_item, nid: index, price: total / qty, qty }];
    }
    const isCancelled = item.status === 'CANCELLED';
    return (
      <MovementItem
        key={index}
        style={this.styles.item}
        title={item.expense_type ? 'Pago ' + item.expense_type : item.title}
        type={item.movement === 'expense' ? 'Salida' : item.movement_type}
        value={item.value}
        qty={qty}
        status={item.hour}
        from={'purchase'}
        cancelled={isCancelled}
        cancellationReason={item.cancellation_reason}
        cancelledByName={item.cancelled_by_name}
        onDelete={isCancelled ? null : () => this.openCancelSheet(item)}
        onPress={() =>
          this.props.navigation.navigate('BuyDetails', {
            details: {
              customer: item.customer,
              provider: item.provider,
              movementType: item.expense_type ? item.expense_type : item.title,
              paymentType: item.payment,
              value: item.expense_type ? total : item.value,
              paid: item.paid,
              observations: item.observations,
              total: total,
              order: item.order,
              orderConsecutive: item.consecutive,
              movement: item.movement,
              movement_id: item.movement_id,
              date: item.created.replace(/\n/g, '') + ' ' + item.hour.replace(/\n/g, ''),
              product,
              status: item.status,
              cancellationReason: item.cancellation_reason,
              cancelledByName: item.cancelled_by_name,
              cancelledAt: item.cancelled_at,
            },
          })
        }
      />
    );
  };

  render() {
    const { cancelTarget, cancelReason, cancelError, cancelling } = this.state;
    return (
      <View style={this.styles.container}>
        <View style={this.styles.head}>
          <Text style={this.styles.movTxt}>Movimientos</Text>
          <View>
            <Text style={this.styles.totalLabel}>Saldo total</Text>
            <Text style={this.styles.totalValue}>{this.props.total}</Text>
          </View>
        </View>

        {this.props.list && this.props.list.length > 0 && this.renderTypeFilter()}

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: this.props.list
              ? this.props.list.length === 0 ? 'center' : 'flex-start'
              : 'flex-start',
          }}
          onScrollEndDrag={({ nativeEvent }) => {
            if (
              nativeEvent.layoutMeasurement.height +
              nativeEvent.contentOffset.y >=
              nativeEvent.contentSize.height - 1
            ) {
              this.props.actions.getMovements(this.props.user.branch_office, false);
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={this.props.showRrefresh}
              onRefresh={() => {
                this.props.actions.getMovements(this.props.user.branch_office, true);
                this.props.actions.getBalance(this.props.user.uid);
              }}
              progressViewOffset={10}
            />
          }
        >
          {this.props.list ? (
            this.props.list.length > 0 ? (
              (() => {
                const filtered = this.getFilteredList() || [];
                if (filtered.length === 0) {
                  return (
                    <Text style={this.styles.noresult}>
                      No hay movimientos de este tipo
                    </Text>
                  );
                }
                return (
                  <>
                    {filtered.map((group, i) => (
                      <View key={i}>
                        <Text style={this.styles.date}>{group.date}</Text>
                        {group.children.map((item, index) => this.renderItem(item, index))}
                      </View>
                    ))}

                    <View style={this.styles.loaderContainer}>
                      {this.props.showLoader && (
                        <ActivityIndicator size="large" color={'red'} />
                      )}
                    </View>
                  </>
                );
              })()
            ) : (
              <Text style={this.styles.noresult}>
                Aún no tienes movimientos registrados
              </Text>
            )
          ) : (
            <View style={this.styles.shimmerCont}>
              {Array.from(Array(12).keys()).map((_, i) => (
                <Shimmer
                  key={i}
                  style={this.styles.shimmer}
                  height={this.styles.shimmer.height}
                  width={this.styles.shimmer.width}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <RBSheet
          ref={(ref) => { this.RBSheet = ref; }}
          height={360}
          openDuration={300}
          closeDuration={250}
          customStyles={{
            container: {
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              paddingHorizontal: 20,
              paddingTop: 18,
              paddingBottom: 24,
            },
          }}
          closeOnPressMask={!cancelling}
          onClose={() => {
            if (!cancelling) {
              this.setState({ cancelTarget: null, cancelReason: '', cancelError: null });
            }
          }}
        >
          <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: colors.dialogText, marginBottom: 6 }}>
            Cancelar movimiento
          </Text>
          {cancelTarget && (
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: '#666', marginBottom: 14 }} numberOfLines={2}>
              {cancelTarget.label}
            </Text>
          )}
          <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: '#666', marginBottom: 6 }}>
            El movimiento quedará marcado como Cancelado. Se revertirán inventario y caja automáticamente.
          </Text>
          <TextInput
            mode="outlined"
            label="Motivo de cancelación *"
            placeholder="Ej: Cliente devolvió el producto"
            value={cancelReason}
            onChangeText={(t) => this.setState({ cancelReason: t, cancelError: null })}
            multiline
            numberOfLines={3}
            maxLength={500}
            editable={!cancelling}
            error={!!cancelError}
            style={{ marginTop: 8, backgroundColor: '#FFFFFF' }}
          />
          <HelperText type="error" visible={!!cancelError}>
            {cancelError}
          </HelperText>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18, gap: 10 }}>
            <Button
              mode="outlined"
              onPress={this.closeCancelSheet}
              disabled={cancelling}>
              Volver
            </Button>
            <Button
              mode="contained"
              buttonColor="#E53935"
              textColor="#FFFFFF"
              onPress={this.confirmCancel}
              loading={cancelling}
              disabled={cancelling || cancelReason.trim().length < MIN_REASON_LENGTH}>
              Confirmar cancelación
            </Button>
          </View>
        </RBSheet>
      </View>
    );
  }
}

export default BalanceScreen;
