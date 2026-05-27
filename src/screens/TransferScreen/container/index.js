import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, transferData, activeBranchData}) => {
  const {
    user
  } = userData;

  const {
    branch,
    product,
    qty,
    obs,
    errors,
    changed,
    originInventory,
    originLoading,
  } = transferData;

  const {refetchTick = 0} = activeBranchData ?? {};

  return {
    user,
    branch,
    product,
    qty,
    obs,
    errors,
    changed,
    originInventory,
    originLoading,
    refetchTick,
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);