import React, {Component} from 'react';
import {Image, ScrollView, View} from 'react-native';
import {Card, List, Text} from 'react-native-paper';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';
import {OrderProductItem} from '../../../components';
import {colors, normalizeSize} from '../../../styles/basicStyles';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

class TransferDetailsScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(this.props, 'Detalles de traslado de inventario', 'TransferDetailsScreen');
  }

  renderMovementSection(title, concept, branchLabel, branchValue, products) {
    return (
      <Card mode="outlined" style={{backgroundColor: '#FFFFFF', marginTop: normalizeSize(12)}}>
        <Card.Content>
          <Text variant="titleMedium" style={{color: colors.text}}>
            {title}
          </Text>
          <List.Item
            title="Salida de inventario por traslado"
            description="Concepto"
            left={(p) => <List.Icon {...p} icon="swap-horizontal" />}
            style={{paddingLeft: 0}}
            titleStyle={{fontSize: normalizeSize(14)}}
          />
          {branchValue && (
            <List.Item
              title={branchValue}
              description={branchLabel}
              left={(p) => <List.Icon {...p} icon="store-outline" />}
              style={{paddingLeft: 0}}
              titleStyle={{fontSize: normalizeSize(14)}}
            />
          )}
          {products && products.length > 0 && (
            <View style={{marginTop: normalizeSize(8)}}>
              {products.map((item) => (
                <OrderProductItem
                  key={item.nid}
                  name={item.label}
                  value={item.price * item.qty}
                  qty={item.qty}
                  products={item.products}
                />
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  }

  render() {
    const details = this.props.route.params.details;
    return (
      <Layout
        hideLogo={true}
        title={'Detalles'}
        subtitle={'del traslado'}
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
              fileName: 'Comprobante ' + this.props.user.company_name,
              format: 'png',
              quality: 1,
            }}>
            <Card mode="outlined" style={{backgroundColor: '#FFFFFF'}}>
              <Card.Content>
                <Text variant="headlineSmall" style={{textAlign: 'center'}}>
                  {this.props.user.company_name}
                </Text>
              </Card.Content>
            </Card>

            {details.movement_out && (
              <Card mode="outlined" style={{backgroundColor: '#FFFFFF', marginTop: normalizeSize(12)}}>
                <Card.Content>
                  <Text variant="titleMedium" style={{color: colors.text}}>
                    Transacción {details.movement_out}
                  </Text>
                  <Text variant="bodyMedium" style={{color: colors.purplishGrey, marginBottom: normalizeSize(8)}}>
                    {details.date}
                  </Text>
                  <List.Item
                    title="Salida de inventario por traslado"
                    description="Concepto"
                    left={(p) => <List.Icon {...p} icon="swap-horizontal" />}
                    style={{paddingLeft: 0}}
                    titleStyle={{fontSize: normalizeSize(14)}}
                  />
                  {(details.branch_out || details.branch_destination) && (
                    <List.Item
                      title={details.branch_out || details.branch_destination}
                      description={details.branch_out ? 'Sucursal de origen' : 'Sucursal de destino'}
                      left={(p) => <List.Icon {...p} icon="store-outline" />}
                      style={{paddingLeft: 0}}
                      titleStyle={{fontSize: normalizeSize(14)}}
                    />
                  )}
                  {details.product && (
                    <View style={{marginTop: normalizeSize(8)}}>
                      {details.product.map((item) => (
                        <OrderProductItem
                          key={item.nid}
                          name={item.label}
                          value={item.price * item.qty}
                          qty={item.qty}
                          products={item.products}
                        />
                      ))}
                    </View>
                  )}
                </Card.Content>
              </Card>
            )}

            {details.movement_in && (
              <Card mode="outlined" style={{backgroundColor: '#FFFFFF', marginTop: normalizeSize(12)}}>
                <Card.Content>
                  <Text variant="titleMedium" style={{color: colors.text}}>
                    Transacción {details.movement_in}
                  </Text>
                  <Text variant="bodyMedium" style={{color: colors.purplishGrey, marginBottom: normalizeSize(8)}}>
                    {details.date}
                  </Text>
                  <List.Item
                    title="Entrada de inventario por traslado"
                    description="Concepto"
                    left={(p) => <List.Icon {...p} icon="swap-horizontal" />}
                    style={{paddingLeft: 0}}
                    titleStyle={{fontSize: normalizeSize(14)}}
                  />
                  {(details.branch_in || details.branch_destination) && (
                    <List.Item
                      title={details.branch_in || details.branch_destination}
                      description={details.branch_destination ? 'Sucursal de origen' : 'Sucursal de destino'}
                      left={(p) => <List.Icon {...p} icon="store-outline" />}
                      style={{paddingLeft: 0}}
                      titleStyle={{fontSize: normalizeSize(14)}}
                    />
                  )}
                  {details.product && (
                    <View style={{marginTop: normalizeSize(8)}}>
                      {details.product.map((item) => (
                        <OrderProductItem
                          key={item.nid}
                          name={item.label}
                          value={item.price * item.qty}
                          qty={item.qty}
                          products={item.products}
                        />
                      ))}
                    </View>
                  )}
                </Card.Content>
              </Card>
            )}

            {details.observations && (
              <Card mode="outlined" style={{backgroundColor: '#FFFFFF', marginTop: normalizeSize(12)}}>
                <Card.Content>
                  <List.Item
                    title={details.observations}
                    description="Observaciones"
                    left={(p) => <List.Icon {...p} icon="note-text-outline" />}
                    style={{paddingLeft: 0}}
                    titleNumberOfLines={10}
                  />
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
export default TransferDetailsScreen;
