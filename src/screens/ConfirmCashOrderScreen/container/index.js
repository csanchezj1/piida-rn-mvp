import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, newSaleData, confirmCahsOrderData}) => {
  const { 
    user
  } = userData;

  const { 
    value,
    errors,
    returnValue,
    invoice
  } = confirmCahsOrderData;

  const { 
    total,
    product,
    customer,
  } = newSaleData;

  return {
    user,
    value,
    errors,
    product,
    total,
    customer,
    returnValue,
    invoice
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);