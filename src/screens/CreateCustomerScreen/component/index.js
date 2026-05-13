import React, {Component} from 'react';
import {ScrollView, View} from 'react-native';
import {Button, HelperText, TextInput} from 'react-native-paper';
import moment from 'moment';
import {SelectList, TextDate} from '../../../components';
import {normalizeSize} from '../../../styles/basicStyles';
import {fieldErrors} from '../../../utils/screenFunctions';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';

class CreateCustomerScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(this.props, 'Formulario crear cliente', 'CreateCustomerScreen');
    this.props.actions.getIdTypes();
  }
  componentWillUnmount() {
    this.props.actions.clearScreen();
  }

  field = ({label, placeholder, icon, errKey, value, onChangeText, ...rest}) => {
    const err = fieldErrors(errKey, this.props.errors);
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
        <HelperText type="error" visible={!!err}>
          {err}
        </HelperText>
      </>
    );
  };

  render() {
    return (
      <Layout
        title={'Crear'}
        subtitle={'Cliente'}
        contentContainerStyle={{justifyContent: 'flex-start'}}
        hideLogo>
        <ScrollView
          style={{width: '100%'}}
          contentContainerStyle={{paddingHorizontal: normalizeSize(16), paddingBottom: normalizeSize(40)}}>
          {this.field({
            label: 'Nombre completo',
            placeholder: 'Nombre completo',
            icon: 'account-outline',
            errKey: 'name',
            value: this.props.name,
            onChangeText: this.props.actions.nameChange,
          })}

          {this.field({
            label: 'Número telefónico',
            placeholder: 'Número telefónico',
            icon: 'cellphone',
            errKey: 'phone',
            value: this.props.phone,
            onChangeText: this.props.actions.phoneChange,
            keyboardType: 'phone-pad',
          })}

          <SelectList
            label={'Tipo de identificación'}
            placeholder="Tipo de identificación"
            value={this.props.idType ? this.props.idType.label : null}
            icon={require('../../../assets/images/badge_black.png')}
            variables={this.props.idTypes}
            onValueChange={(idType) => this.props.actions.idTypeChange(idType)}
          />

          {this.field({
            label: 'Número de identificación',
            placeholder: 'Número de identificación',
            icon: 'badge-account-outline',
            errKey: 'idNumber',
            value: this.props.idNumber,
            onChangeText: this.props.actions.idNumberChange,
          })}

          {this.props.idType?.label === 'NIT' &&
            this.field({
              label: 'Dígito de verificación',
              placeholder: 'Dígito de verificación',
              icon: 'badge-account-outline',
              errKey: 'digit',
              value: this.props.digit,
              onChangeText: this.props.actions.digitChange,
              keyboardType: 'number-pad',
            })}

          {this.field({
            label: 'Correo electrónico',
            placeholder: 'Correo electrónico',
            icon: 'email-outline',
            errKey: 'email',
            value: this.props.email,
            onChangeText: this.props.actions.emailChange,
            keyboardType: 'email-address',
            autoCapitalize: 'none',
          })}

          {this.props.user.features?.includes('clients_birthday') && (
            <TextDate
              label={'Fecha de nacimiento'}
              placeholder={'Fecha de nacimiento'}
              autoCapitalize="none"
              value={
                this.props.birthday
                  ? moment(this.props.birthday).format('YYYY-MM-DD')
                  : null
              }
              date={this.props.birthday || new Date()}
              maximumDate={new Date()}
              errorText={fieldErrors('birthday', this.props.errors)}
              isError={fieldErrors('birthday', this.props.errors) != ''}
              dateSelected={(birthday) => this.props.actions.birthdayChange(birthday)}
            />
          )}

          {this.field({
            label: 'Dirección',
            placeholder: 'Dirección',
            icon: 'home-outline',
            errKey: 'address',
            value: this.props.address,
            onChangeText: this.props.actions.addressChange,
          })}

          <SelectList
            label={'Ciudad'}
            placeholder="Ciudad"
            value={this.props.city ? this.props.city.label : null}
            icon={require('../../../assets/images/ic_home.png')}
            variables={[
              {label: 'Bogotá', value: 103},
              {label: 'Cali', value: 105},
              {label: 'Otra', value: 104},
            ]}
            onValueChange={(city) => this.props.actions.cityChange(city)}
          />

          {this.props.city?.value === 104 &&
            this.field({
              label: 'Ciudad',
              placeholder: 'Escribe el nombre de la ciudad',
              icon: 'home-outline',
              errKey: 'cityName',
              value: this.props.cityName,
              onChangeText: this.props.actions.cityNameChange,
            })}

          {this.field({
            label: 'Código',
            placeholder: 'Código',
            icon: 'pound',
            errKey: 'code',
            value: this.props.code,
            onChangeText: this.props.actions.codeChange,
          })}

          <Button
            mode="contained"
            onPress={() =>
              this.props.actions.createCustomer({navigation: this.props.navigation})
            }
            style={{marginTop: normalizeSize(12)}}
            contentStyle={{paddingVertical: normalizeSize(6)}}>
            Crear cliente
          </Button>
        </ScrollView>
      </Layout>
    );
  }
}

export default CreateCustomerScreen;
