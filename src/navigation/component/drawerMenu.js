import React from 'react';
import {
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Icon, Text} from 'react-native-paper';
import {Dialog} from '../../components';
import {fonts} from '../../styles/basicStyles';

// Paleta del diseño 09 (Drawer).
const WHITE = '#FFFFFF';
const INK = '#1A130C';
const DGOLD = '#C66E00';
const MUTED = '#7E6A52';
const BRANCH_BG = '#FFF1D6';
const ICON_BG = '#F7F1E5';
const HELP_BG = '#E6F7EC';
const LOGOUT = '#C24213';
const WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=573212133943';

const DrawerMenu = ({props, navigationRef}) => {
  const close = () => props.actions.showDrawer(false);
  const goTo = (route, params) => {
    close();
    navigationRef.navigate(route, params);
  };

  const user = props.user || {};
  const initials = (
    ((user.names || '?').trim()[0] || '') + ((user.last_names || '').trim()[0] || '')
  ).toUpperCase();
  const fullName = `${user.names || ''} ${user.last_names || ''}`.trim() || 'Usuario';
  const secondary = user.company_name || 'Piida';

  const branches = props.branches || [];
  const roles = user.roles || [];
  const isAdmin = roles.includes('administrator') || roles.includes('content_editor');
  const canChangeBranch = branches.length > 1 && isAdmin;
  const activeBranchName =
    branches.find((b) => b.id === props.activeBranchId)?.name ||
    user.branch_office_name ||
    'Sucursal asignada';

  const items = [
    {
      label: 'Órdenes de venta',
      icon: 'receipt',
      onPress: () => goTo('OrdersHistory', {from: 'drawer'}),
    },
    {
      label: 'Mis notificaciones',
      icon: 'bell-outline',
      onPress: () => goTo('NotificationsList'),
    },
    {
      label: 'Suscripción y pagos',
      icon: 'credit-card-outline',
      onPress: () => goTo('Billing'),
    },
    ...(Platform.OS === 'android'
      ? [
          {
            label: 'Configurar impresora',
            icon: 'printer-outline',
            onPress: () => goTo('PrinterSettings'),
          },
        ]
      : []),
  ];

  return (
    <>
      <Modal
        visible={!!props.showDrawer}
        transparent
        animationType="fade"
        onRequestClose={close}>
        <View style={st.row}>
          <TouchableOpacity style={st.backdrop} activeOpacity={1} onPress={close} />
          <View style={st.panel}>
            <SafeAreaView edges={['top']} style={{flex: 1}}>
              {/* Header */}
              <View style={st.header}>
                <View style={st.avatar}>
                  <Text style={st.avatarText}>{initials}</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={st.name} numberOfLines={1}>
                    {fullName}
                  </Text>
                  <Text style={st.sub} numberOfLines={1}>
                    {secondary}
                  </Text>
                </View>
                <TouchableOpacity style={st.closeBtn} activeOpacity={0.7} onPress={close}>
                  <Icon source="close" size={20} color={INK} />
                </TouchableOpacity>
              </View>

              {/* Sucursal activa */}
              <TouchableOpacity
                activeOpacity={canChangeBranch ? 0.8 : 1}
                disabled={!canChangeBranch}
                style={st.branchCard}
                onPress={() => {
                  close();
                  props.actions.showBranchModal(true);
                }}>
                <View style={st.branchIcon}>
                  <Icon source="storefront-outline" size={22} color={DGOLD} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={st.branchLabel}>SUCURSAL ACTIVA</Text>
                  <Text style={st.branchName} numberOfLines={1}>
                    {activeBranchName}
                  </Text>
                  {canChangeBranch && (
                    <Text style={st.branchChange}>Cambiar sucursal →</Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* Menú */}
              <ScrollView
                style={{flex: 1}}
                contentContainerStyle={{padding: 8}}
                showsVerticalScrollIndicator={false}>
                {items.map((it, i) => (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.7}
                    style={st.item}
                    onPress={it.onPress}>
                    <View style={st.itemIcon}>
                      <Icon source={it.icon} size={22} color={INK} />
                    </View>
                    <Text style={st.itemText}>{it.label}</Text>
                    <Icon source="chevron-right" size={20} color={MUTED} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Inferior */}
              <View style={st.bottom}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={st.helpBtn}
                  onPress={() => {
                    close();
                    Linking.openURL(WHATSAPP_URL);
                  }}>
                  <Image
                    source={require('../../assets/images/ic_whatsapp.png')}
                    style={{width: 22, height: 22}}
                    resizeMode="contain"
                  />
                  <Text style={st.helpText}>¿Necesitas ayuda? · WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={st.logoutBtn}
                  onPress={() => {
                    close();
                    props.actions.dialogVisible(true);
                  }}>
                  <Icon source="logout" size={20} color={LOGOUT} />
                  <Text style={st.logoutText}>Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>

      <Dialog
        visible={props.visible}
        title={'Cerrar sesión'}
        message={'¿Estas seguro que deseas cerrar sesión?'}
        acceptTitle={'Si, cerrar sesión'}
        onAccept={() => props.actions.logout()}
        onClose={() => props.actions.dialogVisible(false)}
      />
    </>
  );
};

const st = StyleSheet.create({
  row: {flex: 1, flexDirection: 'row'},
  backdrop: {flex: 1, backgroundColor: 'rgba(26,19,12,0.35)'},
  panel: {
    width: 380,
    backgroundColor: WHITE,
    shadowColor: '#1A130C',
    shadowOffset: {width: -20, height: 0},
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: 14,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 18,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BRANCH_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: DGOLD,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: INK,
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: MUTED,
    marginTop: 3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0E9DB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  branchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    backgroundColor: BRANCH_BG,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  branchIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFE6B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 1,
    color: DGOLD,
  },
  branchName: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: INK,
    marginTop: 2,
  },
  branchChange: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: DGOLD,
    marginTop: 2,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 15,
    color: INK,
  },

  bottom: {
    padding: 16,
    rowGap: 10,
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 10,
    backgroundColor: HELP_BG,
    borderRadius: 14,
    paddingVertical: 14,
  },
  helpText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: INK,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 10,
    paddingVertical: 14,
  },
  logoutText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: LOGOUT,
  },
});

export {DrawerMenu};
