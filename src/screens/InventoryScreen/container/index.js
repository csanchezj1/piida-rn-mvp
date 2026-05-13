import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, inventoryData, activeBranchData}) => {
  const {
    user
  } = userData;

  const {
    list,
    total,
    requestMade,
    offset,
    showLoader,
    showRrefresh,
    changeTotal
  } = inventoryData;

  const { refetchTick = 0 } = activeBranchData ?? {};

  return {
    user,
    list,
    total,
    requestMade,
    offset,
    showLoader,
    showRrefresh,
    changeTotal,
    refetchTick,
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);