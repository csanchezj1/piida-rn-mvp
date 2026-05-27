import {ToastAndroid} from 'react-native';
import validate from 'validate.js';
import Token from '../../../api/token';
import Product from '../../../api/product';
import moment from 'moment';

import {
  CREATE_PRODUCT_NAME_CHANGE,
  CREATE_PRODUCT_CODE_CHANGE,
  CREATE_PRODUCT_PRICE_CHANGE,
  CREATE_PRODUCT_FORM_FAIL,
  CREATE_PRODUCT_CLEAR,
  CREATE_PRODUCT_AUNAP_CHANGE,
  CREATE_PRODUCT_ENGLISH_CHANGE,
  CREATE_PRODUCT_SCIENTIST_CHANGE,
  CREATE_PRODUCT_SIZE_CHANGE,
  CREATE_PRODUCT_AQUARIUM_CHANGE,
  CREATE_PRODUCT_STATUS_CHANGE,
  CREATE_PRODUCT_QTY_CHANGE,
  CREATE_PRODUCT_COLOR_CHANGE,
  CREATE_PRODUCT_REF_CHANGE,
  CREATE_PRODUCT_BRAND_CHANGE,
  CREATE_PRODUCT_TYPE_CHANGE,
  CREATE_PRODUCT_DATE_CHANGE, 
  CREATE_PRODUCT_COST_CHANGE,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_SHOW,
  PROVIDER_LIST,
  PROVIDER_REQUEST_MADE,
  PROVIDER_SHOW_LOADER,
  PROVIDER_LIST_OFFSET,
  PRODUCT_VARIATIONS_SHOW_LOADER,
  PRODUCT_VARIATIONS_LIST_OFFSET,
  PRODUCT_VARIATIONS_REQUEST_MADE,
  PRODUCT_VARIATIONS_LIST,
  PRODUCT_CATEGORIES_LIST,
  PRODUCT_CATEGORIES_SHOW_LOADER,
  PRODUCT_CATEGORIES_LIST_OFFSET,
  PRODUCT_CATEGORIES_REQUEST_MADE,
  NEW_SALE_SHOW_LOADER,
  NEW_SALE_LIST_OFFSET,
  NEW_SALE_LIST,
  NEW_SALE_REQUEST_MADE,
  PRODUCTS_SHOW_LOADER,
  PRODUCTS_LIST_OFFSET,
  PRODUCTS_LIST,
  PRODUCTS_REQUEST_MADE,
} from '../../../utils/constants';
import { createProductEvent } from '../../../utils/analytics';

validate.options = {
  fullMessages: false
};

export const clearScreen = () => {
  return(dispatch) =>{
    dispatch({type: CREATE_PRODUCT_CLEAR});
  }
};

export const nameChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PRODUCT_NAME_CHANGE, payload: code });
    dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: null });
  }
};

export const codeChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PRODUCT_CODE_CHANGE, payload: code });
    dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: null });
  }
};

export const priceChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PRODUCT_PRICE_CHANGE, payload:'$' + code.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".")});
    dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: null });
  }
};

export const costChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PRODUCT_COST_CHANGE, payload:'$' + code.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".")});
    dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: null });
  }
};

export const codeAunapChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PRODUCT_AUNAP_CHANGE, payload: code });
    dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: null });
  }
};

export const englishNameChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PRODUCT_ENGLISH_CHANGE, payload: code });
    dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: null });
  }
};

export const scientistNameChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PRODUCT_SCIENTIST_CHANGE, payload: code });
    dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: null });
  }
};

export const sizeChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PRODUCT_SIZE_CHANGE, payload: code });
    dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: null });
  }
};

export const aquariumChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PRODUCT_AQUARIUM_CHANGE, payload: code });
    dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: null });
  }
};

export const statusChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PRODUCT_STATUS_CHANGE, payload: code });
    dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: null });
  }
};

export const typeChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PRODUCT_TYPE_CHANGE, payload: code });
    dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: null });
  }
};

export const brandChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PRODUCT_BRAND_CHANGE, payload: code });
    dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: null });
  }
};

export const refChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PRODUCT_REF_CHANGE, payload: code });
    dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: null });
  }
};

export const colorChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PRODUCT_COLOR_CHANGE, payload: code });
    dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: null });
  }
};

export const qtyChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PRODUCT_QTY_CHANGE, payload:code.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".") });
    dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: null });
  }
};

export const dateChange = (value) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PRODUCT_DATE_CHANGE, payload: value }); 
    dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: null });
  }
};

