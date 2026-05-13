import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, newSaleData, activeBranchData}) => {
  const { 
    user
  } = userData;

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
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);