import Api from '../../../api/api';

import { 
  TERMS_TEXT
} from '../../../utils/constants';

export const getTerms = (company) => {
  return(dispatch) => {
    Api.getTerms(company)
    .then(res => {
      dispatch({ type: TERMS_TEXT, payload: res[0].text });
    })
  }
}

export const getPolicy = (company) => {
  return(dispatch) => {
    Api.getPolicy(company)
    .then(res => {
      dispatch({ type: TERMS_TEXT, payload: res[0].text });
    })
  }
}

export const clear = () => {
  return(dispatch) => {
    dispatch({ type: TERMS_TEXT, payload: null });
  }
}
