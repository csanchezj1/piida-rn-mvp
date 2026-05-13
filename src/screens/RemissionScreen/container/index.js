import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, remissionData, fieldsData}) => {
  const { 
    user
  } = userData;

  const { 
    products,
    fieldChange
  } = fieldsData;

  const { 
    qty,
    value,
    obs,
    errors,
    product,
    humidity,
    waybill,
    warehouse,
    transporter,
    customer,
    changed,
    total,
    observations,
    paymentsQty,
    invoice
  } = remissionData;

  return {
    user,
    qty,
    value,
    obs,
    errors,
    product,
    humidity,
    products,
    waybill,
    fieldChange,
    warehouse,
    transporter,
    customer,
    changed,
    total,
    observations,
    paymentsQty,
    invoice
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);