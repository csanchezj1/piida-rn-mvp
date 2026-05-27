import React, {Component} from 'react';
import {RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Icon, Text} from 'react-native-paper';
import {registerEventScreenMounted} from '../../../utils/analytics';
import AppShell from '../../../layouts/AppShell';
import {Shimmer} from '../../../components';
import {fonts} from '../../../styles/basicStyles';

const INK = '#1A130C';
const MUTED = '#7E6A52';
const DGOLD = '#C66E00';
const GOLD = '#F7A928';
const RED = '#C44A4A';
const GREEN = '#36B37E';
const GREY = '#B9A48C';
const BODY = '#3A2E22';
const WHITE = '#FFFFFF';
const UNREAD_BG = '#FFF1D6';

// Color del punto de la notificación, inferido del título (la data no
// trae un campo `type`). Las leídas van en gris.
const dotColor = (n) => {
  if (n.isRead) return GREY;
  const t = (n.title || '').toLowerCase();
  if (t.includes('inventario') || t.includes('stock')) return RED;
  if (t.includes('venta')) return GREEN;
  if (t.includes('caja')) return GOLD;
  return GOLD;
};

class NotificationsListScreen extends Component {
  state = {refreshing: false};

  componentDidMount() {
    this.props.actions.getNotifications();
    this.props.actions.getUnreadCount();
    registerEventScreenMounted(
      this.props,
      'Pantalla listado de notificaciones',
      'NotificationsListScreen',
    );
  }

  componentWillUnmount() {
    this.props.actions.clear();
  }

  onRefresh = () => {
    this.setState({refreshing: true});
    this.props.actions.getNotifications();
    this.props.actions.getUnreadCount();
    setTimeout(() => this.setState({refreshing: false}), 700);
  };

  render() {
    const list = this.props.list;
    const unread = (list || []).filter((n) => !n.isRead).length;

    return (
      <AppShell>
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={st.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
          }>
          {/* Encabezado */}
          <View style={st.header}>
            <View style={{flex: 1}}>
              <Text style={st.title}>Notificaciones</Text>
              <Text style={st.subtitle}>
                {unread > 0 ? `Tenés ${unread} sin leer` : 'Estás al día'}
              </Text>
            </View>
            {unread > 0 && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={st.markAllBtn}
                onPress={() => this.props.actions.markAllRead()}>
                <Icon source="check-all" size={18} color={DGOLD} />
                <Text style={st.markAllText}>Marcar todas como leídas</Text>
              </TouchableOpacity>
            )}
          </View>

          {!list ? (
            Array.from(Array(6).keys()).map((_, i) => (
              <Shimmer key={i} height={83} style={{marginBottom: 10, borderRadius: 18}} />
            ))
          ) : list.length === 0 ? (
            <Text style={st.empty}>Aún no tienes notificaciones</Text>
          ) : (
            list.map((item) => {
              const unreadCard = !item.isRead;
              const dc = dotColor(item);
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  style={[st.card, unreadCard && st.cardUnread]}
                  onPress={() => unreadCard && this.props.actions.markRead(item.id)}>
                  <View style={[st.chip, {backgroundColor: dc + '22'}]}>
                    <View style={[st.dot, {backgroundColor: dc}]} />
                  </View>
                  <View style={{flex: 1}}>
                    <View style={st.cardTopRow}>
                      <Text style={st.cardTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={st.cardTime}>{formatRelative(item.createdAt)}</Text>
                    </View>
                    <Text style={st.cardBody}>{item.body}</Text>
                  </View>
                  {unreadCard && <View style={st.unreadDot} />}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </AppShell>
    );
  }
}

function formatRelative(iso) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return '';
  const diff = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (diff < 60) return 'Hace instantes';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  const days = Math.floor(diff / 86400);
  if (days < 7) return `Hace ${days} día${days === 1 ? '' : 's'}`;
  return new Date(iso).toLocaleDateString('es-CO', {day: '2-digit', month: 'short'});
}

const st = StyleSheet.create({
  scroll: {padding: 24},
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    letterSpacing: -0.6,
    color: INK,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: MUTED,
    marginTop: 4,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE3D2',
  },
  markAllText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: DGOLD,
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: 14,
    backgroundColor: WHITE,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 10,
  },
  cardUnread: {
    backgroundColor: UNREAD_BG,
  },
  chip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    paddingRight: 10,
    fontFamily: fonts.bold,
    fontSize: 16,
    letterSpacing: -0.2,
    color: INK,
  },
  cardTime: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: MUTED,
  },
  cardBody: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: BODY,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GOLD,
    marginTop: 6,
  },
});

export default NotificationsListScreen;
