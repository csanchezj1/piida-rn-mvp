import React, {Component} from 'react';
import {View} from 'react-native';
import {Button, HelperText, TextInput} from 'react-native-paper';
import {normalizeSize} from '../../../styles/basicStyles';
import {fieldErrors} from '../../../utils/screenFunctions';
import {Layout} from '../../../layouts';
import {registerEventScreenMounted} from '../../../utils/analytics';

class ChangePassScreen extends Component {
  state = {showPass: false, showConfirm: false};

  componentWillUnmount() {
    this.props.actions.clearScreen();
  }
  componentDidMount() {
    registerEventScreenMounted(
      this.props,
      'Formulario cambio de contraseña',
      'ChangePassScreen',
    );
  }

  togglePass = () => this.setState((s) => ({showPass: !s.showPass}));
  toggleConfirm = () => this.setState((s) => ({showConfirm: !s.showConfirm}));

  render() {
    const passErr = fieldErrors('pass', this.props.errors);
    const confirmErr = fieldErrors('confirmPass', this.props.errors);
    return (
      <Layout
        title={'Cambiar contraseña'}
        description={'Por favor ingresa tu nueva contraseña'}>
        <View style={{width: '100%', paddingHorizontal: normalizeSize(20)}}>
          <TextInput
            mode="outlined"
            label="Contraseña"
            placeholder="Contraseña"
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
            value={this.props.pass || ''}
            error={!!passErr}
            onChangeText={this.props.actions.passChange}
          />
          <HelperText type="error" visible={!!passErr}>
            {passErr}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Confirmar contraseña"
            placeholder="Confirmar contraseña"
            secureTextEntry={!this.state.showConfirm}
            autoCapitalize="none"
            autoComplete="password-new"
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={this.state.showConfirm ? 'eye-off-outline' : 'eye-outline'}
                onPress={this.toggleConfirm}
              />
            }
            value={this.props.confirmPass || ''}
            error={!!confirmErr}
            onChangeText={this.props.actions.passConfirmChange}
            style={{marginTop: normalizeSize(8)}}
          />
          <HelperText type="error" visible={!!confirmErr}>
            {confirmErr}
          </HelperText>

          <Button
            mode="contained"
            onPress={
              this.props.route.params
                ? () =>
                    this.props.actions.changePass({
                      pass: this.props.pass,
                      confirmPass: this.props.confirmPass,
                      mail: this.props.route.params.mail,
                    })
                : () =>
                    this.props.actions.changeUserPass({
                      pass: this.props.pass,
                      confirmPass: this.props.confirmPass,
                      uid: this.props.user.uid,
                      navigation: this.props.navigation,
                    })
            }
            style={{marginTop: normalizeSize(16)}}
            contentStyle={{paddingVertical: normalizeSize(6)}}>
            Enviar
          </Button>
        </View>
      </Layout>
    );
  }
}

export default ChangePassScreen;
