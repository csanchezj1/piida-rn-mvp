import React, { Component } from 'react';
import {Text, View} from 'react-native';
import {ActivityIndicator, Card} from 'react-native-paper';
import {getProviderStyles} from '../../../styles/screenStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';
import { FloatingAction } from "react-native-floating-action";
import { Layout } from '../../../layouts';
import { Shimmer } from '../../../components';
import { colors, normalizeSize } from '../../../styles/basicStyles';

class ProviderScreen extends Component {
  styles = getProviderStyles();
  componentDidMount(){
    registerEventScreenMounted(this.props, 'Pantalla listado de proveedores', 'ProviderScreen');
    this.fetchByFrom();
    // Refetch al recibir focus para que un cliente/proveedor recién creado
    // (desde CreateCustomerScreen / CreateProviderScreen) aparezca al volver.
    this._focusListener = this.props.navigation.addListener('focus', () => {
      this.fetchByFrom();
    });
  }
  componentWillUnmount(){
    if (this._focusListener) this._focusListener();
    this.props.actions.clear();
  }

  fetchByFrom(){
    if (!this.props.route.params) return;
    const from = this.props.route.params.from;
    if (from === 'provider' || from === 'providerNew') {
      this.props.actions.getProviders(this.props.user.company, '', true);
    } else if (from === 'customer') {
      this.props.actions.getCustomer(this.props.user.company, '', true);
    } else if (from === 'branch') {
      this.props.actions.getBranch(this.props.user.company, this.props.user.branch_office, '', true);
    } else if (from === 'product' || from === 'buy_product' || from === 'transfer_product' || from === 'kit') {
      this.props.actions.getProduct('', true);
    }
  }

  pressMainAction(){
    switch (this.props.route.params.from) {
      case 'provider':
      case 'providerNew':
        if(!this.props.user.providers_limit){
          return this.props.actions.showSubscriptionMessage(
            'Crear proveedor',
            'Llegaste al límite de proveedores que puedes crear. Si deseas crear proveedores ilimitados, debes contar con una suscripción premium.',
            this.props.navigation
          );
        }
        else{
          return this.props.navigation.navigate('CreateProvider')
        }
      case 'kit':
      case 'buy_product':
      case 'transfer_product':
        return this.props.navigation.navigate('CreateProduct')
      case 'customer':
        if(!this.props.user.customers_limit){
          return this.props.actions.showSubscriptionMessage(
            'Crear cliente',
            'Llegaste al límite de clientes que puedes crear. Si deseas crear clientes ilimitados, debes contar con una suscripción premium.',
            this.props.navigation
          );
        }
        else{
          return this.props.navigation.navigate('CreateCustomer')
        }
    }
    

    return null;
  }

