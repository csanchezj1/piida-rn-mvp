import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({recoveryPassGetCodeData}) => {
  const {
    mail,
    errors,
  } = recoveryPassGetCodeData;

  return {
    mail,
    errors,
  };
};

const mapDispatchToProps = dispatch => {
  return {actions: bindActionCreators(actionsCreators, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);