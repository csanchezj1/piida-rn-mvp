import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, createCustomerData, fieldsData}) => {
  const { 
    user
  } = userData;

  const { 
    idTypes
  } = fieldsData;

  const { 
    name,
    phone,
    idNumber,
    address,
    email,
    city,
    cityName,
    code,
    idType,
    digit,
    birthday,
    errors
  } = createCustomerData;

  return {
    name,
    phone,
    idNumber,
    address,
    email,
    city,
    cityName,
    code,
    idType,
    errors,
    user,
    digit,
    idTypes,
    birthday
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);