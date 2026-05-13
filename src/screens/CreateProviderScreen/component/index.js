import React, {Component} from 'react';
import {ScrollView} from 'react-native';
import {Button, HelperText, TextInput} from 'react-native-paper';
import {normalizeSize} from '../../../styles/basicStyles';
import {fieldErrors} from '../../../utils/screenFunctions';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';

class CreateProviderScreen extends Component {
  componentDidMount() {
    this.props.actions.getFieldsData(this.props.user.company);
    registerEventScreenMounted(this.props, 'Formulario crear proveedor', 'CreateProviderScreen');
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
        subtitle={'proveedor'}
        contentContainerStyle={{justifyContent: 'flex-start'}}
        hideLogo>
        <ScrollView
          style={{width: '100%'}}
          contentContainerStyle={{paddingHorizontal: normalizeSize(16), paddingBottom: normalizeSize(40)}}>
          {this.field({
            label: 'Nombres',
            placeholder: 'Nombres',
            icon: 'account-outline',
            errKey: 'names',
            value: this.props.names,
            onChangeText: this.props.actions.namesChange,
            autoCapitalize: 'words',
          })}
          {this.field({
            label: 'Apellidos',
            placeholder: 'Apellidos',
            icon: 'account-multiple-outline',
            errKey: 'lastNames',
            value: this.props.lastNames,
            onChangeText: this.props.actions.lastNamesChange,
            autoCapitalize: 'words',
          })}
          {this.field({
            label: 'Número de documento',
            placeholder: 'Número de documento',
            icon: 'badge-account-outline',
            errKey: 'idNumber',
            value: this.props.idNumber,
            onChangeText: this.props.actions.idNumberChange,
            keyboardType: 'numeric',
          })}
          {this.field({
            label: 'Celular',
            placeholder: 'Celular',
            icon: 'cellphone',
            errKey: 'phone',
            value: this.props.phone,
            onChangeText: this.props.actions.phoneChange,
            keyboardType: 'phone-pad',
          })}
          {this.field({
            label: 'Ciudad',
            placeholder: 'Ciudad',
            icon: 'home-outline',
            errKey: 'city',
            value: this.props.city,
            onChangeText: this.props.actions.cityChange,
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
              this.props.actions.createProvider({
                names: this.props.names,
                lastNames: this.props.lastNames,
                idNumber: this.props.idNumber,
                gender: this.props.gender,
                phone: this.props.phone,
                city: this.props.city,
                code: this.props.code,
                navigation: this.props.navigation,
              })
            }
            style={{marginTop: normalizeSize(12)}}
            contentStyle={{paddingVertical: normalizeSize(6)}}>
            Crear proveedor
          </Button>
        </ScrollView>
      </Layout>
    );
  }
}

export default CreateProviderScreen;
