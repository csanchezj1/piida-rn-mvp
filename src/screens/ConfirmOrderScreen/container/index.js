import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, remissionData, fieldsData, newSaleData}) => {
  const { 
    user
  } = userData;

  const { 
    paymentsType,
    orderPaymentsType,
    fieldChange
  } = fieldsData;

  const { 
    qty,
    value,
    obs,
    errors,
    humidity,
    waybill,
    warehouse,
    transporter,
    changed,
    payment,
    orderPayment,
    observations,
    paymentsQty,
    errorArr,
    invoice
  } = remissionData;


  const { 
    total,
    product,
    customer,
  } = newSaleData;

  return {
    user,
    qty,
    value,
    obs,
    errors,
    product,
    humidity,
    paymentsType,
    waybill,
    fieldChange,
    warehouse,
    transporter,
    customer,
    changed,
    total,
    payment,
    orderPayment,
    orderPaymentsType,
    observations,
    paymentsQty,
    errorArr,
    invoice
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);