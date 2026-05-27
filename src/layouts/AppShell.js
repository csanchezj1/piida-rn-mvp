import React, {useState} from 'react';
import {Modal, StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Icon, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {fonts} from '../styles/basicStyles';
import {showDrawer, showBranchModal} from '../navigation/actions';
import {lastSaleNavTarget} from '../utils/lastSalePref';

// Shell reutilizable del rediseño tablet (diseño 08): sidebar oscuro de
// navegación principal + topbar. Cada pantalla principal envuelve su
// contenido en <AppShell active="..."> {contenido} </AppShell>.

const SIDEBAR_BG = '#1A130C';
const GOLD = '#F7A928';
const INK = '#1A130C';
const DGOLD = '#C66E00';
const MUTED = '#7E6A52';
const BG = '#FAF5EC';
const SIDE_INACTIVE = '#AA9180';
const WHITE = '#FFFFFF';

// 4 secciones del sidebar. MOVIMIENTOS apunta al tab Balance dentro del
// tab-navigator BottomMenu.
const NAV = [
  // 'venta' es especial: la ruta se resuelve dinámicamente con
  // `lastSaleNavTarget()` (VentaLibre o BottomMenu/Home) según cuál fue la
  // última pantalla de venta usada. Ver `go()` más abajo.
  {key: 'venta', label: 'VENTA', icon: 'cart-outline', route: null},
  {key: 'reportes', label: 'REPORTES', icon: 'chart-box-outline', route: 'AdvancedReports'},
  {key: 'movimientos', label: 'MOVIMIENTOS', icon: 'swap-vertical', route: 'BottomMenu', params: {screen: 'Balance'}},
  {key: 'inventario', label: 'INVENTARIO', icon: 'package-variant-closed', route: 'InventoryList'},
];

// `header` opcional: si se pasa, reemplaza la topbar default (sucursal/campana/
// usuario). Lo usa la pantalla 12 (Nueva Venta) que trae su propio header.
const AppShell = ({active, children, header}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {user} = useSelector((st) => st.userData);
  const cashShift = useSelector((st) => st.cashShiftData || {});
  const [menuOpen, setMenuOpen] = useState(false);
  // El reducer guarda como `activeShiftId` (no `cashShiftActiveId`). Antes
  // se leía el campo equivocado y el FAB siempre creía que no había turno,
  // ofreciendo "Abrir caja" aunque el back reportara uno activo.
  const hasOpenShift = (cashShift.activeShiftId ?? 0) > 0;

  // Acciones rápidas del FAB del sidebar (mismas que el speed-dial naranja).
  const fabActions = [
    {
      label: hasOpenShift ? 'Prestar / Cerrar caja' : 'Abrir caja',
      icon: 'cash-register',
      run: () => navigation.navigate('Box', {type: hasOpenShift ? 'closeBox' : 'openBox'}),
    },
    {label: 'Clientes', icon: 'account-group-outline', run: () => navigation.navigate('Clients')},
    {label: 'Productos', icon: 'package-variant', run: () => navigation.navigate('Products')},
    {label: 'Nuevo gasto', icon: 'cart-minus', run: () => navigation.navigate('Buy')},
    {label: 'Surtir inventario', icon: 'plus-box-outline', run: () => navigation.navigate('AddInventory')},
    {label: 'Trasladar de inventario', icon: 'swap-horizontal', run: () => navigation.navigate('Transfer')},
  ];

  const initials = (
    ((user?.names || '?').trim()[0] || '') + ((user?.last_names || '').trim()[0] || '')
  ).toUpperCase();
  const fullName = `${user?.names || ''} ${user?.last_names || ''}`.trim() || 'Usuario';
  const branchName = user?.branch_office_name || user?.company_name || 'Sucursal';

  const go = async (item) => {
    if (item.key === active) return;
    if (item.key === 'venta') {
      // Resolver pantalla de venta según la última que se usó.
      const target = await lastSaleNavTarget();
      if (target.route === 'BottomMenu') navigation.navigate('BottomMenu', target.params);
      else navigation.navigate(target.route);
      return;
    }
    if (item.params) navigation.navigate(item.route, item.params);
    else navigation.navigate(item.route);
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={SIDEBAR_BG} />

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <View style={s.sidebar}>
        <View style={s.logo}>
          <Text style={s.logoText}>p.</Text>
        </View>
        <View style={s.navList}>
          {NAV.map((item) => {
            const on = item.key === active;
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.7}
                style={[s.navBtn, on && s.navBtnActive]}
                onPress={() => go(item)}>
                <Icon source={item.icon} size={22} color={on ? WHITE : SIDE_INACTIVE} />
                <Text
                  style={[s.navLabel, {color: on ? WHITE : SIDE_INACTIVE}]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          style={s.fab}
          onPress={() => setMenuOpen(true)}>
          <Icon source="plus" size={28} color={WHITE} />
        </TouchableOpacity>
      </View>

      {/* ── Topbar + contenido ──────────────────────────────── */}
      <View style={s.main}>
        {header || (
        <View style={s.topbar}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={s.branchBtn}
            onPress={() => dispatch(showBranchModal(true))}>
            <Icon source="storefront-outline" size={20} color={INK} />
            <View style={{flexShrink: 1}}>
              <Text style={s.branchLabel}>SUCURSAL</Text>
              <Text style={s.branchName} numberOfLines={1}>
                {branchName}
              </Text>
            </View>
            <Icon source="chevron-down" size={16} color={MUTED} />
          </TouchableOpacity>

          <View style={{flex: 1}} />

          <TouchableOpacity
            activeOpacity={0.7}
            style={s.iconBtn}
            onPress={() => navigation.navigate('NotificationsList')}>
            <Icon source="bell-outline" size={22} color={INK} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={s.userChip}
            onPress={() => dispatch(showDrawer(true))}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
            <View style={{flexShrink: 1}}>
              <Text style={s.userName} numberOfLines={1}>
                {fullName}
              </Text>
              <Text style={s.userRole} numberOfLines={1}>
                Mi cuenta
              </Text>
            </View>
            <Icon source="menu" size={22} color={INK} />
          </TouchableOpacity>
        </View>
        )}

        {/* NOTA: en algún momento se envolvía con Pressable para cerrar el
            teclado al tap fuera. Eso bloqueaba todos los scrolls (Reportes,
            Billing, Transfer, etc.) en RN porque el Pressable consume el
            gesture aunque tenga hijos scrolleables. Solución: aplicar el
            dismiss del teclado solo en pantallas que tienen TextInput
            (vía `keyboardShouldPersistTaps='handled'` en sus ScrollView o
            con el helper KeyboardDismiss puntual). */}
        <View style={s.content}>{children}</View>
      </View>

      {/* Menú de acciones rápidas (FAB del sidebar) */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity
          activeOpacity={1}
          style={s.menuBackdrop}
          onPress={() => setMenuOpen(false)}>
          <View style={s.menuPanel}>
            <Text style={s.menuTitle}>Acciones rápidas</Text>
            {fabActions.map((a, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                style={s.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  a.run();
                }}>
                <View style={s.menuItemIcon}>
                  <Icon source={a.icon} size={20} color={GOLD} />
                </View>
                <Text style={s.menuItemText}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  // El bg dark cubre la franja del status bar (queda como barra superior).
  root: {flex: 1, flexDirection: 'row', backgroundColor: SIDEBAR_BG},

  // Sidebar
  sidebar: {
    width: 88,
    backgroundColor: SIDEBAR_BG,
    alignItems: 'center',
    paddingVertical: 20,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logoText: {
    fontFamily: fonts.bold,
    fontSize: 24,
    letterSpacing: -0.5,
    color: WHITE,
  },
  navList: {
    flex: 1,
    rowGap: 4,
  },
  navBtn: {
    width: 76,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 4,
    paddingHorizontal: 2,
  },
  navBtnActive: {
    backgroundColor: GOLD,
  },
  navLabel: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0,
    textAlign: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GOLD,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 6,
  },

  // Main column
  main: {flex: 1},
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 18,
    columnGap: 12,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE3D2',
  },
  branchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    backgroundColor: '#F0E9DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    maxWidth: 260,
  },
  branchLabel: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1,
    color: MUTED,
  },
  branchName: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: INK,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: '#EFE3D2',
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF1D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: DGOLD,
  },
  userName: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: INK,
  },
  userRole: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: MUTED,
  },
  content: {flex: 1, backgroundColor: BG},

  // Menú de acciones rápidas
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,19,12,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuPanel: {
    width: 320,
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  menuTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: MUTED,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  menuItemIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#FFF4E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: INK,
  },
});

export default AppShell;
