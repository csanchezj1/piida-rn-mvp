import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, ordersData}) => {
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
    tabActive,
    autoValue
  } = ordersData;

  return {
    user,
    list,
    requestMade,
    offset,
    showLoader,
    showRrefresh,
    listChanged,
    tabActive,
    autoValue
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);