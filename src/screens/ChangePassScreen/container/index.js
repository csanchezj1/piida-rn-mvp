import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({changePassData, userData}) => {
  const {
    pass,
    confirmPass,
    errors,
  } = changePassData;

  const {
    user,
  } = userData;

  return {
    pass,
    confirmPass,
    errors,
    user
  };
};

const mapDispatchToProps = dispatch => {
  return {actions: bindActionCreators(actionsCreators, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);