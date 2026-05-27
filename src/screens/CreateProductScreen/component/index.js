import React, { Component } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon, Text } from 'react-native-paper';
import moment from 'moment';
import AppShell from '../../../layouts/AppShell';
import { TextDate } from '../../../components';
import { fonts } from '../../../styles/basicStyles';
import { fieldErrors } from '../../../utils/screenFunctions';
import { registerEventScreenMounted } from '../../../utils/analytics';

const GOLD = '#F7A928';
const DGOLD = '#C66E00';
const TINT_GOLD = '#FFF1D6';
const INK = '#1A130C';
const MUTED = '#7E6A52';
const SUBTLE = '#A89580';
const WHITE = '#FFFFFF';
const BORDER_SOFT = '#EFE3D2';
const FIELD_BG = '#FFFAF0';
const FIELD_BORDER = '#F0E2C4';
const GREEN_BG = '#E6F4EA';
const GREEN_TXT = '#1F8A4C';
const GREEN_BORDER = '#BFE6CD';
const ERROR = '#D7263D';
const HINT_BG = '#FFF7E0';

const parseMoney = (str) => {
  if (str == null || str === '') return 0;
  const cleaned = String(str).replace(/[^0-9]/g, '');
  return Number(cleaned) || 0;
};
const fmtMoney = (n) => '$' + (Math.round(Number(n) || 0)).toLocaleString('es-CO');

// Field rendered as gold-tinted card (matches design).
const FormField = ({
  label,
  icon,
  value,
  placeholder,
  onChangeText,
  error,
  keyboardType,
  suffix,
  onPress,
  rightIcon,
  prefix,
}) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={[st.fieldCard, error && st.fieldCardError]}
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}>
      <View style={st.fieldLabelRow}>
        {icon ? <Icon source={icon} size={14} color={DGOLD} /> : null}
        <Text style={st.fieldLabel}>{label}</Text>
      </View>
      <View style={st.fieldInputRow}>
        {prefix ? <Text style={st.fieldPrefix}>{prefix}</Text> : null}
        {onPress ? (
          <Text
            style={[
              st.fieldValueText,
              !value && st.fieldPlaceholderText,
            ]}
            numberOfLines={1}>
            {value || placeholder}
          </Text>
        ) : (
          <RNTextInput
            style={st.fieldInput}
            value={value || ''}
            placeholder={placeholder}
            placeholderTextColor={SUBTLE}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
          />
        )}
        {suffix ? <Text style={st.fieldSuffix}>{suffix}</Text> : null}
        {rightIcon ? <Icon source={rightIcon} size={18} color={MUTED} /> : null}
      </View>
      {error ? <Text style={st.fieldError}>{error}</Text> : null}
    </Wrapper>
  );
};

class CreateProductScreen extends Component {
  state = {
    catId: null,
    catName: '',
    catPickerOpen: false,
    catSearch: '',
  };

  componentDidMount() {
    registerEventScreenMounted(
      this.props,
      'Formulario crear producto',
      'CreateProductScreen',
    );
    const product = this.props.route?.params?.product;
    if (product) {
      if (product.code) this.props.actions.codeChange(product.code.toString());
      if (product.code_aunap)
        this.props.actions.codeAunapChange(product.code_aunap.toString());
      if (product.name || product.label)
        this.props.actions.nameChange(product.name || product.label);
      if (product.english_name)
        this.props.actions.englishNameChange(product.english_name);
      if (product.scientist_name)
        this.props.actions.scientistNameChange(product.scientist_name);
      if (product.size) this.props.actions.sizeChange(product.size.toString());
      if (product.aquarium)
        this.props.actions.aquariumChange(product.aquarium.toString());
      if (product.status) this.props.actions.statusChange(product.status);
      if (product.type) this.props.actions.typeChange(product.type);
      if (product.brand) this.props.actions.brandChange(product.brand);
      if (product.ref) this.props.actions.refChange(product.ref);
      if (product.color) this.props.actions.colorChange(product.color);
      if (product.production_date)
        this.props.actions.dateChange(new Date(product.production_date));
      if (product.cost) this.props.actions.costChange(product.cost.toString());
      if (product.price) this.props.actions.priceChange(product.price.toString());
      if (product.cat || product.category) {
        this.setState({
          catId: product.cat ?? null,
          catName: product.category ?? '',
        });
      }
    }
    // Fetch categorías para el picker (solo si no vienen ya en redux).
    if (!this.props.categories) {
      this.props.actions.getProductCat();
    }
  }

