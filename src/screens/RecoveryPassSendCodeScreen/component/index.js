import React, {Component} from 'react';
import {View} from 'react-native';
import {Button, HelperText, TextInput} from 'react-native-paper';
import {normalizeSize} from '../../../styles/basicStyles';
import {fieldErrors} from '../../../utils/screenFunctions';
import {Layout} from '../../../layouts';
import {registerEventScreenMounted} from '../../../utils/analytics';

class RecoveryPassSendCodeScreen extends Component {
  componentWillUnmount() {
    this.props.actions.clearScreen();
  }
  componentDidMount() {
    registerEventScreenMounted(
      this.props,
      'Formulario enviar código recuperación contraseña',
      'RecoveryPassSendCodeScreen',
    );
  }
  render() {
    const err = fieldErrors('code', this.props.errors);
    return (
      <Layout
        title={'Recuperar contraseña'}
        description={
          'Ingresa el código enviado a tu correo electrónico para que puedas cambiar tu contraseña.'
        }>
        <View style={{width: '100%', paddingHorizontal: normalizeSize(20)}}>
          <TextInput
            mode="outlined"
            label="Código"
            placeholder="Código de seguridad"
            autoCapitalize="characters"
            maxLength={5}
            left={<TextInput.Icon icon="lock-outline" />}
            value={this.props.code || ''}
            error={!!err}
            onChangeText={(code) => this.props.actions.codeChange(code)}
          />
          <HelperText type="error" visible={!!err}>
            {err}
          </HelperText>

          <Button
            mode="contained"
            onPress={() =>
              this.props.actions.validateCode({
                code: this.props.code,
                navigation: this.props.navigation,
              })
            }
            style={{marginTop: normalizeSize(12)}}
            contentStyle={{paddingVertical: normalizeSize(6)}}>
            Enviar
          </Button>
        </View>
      </Layout>
    );
  }
}

export default RecoveryPassSendCodeScreen;
