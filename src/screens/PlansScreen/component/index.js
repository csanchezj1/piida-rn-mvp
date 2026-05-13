import React, { Component } from 'react';
import {planStyles} from '../../../styles/screenStyles';
import {getLayoutStyles} from '../../../styles/layoutStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';
import { Image, ScrollView, Text, View, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { colors, normalizeSize } from '../../../styles/basicStyles';
import { Shimmer } from '../../../components';
import AppIntroSlider from 'react-native-app-intro-slider';
import RBSheet from 'react-native-raw-bottom-sheet';

class PlansScreen extends Component {
  styles = planStyles();
  layoutStyles = getLayoutStyles();
  componentDidMount(){
    this.props.actions.getPlans();
    registerEventScreenMounted(this.props, 'Pantalla de planes desuscripción', 'PlansScreen');
  }
  componentWillUnmount(){
    this.props.actions.clear()
  }
  _renderItem = ({ item, index }) => {
    return (
      <View>
        <Card
          mode="outlined"
          style={[this.styles.planCont, {
            backgroundColor:index == 0 ? colors.buttonBackground : colors.dialogTitle
          }]}
          onPress={() =>{
            this.props.actions.selectPlan(item),
            this.props.actions.priceChange(null)
            this.RBSheet.open()}
          }>
          <Card.Content>
            <View
              style={{flexDirection:'row', alignItems:'center'}}>
              <Text
                style={this.styles.planTitle}>
                {item.title}
              </Text>
              <View
                style={this.styles.planButton}>
                <Text
                  style={this.styles.planButtonText}>
                  Actualiza tu plan
                </Text>
              </View>
            </View>
            <Text
              style={this.styles.planDescription}>
              {item.description}
            </Text>
          </Card.Content>
        </Card>
        {item.free_days > 0 && (
          <View>
            <Text
              style={this.styles.free}>
              {'Incluye prueba gratuita de ' + item.free_days + ' días. No se te cobrará nada hasta que finalice el período de prueba. Puedes cancelar la suscripcripción en cualquier momento.'}
            </Text>
          </View>
        )}
        <Text
          style={this.styles.feturesTitle}>
          ¿Que obtendrás?
        </Text>
        <ScrollView
          style={this.styles.fetures}
          contentContainerStyle={{paddingBottom:50}}>
          {item.features.map((feature, ind) => {
            return(
              <View
                key={ind}
                style={[this.styles.featureCont, {
                  //marginBottom:ind == item.features.length - 1 ? normalizeSize(50) :0
                }]}>
                <Image
                  source={require('../../../assets/images/play.png')}
                  style={this.styles.featureImg}
                />
                <Text
                  style={this.styles.name}>
                  {feature}
                </Text>
              </View>
            )
          })}
        </ScrollView>
      </View>
    );
  }
  _renderPag = (index) => {
    return(
      <SafeAreaView
        style={this.styles.pagCont}>
        {this.props.info.plans.map((item, i) => {
          return(
            <TouchableOpacity
              key={i}
              onPress={() => this.slider?.goToSlide(i, true)}
              style={[this.styles.pag, 
                i === index
                  ? {backgroundColor: colors.dialogTitle}
                  : {backgroundColor: 'rgba(0, 0, 0, .3)'},
              ]}
            />
          )
        })}
      </SafeAreaView>
    )
  }
  
  render() {
    return (
      <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={'white'}/>
      <View
        style={this.layoutStyles.container}>
        <Image
          resizeMode='cover'
          style={this.layoutStyles.topImg}
          source={require('../../../assets/images/top.png')}
        />
        <Image
          style={this.layoutStyles.bottom}
          source={require('../../../assets/images/bottom.png')}
        />
        <View
          style={this.layoutStyles.safe}>
          <View
            style={this.layoutStyles.titleCont}>
            <Text
              style={this.layoutStyles.titleTwo}>
              Suscripción
            </Text>
            <Text
              style={this.layoutStyles.subtitle}>
              Premium
            </Text>
          </View>
        </View>
        {this.props.info ? (          
          this.props.info.plans.length > 0 ? (
           <AppIntroSlider 
            ref={(ref) => (this.slider = ref)}
            renderItem={this._renderItem} 
            renderPagination={this._renderPag} 
            data={this.props.info.plans} 
          />
          ) : (
            this.props.info.subscription.length > 0 && (
              <View
                style={this.styles.subContainer}>
                <Text
                  style={this.styles.subTitle}>
                  {this.props.info.subscription[0].title}
                </Text>
                <Text
                  style={this.styles.subName}>
                  {this.props.info.subscription[0].name}
                </Text>
                <View>
                  <Text
                    style={this.styles.subText}>
                    {this.props.info.subscription[0].price.qty}
                  </Text>
                  <Text
                    style={this.styles.subValue}>
                    {this.props.info.subscription[0].price.value}
                  </Text>
                </View>
                <Text
                  style={this.styles.subText}>
                  {this.props.info.subscription[0].card.label}
                </Text>
                <View
                  style={{flexDirection:'row', alignSelf:'flex-end'}}>
                  <Image
                    style={this.styles.subCardImg}
                    source={{uri:this.props.info.subscription[0].card.brand}}
                  />
                  <Text
                    style={this.styles.subValue}>
                    {this.props.info.subscription[0].card.number}
                  </Text>
                </View>
                <View>
                  <Text
                    style={this.styles.subText}>
                    {this.props.info.subscription[0].next_payment.label}
                  </Text>
                  <Text
                    style={this.styles.subValue}>
                    {this.props.info.subscription[0].next_payment.date}
                  </Text>
                </View>
                {this.props.info.subscription[0].status == 130 && (
                  <Button
                    mode="contained"
                    style={this.styles.subButton}
                    onPress={() => this.props.actions.showSubCancel(
                      this.props.info.subscription[0].next_payment.date,
                      this.props.info.subscription[0].nid
                    )}>
                    Cancelar suscripcripción
                  </Button>
                )}
                {this.props.info.subscription[0].status == 131 && (
                  <View
                    style={this.styles.subCanceledCont}>
                    <Text
                      style={this.styles.subCanceledText}>
                      {this.props.info.subscription[0].canceled}
                    </Text>
                    <Button
                      mode="contained"
                      onPress={() => this.props.actions.showSubContinue(
                        this.props.info.subscription[0].nid
                      )}>
                      Continuar suscripcripción
                    </Button>
                  </View>
                )}
              </View>
            )
          )
        ) : (
          Array.from(Array(12).keys()).map((e, i) => {
            return(
              <Shimmer
                key={i}
                style={this.styles.shimmer}
              />
            )
          })
        )}
      </View>
       <RBSheet
        ref={(ref) => {
          this.RBSheet = ref;
        }}
        minClosingHeight={(50)}
        //height={this.styles.bottomSheetHeigth}
        //customStyles={{container: this.styles.bottomSheetContainer}}
        draggable={true}
        openDuration={500}
        closeDuration={500}
        dragFromTopOnly={true}>
        {this.props.planSelected && (
          this.props.planSelected.prices.length > 0 && (
            <View>
              <ScrollView
                horizontal
                style={[this.styles.horizontal, {
                  borderColor:this.props.error ? colors.red : '#EFF8FF'
                }]}>
                {this.props.planSelected.prices.map((price, i) => {
                  return(
                    <TouchableOpacity 
                      key={i}
                      style={[this.styles.container, {
                        marginStart:i == 0 ? normalizeSize(20) : normalizeSize(5),
                        marginEnd:i == this.props.planSelected.prices.length-1 ? normalizeSize(20) : normalizeSize(5),
                        backgroundColor:this.props.price == price ? '#c1c1c1' : '#FFF'
                      }]}
                      activeOpacity={0.9}
                      onPress={() => this.props.actions.priceChange(price)}>
                      <View
                        style={this.styles.first}>
                        <Text
                          style={this.styles.name}>
                          {price.name}
                        </Text>
                        {price.discount != '' && (
                          <View
                            style={this.styles.discountCont}>
                            <Text
                              style={this.styles.discount}>
                              - {price.discount} %
                            </Text>
                          </View>
                        )}
                      </View>
                      <View
                        style={this.styles.second}>
                        <Text
                          style={this.styles.value}>
                          {price.value}
                        </Text>
                        <Text
                          style={this.styles.new_value}>
                          {price.new_value}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
              {this.props.price ? (
                <Button
                  mode="contained"
                  onPress={() => {
                    this.RBSheet.close(),
                    this.props.actions.validate(this.props.navigation)
                  }}>
                  {'Continua - Total ' + this.props.price.new_value}
                </Button>
              ) : (
                <Text
                  style={this.styles.bestOption}>
                  Selecciona la mejor opción para tí
                </Text>
              )}
            </View>
          )
        )}
      </RBSheet>
      </>
    );
  }
}
export default PlansScreen;