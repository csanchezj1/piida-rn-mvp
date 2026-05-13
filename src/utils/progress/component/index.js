import React, { Component } from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import {getProgressStyles} from '../../../styles/componentStyles';

class Progress extends Component {
  render() {
    const styles = getProgressStyles();
    return(
      <View
        style={[styles.overlay, {
          display: this.props.visible ? 'flex' : 'none'
        }]}>
        <ActivityIndicator
          color={styles.indicatorProgress.color}
          size={this.props.size}
        />
        <Text
          style={styles.messageProgress}>
          {this.props.message}
        </Text>
      </View>
    );
  }
}

export default Progress;