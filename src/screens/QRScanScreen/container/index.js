import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({qrScanData}) => {
  const {
    cameraActive,
    codeScanned,
    hasPermission
  } = qrScanData;

  return {
    cameraActive,
    codeScanned,
    hasPermission
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);