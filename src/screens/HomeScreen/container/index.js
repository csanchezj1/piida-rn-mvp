import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, homeData, activeBranchData}) => {
  const {
    user
  } = userData;

  const {
    total,
    showRrefresh,
    period
  } = homeData;

  const { refetchTick = 0 } = activeBranchData ?? {};

  return {
    user,
    total,
    showRrefresh,
    period,
    refetchTick,
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);