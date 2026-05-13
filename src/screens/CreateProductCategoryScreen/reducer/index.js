import {
  CREATE_PRODUCT_CATEGORY_NAME_CHANGE,
  CREATE_PRODUCT_CATEGORY_FORM_FAIL,
  CREATE_PRODUCT_CATEGORY_CLEAR,
} from '../../../utils/constants';

const initialState = {
  name: null,
  errors: null,
};

const createProductCategoryData = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_PRODUCT_CATEGORY_NAME_CHANGE:
      return { ...state, name: action.payload };
    case CREATE_PRODUCT_CATEGORY_FORM_FAIL:
      return { ...state, errors: action.payload };
    case CREATE_PRODUCT_CATEGORY_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default createProductCategoryData;