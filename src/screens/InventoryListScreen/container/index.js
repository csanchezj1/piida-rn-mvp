import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, inventroyListData, activeBranchData}) => {
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
  } = inventroyListData

  const {refetchTick = 0} = activeBranchData ?? {};

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
    refetchTick,
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);