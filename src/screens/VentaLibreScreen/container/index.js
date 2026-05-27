import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Component from '../component';
// Reusa actions de NewSale — selectProduct, clearProduct, etc.
import * as actionsCreators from '../../NewSaleScreen/actions';

const mapStateToProps = ({userData, newSaleData, cashShiftData}) => {
  const {user} = userData;
  const {product, total, customer, customerVisible} = newSaleData;
  // Branch-aware: turno activo desde cashShiftData (refresh on focus).
  const cashShiftActiveId = cashShiftData?.activeShiftId ?? 0;
  return {user, product, total, customer, customerVisible, cashShiftActiveId};
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actionsCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
