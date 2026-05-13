import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, planData}) => {
  const { 
    user
  } = userData;

  const { 
    price,
    error,
    info,
    plan,
    planSelected
  } = planData;

  return {
   user,
   price,
   error,
   info,
   plan,
   planSelected
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);