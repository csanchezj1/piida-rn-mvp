import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, inventoryCategoryData}) => {
  const { 
    user
  } = userData;

  const { 
    list,
    requestMade,
    offset,
    showLoader,
    showRrefresh,
    listChanged,
    searchButton,
    text,
  } = inventoryCategoryData

  return {
    user,
    list,
    requestMade,
    offset,
    showLoader,
    showRrefresh,
    listChanged,
    searchButton,
    text,
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);