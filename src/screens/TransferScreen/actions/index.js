import validate from 'validate.js';
import Token from '../../../api/token';
import Movements from '../../../api/movements';
import Product from '../../../api/product';

import {
  TRANSFER_BRANCH_CHANGE,
  TRANSFER_PRODUCT_CHANGE,
  TRANSFER_QTY_CHANGE,
  TRANSFER_CLEAR,
  TRANSFER_FORM_FAIL,
  TRANSFER_OBS_CHANGE,
  TRANSFER_ORIGIN_INVENTORY,
  TRANSFER_ORIGIN_LOADING,
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

// Carga el catálogo de la sucursal ORIGEN (la activa del user) para el
// rediseño 38. Pone los items en transferData.originInventory.
export const loadOriginInventory = () => {
  return (dispatch, getState) => {
    const {user} = getState().userData;
    if (!user?.company) return;
    dispatch({type: TRANSFER_ORIGIN_LOADING, payload: true});
    Token.getToken()
      .then((token) =>
        Product.getProductsKits({
          token,
          page: 0,
          company: user.company,
          branchOffice: user.branch_office,
          keyword: '',
        })
      )
      .then((response) => {
        const items = Array.isArray(response) ? response : [];
        dispatch({type: TRANSFER_ORIGIN_INVENTORY, payload: items});
        dispatch({type: TRANSFER_ORIGIN_LOADING, payload: false});
      })
      .catch(() => {
        dispatch({type: TRANSFER_ORIGIN_INVENTORY, payload: []});
        dispatch({type: TRANSFER_ORIGIN_LOADING, payload: false});
      });
  };
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
      // Ya está en el carrito → incrementar qty.
      product[index].qty = (Number(product[index].qty) || 0) + 1;
    } else {
      // No estaba → push con qty=1. Antes solo incrementaba existentes,
      // así que tap-ear un item nuevo desde la lista origen no hacía nada.
      product.push({ ...item, qty: 1 });
    }
    dispatch({ type: TRANSFER_PRODUCT_CHANGE, payload: product });
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
          // Branch puede venir como {id, name, ...} (rediseño 28) o como
          // {nid, label, value} (SelectList legacy). Aceptamos cualquiera.
          branch: branch.id ?? branch.value ?? branch.nid,
          // Normalizamos qty a número y nid a entero para que el back no
          // rechace por shape (algunos items vienen con qty string '1' y
          // nid string del catálogo).
          products: product.map((p) => ({
            nid: parseInt(p.nid ?? p.id ?? p.product_id, 10),
            qty: parseInt(p.qty, 10) || 1,
          })),
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
        .catch((e) =>{
          console.log('[Transfer.createTransfer] back error:', e);
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          // Surface del mensaje real del back (ej: "to_branch_id es
          // obligatorio", "qty debe ser > 0", etc.). Antes el catch tragaba
          // el error y el cajero veía solo "Hubo un error de comunicación".
          const backMsg =
            e?.data?.message ||
            (Array.isArray(e?.data?.errors) ? e.data.errors.join('. ') : null) ||
            'Hubo un error de comunicación con el servidor, por favor revisa tu conexión y/o intenta más tarde.';
          dispatch({
            type: DIALOG_SHOW,
            payload: { title: 'Error', message: backMsg }
          });
        })
      })
      .catch((e) => {
        console.log('[Transfer.token] error:', e);
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