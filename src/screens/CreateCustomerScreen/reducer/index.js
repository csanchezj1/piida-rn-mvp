import {
  CREATE_CUSTOMER_NAME_CHANGE,
  CREATE_CUSTOMER_PHONE_CHANGE,
  CREATE_CUSTOMER_ID_NUMBER_CHANGE,
  CREATE_CUSTOMER_ADDRESS_CHANGE,
  CREATE_CUSTOMER_EMAIL_CHANGE,
  CREATE_CUSTOMER_CITY_CHANGE,
  CREATE_CUSTOMER_CITY_NAME_CHANGE,
  CREATE_CUSTOMER_CODE_CHANGE,
  CREATE_CUSTOMER_ID_TYPE_CHANGE,
  CREATE_CUSTOMER_FORM_FAIL,
  CREATE_CUSTOMER_CLEAR,
  CREATE_CUSTOMER_DIGIT_CHANGE,
  CREATE_CUSTOMER_BIRTHDAY_CHANGE,
} from '../../../utils/constants';

const initialState = {
  name: null,
  phone: null,
  idNumber:null,
  address:null,
  email:null,
  city:null,
  cityName:null,
  code:null,
  idType:null,
  digit:null,
  birthday:null,
  errors:null,
};

const createCustomerData = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_CUSTOMER_NAME_CHANGE:
      return { ...state, name: action.payload };
    case CREATE_CUSTOMER_PHONE_CHANGE:
      return { ...state, phone: action.payload };
    case CREATE_CUSTOMER_ID_NUMBER_CHANGE:
      return { ...state, idNumber: action.payload };
    case CREATE_CUSTOMER_ADDRESS_CHANGE:
      return { ...state, address: action.payload };
    case CREATE_CUSTOMER_EMAIL_CHANGE:
      return { ...state, email: action.payload };
    case CREATE_CUSTOMER_CITY_CHANGE:
      return { ...state, city: action.payload };
    case CREATE_CUSTOMER_CITY_NAME_CHANGE:
      return { ...state, cityName: action.payload };
    case CREATE_CUSTOMER_CODE_CHANGE:
      return { ...state, code: action.payload };
    case CREATE_CUSTOMER_ID_TYPE_CHANGE:
      return { ...state, idType: action.payload };
    case CREATE_CUSTOMER_DIGIT_CHANGE:
      return { ...state, digit: action.payload };
    case CREATE_CUSTOMER_BIRTHDAY_CHANGE:
      return { ...state, birthday: action.payload };
    case CREATE_CUSTOMER_FORM_FAIL:
      return { ...state, errors: action.payload };
    case CREATE_CUSTOMER_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default createCustomerData;