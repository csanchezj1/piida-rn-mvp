import React from "react";
import { Modal, View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, normalizeSize } from "../../styles/basicStyles";

/**
 * BranchModal — Bloque 4 multi-sucursal RN
 *
 * Modal full-screen con la lista de sucursales del user. Tap a una opción:
 *  - dispara setActiveBranch (cierra modal + drawer)
 *  - el switcher en X-Branch-Id es global (axios wrapper lo lee del store)
 *  - el `refetchTick` se incrementa, las pantallas que lo escuchan refetcean
 */
const BranchModal = ({ props }) => {
  const visible = props.branchModalVisible;
  const branches = props.branches || [];
  const activeId = props.activeBranchId;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={!!visible}
      onRequestClose={() => props.actions.showBranchModal(false)}
      testID="branch-modal">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: normalizeSize(15),
            paddingVertical: normalizeSize(15),
            borderBottomWidth: 1,
            borderBottomColor: colors.inputLineInactive,
          }}>
          <Text
            style={{
              fontFamily: fonts.medium,
              fontSize: normalizeSize(18),
              color: colors.text,
            }}>
            Cambiar sucursal
          </Text>
          <TouchableOpacity
            onPress={() => props.actions.showBranchModal(false)}
            testID="branch-modal-close"
            style={{ padding: normalizeSize(5) }}>
            <Image
              style={{ width: normalizeSize(20), height: normalizeSize(20) }}
              resizeMode="contain"
              source={require('../../assets/images/ic_close.png')}
            />
          </TouchableOpacity>
        </View>

        {branches.length === 0 ? (
          <View style={{ padding: normalizeSize(30), alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: fonts.regular,
                fontSize: normalizeSize(14),
                color: colors.label,
                textAlign: 'center',
              }}>
              No hay sucursales asignadas a tu usuario.
            </Text>
          </View>
        ) : (
          <FlatList
            data={branches}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              const isActive = item.id === activeId;
              return (
                <TouchableOpacity
                  testID={`branch-option-${item.id}`}
                  activeOpacity={0.85}
                  onPress={() => props.actions.setActiveBranch(item.id)}
                  style={{
                    paddingVertical: normalizeSize(15),
                    paddingHorizontal: normalizeSize(20),
                    borderBottomWidth: 1,
                    borderBottomColor: colors.inputLineInactive,
                    backgroundColor: isActive
                      ? colors.inputBackgroundFilled
                      : '#fff',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      fontFamily: isActive ? fonts.medium : fonts.regular,
                      fontSize: normalizeSize(15),
                      color: isActive
                        ? colors.buttonBackground
                        : colors.text,
                    }}>
                    {item.name}
                  </Text>
                  {isActive && (
                    <Text
                      style={{
                        fontFamily: fonts.medium,
                        fontSize: normalizeSize(12),
                        color: colors.buttonBackground,
                      }}>
                      Activa
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

export { BranchModal };
