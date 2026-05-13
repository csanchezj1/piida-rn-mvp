import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({splashscreenData, userData}) => {
  const { 
    isLoading,
  } = splashscreenData;

  const { 
    user,
    password
  } = userData;

  return {
    isLoading,
    user,
    password
  };

};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);