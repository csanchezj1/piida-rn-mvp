import {
  CREATE_PROVIDER_NAMES_CHANGE,
  CREATE_PROVIDER_LAST_NAMES_CHANGE,
  CREATE_PROVIDER_GENDER_CHANGE,
  CREATE_PROVIDER_PHONE_CHANGE,
  CREATE_PROVIDER_CITY_CHANGE,
  CREATE_PROVIDER_VEREDA_CHANGE,
  CREATE_PROVIDER_SECTOR_CHANGE,
  CREATE_PROVIDER_FARM_CHANGE,
  CREATE_PROVIDER_TYPE_CHANGE,
  CREATE_PROVIDER_CLEAR,
  CREATE_PROVIDER_FORM_FAIL,
  CREATE_PROVIDER_ID_NUMBER_CHANGE,
  CREATE_PROVIDER_CODE_CHANGE
} from '../../../utils/constants';

const initialState = {
  names: null,
  lastNames:null,
  gender:null,
  phone:null,
  city:null,
  code:null,
  vereda:null,
  sector:null,
  farm:null,
  type:null,
  idNumber:null,
  errors:null,
};

const createProviderData = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_PROVIDER_NAMES_CHANGE:
      return { ...state, names: action.payload };
    case CREATE_PROVIDER_LAST_NAMES_CHANGE:
      return { ...state, lastNames: action.payload };
    case CREATE_PROVIDER_GENDER_CHANGE:
      return { ...state, gender: action.payload };
    case CREATE_PROVIDER_PHONE_CHANGE:
      return { ...state, phone: action.payload };
    case CREATE_PROVIDER_CITY_CHANGE:
      return { ...state, city: action.payload };
    case CREATE_PROVIDER_CODE_CHANGE:
      return { ...state, code: action.payload };
    case CREATE_PROVIDER_VEREDA_CHANGE:
      return { ...state, vereda: action.payload };
    case CREATE_PROVIDER_SECTOR_CHANGE:
      return { ...state, sector: action.payload };
    case CREATE_PROVIDER_FARM_CHANGE:
      return { ...state, farm: action.payload };
    case CREATE_PROVIDER_TYPE_CHANGE:
      return { ...state, type: action.payload };
    case CREATE_PROVIDER_ID_NUMBER_CHANGE:
      return { ...state, idNumber: action.payload };
    case CREATE_PROVIDER_FORM_FAIL:
      return { ...state, errors: action.payload };
    case CREATE_PROVIDER_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default createProviderData;