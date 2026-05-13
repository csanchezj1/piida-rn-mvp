import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({ progressData }) => {
  const {
    visible,
    message,
    size
  } = progressData;

  return {
    visible,
    message,
    size,
  };
};

const mapDispatchToProps = dispatch => {
  return { actions: bindActionCreators(actionsCreators, dispatch) };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);