  componentWillUnmount() {
    this.props.actions.clearScreen();
  }

  err = (key) => fieldErrors(key, this.props.errors) || '';

  openCatPicker = () => this.setState({ catPickerOpen: true, catSearch: '' });
  closeCatPicker = () => this.setState({ catPickerOpen: false });

  pickCategory = (cat) =>
    this.setState({ catId: cat.tid, catName: cat.name, catPickerOpen: false });

  clearCategory = () =>
    this.setState({ catId: null, catName: '' });

  submit = () => {
    const product = this.props.route?.params?.product;
    const routeCat = this.props.route?.params?.cat ?? null;
    if (product) {
      this.props.actions.editProduct({
        productId: product.nid,
        navigation: this.props.navigation,
        features: this.props.user.features,
      });
    } else {
      this.props.actions.createProduct({
        navigation: this.props.navigation,
        features: this.props.user.features,
        cat: routeCat ?? this.state.catId ?? null,
      });
    }
  };

  renderSubHeader(isEdit) {
    return (
      <View style={st.subHeader}>
        <TouchableOpacity
          style={st.backBtn}
          activeOpacity={0.7}
          onPress={() => this.props.navigation.goBack()}>
          <Icon source="arrow-left" size={22} color={INK} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 4 }}>
          <Text style={st.subHeaderTitle}>
            {isEdit ? 'Editar producto' : 'Crear producto'}
          </Text>
          <Text style={st.subHeaderSub}>
            {isEdit
              ? 'Modifica los datos del producto'
              : 'Agrega un nuevo producto a tu catálogo'}
          </Text>
        </View>
      </View>
    );
  }

  renderSection(title, children) {
    return (
      <View style={st.section}>
        <Text style={st.sectionLabel}>{title}</Text>
        <View style={{ rowGap: 12 }}>{children}</View>
      </View>
    );
  }

  renderPreview(features) {
    const name = this.props.name || 'Nombre del producto';
    const code = this.props.code || '';
    const category = this.state.catName || '';
    const codeAndCat = [code, category].filter(Boolean).join(' · ');
    const price = parseMoney(this.props.price);

    return (
      <View style={st.previewWrap}>
        <Text style={st.previewLabel}>VISTA PREVIA</Text>
        <View style={st.previewCard}>
          <View style={st.previewIcon}>
            <Icon source="cube-outline" size={26} color={DGOLD} />
          </View>
          <Text style={st.previewName} numberOfLines={3}>
            {name}
          </Text>
          {!!codeAndCat && (
            <Text style={st.previewMeta} numberOfLines={2}>
              {codeAndCat}
            </Text>
          )}
          <View style={st.previewPriceRow}>
            <Text style={st.previewPriceLabel}>PRECIO</Text>
            <Text style={st.previewPrice}>{fmtMoney(price)}</Text>
          </View>
        </View>
        <Text style={st.previewHint}>
          Así verá el cajero el producto en el catálogo de Nueva Venta.
        </Text>
      </View>
    );
  }

  renderCatPicker() {
    const cats = this.props.categories || [];
    const q = this.state.catSearch.trim().toLowerCase();
    const filtered = q
      ? cats.filter((c) => (c.name || '').toLowerCase().includes(q))
      : cats;

    return (
      <Modal
        visible={this.state.catPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={this.closeCatPicker}>
        <TouchableOpacity
          activeOpacity={1}
          style={st.pickerBackdrop}
          onPress={this.closeCatPicker}>
          <TouchableOpacity activeOpacity={1} style={st.pickerPanel}>
            <View style={st.pickerHeader}>
              <Text style={st.pickerTitle}>Selecciona una categoría</Text>
              <TouchableOpacity onPress={this.closeCatPicker} style={st.pickerClose}>
                <Icon source="close" size={20} color={INK} />
              </TouchableOpacity>
            </View>
            <View style={st.pickerSearch}>
              <Icon source="magnify" size={18} color={MUTED} />
              <RNTextInput
                style={st.pickerSearchInput}
                placeholder="Buscar categoría..."
                placeholderTextColor={SUBTLE}
                value={this.state.catSearch}
                onChangeText={(t) => this.setState({ catSearch: t })}
              />
            </View>
            {!cats.length ? (
              <View style={st.pickerEmpty}>
                <Text style={st.pickerEmptyTxt}>
                  Aún no tienes categorías. Podés dejarla vacía o crearla en
                  Productos → Categorías.
                </Text>
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(c) => String(c.tid)}
                style={{ maxHeight: 360 }}
                ItemSeparatorComponent={() => (
                  <View style={st.pickerSep} />
                )}
                renderItem={({ item }) => {
                  const on = this.state.catId === item.tid;
                  return (
                    <TouchableOpacity
                      style={[st.pickerRow, on && st.pickerRowActive]}
                      activeOpacity={0.7}
                      onPress={() => this.pickCategory(item)}>
                      <Icon
                        source="tag-outline"
                        size={18}
                        color={on ? DGOLD : MUTED}
                      />
                      <Text
                        style={[
                          st.pickerRowTxt,
                          on && st.pickerRowTxtActive,
                        ]}>
                        {item.name}
                      </Text>
                      {on && <Icon source="check" size={18} color={DGOLD} />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
            {this.state.catId != null && (
              <TouchableOpacity
                style={st.pickerClear}
                activeOpacity={0.8}
                onPress={() => {
                  this.clearCategory();
                  this.closeCatPicker();
                }}>
                <Icon source="close-circle-outline" size={16} color={MUTED} />
                <Text style={st.pickerClearTxt}>Quitar categoría</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }

  render() {
    const product = this.props.route?.params?.product;
    const isEdit = !!product;
    const features = this.props.user.features || [];
    const routeCat = this.props.route?.params?.cat ?? null;

    const cost = parseMoney(this.props.cost);
    const price = parseMoney(this.props.price);
    const profit = price - cost;
    const margin =
      price > 0 ? Math.round((profit / price) * 100) : null;
    const showMargin = price > 0 && cost > 0;

    return (
      <AppShell active="inventario">
        <View style={st.split}>
          {/* ── Form column ── */}
          <ScrollView
            style={st.formCol}
            contentContainerStyle={st.formContent}
            showsVerticalScrollIndicator={false}>
            {this.renderSubHeader(isEdit)}

            {this.renderSection('INFORMACIÓN BÁSICA', [
              !features.includes('product_extra_fields_production_date') && (
                <FormField
                  key="name"
                  label="NOMBRE DEL PRODUCTO"
                  icon="package-variant"
                  placeholder="Ej: Tornillo 1/2 pulgada"
                  value={this.props.name}
                  onChangeText={this.props.actions.nameChange}
                  error={this.err('name')}
                />
              ),
              <FormField
                key="code"
                label={features.includes('product_extra_fields') ? 'CÓDIGO JR' : 'CÓDIGO'}
                icon="pound"
                placeholder="Ej: TOR-123"
                value={this.props.code}
                onChangeText={this.props.actions.codeChange}
              />,
              features.includes('product_extra_fields') && (
                <FormField
                  key="codeAunap"
                  label="CÓDIGO AUNAP"
                  icon="tag-outline"
                  placeholder="Opcional"
                  value={this.props.codeAunap}
                  onChangeText={this.props.actions.codeAunapChange}
                />
              ),
              !routeCat && (
                <FormField
                  key="category"
                  label="CATEGORÍA"
                  icon="shape-outline"
                  placeholder="Selecciona una categoría"
                  value={this.state.catName}
                  rightIcon="chevron-right"
                  onPress={this.openCatPicker}
                />
              ),
            ])}

            {this.renderSection('PRECIO Y COSTO', [
              <View key="prices" style={st.twoCol}>
                <View style={{ flex: 1 }}>
                  <FormField
                    label="COSTO"
                    icon="currency-usd"
                    placeholder="0"
                    prefix="$"
                    value={this.props.cost ? this.props.cost.replace(/^\$/, '') : ''}
                    onChangeText={this.props.actions.costChange}
                    keyboardType="numeric"
                    error={this.err('cost')}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FormField
                    label="PRECIO DE VENTA"
                    icon="tag-text-outline"
                    placeholder="0"
                    prefix="$"
                    value={this.props.price ? this.props.price.replace(/^\$/, '') : ''}
                    onChangeText={this.props.actions.priceChange}
                    keyboardType="numeric"
                    error={this.err('price')}
                  />
                </View>
              </View>,
              showMargin && (
                <View key="margin" style={st.marginPill}>
                  <Icon source="trending-up" size={16} color={GREEN_TXT} />
                  <Text style={st.marginPillTxt}>
                    <Text style={st.marginPillBold}>Margen: </Text>
                    <Text style={st.marginPillBold}>{margin}%</Text>
                    {profit > 0 && (
                      <>
                        <Text> · Ganancia </Text>
                        <Text style={st.marginPillBold}>{fmtMoney(profit)}</Text>
                        <Text> por unidad</Text>
                      </>
                    )}
                  </Text>
                </View>
              ),
            ])}

            {!isEdit &&
              this.renderSection('INVENTARIO INICIAL', [
                <FormField
                  key="qty"
                  label="CANTIDAD EN INVENTARIO"
                  icon="package-variant-closed"
                  placeholder="0"
                  suffix="unidades"
                  value={this.props.qty}
                  onChangeText={this.props.actions.qtyChange}
                  keyboardType="numeric"
                  error={this.err('qty')}
                />,
                <View key="hint" style={st.hintCard}>
                  <Icon source="information-outline" size={14} color={DGOLD} />
                  <Text style={st.hintTxt}>
                    Esta es la cantidad que se sumará al inventario de tu sucursal
                    activa. Después podés ajustarla desde "Surtir inventario".
                  </Text>
                </View>,
              ])}

            {/* ── Información adicional (features opcionales) ── */}
            {(features.includes('product_extra_fields') ||
              features.includes('product_extra_fields_big_riders') ||
              features.includes('product_extra_fields_carolina_rodriguez') ||
              features.includes('product_extra_fields_production_date')) &&
              this.renderSection('INFORMACIÓN ADICIONAL', [
                features.includes('product_extra_fields_production_date') && (
                  <View key="date" style={st.fieldCard}>
                    <View style={st.fieldLabelRow}>
                      <Icon source="calendar-outline" size={14} color={DGOLD} />
                      <Text style={st.fieldLabel}>FECHA DE PRODUCCIÓN</Text>
                    </View>
                    <View style={{ marginTop: 6 }}>
                      <TextDate
                        label=""
                        placeholder="YYYY-MM-DD"
                        value={
                          this.props.date
                            ? moment(this.props.date).format('YYYY-MM-DD')
                            : null
                        }
                        date={this.props.date || new Date()}
                        errorText={this.err('date')}
                        isError={!!this.err('date')}
                        dateSelected={(d) => this.props.actions.dateChange(d)}
                      />
                    </View>
                  </View>
                ),
                features.includes('product_extra_fields') && (
                  <React.Fragment key="extraFields">
                    <FormField
                      label="NOMBRE EN ESPAÑOL"
                      icon="translate"
                      placeholder="Nombre en español"
                      value={this.props.name}
                      onChangeText={this.props.actions.nameChange}
                      error={this.err('name')}
                    />
                    <FormField
                      label="NOMBRE EN INGLÉS"
                      placeholder="Opcional"
                      value={this.props.englishName}
                      onChangeText={this.props.actions.englishNameChange}
                    />
                    <FormField
                      label="NOMBRE CIENTÍFICO"
                      placeholder="Opcional"
                      value={this.props.scientistName}
                      onChangeText={this.props.actions.scientistNameChange}
                    />
                    <FormField
                      label="TAMAÑO"
                      placeholder="Opcional"
                      value={this.props.size}
                      onChangeText={this.props.actions.sizeChange}
                    />
                    <FormField
                      label="NÚMERO DE ACUARIO"
                      placeholder="Opcional"
                      value={this.props.aquarium}
                      onChangeText={this.props.actions.aquariumChange}
                    />
                    <FormField
                      label="ESTADO"
                      placeholder="Opcional"
                      value={this.props.status}
                      onChangeText={this.props.actions.statusChange}
                    />
                  </React.Fragment>
                ),
                features.includes('product_extra_fields_big_riders') && (
                  <React.Fragment key="bigRiders">
                    <FormField
                      label="TALLA"
                      placeholder="Opcional"
                      value={this.props.size}
                      onChangeText={this.props.actions.sizeChange}
                    />
                    <FormField
                      label="TIPO DE PRODUCTO"
                      icon="shape-outline"
                      placeholder="Tipo"
                      value={this.props.type}
                      onChangeText={this.props.actions.typeChange}
                      error={this.err('type')}
                    />
                    <FormField
                      label="MARCA"
                      placeholder="Marca"
                      value={this.props.brand}
                      onChangeText={this.props.actions.brandChange}
                      error={this.err('brand')}
                    />
                    <FormField
                      label="REFERENCIA"
                      placeholder="Referencia"
                      value={this.props.ref}
                      onChangeText={this.props.actions.refChange}
                      error={this.err('ref')}
                    />
                    <FormField
                      label="COLOR"
                      placeholder="Opcional"
                      value={this.props.color}
                      onChangeText={this.props.actions.colorChange}
                    />
                  </React.Fragment>
                ),
                features.includes('product_extra_fields_carolina_rodriguez') && (
                  <FormField
                    key="carolinaBrand"
                    label="MARCA"
                    placeholder="Opcional"
                    value={this.props.brand}
                    onChangeText={this.props.actions.brandChange}
                    error={this.err('brand')}
                  />
                ),
              ])}

            <TouchableOpacity
              style={st.saveBtn}
              activeOpacity={0.85}
              onPress={this.submit}>
              <Icon source={isEdit ? 'check' : 'plus'} size={20} color={WHITE} />
              <Text style={st.saveBtnTxt}>
                {isEdit ? 'Guardar cambios' : 'Crear producto'}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* ── Preview column ── */}
          <View style={st.previewCol}>{this.renderPreview(features)}</View>
        </View>

        {this.renderCatPicker()}
      </AppShell>
    );
  }
}

const st = StyleSheet.create({
  split: { flex: 1, flexDirection: 'row' },
  formCol: { flex: 1 },
  formContent: { paddingHorizontal: 24, paddingBottom: 60, paddingTop: 8 },
  previewCol: {
    width: 320,
    backgroundColor: WHITE,
    borderLeftWidth: 1,
    borderLeftColor: BORDER_SOFT,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subHeaderTitle: { fontFamily: fonts.bold, fontSize: 20, color: INK },
  subHeaderSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },

  section: { marginTop: 18 },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: SUBTLE,
    marginBottom: 10,
  },

  fieldCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  fieldCardError: { borderColor: ERROR },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
  },
  fieldLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: DGOLD,
  },
  fieldInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  fieldPrefix: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: INK,
    marginRight: 4,
  },
  fieldInput: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: INK,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  fieldValueText: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: INK,
    paddingVertical: 6,
  },
  fieldPlaceholderText: { color: SUBTLE, fontFamily: fonts.regular },
  fieldSuffix: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: MUTED,
    marginLeft: 8,
  },
  fieldError: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: ERROR,
  },

  twoCol: { flexDirection: 'row', columnGap: 12 },

  marginPill: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: GREEN_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GREEN_BORDER,
  },
  marginPillTxt: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: GREEN_TXT,
    lineHeight: 18,
  },
  marginPillBold: { fontFamily: fonts.bold },

  hintCard: {
    flexDirection: 'row',
    columnGap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: HINT_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
  },
  hintTxt: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
    lineHeight: 16,
  },

  saveBtn: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    height: 52,
    borderRadius: 14,
    backgroundColor: GOLD,
  },
  saveBtnTxt: { fontFamily: fonts.bold, fontSize: 15, color: WHITE },

  // Preview
  previewWrap: { flex: 1 },
  previewLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: SUBTLE,
    marginBottom: 10,
  },
  previewCard: {
    backgroundColor: FIELD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FIELD_BORDER,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: TINT_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  previewName: { fontFamily: fonts.bold, fontSize: 18, color: INK, lineHeight: 22 },
  previewMeta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  previewPriceRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: FIELD_BORDER,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewPriceLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: SUBTLE,
  },
  previewPrice: { fontFamily: fonts.bold, fontSize: 22, color: INK },
  previewHint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: MUTED,
    marginTop: 12,
    lineHeight: 15,
  },

  // Category picker modal
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,19,12,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pickerPanel: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_SOFT,
  },
  pickerTitle: { flex: 1, fontFamily: fonts.bold, fontSize: 15, color: INK },
  pickerClose: { padding: 4 },
  pickerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    marginHorizontal: 14,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: BORDER_SOFT,
  },
  pickerSearchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: INK,
    paddingVertical: 0,
  },
  pickerEmpty: { paddingHorizontal: 22, paddingVertical: 30 },
  pickerEmptyTxt: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 18,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  pickerRowActive: { backgroundColor: TINT_GOLD },
  pickerRowTxt: { flex: 1, fontFamily: fonts.semiBold, fontSize: 14, color: INK },
  pickerRowTxtActive: { color: DGOLD },
  pickerSep: { height: 1, backgroundColor: BORDER_SOFT, marginHorizontal: 18 },
  pickerClear: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 6,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER_SOFT,
  },
  pickerClearTxt: { fontFamily: fonts.semiBold, fontSize: 13, color: MUTED },
});

export default CreateProductScreen;
