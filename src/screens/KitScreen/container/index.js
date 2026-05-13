import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, kitData}) => {
  const { 
    user
  } = userData;

  const { 
    errors,
    pro,
    changed,
    tot,
    name
  } = kitData;

  return {
    user,
    errors,
    pro,
    changed,
    tot,
    name
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);