import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, buyDetailsData}) => {
  const { 
    user
  } = userData;

  const { 
    items,
    payments,
    paymentsChange
  } = buyDetailsData;

  return {
    user,
    items,
    payments,
    paymentsChange
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);