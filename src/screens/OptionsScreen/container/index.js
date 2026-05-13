import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, fieldsData, registerData}) => {
  const { 
    user
  } = userData;
  
  const { 
    appGoals
  } = fieldsData;

  const { 
    appGoal,
    changeOpt
  } = registerData;

  return {
    user,
    appGoals,
    appGoal,
    changeOpt
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);