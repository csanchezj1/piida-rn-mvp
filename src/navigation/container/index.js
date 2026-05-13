import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({navigationData, splashscreenData, userData, homeData, activeBranchData, cashShiftData}) => {
  const {
    showDrawer,
    visible,
  } = navigationData;

  const {
    isLoading,
  } = splashscreenData;

  const {
    user,
  } = userData;

  const {
    buttonState,
  } = homeData;

  const {
    branches = [],
    activeBranchId = null,
    modalVisible: branchModalVisible = false,
  } = activeBranchData ?? {};

  const {
    activeShiftId: cashShiftActiveId = 0,
    hasOpenShift: cashHasOpenShift = false,
  } = cashShiftData ?? {};

  return {
    isLoading,
    user,
    showDrawer,
    visible,
    buttonState,
    branches,
    activeBranchId,
    branchModalVisible,
    cashShiftActiveId,
    cashHasOpenShift,
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);