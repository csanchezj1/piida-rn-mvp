import React, {Component} from 'react';
import {View} from 'react-native';
import {Button, HelperText, Text, TextInput} from 'react-native-paper';
import {getLoginStyles} from '../../../styles/screenStyles';
import {colors, normalizeSize} from '../../../styles/basicStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {SelectList} from '../../../components';
import {fieldErrors} from '../../../utils/screenFunctions';
import {Layout} from '../../../layouts';

class RegisterScreen extends Component {
  styles = getLoginStyles();
  state = {showPass: false};

  goalValue() {
    let goal = [];
    if (this.props.appGoal.length > 0) {
      this.props.appGoal.map((item) => {
        goal.push(item.label);
      });
    }
    return goal;
  }

  componentDidMount() {
    registerEventScreenMounted(this.props, 'Crear cuenta', 'RegisterScreen');
  }
  componentWillUnmount() {
    this.props.actions.clearScreen();
  }

  togglePass = () => this.setState((s) => ({showPass: !s.showPass}));

  renderField = ({label, placeholder, icon, errorKey, value, onChangeText, ...rest}) => {
    const err = fieldErrors(errorKey, this.props.errors);
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
          style={{marginTop: normalizeSize(8)}}
          {...rest}
        />
        <HelperText type="error" visible={!!err}>
          {err}
        </HelperText>
      </>
    );
  };

  render() {
    const passErr = fieldErrors('password', this.props.errors);
    const businessErr = fieldErrors('business', this.props.errors);
    const businessTextErr = fieldErrors('businessText', this.props.errors);

    return (
      <Layout
        hideLogo
        contentContainerStyle={{justifyContent: 'flex-start'}}
        title={'Crea una cuenta'}>
        <View style={{width: '100%', paddingHorizontal: normalizeSize(20)}}>
          <Text variant="bodyMedium" style={{marginVertical: normalizeSize(8)}}>
            Ingresa tus datos personales
          </Text>

          {this.renderField({
            label: 'Nombres',
            placeholder: 'Tus nombres',
            icon: 'account-outline',
            errorKey: 'name',
            value: this.props.name,
            onChangeText: this.props.actions.nameChange,
            autoCapitalize: 'words',
          })}

          {this.renderField({
            label: 'Apellidos',
            placeholder: 'Tus apellidos',
            icon: 'account-multiple-outline',
            errorKey: 'lastName',
            value: this.props.lastName,
            onChangeText: this.props.actions.lastNameChange,
            autoCapitalize: 'words',
          })}

          {this.renderField({
            label: 'Correo',
            placeholder: 'Tu correo electrónico',
            icon: 'email-outline',
            errorKey: 'email',
            value: this.props.email,
            onChangeText: this.props.actions.mailChange,
            keyboardType: 'email-address',
            autoCapitalize: 'none',
            autoComplete: 'email',
          })}

          {this.renderField({
            label: 'Número telefónico',
            placeholder: 'Tu número telefónico',
            icon: 'cellphone',
            errorKey: 'phone',
            value: this.props.phone,
            onChangeText: this.props.actions.phoneChange,
            keyboardType: 'phone-pad',
          })}

          {this.renderField({
            label: 'Empresa',
            placeholder: 'Nombre de tu negocio',
            icon: 'briefcase-outline',
            errorKey: 'company',
            value: this.props.company,
            onChangeText: this.props.actions.companyChange,
          })}

          {/* SelectList queda con su look propio hasta que migremos
              el control de dropdown — Paper no trae uno integrado y migrar
              esto requiere refactor mayor del flujo del SelectList. */}
          <SelectList
            style={[this.styles.input, {marginTop: normalizeSize(8)}]}
            label={'Tipo de negocio'}
            isError={!!businessErr}
            value={this.props.business ? this.props.business.label : null}
            variables={this.props.businessType}
            icon={require('../../../assets/images/partner.png')}
            onValueChange={(business) => this.props.actions.businessChange(business)}
          />
          <HelperText type="error" visible={!!businessErr}>
            {businessErr}
          </HelperText>

          {this.props.business && this.props.business.label == 'Otro' &&
            this.renderField({
              label: 'Tipo de negocio',
              placeholder: 'Escribe el tipo de negocio',
              icon: 'briefcase-edit-outline',
              errorKey: 'businessText',
              value: this.props.businessText,
              onChangeText: this.props.actions.businessTextChange,
            })}

          <TextInput
            mode="outlined"
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            secureTextEntry={!this.state.showPass}
            autoCapitalize="none"
            autoComplete="password-new"
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={this.state.showPass ? 'eye-off-outline' : 'eye-outline'}
                onPress={this.togglePass}
              />
            }
            value={this.props.password || ''}
            error={!!passErr}
            onChangeText={this.props.actions.passChange}
            style={{marginTop: normalizeSize(8)}}
          />
          <HelperText type="error" visible={!!passErr}>
            {passErr}
          </HelperText>

          <Button
            mode="contained"
            onPress={() =>
              this.props.actions.verify({
                name: this.props.name,
                lastName: this.props.lastName,
                email: this.props.email,
                phone: this.props.phone,
                password: this.props.password,
                company: this.props.company,
                business: this.props.business,
                businessText: this.props.businessText,
                navigation: this.props.navigation,
              })
            }
            style={{marginTop: normalizeSize(16), marginBottom: normalizeSize(24)}}
            contentStyle={{paddingVertical: normalizeSize(6)}}>
            Continuar
          </Button>
        </View>
      </Layout>
    );
  }
}

export default RegisterScreen;
