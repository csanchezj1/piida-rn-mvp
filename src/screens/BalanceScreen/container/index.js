import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, balanceData, activeBranchData}) => {
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
    listChanged
  } = balanceData;

  const { refetchTick = 0 } = activeBranchData ?? {};

  return {
    user,
    list,
    total,
    requestMade,
    offset,
    showLoader,
    showRrefresh,
    listChanged,
    refetchTick,
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);