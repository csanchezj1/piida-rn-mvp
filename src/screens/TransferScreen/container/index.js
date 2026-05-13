import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, transferData}) => {
  const { 
    user
  } = userData;

  const { 
    branch,
    product,
    qty,
    obs,
    errors,
    changed
  } = transferData;

  return {
    user,
    branch,
    product,
    qty,
    obs,
    errors,
    changed
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);