import React, {Component} from 'react';
import {Image, ScrollView, View} from 'react-native';
import {Button, Card, HelperText, List, Text, TextInput} from 'react-native-paper';
import {fonts, colors, normalizeSize} from '../../../styles/basicStyles';
import {Layout} from '../../../layouts';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {CreditCardInput} from '../../../utils/credit-card-input';

class CreateCreditCardScreen extends Component {
  componentWillUnmount() {
    this.props.actions.clear();
  }

  componentDidMount() {
    if (this.props.user) {
      this.props.actions.identificationChange(this.props.user.identification);
    }
    if (this.props.info.cards.length > 0) {
      this.props.actions.changeMode('showCards');
    }
    registerEventScreenMounted(this.props, 'Formulario crear tarjeta de crédito', 'CreateCreditCardScreen');
  }

  render() {
    return (
      <Layout
        title={'Suscripción Premium'}
        subtitle={'Piida ' + this.props.price.name}
        onBack={() => this.props.navigation.goBack()}
        description={
          this.props.planSelected.title + '\n' + this.props.price.new_value + ' ' + this.props.price.name
        }
        hideLogo={true}>
        <ScrollView
          style={{width: '100%'}}
          contentContainerStyle={{
            paddingHorizontal: normalizeSize(16),
            paddingBottom: normalizeSize(40),
          }}>
          <View style={{alignItems: 'center', marginVertical: normalizeSize(8)}}>
            <Text variant="bodySmall" style={{color: colors.purplishGrey}}>
              Pago confiable a través de
            </Text>
            <Image
              style={{
                height: normalizeSize(40),
                width: normalizeSize(100),
                resizeMode: 'contain',
                marginTop: normalizeSize(4),
              }}
              source={require('../../../assets/images/payu.png')}
            />
          </View>

          {this.props.mode == 'showCards' ? (
            <View>
              <Button
                mode="text"
                onPress={() => this.props.actions.changeMode('createCard')}
                style={{alignSelf: 'flex-end'}}>
                Agregar y cambiar tarjeta
              </Button>
              <Text
                variant="titleMedium"
                style={{color: colors.label, marginTop: normalizeSize(8), marginBottom: normalizeSize(4)}}>
                Tus métodos de pago
              </Text>
              <Card mode="outlined" style={{backgroundColor: '#FFFFFF'}}>
                <Card.Content>
                  {this.props.info.cards.map((item) => (
                    <List.Item
                      key={item.nid}
                      title={item.number}
                      left={() => (
                        <Image
                          source={{uri: item.image}}
                          style={{
                            height: normalizeSize(35),
                            width: normalizeSize(50),
                            resizeMode: 'contain',
                            alignSelf: 'center',
                            marginRight: normalizeSize(8),
                          }}
                        />
                      )}
                    />
                  ))}
                </Card.Content>
              </Card>
            </View>
          ) : (
            <View>
              {this.props.info.cards.length > 0 && (
                <Button
                  mode="text"
                  onPress={() => this.props.actions.changeMode('showCards')}
                  style={{alignSelf: 'flex-end'}}>
                  Ver mis métodos de pago
                </Button>
              )}
              <Card mode="outlined" style={{backgroundColor: '#FFFFFF', marginTop: normalizeSize(8)}}>
                <Card.Content>
                  <CreditCardInput
                    requiresName={true}
                    onChange={(form) => this.props.actions.cardFormChange(form)}
                    placeholders={{
                      number: 'Número de la tarjeta',
                      expiry: 'MM/AA',
                      cvc: 'CVC',
                      name: 'Nombre del titular',
                    }}
                    cardFontFamily={fonts.regular}
                    allowScroll={true}
                    invalidColor={colors.error}
                    placeholderColor={colors.inputPlaceholder}
                    labels={{}}
                  />
                  <HelperText type="error" visible={!!this.props.ccvError}>
                    {this.props.ccvError}
                  </HelperText>
                  <HelperText type="error" visible={!!this.props.expiryError}>
                    {this.props.expiryError}
                  </HelperText>
                  <HelperText type="error" visible={!!this.props.nameError}>
                    {this.props.nameError}
                  </HelperText>
                  <HelperText type="error" visible={!!this.props.numberError}>
                    {this.props.numberError}
                  </HelperText>

                  <TextInput
                    mode="outlined"
                    label="Número de identificación"
                    placeholder="Número de identificación"
                    left={<TextInput.Icon icon="card-account-details-outline" />}
                    value={this.props.idForm || ''}
                    error={this.props.idError != null}
                    onChangeText={(identification) =>
                      this.props.actions.identificationChange(identification)
                    }
                    style={{marginTop: normalizeSize(8)}}
                  />
                  <HelperText type="error" visible={!!this.props.idError}>
                    {this.props.idError}
                  </HelperText>
                </Card.Content>
              </Card>
            </View>
          )}

          <Button
            mode="contained"
            onPress={() => this.props.actions.createCard(this.props.navigation)}
            style={{marginTop: normalizeSize(16)}}
            contentStyle={{paddingVertical: normalizeSize(6)}}>
            Continuar con la suscripción
          </Button>
        </ScrollView>
      </Layout>
    );
  }
}
export default CreateCreditCardScreen;
