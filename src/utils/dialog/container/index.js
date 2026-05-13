import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({dialogData}) =>{
  const {
    visible,
    message,
    title,
    acceptTitle,
    cancelTitle,
    acceptAction,
    showCancelButton,
    type
  } = dialogData;

  return {
    visible,
    message,
    title,
    acceptTitle,
    cancelTitle,
    acceptAction,
    showCancelButton,
    type
  }
}

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);