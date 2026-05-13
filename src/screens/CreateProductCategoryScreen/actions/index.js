import validate from 'validate.js';
import Token from '../../../api/token';
import Product from '../../../api/product';
import API from '../../../api/api';

import {
  CREATE_PRODUCT_CATEGORY_NAME_CHANGE,
  CREATE_PRODUCT_CATEGORY_FORM_FAIL,
  CREATE_PRODUCT_CATEGORY_CLEAR,
  PROGRESS_VISIBLE_CHANGE,
  DIALOG_SHOW,
  PRODUCT_CATEGORIES_LIST,
  PRODUCT_CATEGORIES_SHOW_LOADER,
  PRODUCT_CATEGORIES_LIST_OFFSET,
  PRODUCT_CATEGORIES_REQUEST_MADE,
  NEW_SALE_SHOW_LOADER,
  NEW_SALE_LIST_OFFSET,
  NEW_SALE_LIST,
  NEW_SALE_REQUEST_MADE
} from '../../../utils/constants';

validate.options = {
  fullMessages: false
};

export const clearScreen = () => {
  return(dispatch) =>{
    dispatch({type: CREATE_PRODUCT_CATEGORY_CLEAR});
  }
};

export const nameChange = (code) => {
  return(dispatch) =>{
    dispatch({ type: CREATE_PRODUCT_CATEGORY_NAME_CHANGE, payload: code });
    dispatch({ type: CREATE_PRODUCT_CATEGORY_FORM_FAIL, payload: null });
  }
};

export const createProduct = ({
  navigation
}) => { 
  return (dispatch, getState) => { 
    const { user } = getState().userData;
    const {  
      name,
    } = getState().createProductCategoryData;
    const message = 'Este campo es requerido';
    let constraints = {
      name: {
        presence: {
          allowEmpty: false,
          message: message,
        },
      },
      
    };
    const errors = validate({ name }, constraints);
    console.log(errors)
    if (errors) {
      dispatch({ type: CREATE_PRODUCT_CATEGORY_FORM_FAIL, payload: errors });
    }
    else{
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
      Token.getToken()
      .then(token => {
        Product.createProductCategory({
          token, 
          uid:user.uid,
          name, 
        })
        .then((tid) =>{
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          dispatch({
            type: DIALOG_SHOW,
            payload: { 
              title:'Nuevo producto',
              message:'Producto creado exitosamente. Recuerda crear variaciones para agregar a la orden.',
            }
          });
          dispatch(getProducts())
          navigation.goBack();
          navigation.navigate('ProductVariations', {
            cat:tid,
            catName:name,
            from:'createProductCategory'
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

export const getProducts = () => {
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

        dispatch({type: NEW_SALE_SHOW_LOADER, payload: false});
        dispatch({type: NEW_SALE_LIST_OFFSET, payload: 1});
        dispatch({type: NEW_SALE_LIST, payload: response});
        dispatch({type: NEW_SALE_REQUEST_MADE, payload: false});
      })
    })
  }
};