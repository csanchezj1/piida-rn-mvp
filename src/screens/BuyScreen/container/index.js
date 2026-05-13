import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, buyData, fieldsData}) => {
  const { 
    user
  } = userData;

  const { 
    expenseType,
    paymentsType,
    fieldChange
  } = fieldsData;

  const { 
    qty,
    value,
    obs,
    errors,
    product,
    payment,
    provider,
    expense,
    changed,
  } = buyData;

  return {
    user,
    qty,
    value,
    obs,
    errors,
    product,
    payment,
    provider,
    expenseType,
    paymentsType,
    expense,
    fieldChange,
    changed
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);