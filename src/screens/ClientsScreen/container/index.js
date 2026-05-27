import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Component from '../component';
// Reusa fetching del ProviderScreen — providerData es el store compartido.
import * as actionsCreators from '../../ProviderScreen/actions';

const mapStateToProps = ({userData, providerData, activeBranchData}) => {
  const {user} = userData;
  const {list, requestMade, offset, showLoader, text} = providerData;
  const {refetchTick = 0} = activeBranchData ?? {};
  return {user, list, requestMade, offset, showLoader, text, refetchTick};
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actionsCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
