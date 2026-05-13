import React, {Component} from 'react';
import {ScrollView, View} from 'react-native';
import {Button, HelperText, TextInput} from 'react-native-paper';
import moment from 'moment';
import {TextDate} from '../../../components';
import {normalizeSize} from '../../../styles/basicStyles';
import {fieldErrors} from '../../../utils/screenFunctions';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';

class CreateProductScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(this.props, 'Formulario crear producto', 'CreateProductScreen');
    if (this.props.route.params && this.props.route.params.product) {
      const product = this.props.route.params.product;
      if (product.code) this.props.actions.codeChange(product.code.toString());
      if (product.code_aunap) this.props.actions.codeAunapChange(product.code_aunap.toString());
      if (product.name || product.label) this.props.actions.nameChange(product.name || product.label);
      if (product.english_name) this.props.actions.englishNameChange(product.english_name);
      if (product.scientist_name) this.props.actions.scientistNameChange(product.scientist_name);
      if (product.size) this.props.actions.sizeChange(product.size.toString());
      if (product.aquarium) this.props.actions.aquariumChange(product.aquarium.toString());
      if (product.status) this.props.actions.statusChange(product.status);
      if (product.type) this.props.actions.typeChange(product.type);
      if (product.brand) this.props.actions.brandChange(product.brand);
      if (product.ref) this.props.actions.refChange(product.ref);
      if (product.color) this.props.actions.colorChange(product.color);
      if (product.production_date)
        this.props.actions.dateChange(new Date(product.production_date));
      if (product.cost) this.props.actions.costChange(product.cost.toString());
      if (product.price) this.props.actions.priceChange(product.price.toString());
    }
  }
  componentWillUnmount() {
    this.props.actions.clearScreen();
  }

  field = ({label, placeholder, icon, errKey, value, onChangeText, description, ...rest}) => {
    const err = errKey ? fieldErrors(errKey, this.props.errors) : '';
    return (
      <>
        <TextInput
          mode="outlined"
          label={label}
          placeholder={placeholder}
          left={icon ? <TextInput.Icon icon={icon} /> : undefined}
          value={value || ''}
          error={!!err}
          onChangeText={onChangeText}
          style={{marginTop: normalizeSize(6)}}
          {...rest}
        />
        {(err || description) && (
          <HelperText type={err ? 'error' : 'info'} visible>
            {err || description}
          </HelperText>
        )}
      </>
    );
  };

  render() {
    let product = null;
    if (this.props.route.params && this.props.route.params.product) {
      product = this.props.route.params.product;
    }
    const features = this.props.user.features || [];

    return (
      <Layout
        title={product ? 'Editar' : 'Crear'}
        subtitle={'producto'}
        contentContainerStyle={{justifyContent: 'flex-start'}}
        description={
          !product && 'Recuerda que desde piida.co puedes crear de forma masiva tus productos.'
        }
        hideLogo>
        <ScrollView
          style={{width: '100%'}}
          contentContainerStyle={{paddingHorizontal: normalizeSize(16), paddingBottom: normalizeSize(40)}}>
          {this.field({
            label: features.includes('product_extra_fields') ? 'Código JR' : 'Código',
            placeholder: features.includes('product_extra_fields')
              ? 'Código JR (Opcional)'
              : 'Código del producto (Opcional)',
            icon: 'pound',
            value: this.props.code,
            onChangeText: this.props.actions.codeChange,
          })}

          {features.includes('product_extra_fields') &&
            this.field({
              label: 'Código aunap (Opcional)',
              placeholder: 'Código aunap (Opcional)',
              icon: 'tag-outline',
              value: this.props.codeAunap,
              onChangeText: this.props.actions.codeAunapChange,
            })}

          {!features.includes('product_extra_fields_production_date') &&
            this.field({
              label: features.includes('product_extra_fields') ? 'Nombre en español' : 'Nombre',
              placeholder: features.includes('product_extra_fields')
                ? 'Nombre en español'
                : 'Nombre del producto',
              icon: 'package-variant',
              errKey: 'name',
              value: this.props.name,
              onChangeText: this.props.actions.nameChange,
            })}

          {features.includes('product_extra_fields') && (
            <View>
              {this.field({
                label: 'Nombre en inglés (Opcional)',
                placeholder: 'Nombre en inglés (Opcional)',
                icon: 'package-variant',
                value: this.props.englishName,
                onChangeText: this.props.actions.englishNameChange,
              })}
              {this.field({
                label: 'Nombre científico (Opcional)',
                placeholder: 'Nombre científico (Opcional)',
                icon: 'flask-outline',
                value: this.props.scientistName,
                onChangeText: this.props.actions.scientistNameChange,
              })}
              {this.field({
                label: 'Tamaño (Opcional)',
                placeholder: 'Tamaño (Opcional)',
                icon: 'resize',
                value: this.props.size,
                onChangeText: this.props.actions.sizeChange,
              })}
              {this.field({
                label: 'Número de acuario (Opcional)',
                placeholder: 'Número de acuario (Opcional)',
                icon: 'fishbowl-outline',
                value: this.props.aquarium,
                onChangeText: this.props.actions.aquariumChange,
              })}
              {this.field({
                label: 'Estado (Opcional)',
                placeholder: 'Estado (Opcional)',
                icon: 'list-status',
                value: this.props.status,
                onChangeText: this.props.actions.statusChange,
              })}
            </View>
          )}

          {features.includes('product_extra_fields_big_riders') && (
            <View>
              {this.field({
                label: 'Talla (Opcional)',
                placeholder: 'Talla (Opcional)',
                icon: 'resize',
                value: this.props.size,
                onChangeText: this.props.actions.sizeChange,
              })}
              {this.field({
                label: 'Tipo de producto',
                placeholder: 'Tipo de producto',
                icon: 'shape-outline',
                errKey: 'type',
                value: this.props.type,
                onChangeText: this.props.actions.typeChange,
              })}
              {this.field({
                label: 'Marca',
                placeholder: 'Marca',
                icon: 'tag-multiple-outline',
                errKey: 'brand',
                value: this.props.brand,
                onChangeText: this.props.actions.brandChange,
              })}
              {this.field({
                label: 'Referencia',
                placeholder: 'Referencia',
                icon: 'identifier',
                errKey: 'ref',
                value: this.props.ref,
                onChangeText: this.props.actions.refChange,
              })}
              {this.field({
                label: 'Color (Opcional)',
                placeholder: 'Color (Opcional)',
                icon: 'palette-outline',
                value: this.props.color,
                onChangeText: this.props.actions.colorChange,
              })}
            </View>
          )}

          {features.includes('product_extra_fields_carolina_rodriguez') &&
            this.field({
              label: 'Marca (Opcional)',
              placeholder: 'Marca (Opcional)',
              icon: 'tag-multiple-outline',
              errKey: 'brand',
              value: this.props.brand,
              onChangeText: this.props.actions.brandChange,
            })}

          {features.includes('product_extra_fields_production_date') && (
            <TextDate
              label="Fecha de producción"
              placeholder="Fecha de producción"
              autoCapitalize="none"
              value={this.props.date ? moment(this.props.date).format('YYYY-MM-DD') : null}
              date={this.props.date || new Date()}
              errorText={fieldErrors('date', this.props.errors)}
              isError={fieldErrors('date', this.props.errors) != ''}
              dateSelected={(date) => this.props.actions.dateChange(date)}
            />
          )}

          {this.field({
            label: 'Costo',
            placeholder: 'Costo del producto',
            icon: 'currency-usd',
            errKey: 'cost',
            value: this.props.cost,
            onChangeText: this.props.actions.costChange,
            keyboardType: 'numeric',
          })}

          {this.field({
            label: 'Precio',
            placeholder: 'Precio venta del producto',
            icon: 'tag-text-outline',
            errKey: 'price',
            value: this.props.price,
            onChangeText: this.props.actions.priceChange,
            keyboardType: 'numeric',
          })}

          {!product &&
            this.field({
              label: 'Cantidad en inventario',
              placeholder: 'Cantidad en inventario',
              icon: 'package-variant-closed',
              errKey: 'qty',
              value: this.props.qty,
              onChangeText: this.props.actions.qtyChange,
              keyboardType: 'numeric',
              description:
                'Ingresa la cantidad para que puedas usar el producto en la orden. Lo ingresado será el inventario del producto en la sucursal.',
            })}

          <Button
            mode="contained"
            onPress={
              !product
                ? () =>
                    this.props.actions.createProduct({
                      navigation: this.props.navigation,
                      features: this.props.user.features,
                      cat: this.props.route.params ? this.props.route.params.cat : null,
                    })
                : () =>
                    this.props.actions.editProduct({
                      productId: product.nid,
                      navigation: this.props.navigation,
                      features: this.props.user.features,
                    })
            }
            style={{marginTop: normalizeSize(12)}}
            contentStyle={{paddingVertical: normalizeSize(6)}}>
            {product ? 'Editar producto' : 'Crear producto'}
          </Button>
        </ScrollView>
      </Layout>
    );
  }
}

export default CreateProductScreen;
