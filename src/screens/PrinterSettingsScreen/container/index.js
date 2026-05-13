import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({printerSettingsData}) => {
  const {
    address, name, autoPrintAfterSale, openDrawerOnCashSale,
    paired, found, loading, scanning, pairingAddress,
  } = printerSettingsData;
  return {
    address, name, autoPrintAfterSale, openDrawerOnCashSale,
    paired, found, loading, scanning, pairingAddress,
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actionsCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
