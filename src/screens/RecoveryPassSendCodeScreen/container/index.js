import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({recoveryPassSendCodeData}) => {
  const {
    code,
    errors,
  } = recoveryPassSendCodeData;

  return {
    code,
    errors,
  };
};

const mapDispatchToProps = dispatch => {
  return {actions: bindActionCreators(actionsCreators, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);