import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, newSaleData, activeBranchData, cashShiftData}) => {
  const {
    user
  } = userData;
  // Branch-aware: el id del turno activo viene del slice cashShiftData (que
  // se refresca on focus desde el server). `user.cash_id` puede quedar stale
  // si la caja se abrió/cerró desde otra sesión o pestaña.
  const cashShiftActiveId = cashShiftData?.activeShiftId ?? 0;

  const { 
    list,
    requestMade,
    offset,
    showLoader,
    text,
    searchButton,
    errors,
    product,
    total,
    customer,
    customerVisible,
    productSelected
  } = newSaleData;

  const { refetchTick = 0 } = activeBranchData ?? {};

  return {
    user,
    list,
    requestMade,
    offset,
    showLoader,
    text,
    searchButton,
    errors,
    product,
    total,
    customer,
    customerVisible,
    productSelected,
    refetchTick,
    cashShiftActiveId,
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);