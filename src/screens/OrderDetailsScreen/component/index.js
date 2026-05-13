import React, {Component} from 'react';
import {Image, ScrollView, View} from 'react-native';
import {Card, Divider, List, Text} from 'react-native-paper';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';
import {OrderProductItem} from '../../../components';
import {NumericFormat} from 'react-number-format';
import {colors, normalizeSize} from '../../../styles/basicStyles';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

class OrderDetailsScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(this.props, 'Detalles de la orden', 'OrderDetailsScreen');
    if (this.props.route.params) {
      if (this.props.route.params.details) {
        if (this.props.route.params.details.order) {
          this.props.actions.getItems(this.props.route.params.details.order);
        }
      }
    }
  }
  componentWillUnmount() {
    this.props.actions.clear();
  }

  renderTotalRow(label, value, emphasized) {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginVertical: normalizeSize(4),
        }}>
        <Text
          variant={emphasized ? 'titleMedium' : 'bodyMedium'}
          style={{color: emphasized ? colors.label : colors.purplishGrey}}>
          {label}
        </Text>
        <NumericFormat
          value={value}
          displayType={'text'}
          thousandSeparator={'.'}
          decimalSeparator={','}
          prefix={'$'}
          renderText={(v) => (
            <Text
              variant={emphasized ? 'titleMedium' : 'bodyMedium'}
              style={{color: colors.text}}>
              {v}
            </Text>
          )}
        />
      </View>
    );
  }

  render() {
    const details = this.props.route.params.details;
    return (
      <Layout
        hideLogo={true}
        title={'Detalles de'}
        subtitle={'la orden'}
        onPress={() => {
          this.viewShot.capture().then((uri) => {
            Share.open({
              title: 'Comprobante Piida',
              message: 'Comprobante Piida',
              url: `file://${uri}`,
              type: 'image/png',
              failOnCancel: false,
            }).catch((err) => console.log(err));
          });
        }}>
        <ScrollView
          style={{width: '100%'}}
          contentContainerStyle={{
            paddingHorizontal: normalizeSize(16),
            paddingBottom: normalizeSize(40),
          }}>
          <ViewShot
            ref={(ref) => (this.viewShot = ref)}
            options={{
              fileName: 'Orden de venta ' + this.props.user.company_name,
              format: 'png',
              quality: 1,
            }}>
            <Card mode="outlined" style={{backgroundColor: '#FFFFFF'}}>
              <Card.Content>
                <Text variant="headlineSmall" style={{textAlign: 'center'}}>
                  {this.props.user.company_name}
                </Text>
                {details.consecutive && (
                  <Text
                    variant="titleMedium"
                    style={{color: colors.text, marginTop: normalizeSize(12), textAlign: 'center'}}>
                    Orden No. {details.consecutive}
                  </Text>
                )}
                {details.date && (
                  <Text
                    variant="bodyMedium"
                    style={{color: colors.purplishGrey, textAlign: 'center'}}>
                    {details.date}
                  </Text>
                )}
              </Card.Content>
            </Card>

            {(details.customer || details.observations) && (
              <Card mode="outlined" style={{backgroundColor: '#FFFFFF', marginTop: normalizeSize(12)}}>
                <Card.Content>
                  {details.customer && (
                    <List.Item
                      title={details.customer}
                      description="Cliente"
                      left={(p) => <List.Icon {...p} icon="account-outline" />}
                      style={{paddingLeft: 0}}
                    />
                  )}
                  {details.observations && (
                    <List.Item
                      title={details.observations}
                      description="Observaciones"
                      left={(p) => <List.Icon {...p} icon="note-text-outline" />}
                      style={{paddingLeft: 0}}
                      titleNumberOfLines={10}
                    />
                  )}
                </Card.Content>
              </Card>
            )}

            {this.props.items && (
              <>
                {this.props.items.items.length > 0 && (
                  <Card
                    mode="outlined"
                    style={{backgroundColor: '#FFFFFF', marginTop: normalizeSize(12)}}>
                    <Card.Content>
                      <Text
                        variant="titleMedium"
                        style={{color: colors.label, marginBottom: normalizeSize(8)}}>
                        Items comprados
                      </Text>
                      {this.props.items.items.map((item) => (
                        <OrderProductItem
                          key={item.nid}
                          name={item.product}
                          value={item.value}
                          qty={item.qty}
                          products={item.products}
                        />
                      ))}
                    </Card.Content>
                  </Card>
                )}

                {this.props.items.payments.length > 0 && (
                  <Card
                    mode="outlined"
                    style={{backgroundColor: '#FFFFFF', marginTop: normalizeSize(12)}}>
                    <Card.Content>
                      <Text
                        variant="titleMedium"
                        style={{color: colors.label, marginBottom: normalizeSize(8)}}>
                        Pagos
                      </Text>
                      {this.props.items.payments.map((item, index) => (
                        <OrderProductItem
                          key={index}
                          name={item.type}
                          value={item.value}
                          date={item.date}
                        />
                      ))}
                    </Card.Content>
                  </Card>
                )}
              </>
            )}

            {(details.value || details.paid) && (
              <Card mode="outlined" style={{backgroundColor: '#FFFFFF', marginTop: normalizeSize(12)}}>
                <Card.Content>
                  {details.value && this.renderTotalRow('Total', details.value, false)}
                  {details.paid && this.renderTotalRow('Pagado', details.paid, false)}
                  {details.value && details.paid && (
                    <>
                      <Divider style={{marginVertical: normalizeSize(4)}} />
                      {this.renderTotalRow('SALDO', details.value - details.paid, true)}
                    </>
                  )}
                </Card.Content>
              </Card>
            )}

            <Image
              style={{
                width: '100%',
                height: normalizeSize(40),
                marginTop: normalizeSize(16),
              }}
              resizeMode={'contain'}
              source={require('../../../assets/images/bott.png')}
            />
          </ViewShot>
        </ScrollView>
      </Layout>
    );
  }
}
export default OrderDetailsScreen;
