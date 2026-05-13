import React, { Component } from 'react';
import { Text, View } from 'react-native';
import {getLoginStyles} from '../../../styles/screenStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';
import { ActionButton, TextInput, SelectList } from '../../../components';
import {fieldErrors} from '../../../utils/screenFunctions';
import { Layout } from '../../../layouts';

class RegisterCompanyScreen extends Component {
  styles = getLoginStyles();
 
  goalValue(){
    let goal = [];
    if(this.props.appGoal.length > 0){
      this.props.appGoal.map(item => {
        goal.push(item.label)
      })
    }

    return goal;
  }
  checkOtherGoal(){
    if(this.props.appGoal.length > 0){
      const index = this.props.appGoal.findIndex(e => e.label == 'Otro');

      return index !== -1;
    }

    return false;
  }
  componentDidMount(){
    registerEventScreenMounted(this.props, 'Crear empresa', 'RegisterCompanyScreen');
  }
  componentWillUnmount(){
    this.props.actions.clearScreen()
  }
  render() {
    return (
      <Layout
        hideLogo
        title={'Crea una cuenta'}>
        <View>
          <Text
            style={this.styles.subtitle}>
            Ingresa los datos de tu negocio
          </Text>
          <TextInput
            label={'Empresa'}
            style={this.styles.input}
            icon={require('../../../assets/images/ic_business.png')}
            placeholder={'Nombre de tu negocio'}
            autoCapitalize='none'
            value={this.props.company}
            isError={fieldErrors('company', this.props.errors) != ''}
            onChangeText={(company) => this.props.actions.companyChange(company)}
          />
          <SelectList
            style={this.styles.input}
            label={'Tiempo de operación'}
            isError={fieldErrors('operation', this.props.errors) != ''}
            value={this.props.operation ? this.props.operation.label : null}
            variables={this.props.operationTime}
            icon={require('../../../assets/images/ic_calendar.png')}
            onValueChange={(operation) => this.props.actions.operationChange(operation)}/>
          <SelectList
            style={this.styles.input}
            label={'Tipo de negocio'}
            isError={fieldErrors('business', this.props.errors) != ''}
            value={this.props.business ? this.props.business.label : null}
            variables={this.props.businessType}
            icon={require('../../../assets/images/partner.png')}
            onValueChange={(business) => this.props.actions.businessChange(business)}/>
          {this.props.business && (
            this.props.business.label == 'Otro' && (
              <TextInput
                label={'Tipo de negocio'}
                style={this.styles.input}
                icon={require('../../../assets/images/partner.png')}
                placeholder={'Escribe el tipo de negocio'}
                autoCapitalize='none'
                value={this.props.businessText}
                isError={fieldErrors('businessText', this.props.errors) != ''}
                onChangeText={(businessText) => this.props.actions.businessTextChange(businessText)}
              />
            )
          )}
          <TextInput
            label={'Sitio web'}
            style={this.styles.input}
            icon={require('../../../assets/images/ic_web.png')}
            placeholder={'Sitio web (Opcional)'}
            autoCapitalize='none'
            value={this.props.web}
            isError={fieldErrors('web', this.props.errors) != ''}
            onChangeText={(web) => this.props.actions.webChange(web)}
          />
          <SelectList
            style={this.styles.input}
            label={'¿Cómo manejas las finanzas y/o inventario actualmente?'}
            isError={fieldErrors('finance', this.props.errors) != ''}
            value={this.props.finance ? this.props.finance.label : null}
            variables={this.props.financeManagement}
            icon={require('../../../assets/images/ic_money.png')}
            onValueChange={(finance) => this.props.actions.financeChange(finance)}/>
          {this.props.finance && (
            this.props.finance.label == 'Otro' && (
              <TextInput
                label={'Manejo de finanzas'}
                style={this.styles.input}
                icon={require('../../../assets/images/ic_money.png')}
                placeholder={'Escribe como manejas tus finanzas'}
                autoCapitalize='none'
                value={this.props.financeText}
                isError={fieldErrors('financeText', this.props.errors) != ''}
                onChangeText={(financeText) => this.props.actions.financeTextChange(financeText)}
              />
            )
          )}
          <SelectList
            style={this.styles.input}
            label={'¿Qué te gustaría lograr con la app?'}
            isError={fieldErrors('appGoal', this.props.errors) != ''}
            value={this.goalValue() ? this.goalValue().join(', ') : null} 
            onPress={() => this.props.navigation.navigate('Options')} 
            icon={require('../../../assets/images/ic_list.png')}/>
          {this.checkOtherGoal() && (
            <TextInput
              label={'¿Qué te gustaría lograr con la app?'}
              style={this.styles.input}
              icon={require('../../../assets/images/ic_money.png')}
              placeholder={'Escribe que más te gustaría lograr con la app'}
              autoCapitalize='none'
              value={this.props.appGoalText}
              isError={fieldErrors('appGoalText', this.props.errors) != ''}
              onChangeText={(appGoalText) => this.props.actions.appGoalTextChange(appGoalText)}
            />
          )}
          <SelectList
            style={this.styles.input}
            label={'Del negocio eres...'}
            isError={fieldErrors('role', this.props.errors) != ''}
            value={this.props.role ? this.props.role.label : null}
            variables={[
              {
                label:'Propietario',
                value:'owner'
              },
              {
                label:'Colaborador',
                value:'collaborator'
              }
            ]}
            icon={require('../../../assets/images/ic_org.png')}
            onValueChange={(role) => this.props.actions.roleChange(role)}/>
          {this.props.role && (
            this.props.role.label == 'Colaborador' && (
              <TextInput
                label={'Cargo'}
                style={this.styles.input}
                icon={require('../../../assets/images/ic_org.png')}
                placeholder={'¿Cual es tu cargo?'}
                autoCapitalize='none'
                value={this.props.position}
                isError={fieldErrors('position', this.props.errors) != ''}
                onChangeText={(position) => this.props.actions.positionChange(position)}
              />
            )
          )}
        </View>
        <ActionButton
          title={'Registrarme'}
          style={this.styles.button}
          onPress={() => this.props.actions.register({
            name:this.props.name,
            lastName:this.props.lastName,
            email:this.props.email,
            idNumber:this.props.idNumber,
            phone:this.props.phone,
            company:this.props.company,
            operation:this.props.operation,
            business:this.props.business,
            web:this.props.web,
            finance:this.props.finance,
            appGoal:this.props.appGoal,
            role:this.props.role,
            password:this.props.password,
            businessText:this.props.businessText,
          })}
        />
      </Layout>
    );
  }
}
export default RegisterCompanyScreen;