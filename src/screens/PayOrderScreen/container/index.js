import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, payOrderData, fieldsData}) => {
  const { 
    user
  } = userData;

  const { 
    paymentsType,
    fieldChange
  } = fieldsData;

  const { 
    value,
    errors,
    payment,
    items,
    paymentsQty,
    change,
    errorArr
  } = payOrderData;

  return {
    user,
    value,
    errors,
    payment,
    paymentsType,
    fieldChange,
    items,
    paymentsQty,
    change,
    errorArr
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);