  render() {
    let title = null;
    let description = null;
    let noresults = null;
    if(this.props.route.params){
      if(this.props.route.params.from == 'provider' || this.props.route.params.from == 'providerNew'){
        title = 'Proveedor';
        description = 'Selecciona un proveedor de la lista';
        noresults = 'Lo sentimos, no encontramos proveedores en el sistema';
      }
      if(this.props.route.params.from == 'customer'){
        title = 'Clientes';
        description = 'Busca un cliente por su número telefónico, nombre o número de identificación';
        noresults = 'Lo sentimos, no encontramos clientes en el sistema';
      }
      if(this.props.route.params.from == 'branch'){
        title = 'Sedes o sucursales';
        description = 'Busca una sucursal por su nombe';
        noresults = 'Lo sentimos, no encontramos sucursales en el sistema';
      }
      if(this.props.route.params.from == 'product' || this.props.route.params.from == 'buy_product' || this.props.route.params.from == 'transfer_product' || this.props.route.params.from == 'kit'){
        title = 'Productos';
        description = 'Busca los productos por su nombre o código';
        noresults = 'Lo sentimos, no encontramos productos en el sistema';
      }
    }
    return (
      <>
      {this.props.route.params && (
        <Layout
          contentContainerStyle={this.props.list ? this.props.list.length > 0 ? { justifyContent:'flex-start' } : { justifyContent:'center' } : { justifyContent:'center' }}
          hideLogo={true}
          title={title}
          description={description}
          onScrollEndDrag={({nativeEvent}) => {
            if(nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height -1){
              if(this.props.route.params.from == 'provider' || this.props.route.params.from == 'providerNew'){
                this.props.actions.getProviders(this.props.user.company, this.props.text == null ? '' : this.props.text, false);
              }
              if(this.props.route.params.from == 'customer'){
                this.props.actions.getCustomer(this.props.user.company, this.props.text == null ? '' : this.props.text, false);
              }
              if(this.props.route.params.from == 'branch'){
                this.props.actions.getBranch(this.props.user.company, this.props.user.branch_office, this.props.text == null ? '' : this.props.text, false);
              }
              if(this.props.route.params.from == 'product' || this.props.route.params.from == 'buy_product' || this.props.route.params.from == 'transfer_product' || this.props.route.params.from == 'kit'){
                this.props.actions.getProduct(this.props.text == null ? '' : this.props.text, false);
              }
            }
          }}
          autoCompleteProps={this.props.list ? {
            placeholder:this.props.route.params.from == 'provider' || this.props.route.params.from == 'providerNew' ? 'Buscar proveedor...' : this.props.route.params.from == 'customer' ? 'Buscar cliente...' : this.props.route.params.from == 'branch' ? 'Buscar sucursal' : (this.props.route.params.from == 'product' || this.props.route.params.from == 'buy_product' || this.props.route.params.from == 'transfer_product' || this.props.route.params.from == 'kit')? 'Buscar producto...' : 'Buscar...',
            value:this.props.text,
            onChangeText:(text) => {
              this.props.actions.textChange(text);
            },
            results:this.props.searchButton,
            selectItem:() =>{
              if(this.props.route.params.from == 'provider' || this.props.route.params.from == 'providerNew'){
                this.props.actions.getProviders(this.props.user.company, this.props.text, true);
              }
              if(this.props.route.params.from == 'customer'){
                this.props.actions.getCustomer(this.props.user.company, this.props.text, true);
              }
              if(this.props.route.params.from == 'branch'){
                this.props.actions.getBranch(this.props.user.company, this.props.user.branch_office, this.props.text, true);
              }
              if(this.props.route.params.from == 'product' || this.props.route.params.from == 'buy_product' || this.props.route.params.from == 'transfer_product' || this.props.route.params.from == 'kit'){
                this.props.actions.getProduct(this.props.text, true);
              }
              this.props.actions.clearSearch()
            },
            clearText:() =>{
              this.props.actions.textChange(null)
              if(this.props.route.params.from == 'provider' || this.props.route.params.from == 'providerNew'){
                this.props.actions.getProviders(this.props.user.company, '', true);
              }
              if(this.props.route.params.from == 'customer'){
                this.props.actions.getCustomer(this.props.user.company, '', true);
              }
              if(this.props.route.params.from == 'branch'){
                this.props.actions.getBranch(this.props.user.company, this.props.user.branch_office, '', true);
              }
              if(this.props.route.params.from == 'product' || this.props.route.params.from == 'buy_product' || this.props.route.params.from == 'transfer_product' || this.props.route.params.from == 'kit'){
                this.props.actions.getProduct('', true);
              }
            },
          } : null}>
          
          {Array.isArray(this.props.list) ? (
            this.props.list.length > 0 ? (
              <>
              {this.props.list.map(item => {
                return(
                  <Card
                    mode="outlined"
                    key={item.nid}
                    onPress={() => {
                      this.props.actions.selectProvider(item, this.props.route.params.from),
                      this.props.navigation.goBack()
                    }}
                    style={[this.styles.listCont, {
                      marginBottom: normalizeSize(8),
                      backgroundColor: '#FFFFFF',
                    }]}>
                    <Card.Content>
                      <Text
                        style={this.styles.listText}>
                        {item.label}
                      </Text>
                      {item.id_number && (
                        <Text
                          style={this.styles.label}>
                          {'No. identificación: '}
                          <Text
                            style={this.styles.listText}>
                            {item.id_number}
                          </Text>
                        </Text>
                      )}
                      {item.phone && (
                        <Text
                          style={this.styles.label}>
                          {'No. telefónico: '}
                          <Text
                            style={this.styles.listText}>
                            {item.phone}
                          </Text>
                        </Text>
                      )}
                      {item.production_date && (
                        <Text
                          style={this.styles.label}>
                          {'Fecha de producción: '}
                          <Text
                            style={this.styles.listText}>
                            {item.production_date}
                          </Text>
                        </Text>
                      )}
                      {item.code && (
                        <Text
                          style={this.styles.label}>
                          {'Código: '}
                          <Text
                            style={this.styles.listText}>
                            {item.code}
                          </Text>
                        </Text>
                      )}
                      {item.available && (
                        <Text
                          style={this.styles.label}>
                          {'Disponibilidad: '}
                          <Text
                            style={this.styles.listText}>
                            {item.available}
                          </Text>
                        </Text>
                      )}
                    </Card.Content>
                  </Card>
                )
              })}
              {this.props.showLoader && (
                <View style={this.styles.loaderContainer}>
                  <ActivityIndicator size="large" color={colors.buttonBackground} />
                </View>
              )}
              </>
            ) : (
              <Text
                style={this.styles.noresult}>
                {noresults}
              </Text>
            )
          ) : (
            <View 
              style={this.styles.shimmerCont}>
              {Array.from(Array(12).keys()).map((e, i) => {
                return(
                  <Shimmer
                    key={i}
                    style={this.styles.shimmer}
                    height={this.styles.shimmer.height}
                    width={this.styles.shimmer.width}/>
                )
              })}
            </View>
          )}
        </Layout>
      )}
      {this.props.route.params.from == 'product' ? (
        this.props.user.features.includes('build_kit') ? (
        <FloatingAction
          ref={(ref) => {this.floatingAction = ref}}
          distanceToEdge={this.styles.distanceToEdge}
          color={this.styles.color}
          overlayColor={'rgba(68,68,68,0.9)'}
          position={'right'}
          onPressItem={name => {
            this.props.navigation.navigate(name)
          }}
          actions={[
            {
              text: "Nuevo producto",
              color:colors.text,
              textBackground:'transparent',
              icon: require('../../../assets/images/product.png'),
              name: "CreateProduct",
              textStyle:this.styles.textOne,
              shadow:{shadowOpacity: 0},
              textElevation:0
            },
            {
              text: "Nuevo combo",
              color:colors.buttonBackground,
              textBackground:'transparent',
              icon: require('../../../assets/images/products.png'),
              name: "Kit",
              textStyle:this.styles.textOne,
              shadow:{shadowOpacity: 0},
              textElevation:0
            }
          ]}
        />
        ) : (
          <FloatingAction
            ref={(ref) => {this.floatingAction = ref}}
            color={this.styles.color}
            distanceToEdge={this.styles.distanceToEdge}
            overlayColor={'transparent'}
            onOpen={() => this.floatingAction.animateButton()}
            onPressMain={() => this.props.navigation.navigate('CreateProduct')}
          />
        )
      ) : (
        <FloatingAction
          ref={(ref) => {this.floatingAction = ref}}
          color={this.styles.color}
          distanceToEdge={this.styles.distanceToEdge}
          overlayColor={'transparent'}
          onOpen={() => this.floatingAction.animateButton()}
          onPressMain={() => this.pressMainAction()}
        />
      )}
      </>
    );
  }
}
export default ProviderScreen;