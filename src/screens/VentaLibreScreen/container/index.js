import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Component from '../component';
// Reusa actions de NewSale — selectProduct, clearProduct, etc.
import * as actionsCreators from '../../NewSaleScreen/actions';

const mapStateToProps = ({userData, newSaleData}) => {
  const {user} = userData;
  const {product, total, customer, customerVisible} = newSaleData;
  return {user, product, total, customer, customerVisible};
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actionsCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
