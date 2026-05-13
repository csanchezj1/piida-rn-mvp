import validate from 'validate.js';
import Token from '../../../api/token';
import Movements from '../../../api/movements';

import {
  TRANSFER_BRANCH_CHANGE,
  TRANSFER_PRODUCT_CHANGE,
  TRANSFER_QTY_CHANGE,
  TRANSFER_CLEAR,
  TRANSFER_FORM_FAIL,
  TRANSFER_OBS_CHANGE,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_SHOW,
} from '../../../utils/constants';

validate.options = {
  fullMessages: false
};

export const clearScreen = () => {
  return(dispatch) =>{
    dispatch({type: TRANSFER_CLEAR});
    dispatch({ type: TRANSFER_PRODUCT_CHANGE, payload: [] });
  }
};

export const obsChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: TRANSFER_OBS_CHANGE, payload: code });
    dispatch({ type: TRANSFER_FORM_FAIL, payload: null });
  }
};

export const branchChange = (branch) => {
  return(dispatch) =>{
    dispatch({ type: TRANSFER_BRANCH_CHANGE, payload: branch });
    dispatch({ type: TRANSFER_FORM_FAIL, payload: null });
  }
};

export const addProduct = (item) => {
  return(dispatch, getState) =>{
    const { product } = getState().transferData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      product[index].qty ++;     
      dispatch({ type: TRANSFER_PRODUCT_CHANGE, payload: product });
    }
  }
};

export const removeProduct = (item) => {
  return(dispatch, getState) =>{
    const { product } = getState().transferData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      product[index].qty --;
   
      if(product[index].qty == 0){
        product.splice(index, 1)
        dispatch({ type: TRANSFER_PRODUCT_CHANGE, payload: product });
      }
      else{
        dispatch({ type: TRANSFER_PRODUCT_CHANGE, payload: product });
      }
    }
  }
};

export const deleteProduct = (item) => {
  return(dispatch, getState) =>{
    const { product } = getState().transferData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      product.splice(index, 1);
      dispatch({ type: TRANSFER_PRODUCT_CHANGE, payload: product });
    }
  }
};

export const qtyChange = (qty, item) =>{
  return(dispatch, getState) => {
    const { product } = getState().transferData;
    const index = product.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      product[index].qty = qty.replace(/[^0-9]/g, '');
      dispatch({ type: TRANSFER_PRODUCT_CHANGE, payload: product });  
    }
  }
}

export const createTransfer = ({
  navigation
}) => { 
  return (dispatch, getState) => { 
    const { 
      branch,
      product,
      obs,
    } = getState().transferData;
    const { 
      user,
    } = getState().userData;
    let constraints = {
      branch: {
        presence: {
          allowEmpty: false,
        },
      },
      product: {
        presence: {
          allowEmpty: false,
        },
      },
    };
    const errors = validate({ branch, product }, constraints);
    if (errors) {
      dispatch({ type: TRANSFER_FORM_FAIL, payload: errors });
    }
    else{
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
      Token.getToken()
      .then(token => {
        Movements.transferInventory({
          token,
          uid:user.uid,
          branch:branch.nid,
          products:product,
          observations:obs,
        })
        .then((res) =>{
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          dispatch({
            type: DIALOG_SHOW,
            payload: { 
              title:'Traslado de inventario registrado',
              message:'Los datos del traslado fueron guardados.',
            }
          });
          navigation.reset({
            index: 0,
            routes: [
              {name: 'BottomMenu'},
              {name: 'TransferDetails', params:{
                details:{
                  observations:obs,
                  movement_in:res.movement_in,
                  movement_out:res.movement_out,
                  branch_in:branch.label,
                  branch_out:user.branch_office_name,
                  date:res.date,
                  product
                }}
              },
            ],
          })
        })
        .catch(() =>{
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          dispatch({
            type: DIALOG_SHOW,
            payload: { 
              title:'Error',
              message: 'Hubo un error de comunicación con el servidor, por favor revisa tu conexión y/o intenta más tarde.',
            }
          });
        })
      })
      .catch(() => {
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
        dispatch({
          type: DIALOG_SHOW,
          payload: { 
            title:'Error',
            message: 'Hubo un error de comunicación con el servidor, por favor revisa tu conexión y/o intenta más tarde.',
          }
        });
      })
    }
  }
};