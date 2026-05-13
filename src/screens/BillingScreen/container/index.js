import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({billingData}) => billingData;

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actionsCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
