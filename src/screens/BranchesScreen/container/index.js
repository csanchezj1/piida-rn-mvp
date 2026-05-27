import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Component from '../component';
// Para destino de Trasladar inventario reusamos `branchChange` del slice
// transferData. Si en el futuro queremos crear/editar branches desde la
// app, sumar otros actions acá.
import * as transferActions from '../../TransferScreen/actions';

const mapStateToProps = ({userData, activeBranchData}) => {
  const {user} = userData;
  const {branches = [], activeBranchId = null} = activeBranchData ?? {};
  return {user, branches, activeBranchId};
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(transferActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
