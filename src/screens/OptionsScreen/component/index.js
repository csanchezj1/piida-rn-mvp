import React, { Component } from 'react';
import {Image, Text, TouchableOpacity} from 'react-native';
import {getProviderStyles} from '../../../styles/screenStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';
import { Layout } from '../../../layouts';

class OptionsScreen extends Component {
  styles = getProviderStyles();
  isChecked(item){
    const index = this.props.appGoal.findIndex(e => e.value == item.value);

    return index !== -1;
  }
  componentDidMount(){
    registerEventScreenMounted(this.props, 'Pantalla listado de opciones', 'OptionsScreen');
  }
  render() {
    return (
      <Layout
        contentContainerStyle={{ justifyContent:'flex-start' }}
        hideLogo={true}
        title={'¿Qué te gustaría lograr con la app?'}
        description={'Puedes seleccionar una o varias opciones'}>
        {this.props.appGoals && (
          this.props.appGoals.length > 0 && (
            this.props.appGoals.map(item => {
              return(
                <TouchableOpacity
                  activeOpacity={0.9}
                  key={item.value}
                  onPress={() => this.props.actions.selectOption(item)}
                  style={[this.styles.listCont, {
                    flexDirection:'row',
                    alignItems:'center'
                  }]}>
                  <Image
                    style={this.styles.checkIcon}
                    source={this.isChecked(item) ? require('../../../assets/images/ic_check_box.png') : require('../../../assets/images/ic_check_box_blank.png')}
                  />
                  <Text
                    style={this.styles.listText}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )
            })
          ) 
        )}
      </Layout>
    );
  }
}
export default OptionsScreen;