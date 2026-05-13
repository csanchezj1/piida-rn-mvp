import React, {Component} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {Card, List, Text} from 'react-native-paper';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';
import {Shimmer} from '../../../components';
import {colors, normalizeSize} from '../../../styles/basicStyles';

class AddProductKitScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(
      this.props,
      'Pantalla listado de productos para kit',
      'AddProductKitScreen',
    );
    this.props.actions.getProduct(this.props.user.company, '', true);
  }
  componentWillUnmount() {
    this.props.actions.clear();
  }
  render() {
    return (
      <Layout
        contentContainerStyle={
          this.props.list
            ? this.props.list.length > 0
              ? {justifyContent: 'flex-start'}
              : {justifyContent: 'center'}
            : {justifyContent: 'center'}
        }
        hideLogo={true}
        title={'Productos'}
        subtitle={'combo'}
        description={
          'Busca los productos que quieres agregar al combo por su nombre o código'
        }
        onScrollEndDrag={({nativeEvent}) => {
          if (
            nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
            nativeEvent.contentSize.height - 1
          ) {
            this.props.actions.getProduct(
              this.props.user.company,
              this.props.text == null ? '' : this.props.text,
              false,
            );
          }
        }}
        autoCompleteProps={
          this.props.list
            ? {
                placeholder: 'Buscar producto...',
                value: this.props.text,
                onChangeText: (text) => {
                  this.props.actions.textChange(text);
                },
                results: this.props.searchButton,
                selectItem: () => {
                  this.props.actions.getProduct(
                    this.props.user.company,
                    this.props.text,
                    true,
                  );
                },
                clearText: () => {
                  this.props.actions.getProduct(this.props.user.company, '', true);
                },
              }
            : null
        }>
        {this.props.list ? (
          this.props.list.length > 0 ? (
            <View
              style={{width: '100%', paddingHorizontal: normalizeSize(16)}}>
              {this.props.list.map((item) => (
                <Card
                  key={item.nid}
                  mode="outlined"
                  style={{marginBottom: normalizeSize(8)}}>
                  <List.Item
                    title={item.label}
                    description={item.code ? `Código: ${item.code}` : undefined}
                    left={(props) => (
                      <List.Icon {...props} icon="package-variant" />
                    )}
                    onPress={() => {
                      this.props.actions.selectProvider(item);
                      this.props.navigation.goBack();
                    }}
                  />
                </Card>
              ))}
              {this.props.showLoader && (
                <View
                  style={{
                    alignItems: 'center',
                    paddingVertical: normalizeSize(16),
                  }}>
                  <ActivityIndicator
                    size="large"
                    color={colors.buttonBackground}
                  />
                </View>
              )}
            </View>
          ) : (
            <View
              style={{
                width: '100%',
                paddingHorizontal: normalizeSize(20),
              }}>
              <Text
                variant="bodyMedium"
                style={{color: colors.purplishGrey, textAlign: 'center'}}>
                Lo sentimos, no encontramos productos en el sistema
              </Text>
            </View>
          )
        ) : (
          <View
            style={{
              width: '100%',
              paddingHorizontal: normalizeSize(16),
              paddingTop: normalizeSize(8),
            }}>
            {Array.from(Array(12).keys()).map((_, i) => (
              <Shimmer
                key={i}
                style={{marginBottom: normalizeSize(8), borderRadius: 8}}
                height={normalizeSize(60)}
                width={'100%'}
              />
            ))}
          </View>
        )}
      </Layout>
    );
  }
}
export default AddProductKitScreen;
