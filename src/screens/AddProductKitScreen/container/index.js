import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, addProductKitData}) => {
  const { 
    user
  } = userData;
  
  const { 
    list,
    requestMade,
    offset,
    showLoader,
    text,
    searchButton
  } = addProductKitData;

  return {
    user,
    list,
    requestMade,
    offset,
    showLoader,
    text,
    searchButton
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);