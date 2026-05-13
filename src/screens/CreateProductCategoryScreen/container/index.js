import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, createProductCategoryData}) => {
  const { 
    user
  } = userData;

  const { 
    name,
    errors,
  } = createProductCategoryData;

  return {
    name,
    errors,
    user,
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);