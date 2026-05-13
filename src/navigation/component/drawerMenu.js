import React from "react";
import {TouchableOpacity, Text, Image, View, Linking, Platform} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {getDrawerStyles} from '../../styles/menuStyles';
import { Dialog, TopSheet } from "../../components";
import { normalizeSize } from "../../styles/basicStyles";

const DrawerMenu = ({
  props,
  navigationRef
}) => {
  const styles = getDrawerStyles();
  return(
    <>
    <TopSheet
      visible={props.showDrawer}
      onClose={() => props.actions.showDrawer(false)}>
      <SafeAreaView
        edges={['top']}
        style={{paddingTop: Platform.OS === 'ios' ? normalizeSize(20) : normalizeSize(30)}}>
        <View 
          style={styles.container}>
          {props.user && (
            <View
              style={styles.nameCont}>
              <Text
                style={styles.name}>
                {props.user.names}
              </Text>
              <Text
                style={styles.name}>
                {props.user.last_names}
              </Text>
            </View>
          )}
          <TouchableOpacity
            activeOpacity={1}
            style={styles.closeCont}
            onPress={() => props.actions.showDrawer(false)}>
            <Image
              style={styles.closeImg}
              source={require('../../assets/images/ic_close.png')}
            />
          </TouchableOpacity>
        </View>
        <View
          style={styles.storeContainer}>
          <Image
            style={styles.storeImg}
            resizeMode='contain'
            source={require('../../assets/images/ic_store.png')}
          />
          <Text
            style={styles.store}>
            {props.user.company_name} - {(() => {
              const id = props.activeBranchId;
              const list = props.branches || [];
              const active = list.find(b => b.id === id);
              return active?.name ?? props.user.branch_office_name;
            })()}
          </Text>
        </View>
        {/* ─── Bloque 4 multi-sucursal — switcher ──────────────────── */}
        {(() => {
          const list = props.branches || [];
          const roles = props.user?.roles || [];
          const isAdmin =
            roles.includes('administrator') || roles.includes('content_editor');
          // Si solo hay 1 sucursal o el user es cajero → badge informativo
          // (no se puede cambiar). Si hay >=2 y es admin → tap abre el modal.
          if (list.length <= 1 || !isAdmin) {
            const activeName = list.find(b => b.id === props.activeBranchId)?.name
              || props.user.branch_office_name
              || 'Sucursal asignada';
            return (
              <View
                testID="branch-locked-badge"
                style={styles.policyCont}>
                <Image
                  style={[styles.arrow, {marginEnd: normalizeSize(10)}]}
                  resizeMode='contain'
                  source={require('../../assets/images/ic_store.png')}/>
                <Text style={styles.links}>
                  Sucursal: {activeName}
                </Text>
                <Text style={[styles.links, {opacity: 0.5, fontSize: normalizeSize(11)}]}>
                  🔒
                </Text>
              </View>
            );
          }
          return (
            <TouchableOpacity
              testID="drawer-change-branch"
              activeOpacity={0.9}
              style={styles.policyCont}
              onPress={() => {
                props.actions.showDrawer(false);
                props.actions.showBranchModal(true);
              }}>
              <Image
                style={[styles.arrow, {marginEnd: normalizeSize(10)}]}
                resizeMode='contain'
                source={require('../../assets/images/ic_store.png')}/>
              <Text style={styles.links}>
                Cambiar sucursal
              </Text>
              <Image
                style={styles.arrow}
                resizeMode='contain'
                source={require('../../assets/images/arrow_back.png')}/>
            </TouchableOpacity>
          );
        })()}
        {/*<TouchableOpacity
          activeOpacity={0.9}
          style={styles.termsCont}
          onPress={() => {
            props.actions.showDrawer(false),
            navigationRef.navigate('ChangePass')
          }}>
          <Text
            style={styles.links}>
            Cambiar contraseña
          </Text>
          <Image
            style={styles.arrow}
            resizeMode='contain'
            source={require('../../assets/images/arrow_back.png')}/>
          <Image/>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.termsCont}
          onPress={() => {
            props.actions.showDrawer(false),
            navigationRef.navigate('Terms', {
              type:'terms'
            })
          }}>
          <Text
            style={styles.links}>
            Términos y condiciones
          </Text>
          <Image
            style={styles.arrow}
            resizeMode='contain'
            source={require('../../assets/images/arrow_back.png')}/>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.policyCont}
          onPress={() => {
            props.actions.showDrawer(false),
            navigationRef.navigate('Terms', {
              type:'privacy'
            })
          }}>
          <Text
            style={styles.links}>
            Política de privacidad
          </Text>
          <Image
            style={styles.arrow}
            resizeMode='contain'
            source={require('../../assets/images/arrow_back.png')}/>
        </TouchableOpacity>*/}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.policyCont}
          onPress={() => {
            props.actions.showDrawer(false),
            navigationRef.navigate('OrdersHistory', {
              from:'drawer'
            })
          }}>
          <Image
            style={[styles.arrow, {
              marginEnd:normalizeSize(10)
            }]}
            resizeMode='contain'
            source={require('../../assets/images/ic_menu_balance.png')}/>
          <Text
            style={styles.links}>
            Ordenes de venta
          </Text>
          <Image
            style={styles.arrow}
            resizeMode='contain'
            source={require('../../assets/images/arrow_back.png')}/>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.policyCont}
          onPress={() => {
            props.actions.showDrawer(false),
            navigationRef.navigate('NotificationsList')
          }}>
          <Image
            style={[styles.arrow, {
              marginEnd:normalizeSize(10)
            }]}
            resizeMode='contain'
            source={require('../../assets/images/ic_list.png')}/>
          <Text
            style={styles.links}>
            Mis notificaciones
          </Text>
          <Image
            style={styles.arrow}
            resizeMode='contain'
            source={require('../../assets/images/arrow_back.png')}/>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.policyCont}
          onPress={() => {
            props.actions.showDrawer(false),
            navigationRef.navigate('Billing')
          }}>
          <Text
            style={styles.links}>
            Suscripción y pagos
          </Text>
          <Image
            style={styles.arrow}
            resizeMode='contain'
            source={require('../../assets/images/arrow_back.png')}/>
        </TouchableOpacity>
        
        {Platform.OS === 'android' && (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.policyCont}
            onPress={() => {
              props.actions.showDrawer(false),
              navigationRef.navigate('PrinterSettings')
            }}>
            <Text
              style={styles.links}>
              Configurar impresora
            </Text>
            <Image
              style={styles.arrow}
              resizeMode='contain'
              source={require('../../assets/images/arrow_back.png')}/>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.termsCont}
          onPress={() => {
            props.actions.showDrawer(false),
            Linking.openURL(`https://api.whatsapp.com/send?phone=573212133943`)
          }}>
          <Image
            style={styles.wp}
            resizeMode='contain'
            source={require('../../assets/images/ic_whatsapp.png')}/>
          <Text
            style={styles.links}>
            ¿Necesitas ayuda?
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.policyCont}
          onPress={() => {
            props.actions.showDrawer(false),
            props.actions.dialogVisible(true)
          }}>
          <Text
            style={styles.logout}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </TopSheet>
    <Dialog
      visible={props.visible}
      title={'Cerrar sesion'}
      message={'¿Estas seguro que deseas cerrar sesion?'}
      acceptTitle={'Si, cerrar sesión'}
      onAccept={() => { props.actions.logout()}}
      onClose={() => props.actions.dialogVisible(false)}
    />
    </>
  );
};

export {DrawerMenu};
