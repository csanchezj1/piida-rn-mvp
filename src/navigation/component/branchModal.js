import React from 'react';
import {Modal, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Icon, Text} from 'react-native-paper';
import {fonts} from '../../styles/basicStyles';

// Paleta del diseño 10 (Branch modal).
const WHITE = '#FFFFFF';
const INK = '#1A130C';
const MUTED = '#7E6A52';
const GOLD = '#F7A928';
const BEIGE = '#F0E9DB';
const ROW_ACTIVE = '#FFF1D6';

// BranchModal — Bloque 4 multi-sucursal RN. Tarjeta centrada con la lista
// de sucursales. Tap a una opción → setActiveBranch (cierra modal + drawer,
// el switcher X-Branch-Id es global vía el wrapper axios).
const BranchModal = ({props}) => {
  const visible = props.branchModalVisible;
  const branches = props.branches || [];
  const activeId = props.activeBranchId;
  const close = () => props.actions.showBranchModal(false);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={!!visible}
      onRequestClose={close}
      testID="branch-modal">
      <TouchableOpacity activeOpacity={1} style={st.backdrop} onPress={close}>
        <TouchableOpacity activeOpacity={1} style={st.card} onPress={() => {}}>
          {/* Header */}
          <View style={st.header}>
            <View style={{flex: 1}}>
              <Text style={st.title}>Cambiar sucursal</Text>
              <Text style={st.subtitle}>Elegí en cuál estás trabajando ahora</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              style={st.closeBtn}
              onPress={close}
              testID="branch-modal-close">
              <Icon source="close" size={22} color={INK} />
            </TouchableOpacity>
          </View>

          {/* Lista */}
          {branches.length === 0 ? (
            <Text style={st.empty}>No hay sucursales asignadas a tu usuario.</Text>
          ) : (
            <ScrollView style={{maxHeight: 380}} contentContainerStyle={{paddingVertical: 8}}>
              {branches.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <TouchableOpacity
                    key={String(item.id)}
                    testID={`branch-option-${item.id}`}
                    activeOpacity={0.8}
                    style={[st.row, isActive && st.rowActive]}
                    onPress={() => props.actions.setActiveBranch(item.id)}>
                    <View style={[st.icon, {backgroundColor: isActive ? GOLD : BEIGE}]}>
                      <Icon source="storefront-outline" size={22} color={isActive ? WHITE : INK} />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={st.name} numberOfLines={1}>
                        {item.name}
                      </Text>
                      {!!item.address && (
                        <Text style={st.addr} numberOfLines={1}>
                          {item.address}
                        </Text>
                      )}
                    </View>
                    {isActive && (
                      <View style={st.badge}>
                        <Icon source="check-bold" size={12} color={WHITE} />
                        <Text style={st.badgeText}>ACTIVA</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const st = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,19,12,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '88%',
    maxWidth: 500,
    backgroundColor: WHITE,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#1A130C',
    shadowOffset: {width: 0, height: 40},
    shadowOpacity: 0.4,
    shadowRadius: 80,
    elevation: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    letterSpacing: -0.3,
    color: INK,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: MUTED,
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BEIGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    paddingVertical: 30,
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 14,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  rowActive: {
    backgroundColor: ROW_ACTIVE,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: INK,
  },
  addr: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    backgroundColor: GOLD,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.4,
    color: WHITE,
  },
});

export {BranchModal};
