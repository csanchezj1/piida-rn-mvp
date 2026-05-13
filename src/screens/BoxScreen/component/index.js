import React, { Component } from 'react';
import {boxStyles} from '../../../styles/screenStyles';
import {SelectList, Shimmer} from '../../../components';
import {Button, HelperText, TextInput} from 'react-native-paper';
import {fieldErrors} from '../../../utils/screenFunctions';
import {registerEventScreenMounted} from '../../../utils/analytics';
import { Layout } from '../../../layouts';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { colors, normalizeSize } from '../../../styles/basicStyles';
import { NumericFormat } from 'react-number-format';

class BoxScreen extends Component {
  styles = boxStyles();
  componentDidMount(){
    registerEventScreenMounted(this.props, 'Abrir / Cerrar caja', 'BoxScreen');
    this.props.actions.getHistory();
  }
  componentDidUpdate(prevProps){
    // Si cambia el turno activo (open/close hecho desde otra app o por el
    // refresh on focus), refrescamos el historial para reflejar el cambio.
    if (prevProps.cashShiftActiveId !== this.props.cashShiftActiveId) {
      this.props.actions.getHistory();
    }
  }
  componentWillUnmount(){
    this.props.actions.clearScreen();
  }
  showInputs(type){
    if(type == 'closeBox'){
      if(this.props.balance_type){
        if(this.props.balance_type != 'cash'){
          return false;
        }
      }
    }
    
    return true;
  }
  form(type, cashTotal){
    return(
      <View
        style={this.styles.form}>
        
        {this.showInputs(type) && (
          <View>
            <Text
              style={this.styles.textBold}>
              {type == 'openBox' ?
                'Ingresa la cantidad de dinero con la que inicias tu turno.' :
                this.props.select.value == 'loan' ?
                'Ingresa la cantidad de dinero que quieres agregar a la caja' :
                'Ingresa la cantidad de dinero en efectivo que tienes en caja.'
              }
            </Text>
            <TextInput
              mode="outlined"
              label="Monto en efectivo"
              placeholder="Monto en efectivo"
              keyboardType="numeric"
              left={<TextInput.Icon icon="cash" />}
              value={this.props.money || ''}
              error={fieldErrors('money', this.props.errors) != ''}
              onChangeText={(money) => this.props.actions.moneyChange(money)}
              style={{marginTop: normalizeSize(8)}}
            />
            <HelperText
              type="error"
              visible={fieldErrors('money', this.props.errors) != ''}>
              {fieldErrors('money', this.props.errors)}
            </HelperText>
          </View>
        )}
        
        {this.props.select && (
          this.props.select.value == 'close' && (
            this.props.money && (
              this.props.money.split('.').join('').split('$').join('') - cashTotal < 0 ? (
                <View
                  style={this.styles.warningCont}>
                  <Image
                    source={require('../../../assets/images/ic_warning.png')}
                    style={this.styles.warning}
                  />
                  <NumericFormat
                    value={(this.props.money.split('.').join('').split('$').join('') - cashTotal) * -1}
                    displayType={'text'} 
                    thousandSeparator={'.'} 
                    decimalSeparator={','} 
                    prefix={'Tienes un descuadre. Te faltan $'} 
                    renderText={
                      (value) => 
                      <Text 
                        style={[this.styles.textBold, {
                          textAlign:'center'
                        }]}>
                        {value}
                      </Text>
                    }
                  />
                </View>
              ) : (
                <Text 
                  style={[this.styles.textBold, {
                    textAlign:'center'
                  }]}>
                  Muy bien!! No tienes descuadres
                </Text>
              )
            )
          )
        )}
        {this.showInputs(type) && (
          <Button
            mode="contained"
            onPress={() => this.props.actions.submit({
              money:this.props.money,
              navigation:this.props.navigation,
              uid:this.props.user.uid,
              // nid del turno activo en la sucursal actual (cashShiftData);
              // user.cash_id quedaba stale y no era branch-aware.
              nid:type == 'openBox' ? null : this.props.cashShiftActiveId,
              type:type == 'openBox' ?
                'open' :
                this.props.select.value
            })}
            style={{marginTop: normalizeSize(8)}}
            contentStyle={{paddingVertical: normalizeSize(4)}}>
            {type == 'openBox' ?
              'Iniciar turno' :
              this.props.select.value == 'loan' ?
              'Agregar dinero' :
              'Finalizar turno'
            }
          </Button>
        )}
      </View>
    );
  }

