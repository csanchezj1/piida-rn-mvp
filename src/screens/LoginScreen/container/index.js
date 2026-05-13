import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({loginData, userData}) => {
  const {
    email,
    password,
    errors,
  } = loginData;

  const { 
    user
  } = userData;

  return {
    email,
    password,
    errors,
    user
  };

};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);