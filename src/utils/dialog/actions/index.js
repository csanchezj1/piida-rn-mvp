import {
  DIALOG_VISIBLE,
  DIALOG_SHOW,
  DIALOG_RESET,
} from '../../constants';

export const visible = (visible) => {
  return(dispatch) => {
    dispatch({type: DIALOG_VISIBLE, payload: visible});
    dispatch({type: DIALOG_RESET});
  };
};

export const show = ({ title, message, acceptTitle, type }) => {
  return (dispatch => {
    dispatch({
      type: DIALOG_SHOW,
      payload: { title, message, acceptTitle, type }
    });
  });
};