  historyList() {
    if (!this.props.history) {
      return Array.from(Array(3).keys()).map((e, i) => (
        <View key={'hist_shim_'+i} style={[this.styles.card, {marginTop: normalizeSize(10), padding: normalizeSize(10), backgroundColor:'transparent', elevation:0}]}>
          <Shimmer style={this.styles.shimmer} />
        </View>
      ));
    }

    if (this.props.history.length === 0) {
      return (
        <Text style={[this.styles.text, {textAlign: 'center', marginTop: normalizeSize(10)}]}>
          No hay turnos registrados
        </Text>
      );
    }

    return this.props.history.map((record, index) => {
      let openStr = record.opened_at ? record.opened_at.replace('T', ' ') : 'N/A';
      let closeStr = record.closed_at ? record.closed_at.replace('T', ' ') : 'Turno abierto';

      return (
        <View key={'hist_item_'+index} style={[this.styles.card, {marginTop: normalizeSize(10), padding: normalizeSize(15)}]}>
          <Text style={[this.styles.textBold, {fontSize: normalizeSize(16), marginBottom: normalizeSize(5)}]}>Turno #{record.nid}</Text>
          
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: normalizeSize(5)}}>
            <Text style={this.styles.label}>Cajero:</Text>
            <Text style={this.styles.text}>{record.author || 'Usuario'}</Text>
          </View>
          
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: normalizeSize(5)}}>
            <Text style={this.styles.label}>Apertura:</Text>
            <Text style={this.styles.text}>{openStr}</Text>
          </View>
          
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: normalizeSize(5)}}>
            <Text style={this.styles.label}>Cierre:</Text>
            <Text style={[this.styles.text, !record.closed_at ? {color: colors.success, fontWeight: 'bold'} : {}]}>{closeStr}</Text>
          </View>
          
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: normalizeSize(5)}}>
            <Text style={this.styles.label}>Dinero base:</Text>
            <NumericFormat
              value={record.base_money}
              displayType={'text'} 
              thousandSeparator={'.'} 
              decimalSeparator={','} 
              prefix={'$'} 
              renderText={(value) => <Text style={this.styles.textBold}>{value}</Text>}
            />
          </View>
          
          {!!record.closed_at && (
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: normalizeSize(5)}}>
              <Text style={this.styles.label}>Descuadre al cerrar:</Text>
              <NumericFormat
                value={Math.abs(record.mismatch)}
                displayType={'text'} 
                thousandSeparator={'.'} 
                decimalSeparator={','} 
                prefix={record.mismatch < 0 ? '-$' : record.mismatch > 0 ? '+$' : '$'} 
                renderText={(value) => (
                  <Text style={[this.styles.textBold, {color: record.mismatch < 0 ? colors.error : record.mismatch > 0 ? colors.success : colors.text}]}>
                    {value}
                  </Text>
                )}
              />
            </View>
          )}
        </View>
      );
    });
  }

  render() {
    const type = this.props.route.params.type;
    return (
      <Layout
        title={type == 'openBox' ? 'Abrir' : 'Cerrar o Prestar'}
        subtitle={'caja'}
        contentContainerStyle={{justifyContent:'flex-start', paddingBottom: normalizeSize(150)}}
        hideLogo={true}>
        <View
          style={this.styles.card}>
          <View
            style={this.styles.form}>
            <Text
              style={this.styles.label}>
              Usuario
            </Text>
            <Text
              style={this.styles.text}>
              {this.props.user.names} {this.props.user.last_names}
            </Text>
          </View>
          {type != 'openBox' && (
            <View
              style={this.styles.form}>
              <Text
                style={this.styles.textBold}>
                Selecciona una opción para continuar  
              </Text>
              <SelectList
                label={'Selecciona que deseas hacer'}
                variables={[
                  {
                    label:'Agregar dinero a la caja',
                    value:'loan'
                  },
                  {
                    label:'Cerrar caja',
                    value:'close'
                  }
                ]}
                value={this.props.select ? this.props.select.label : null}
                onValueChange={(value) => this.props.actions.selectChange(value)}
              />
            </View>
          )}  
          {type == 'openBox' ? (
            this.form(type)
          ) : (
            this.props.select && (
              this.props.select.value == 'loan' ? (
                this.form(type)
              ) : (
                this.props.balance ? (
                  <View>
                    <Text
                      style={[this.styles.textBold, {
                        marginStart:normalizeSize(20)
                      }]}>
                      Registros realizados 
                    </Text>
                    <ScrollView
                      style={this.styles.methodScroll}
                      horizontal>
                      <TouchableOpacity
                        style={[this.styles.methodCont, {
                          marginStart:normalizeSize(20),
                          backgroundColor:this.props.balance_type == 'cash' ? colors.buttonBackground : 'rgba(247, 169, 40, 0.1)'
                        }]}
                        activeOpacity={0.9}
                        onPress={() => this.props.actions.showMoneyBalance(this.props.balance.cash)}>
                        <Text
                          style={[this.styles.methodText, {
                            color:this.props.balance_type == 'cash' ? 'white' : colors.dialogTitle
                          }]}>
                          Efectivo
                        </Text>
                      </TouchableOpacity>
                      {this.props.balance.others.length > 0 && (
                        this.props.balance.others.map((item, index) => {
                          return(
                            <TouchableOpacity
                              key={index}
                              style={[this.styles.methodCont, {
                                marginEnd:this.props.balance.others.length - 1 == index ? normalizeSize(20) : 0,
                                backgroundColor:this.props.balance_type == item.id ? colors.buttonBackground : 'rgba(247, 169, 40, 0.1)'
                              }]}
                              activeOpacity={0.9}
                              onPress={() => this.props.actions.showOtherBalance(this.props.balance.others, item.id)}>
                              <Text
                                style={[this.styles.methodText, {
                                  color:this.props.balance_type == item.id ? 'white' : colors.dialogTitle
                                }]}>
                                {item.name}
                              </Text>
                            </TouchableOpacity>
                          )
                        })
                      )}
                    </ScrollView>
                    {this.props.balance_show && (
                      <View
                        style={this.styles.form}>
                        {this.props.balance_show.base_money && (
                          <View
                            style={this.styles.lineCont}>
                            <Text
                              style={[this.styles.label, {
                                flex:1
                              }]}>
                              Dinero base
                            </Text>
                            <NumericFormat
                              value={this.props.balance_show.base_money}
                              displayType={'text'} 
                              thousandSeparator='.' 
                              decimalSeparator=','
                              prefix={'$'} 
                              renderText={
                                (value) => 
                                <Text 
                                  style={this.styles.text}>
                                  {value}
                                </Text>
                              }
                            />
                          </View>
                        )}
                        {this.props.balance_show.loans && (
                          <View
                            style={this.styles.lineCont}>
                            <Text
                              style={[this.styles.label, {
                                flex:1
                              }]}>
                              Préstamos a caja
                            </Text>
                            <NumericFormat
                              value={this.props.balance_show.loans}
                              displayType={'text'} 
                              thousandSeparator='.' 
                              decimalSeparator=','
                              prefix={'$'} 
                              renderText={
                                (value) => 
                                <Text 
                                  style={this.styles.text}>
                                  {value}
                                </Text>
                              }
                            />
                          </View>
                        )}
                        <View
                          style={this.styles.lineCont}>
                          <Text
                            style={[this.styles.label, {
                              flex:1
                            }]}>
                            Ventas
                          </Text>
                          
                          <NumericFormat
                            value={this.props.balance_show.sales || 0}
                            displayType={'text'} 
                            thousandSeparator='.' 
                            decimalSeparator=','
                            prefix={'$'} 
                            renderText={
                              (value) => 
                              <Text 
                                style={this.styles.text}>
                                {value}
                              </Text>
                            }
                          />
                        </View>
                        <View
                          style={this.styles.lineCont}>
                          <Text
                            style={[this.styles.label, {
                              flex:1
                            }]}>
                            Gastos
                          </Text>
                          <NumericFormat
                            value={this.props.balance_show.expenses || 0}
                            displayType={'text'} 
                            thousandSeparator='.' 
                            decimalSeparator=','
                            prefix={'$'} 
                            renderText={
                              (value) => 
                              <Text 
                                style={this.styles.text}>
                                {value}
                              </Text>
                            }
                          />
                        </View>
                        <View
                          style={this.styles.lineCont}>
                          <Text 
                            style={[this.styles.textBold, {
                              flex:1
                            }]}>
                            Balance total
                          </Text>
                          
                          <NumericFormat
                            value={this.props.balance_show.total || 0}
                            displayType={'text'} 
                            thousandSeparator='.' 
                            decimalSeparator=','
                            prefix={'$'} 
                            renderText={
                              (value) => 
                              <Text 
                                style={this.styles.textBold}>
                                {value}
                              </Text>
                            }
                          />
                        </View>
                      </View>
                    )}
                    {this.form(type, this.props.balance.cash.total)}
                  </View>
                ) : (
                  Array.from(Array(12).keys()).map((e, i) => {
                    return(
                      <Shimmer
                        key={i}
                        style={this.styles.shimmer}
                      />
                    )
                  })
                )
              )
            )
          )}
        </View>
        <View style={{marginTop: normalizeSize(20), paddingBottom: normalizeSize(30)}}>
          <Text style={[this.styles.textBold, {marginStart: normalizeSize(20), fontSize: normalizeSize(18)}]}>
            Historial de turnos
          </Text>
          {this.historyList()}
        </View>
      </Layout>
    );
  }
}
export default BoxScreen;