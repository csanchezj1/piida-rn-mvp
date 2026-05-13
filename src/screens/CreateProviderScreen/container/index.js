import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, createProviderData, fieldsData}) => {
  const { 
    user
  } = userData;

  const { 
    names,
    lastNames,
    gender,
    phone,
    city,
    code,
    vereda,
    sector,
    farm,
    type,
    idNumber,
    errors
  } = createProviderData;

  const {
    fieldChange,
    genders
  } = fieldsData;

  return {
    names,
    lastNames,
    gender,
    phone,
    city,
    code,
    vereda,
    sector,
    farm,
    type,
    idNumber,
    errors,
    user,
    fieldChange,
    genders,
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);