export const createProduct = ({
  navigation,
  features,
  cat
}) => { 
  return (dispatch, getState) => { 
    const { user } = getState().userData;
    const {  
      code,
      name,
      price,
      codeAunap,
      englishName,
      scientistName,
      size,
      aquarium,
      status, 
      qty,
      color,
      ref,
      brand,
      type,
      date,
      cost
    } = getState().createProductData;
    const message = 'Este campo es requerido';
    let constraints = {
      price: {
        presence: {
          allowEmpty: false,
          message: message,
        },
      },
      qty: {
        presence: {
          allowEmpty: false,
          message: message,
        },
      },
    };
    if(!cat){
      constraints.name = {
        presence: {
          allowEmpty: false,
          message: message,
        },
      }
    }
    if(features.includes('product_extra_fields_big_riders')){
      constraints.type = {
        presence: {
          allowEmpty: false,
          message: message,
        },
      }
      constraints.brand = {
        presence: {
          allowEmpty: false,
          message: message,
        },
      }
      constraints.ref = {
        presence: {
          allowEmpty: false,
          message: message,
        },
      }
    } 
    if(features.includes('product_extra_fields_production_date')){
      constraints.date = {
        presence: {
          allowEmpty: false,
          message: message,
        },
      }
    }

    const errors = validate({ name, price, qty, type, brand, ref, date }, constraints);
    if (errors) {
      dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: errors });
    }
    else{
      if(price == '$'){
        dispatch({
          type: DIALOG_SHOW,
          payload: { 
            title:'Error',
            message: 'Por favor escribe el precio que tendrá el producto.',
          }
        });
      }
      else{
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
        Token.getToken()
        .then(token => {
          Product.createProduct({
            token, 
            uid:user.uid,
            code, 
            name, 
            price:price.split('.').join('').split('$').join(''), 
            cost:cost ? cost.split('.').join('').split('$').join('') : null, 
            codeAunap,
            englishName,
            scientistName,
            size,
            aquarium,
            status,
            qty:qty.split('.').join(''), 
            color,
            ref,
            brand,
            type,
            date:date ? moment(date).format('YYYY-MM-DD') : null,
            cat
          })
          .then((response) =>{
            dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
            ToastAndroid.show('Producto creado', ToastAndroid.SHORT);
            // Siempre refrescar la lista global de productos. Si además hay
            // categoría, refrescar también la lista de variations para esa
            // categoría. Antes solo se llamaba con cat, lo que dejaba el
            // listado de Productos desactualizado tras crear con categoría.
            dispatch(getProducts(null));
            if (cat) dispatch(getProducts(cat));
            dispatch(getProductCat());
            try { createProductEvent(user, response); } catch (_) { /* analytics no debe bloquear */ }
            navigation.goBack();
          })
          .catch((e) =>{
            console.log('[create-product] back error:', e);
            dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
            dispatch({
              type: DIALOG_SHOW,
              payload: {
                title:'Error',
                message:
                  e?.data?.message ||
                  (Array.isArray(e?.data?.errors) ? e.data.errors.join('. ') : null) ||
                  'Hubo un error de comunicación con el servidor, por favor revisa tu conexión y/o intenta más tarde.',
              }
            });
          })
        })
        .catch((e) => {
          console.log('[create-product] token/outer error:', e);
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          // Outer catch: típicamente Token.getToken() falló. Lo más común es
          // 429 (rate limit en /session/token). Surface el motivo si está.
          const status = e?.status;
          const dataMsg = e?.data?.message;
          let message;
          if (status === 429) {
            message = 'El servidor está limitando peticiones (429). Esperá unos segundos y volvé a intentar.';
          } else if (dataMsg) {
            message = Array.isArray(dataMsg) ? dataMsg.join('. ') : dataMsg;
          } else {
            message = 'Hubo un error de comunicación con el servidor, por favor revisa tu conexión y/o intenta más tarde.';
          }
          dispatch({
            type: DIALOG_SHOW,
            payload: { title: 'Error', message }
          });
        })
      }
    }
  }
};

