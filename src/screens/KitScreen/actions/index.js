import validate from 'validate.js';
import Token from '../../../api/token';
import Product from '../../../api/product';

import {
  KIT_CLEAR,
  KIT_FORM_FAIL,
  KIT_PRODUCT_CHANGE,
  KIT_TOTAL_CHANGE,
  REMISSION_TOTAL_CHANGE,
  REMISSION_PRODUCT_CHANGE,
  REMISSION_FORM_FAIL,
  KIT_NAME_CHANGE,
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
  NEW_SALE_SHOW_LOADER,
  NEW_SALE_LIST_OFFSET,
  NEW_SALE_LIST,
  NEW_SALE_REQUEST_MADE,
  PRODUCT_CATEGORIES_SHOW_LOADER,
  PRODUCT_CATEGORIES_LIST_OFFSET,
  PRODUCT_CATEGORIES_REQUEST_MADE,
  PRODUCT_CATEGORIES_LIST
} from '../../../utils/constants';

validate.options = {
  fullMessages: false
};

export const clearScreen = () => {
  return(dispatch) =>{
    dispatch({type: KIT_CLEAR});
    dispatch({type: KIT_PRODUCT_CHANGE, payload:[]});
  }
};

export const qtyChange = (qty, item) =>{
  return(dispatch, getState) => {
    const { pro, tot } = getState().kitData;
    const index = pro.findIndex(e => e.nid == item.nid);
    
    if(index !== -1){
      let newQty = qty.replace(/[^0-9]/g, '');
      //const itemPrice = pro[index].qty * pro[index].price;
      //const newtotal = tot - itemPrice + parseInt(item.price * newQty);
      pro[index].qty = newQty;
   
      //dispatch({ type: REMISSION_TOTAL_CHANGE, payload: newtotal });
      dispatch({ type: KIT_PRODUCT_CHANGE, payload: pro });
    }
  }
}

export const addProduct = (item) => {
  return(dispatch, getState) =>{
    const { pro, tot } = getState().kitData;
    const index = pro.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      pro[index].qty ++;
      //let newtot = tot + parseInt(item.price);
      //dispatch({ type: KIT_TOTAL_CHANGE, payload: newtot });
      dispatch({ type: KIT_PRODUCT_CHANGE, payload: pro });
    }
  }
};

export const removeProduct = (item) => {
  return(dispatch, getState) =>{
    const { pro, tot } = getState().kitData;
    const index = pro.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      pro[index].qty --;
      //let newtot = tot - parseInt(item.price);
      //dispatch({ type: KIT_TOTAL_CHANGE, payload: newtot });
      if(pro[index].qty == 0){
        pro.splice(index, 1)
        dispatch({ type: KIT_PRODUCT_CHANGE, payload: pro });
      }
      else{
        dispatch({ type: KIT_PRODUCT_CHANGE, payload: pro });
      }
    }
  }
};

export const deleteProduct = (item) => {
  return(dispatch, getState) =>{
    const { pro, tot } = getState().kitData;
    const index = pro.findIndex(e => e.nid == item.nid);
    if(index !== -1){
      //let newtot = tot - (parseInt(item.price) * pro[index].qty);
      //dispatch({ type: KIT_TOTAL_CHANGE, payload: newtot });
      pro.splice(index, 1);
      dispatch({ type: KIT_PRODUCT_CHANGE, payload: pro });
    }
  }
};

export const priceChange = (price) => {
  return(dispatch) =>{
    let newPrice = price.replace(/[^0-9]/g, '');
    /*if(price == '' || price == null || newPrice === '' || newPrice == null){
      newPrice = 0;
    }*/
    dispatch({ type: KIT_TOTAL_CHANGE, payload: newPrice });
  }
};

export const nameChange = (name) => {
  return(dispatch) =>{
    dispatch({ type: KIT_NAME_CHANGE, payload: name });
  }
};

export const confirmKit = ({
  navigation,
  cat
}) => { 
  return (dispatch, getState) => { 
    const { pro, tot, name } = getState().kitData;
    const { product, total } = getState().remissionData;
    const { user } = getState().userData;
    const constraints = {
      pro: {
        presence: {
          allowEmpty: false,
          message: 'Agrega por lo menos un producto o servicio al combo.',
        },
      },
      name: {
        presence: {
          allowEmpty: false,
          message: 'Nombra el combo.',
        },
      },
      tot: {
        numericality: {
          greaterThan: 0,
          message: 'Ponle un precio al combo.',
        },
      },
    };

    const errors = validate({ pro, name, tot }, constraints);
    if (errors) {
      dispatch({ type: KIT_FORM_FAIL, payload: errors });
    }
    else{
      dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: true });
      Token.getToken()
      .then(token => {
        Product.createKit({
          token,
          uid:user.uid,
          products:pro,
          name,
          price:tot
        })
        .then(res=>{
          /*const kit = {
            type:'kit',
            products:pro,
            price:tot,
            label:name,
            code:'Combo',
            qty:1,
            nid:res['nid'],
            available:res['available'],
          }
          if(res['available'] > 0){
            product.push(kit)
            let newtotal = total + parseInt(tot);
            dispatch({ type: REMISSION_TOTAL_CHANGE, payload: newtotal });
            dispatch({ type: REMISSION_PRODUCT_CHANGE, payload: product });
          }
          else{
            dispatch({
              type: DIALOG_SHOW,
              payload: { 
                title:'No puedes agregar el combo',
                message:'El combo fue creado exitosamente pero no puede ser agregado a la orden debido a que alguno de sus componentes no posee cantidades disponibles en inventario.',
              }
            });
          }*/
          //dispatch({ type: REMISSION_FORM_FAIL, payload: null });
          dispatch({ type: PROGRESS_VISIBLE_CHANGE, payload: false });
          dispatch({
            type: DIALOG_SHOW,
            payload: { 
              title:'Nuevo combo',
              message:'Combo creado exitosamente.',
            }
          });
          dispatch(getProducts(cat));
          dispatch(getProductCat());
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

        dispatch({type: NEW_SALE_SHOW_LOADER, payload: false});
        dispatch({type: NEW_SALE_LIST_OFFSET, payload: 1});
        dispatch({type: NEW_SALE_LIST, payload: response});
        dispatch({type: NEW_SALE_REQUEST_MADE, payload: false});
      })
    })
  }
};