import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({registerData, userData, fieldsData}) => {
  const {
    name,
    lastName,
    email,
    idNumber,
    phone,
    company,
    password,
    errors,
    operation,
    business,
    businessText,
    web,
    finance,
    appGoal,
    role,
    changeOpt,
  } = registerData;

  const { 
    user
  } = userData;

  const { 
    operationTime,
    businessType,
    financeManagement,
    fieldChange
  } = fieldsData;

  return {
    name,
    lastName,
    email,
    idNumber,
    phone,
    company,
    password,
    errors,
    operation,
    business,
    businessText,
    web,
    finance,
    appGoal,
    role,
    user,
    operationTime,
    businessType,
    financeManagement,
    fieldChange,
    changeOpt,
  };

};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);