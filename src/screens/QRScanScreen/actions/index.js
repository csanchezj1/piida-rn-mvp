import Token from '../../../api/token';
import Product from '../../../api/product';

import {
  QR_SCAN_HAS_PERMISSION,
  QR_SCAN_CLEAR,
  QR_SCAN_CAMERA_ACTIVE,
  QR_SCAN_CODE_SCANNED,
  DIALOG_SHOW,
  REMISSION_TOTAL_CHANGE,
  REMISSION_PRODUCT_CHANGE,
  REMISSION_FORM_FAIL,
  PROGRESS_VISIBLE_CHANGE,
  NEW_SALE_TOTAL_CHANGE,
  NEW_SALE_PRODUCT_CHANGE,
  NEW_SALE_FORM_FAIL
} from '../../../utils/constants'

export const setPermission = () => { 
  return(dispatch) =>{
    dispatch({type:QR_SCAN_HAS_PERMISSION, payload:true})
  }
};

export const clear = () => { 
  return(dispatch) =>{
    dispatch({type:QR_SCAN_CLEAR})
  }
};

export const codeScanned = (code) => { 
  return(dispatch) =>{
    dispatch({type:QR_SCAN_CODE_SCANNED, payload:code})
  }
};

export const product = (nid, navigation) => {
  return(dispatch, getState) =>{
    //const { product, total } = getState().remissionData;
    const { product, total } = getState().newSaleData;
    const { user } = getState().userData;
    dispatch({ type: QR_SCAN_CAMERA_ACTIVE, payload: false });
    dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
    Token.getToken()
    .then(token =>{
      Product.getProduct({
        token,
        company:user.company,
        branchOffice:user.branch_office,
        nid
      })
      .then(response => {
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
        if(response.length > 0){
          const item = response[0];
          const index = product.findIndex(e => e.nid == item.nid);
          let newtotal = total;
          if(index !== -1){
            if(product[index].qty < item.available){
              product[index].qty ++;
              newtotal = total + parseInt(item.price);
            }
            else{
              dispatch({
                type: DIALOG_SHOW,
                payload: { 
                  title:'No puedes agregar el producto',
                  message:'Ya has agregado a la orden la cantidad de producto disponible en inventario.',
                }
              });
            }
          }
          else{
            if(item.available > 0){
              item.qty = 1;
              product.push(item)
              newtotal = total + parseInt(item.price);
              //navigation.goBack();
            }
            else{
              dispatch({
                type: DIALOG_SHOW,
                payload: { 
                  title:'No puedes agregar el producto',
                  message:'El producto escaneado no posee cantidades disponibles en inventario.',
                }
              });
            }
          }
          /*dispatch({ type: REMISSION_TOTAL_CHANGE, payload: newtotal });
          dispatch({ type: REMISSION_PRODUCT_CHANGE, payload: product });
          dispatch({ type: REMISSION_FORM_FAIL, payload: null });*/

          dispatch({ type: NEW_SALE_TOTAL_CHANGE, payload: newtotal });
          dispatch({ type: NEW_SALE_PRODUCT_CHANGE, payload: product });
          dispatch({ type: NEW_SALE_FORM_FAIL, payload: null });
        }
        else{
          dispatch({
            type: DIALOG_SHOW,
            payload: { 
              title:'No hay resultados',
              message:'El código escaneado no corresponde a ningún producto existente en el sistema.',
            }
          });
        }
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
    });

    navigation.goBack();
  }
};
