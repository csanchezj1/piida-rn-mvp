import React, { Component } from 'react';
import {Image, StatusBar, View} from 'react-native';
import {getSplashStyles} from '../../../styles/screenStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';

class Splashscreen extends Component {
  styles = getSplashStyles();
  componentDidMount(){
    registerEventScreenMounted(this.props, 'Splashscreen', 'Splashscreen');
    //this.props.actions.init();
    if (this.props.user !== null){
      this.props.actions.login(this.props.user.email, this.props.password);
    }
    else{
      this.props.actions.getOperation();
      this.props.actions.getBusinessType();
      this.props.actions.getAppGoals();
      this.props.actions.getFinanceManagement();
      setTimeout(
        () => { 
          this.props.actions.isLoading()
        },
        2000
      )
    }
  }
  render() {
    return (
      <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={'white'}/>
      <View
        style={this.styles.container}>
        <Image
          resizeMode='contain'
          style={this.styles.logo}
          source={require('../../../assets/images/logo.png')}
        />
      </View>
      </>
    );
  }
}
export default Splashscreen;