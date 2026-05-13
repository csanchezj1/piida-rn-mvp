import {
  CREATE_CARD_FORM,
  CREATE_CARD_CCV_ERROR,
  CREATE_CARD_EXPIRY_ERROR,
  CREATE_CARD_NAME_ERROR,
  CREATE_CARD_NUMBER_ERROR,
  CREATE_CARD_CLEAR,
  CREATE_CARD_IDENTIFICATION,
  CREATE_CARD_IDENTIFICATION_ERROR,
  CREATE_CARD_MODE,
} from '../../../utils/constants';

const initialState = {
  cardForm: null,
  ccvError: null,
  expiryError: null,
  nameError:null,
  numberError:null,
  idError:null,
  idForm:null,
  mode:'createCard'
};

const createCreditCardData = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_CARD_MODE:
      return { ...state, mode: action.payload };
    case CREATE_CARD_IDENTIFICATION:
      return { ...state, idForm: action.payload };
    case CREATE_CARD_FORM:
      return { ...state, cardForm: action.payload };
    case CREATE_CARD_EXPIRY_ERROR:
      return { ...state, expiryError: action.payload };
    case CREATE_CARD_NAME_ERROR:
      return { ...state, nameError: action.payload };
    case CREATE_CARD_NUMBER_ERROR:
      return { ...state, numberError: action.payload };
    case CREATE_CARD_CCV_ERROR:
      return { ...state, ccvError: action.payload };
    case CREATE_CARD_IDENTIFICATION_ERROR:
      return { ...state, idError: action.payload };
    case CREATE_CARD_CLEAR:
      return { ...initialState };
    default:
      return state;
  }
}

export default createCreditCardData;