import React, {Component} from 'react';
import {View} from 'react-native';
import {Button, HelperText, TextInput} from 'react-native-paper';
import {colors, normalizeSize} from '../../../styles/basicStyles';
import {fieldErrors} from '../../../utils/screenFunctions';
import {Layout} from '../../../layouts';
import {registerEventScreenMounted} from '../../../utils/analytics';

class RecoveryPassGetCodeScreen extends Component {
  componentWillUnmount() {
    this.props.actions.clearScreen();
  }
  componentDidMount() {
    registerEventScreenMounted(
      this.props,
      'Formulario obtener código recuperación contraseña',
      'RecoveryPassGetCodeScreen',
    );
  }
  render() {
    const err = fieldErrors('mail', this.props.errors);
    return (
      <Layout
        title={'Recuperar contraseña'}
        description={
          'Ingresa tu correo electrónico para enviarte el código de recuperación de contraseña'
        }>
        <View style={{width: '100%', paddingHorizontal: normalizeSize(20)}}>
          <TextInput
            mode="outlined"
            label="Correo"
            placeholder="Ingresa tu correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            left={<TextInput.Icon icon="email-outline" />}
            value={this.props.mail || ''}
            error={!!err}
            onChangeText={(mail) => this.props.actions.mailChange(mail)}
          />
          <HelperText type="error" visible={!!err}>
            {err}
          </HelperText>

          <Button
            mode="text"
            compact
            uppercase={false}
            onPress={() => this.props.navigation.navigate('RecoveryPassSendCode')}
            style={{alignSelf: 'flex-end', marginVertical: normalizeSize(4)}}
            labelStyle={{color: colors.label}}>
            Ya tengo un código
          </Button>

          <Button
            mode="contained"
            onPress={() =>
              this.props.actions.validateCode({
                mail: this.props.mail,
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

export default RecoveryPassGetCodeScreen;
