import React, {Component} from 'react';
import {RefreshControl, ScrollView, TouchableOpacity, View} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';
import {Shimmer} from '../../../components';
import {colors, fonts, normalizeSize} from '../../../styles/basicStyles';

class NotificationsListScreen extends Component {
  state = {refreshing: false};

  componentDidMount() {
    this.props.actions.getNotifications();
    this.props.actions.getUnreadCount();
    registerEventScreenMounted(this.props, 'Pantalla listado de notificaciones', 'NotificationsListScreen');
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
      <Layout
        contentContainerStyle={{justifyContent: 'flex-start'}}
        hideLogo
        title="Notificaciones">
        <ScrollView
          style={{width: '100%'}}
          contentContainerStyle={{
            paddingHorizontal: normalizeSize(16),
            paddingBottom: normalizeSize(40),
          }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
            />
          }>
          {!list ? (
            <View>
              {Array.from(Array(8).keys()).map((_, i) => (
                <Shimmer
                  key={i}
                  height={normalizeSize(70)}
                  style={{marginBottom: normalizeSize(8), borderRadius: 8}}
                />
              ))}
            </View>
          ) : list.length === 0 ? (
            <Text
              variant="bodyMedium"
              style={{textAlign: 'center', color: colors.purplishGrey, marginTop: normalizeSize(40)}}>
              Aún no tienes notificaciones
            </Text>
          ) : (
            <>
              {unread > 0 && (
                <TouchableOpacity
                  onPress={() => this.props.actions.markAllRead()}
                  style={{alignSelf: 'flex-end', marginBottom: normalizeSize(8)}}>
                  <Text style={{color: colors.buttonBackground, fontFamily: fonts.semiBold}}>
                    Marcar todas como leídas
                  </Text>
                </TouchableOpacity>
              )}
              {list.map((item) => (
                <Card
                  key={item.id}
                  mode="outlined"
                  onPress={() => !item.isRead && this.props.actions.markRead(item.id)}
                  style={{
                    marginBottom: normalizeSize(8),
                    backgroundColor: item.isRead ? '#FFFFFF' : '#FFF7E6',
                  }}>
                  <Card.Content>
                    <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                      {!item.isRead && (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: colors.buttonBackground,
                            marginTop: normalizeSize(6),
                            marginRight: normalizeSize(8),
                          }}
                        />
                      )}
                      <View style={{flex: 1}}>
                        <Text variant="titleSmall" style={{color: colors.label}}>
                          {item.title}
                        </Text>
                        <Text
                          variant="bodyMedium"
                          style={{marginVertical: normalizeSize(6)}}>
                          {item.body}
                        </Text>
                        <Text
                          variant="bodySmall"
                          style={{color: colors.purplishGrey, textAlign: 'right'}}>
                          {formatRelative(item.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </>
          )}
        </ScrollView>
      </Layout>
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
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
  });
}

export default NotificationsListScreen;