export const getProducts = (cat) => {
  return(dispatch, getState) =>{
    const { user } = getState().userData;
    dispatch({type: PROVIDER_LIST, payload: null});
    dispatch({type: PROVIDER_REQUEST_MADE, payload: true});
    dispatch({type: PROVIDER_SHOW_LOADER, payload: true});      
    Token.getToken()
    .then(token => {
      Product.getProductsKits({
        token,
        page:0,
        company:user.company,
        branchOffice:user.branch_office,
        keyword:'',
        cat
      })
      .then(response => {
        if(cat){
          dispatch({type: PRODUCT_VARIATIONS_SHOW_LOADER, payload: false});
          dispatch({type: PRODUCT_VARIATIONS_LIST_OFFSET, payload: 1});
          dispatch({type: PRODUCT_VARIATIONS_REQUEST_MADE, payload: false});
          dispatch({type: PRODUCT_VARIATIONS_LIST, payload: response});
        }
        else{
          dispatch({type: PROVIDER_SHOW_LOADER, payload: false});
          dispatch({type: PROVIDER_REQUEST_MADE, payload: false});
          dispatch({type: PROVIDER_LIST_OFFSET, payload: 1});
          dispatch({type: PROVIDER_LIST, payload: response});

          dispatch({type: NEW_SALE_SHOW_LOADER, payload: false});
          dispatch({type: NEW_SALE_LIST_OFFSET, payload: 1});
          dispatch({type: NEW_SALE_LIST, payload: response});
          dispatch({type: NEW_SALE_REQUEST_MADE, payload: false});
          
          dispatch({type: PRODUCTS_SHOW_LOADER, payload: false});
          dispatch({type: PRODUCTS_LIST_OFFSET, payload: 1});
          dispatch({type: PRODUCTS_LIST, payload: response});
          dispatch({type: PRODUCTS_REQUEST_MADE, payload: false});
        }
      })
    })
  }
};

export const getProductCat = () => {
  return(dispatch, getState) =>{
    const { user } = getState().userData;
    dispatch({type: PRODUCT_CATEGORIES_LIST, payload: null});
    Token.getToken()
    .then(token => {
      Product.getProductCategories({
        token,
        page:0,
        uid:user.uid,
        keyword:''
      })
      .then(response =>{
        dispatch({type: PRODUCT_CATEGORIES_SHOW_LOADER, payload: false});
        dispatch({type: PRODUCT_CATEGORIES_LIST_OFFSET, payload: 1});
        dispatch({type: PRODUCT_CATEGORIES_REQUEST_MADE, payload: false});
        dispatch({type: PRODUCT_CATEGORIES_LIST, payload: response});
        // No dispatchar NEW_SALE_LIST / PRODUCTS_LIST con categorías:
        // sobreescribía la lista de productos con categorías y al volver
        // a "Productos" mostraba 6 categorías en vez de los 6 productos.
      })
    })
  }
};

export const editProduct = ({
  navigation,
  features,
  productId
}) => { 
  return (dispatch, getState) => { 
    const {  
      code,
      name,
      price,
      codeAunap,
      englishName,
      scientistName,
      size,
      aquarium,
      status, 
      color,
      ref,
      brand,
      type,
      date,
      cost
    } = getState().createProductData;
    const {
      user
    } = getState().userData;
    const message = 'Este campo es requerido';
    let constraints = {
      price: {
        presence: {
          allowEmpty: false,
          message: message,
        },
      },
      name:{
        presence: {
          allowEmpty: false,
          message: message,
        },
      }
    };
    if(features.includes('product_extra_fields_big_riders')){
      constraints.type = {
        presence: {
          allowEmpty: false,
          message: message,
        },
      }
      constraints.brand = {
        presence: {
          allowEmpty: false,
          message: message,
        },
      }
      constraints.ref = {
        presence: {
          allowEmpty: false,
          message: message,
        },
      }
    } 
    if(features.includes('product_extra_fields_production_date')){
      constraints.date = {
        presence: {
          allowEmpty: false,
          message: message,
        },
      }
    }

    const errors = validate({ name, price, type, brand, ref, date }, constraints);
    if (errors) {
      dispatch({ type: CREATE_PRODUCT_FORM_FAIL, payload: errors });
    }
    else{
      if(price == '$'){
        dispatch({
          type: DIALOG_SHOW,
          payload: { 
            title:'Error',
            message: 'Por favor escribe el precio que tendrá el producto.',
          }
        });
      }
      else{
        dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
        Token.getToken()
        .then(token => {
          Product.editProduct({
            uid:user.uid,
            token, 
            code, 
            name, 
            price:price.split('.').join('').split('$').join(''), 
            cost:cost ? cost.split('.').join('').split('$').join('') : null, 
            codeAunap,
            englishName,
            scientistName,
            size,
            aquarium,
            status,
            color,
            ref,
            brand,
            type,
            date:date ? moment(date).format('YYYY-MM-DD') : null,
            productId
          })
          .then(() =>{
            dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
            dispatch({
              type: DIALOG_SHOW,
              payload: { 
                title:'Felicidades',
                message:'El producto fue editado exitosamente.',
              }
            });
            dispatch(getProducts(null));
            //dispatch(getProductCat());
            navigation.goBack();
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
  }
};