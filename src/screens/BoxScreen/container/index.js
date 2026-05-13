import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, boxData, cashShiftData}) => {
  const {
    user
  } = userData;

  const {
    money,
    errors,
    select,
    balance,
    balance_show,
    balance_type,
    history
  } = boxData;

  // Multi-sucursal: el id del turno activo viene del slice cashShiftData
  // (refrescado por server, scoped a la sucursal activa).
  const cashShiftActiveId = cashShiftData?.activeShiftId ?? 0;

  return {
    user,
    money,
    errors,
    select,
    balance,
    balance_show,
    balance_type,
    history,
    cashShiftActiveId,
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);