import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({ createCreditCardData, userData, planData }) => {
  const {
    cardForm,
    ccvError,
    expiryError,
    nameError,
    numberError,
    idError,
    idForm,
    mode
  } = createCreditCardData;

  const { 
    user,
  } = userData;

  const { 
    price,
    info,
    planSelected
  } = planData;

  return {
    cardForm,
    ccvError,
    expiryError,
    nameError,
    numberError,
    user,
    idError,
    idForm,
    price,
    info,
    mode,
    planSelected
  };
};

const mapDispatchToProps = dispatch => {
  return { actions: bindActionCreators(actionsCreators, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);