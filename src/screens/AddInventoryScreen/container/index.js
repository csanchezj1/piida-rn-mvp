import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, addInventoryData}) => {
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
    product,
    changed,
    customer,
    customerVisible,
    productSelected
  } = addInventoryData;

  return {
    user,
    list,
    requestMade,
    offset,
    showLoader,
    text,
    searchButton,
    product,
    changed,
    customer,
    customerVisible,
    productSelected
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);