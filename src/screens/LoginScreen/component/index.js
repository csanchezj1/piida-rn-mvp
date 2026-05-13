import React, {Component} from 'react';
import {Image, Linking, View} from 'react-native';
import {Button, HelperText, TextInput} from 'react-native-paper';
import {getLoginStyles} from '../../../styles/screenStyles';
import {colors, normalizeSize} from '../../../styles/basicStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {fieldErrors} from '../../../utils/screenFunctions';
import {Layout} from '../../../layouts';

class Splashscreen extends Component {
  styles = getLoginStyles();
  state = {showPass: false};

  componentDidMount() {
    registerEventScreenMounted(this.props, 'Inicio de sesión', 'LoginScreen');
  }
  componentWillUnmount() {
    this.props.actions.clearScreen();
  }

  togglePass = () => this.setState((s) => ({showPass: !s.showPass}));

  render() {
    const emailErr = fieldErrors('email', this.props.errors);
    const passErr = fieldErrors('password', this.props.errors);

    return (
      <Layout description={'Por favor ingresa tus datos para iniciar sesión'}>
        <View style={{width: '100%', paddingHorizontal: normalizeSize(20)}}>
          <TextInput
            mode="outlined"
            label="Correo"
            placeholder="Ingresa tu correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            left={<TextInput.Icon icon="email-outline" />}
            value={this.props.email || ''}
            error={!!emailErr}
            onChangeText={(email) => this.props.actions.mailChange(email)}
            style={{marginBottom: normalizeSize(4)}}
          />
          <HelperText type="error" visible={!!emailErr}>
            {emailErr}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            secureTextEntry={!this.state.showPass}
            autoCapitalize="none"
            autoComplete="password"
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={this.state.showPass ? 'eye-off-outline' : 'eye-outline'}
                onPress={this.togglePass}
              />
            }
            value={this.props.password || ''}
            error={!!passErr}
            onChangeText={(password) => this.props.actions.passChange(password)}
            style={{marginTop: normalizeSize(8), marginBottom: normalizeSize(4)}}
          />
          <HelperText type="error" visible={!!passErr}>
            {passErr}
          </HelperText>

          <Button
            mode="text"
            compact
            uppercase={false}
            onPress={() => this.props.navigation.navigate('RecoveryPassGetCode')}
            style={{alignSelf: 'flex-end', marginVertical: normalizeSize(4)}}
            labelStyle={{color: colors.label}}>
            He olvidado la contraseña
          </Button>

          <Button
            mode="contained"
            onPress={() =>
              this.props.actions.login({
                email: this.props.email,
                password: this.props.password,
              })
            }
            style={{marginTop: normalizeSize(8), paddingVertical: normalizeSize(4)}}
            contentStyle={{paddingVertical: normalizeSize(6)}}>
            Ingresar
          </Button>

          <Button
            mode="text"
            uppercase={false}
            onPress={() => this.props.navigation.navigate('Register')}
            style={{alignSelf: 'center', marginTop: normalizeSize(16)}}
            labelStyle={{color: colors.label}}>
            ¿No tienes cuenta? Regístrate aquí
          </Button>

          <Button
            mode="outlined"
            uppercase={false}
            icon={() => (
              <Image
                style={{width: normalizeSize(22), height: normalizeSize(22)}}
                resizeMode="contain"
                source={require('../../../assets/images/ic_whatsapp.png')}
              />
            )}
            onPress={() =>
              Linking.openURL(`https://api.whatsapp.com/send?phone=573212133943`)
            }
            style={{
              marginTop: normalizeSize(28),
              borderColor: colors.purplishGrey,
              alignSelf: 'center',
            }}
            labelStyle={{color: colors.text}}>
            Comunícate con un asesor
          </Button>
        </View>
      </Layout>
    );
  }
}

export default Splashscreen;
