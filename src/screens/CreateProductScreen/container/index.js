import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Component from '../component';
import * as actionsCreators from '../actions';

const mapStateToProps = ({userData, createProductData, productCategoriesData}) => {
  const {
    user
  } = userData;

  const {
    code,
    name,
    price,
    errors,
    codeAunap,
    englishName,
    scientistName,
    size,
    aquarium,
    status,
    qty,
    color,
    ref,
    brand,
    type,
    date,
    cost
  } = createProductData;

  const categories = productCategoriesData?.list ?? null;

  return {
    code,
    name,
    price,
    errors,
    user,
    codeAunap,
    englishName,
    scientistName,
    size,
    aquarium,
    status,
    qty,
    color,
    ref,
    brand,
    type,
    date,
    cost,
    categories,
  };
};

const mapDispatchToProps = dispatch => {
  return { 
    actions: bindActionCreators(actionsCreators, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);