import {
  DIALOG_VISIBLE,
  DIALOG_SHOW,
  DIALOG_RESET,
  COMMON_LOGOUT,
} from '../../constants';

const initialState = {
  visible: false,
  message: null,
  title: 'Error',
  acceptTitle: 'Aceptar',
  cancelTitle: 'Cancelar',
  showCancelButton: false,
  acceptAction:null,
  type:'info',
};

const dialogData = (state = initialState, action) => {
  switch (action.type) {
    case DIALOG_VISIBLE:
      return { ...state, visible: action.payload };
    case DIALOG_SHOW:
      return {
        ...state,
        visible: true,
        title: action.payload.title ? action.payload.title : initialState.title,
        message: action.payload.message,
        type: action.payload.type ? action.payload.type : initialState.type,
        acceptTitle: action.payload.acceptTitle
          ? action.payload.acceptTitle
          : initialState.acceptTitle,
        cancelTitle: action.payload.cancelTitle
          ? action.payload.cancelTitle
          : initialState.cancelTitle,
        showCancelButton:
          action.payload.showCancelButton != null
            ? action.payload.showCancelButton
            : initialState.showCancelButton,
        acceptAction: 
          action.payload.acceptAction
            ? action.payload.acceptAction
            : initialState.acceptAction,
      };
    case COMMON_LOGOUT:
      return { ...initialState };
    case DIALOG_RESET:
      return { ...initialState };
    default:
      return state;
  }
};

export default dialogData;