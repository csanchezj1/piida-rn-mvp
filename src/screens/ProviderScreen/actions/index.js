import API from '../../../api/api';
import Token from '../../../api/token';
import Product from '../../../api/product';
import branchApi from '../../../api/branch';
import providerApi from '../../../api/provider';

import {
  PROVIDER_LIST,
  PROVIDER_LIST_OFFSET,
  PROVIDER_REQUEST_MADE,
  PROVIDER_SHOW_LOADER,
  BUY_PROVIDER_CHANGE,
  BUY_FORM_FAIL,
  BUY_PRODUCT_CHANGE,
  REMISSION_WAREHOUSE_CHANGE,
  REMISSION_TRANSPORTER_CHANGE,
  REMISSION_CUSTOMER_CHANGE,
  NEW_SALE_CUSTOMER_CHANGE,
  REMISSION_PRODUCT_CHANGE,
  REMISSION_TOTAL_CHANGE,
  REMISSION_FORM_FAIL,
  PROVIDER_TEXT_CHANGE,
  PROVIDER_SEARCH_BTN,
  PROVIDER_CLEAR,
  TRANSFER_PRODUCT_CHANGE,
  TRANSFER_BRANCH_CHANGE,
  TRANSFER_FORM_FAIL,
  KIT_FORM_FAIL,
  KIT_PRODUCT_CHANGE,
  DIALOG_SHOW,
  DIALOG_VISIBLE,
  DIALOG_RESET,
  ADD_INVENTORY_CUSTOMER_CHANGE,
  KIT_TOTAL_CHANGE
} from '../../../utils/constants';

export const getProviders = (pp_id, keyword, resetOffset) => {
  // pp_id queda por compat con la firma antigua pero ya no se usa: el back
  // v2 hace scope por req.user.companyId. Pasamos email+password del user
  // logueado porque /api/v2/providers rechaza magic auth.
  return(dispatch, getState) =>{
    const { user, password } = getState().userData;
    if (!user?.email || !password) return;
    const { offset,  list, requestMade} = getState().providerData;
    if(resetOffset){
      dispatch({type: PROVIDER_LIST, payload: null});
      dispatch({type: PROVIDER_SEARCH_BTN, payload: []});
    }
    let currentOffset = resetOffset ? 0 : offset;
    if(!requestMade || resetOffset){
      dispatch({type: PROVIDER_REQUEST_MADE, payload: true});
      dispatch({type: PROVIDER_SHOW_LOADER, payload: true});
      providerApi.getProviders(user.email, password, keyword || '', currentOffset)
      .then(response =>{
        dispatch({type: PROVIDER_SHOW_LOADER, payload: false});
        let currentList = resetOffset ? null : list;
        if(currentList != null){
          if(response.length > 0){
            var nextOffset = currentOffset + 20;
            dispatch({type: PROVIDER_LIST_OFFSET, payload: nextOffset});
            dispatch({type: PROVIDER_REQUEST_MADE, payload: false});
            var presentList_ = currentList.concat(response);
            dispatch({type: PROVIDER_LIST, payload: presentList_});
          }
          else{
            // No hay más páginas — paramos el spinner igual.
            dispatch({type: PROVIDER_REQUEST_MADE, payload: false});
          }
        }
        else{
          var nextOffset = currentOffset + 20;
          dispatch({type: PROVIDER_LIST_OFFSET, payload: nextOffset});
          dispatch({type: PROVIDER_LIST, payload: response});
          dispatch({type: PROVIDER_REQUEST_MADE, payload: false});
        }
      })
      .catch(() => {
        dispatch({type: PROVIDER_SHOW_LOADER, payload: false});
        dispatch({type: PROVIDER_REQUEST_MADE, payload: false});
        dispatch({type: PROVIDER_LIST, payload: []});
      })
    }
  }
};

export const getCustomer = (company, keyword, resetOffset) => {
  return(dispatch, getState) =>{
    const { offset,  list, requestMade} = getState().providerData;
    if(resetOffset){
      dispatch({type: PROVIDER_LIST, payload: null});
      //dispatch({type: PROVIDER_SEARCH_BTN, payload: []});
    }
    let currentOffset = resetOffset ? 0 : offset;
    if(!requestMade || resetOffset){
      dispatch({type: PROVIDER_REQUEST_MADE, payload: true});
      dispatch({type: PROVIDER_SHOW_LOADER, payload: true});
      API.getCustomer(company, keyword, currentOffset)
      .then(response =>{
        dispatch({type: PROVIDER_SHOW_LOADER, payload: false});
        // Defensa: si el back responde HTML/error u objeto, evitamos crash en
        // el render que hace list.map(). Antes provocaba "list.map is not a
        // function" al entrar al sheet "Agregar cliente" desde Venta actual.
        if (!Array.isArray(response)) response = [];
        let currentList = resetOffset ? null : list;
        if(currentList != null){
          if(response.length > 0){
            var nextOffset = currentOffset + 20;
            dispatch({type: PROVIDER_LIST_OFFSET, payload: nextOffset});
            dispatch({type: PROVIDER_REQUEST_MADE, payload: false});
            var presentList_ = currentList.concat(response);
            dispatch({type: PROVIDER_LIST, payload: presentList_});
          }
          else{
            dispatch({type: PROVIDER_REQUEST_MADE, payload: false});
          }
        }
        else{
          var nextOffset = currentOffset + 20;
          dispatch({type: PROVIDER_LIST_OFFSET, payload: nextOffset});
          dispatch({type: PROVIDER_LIST, payload: response});
          dispatch({type: PROVIDER_REQUEST_MADE, payload: false});
        }
      })
      .catch((err) => {
        console.log('[Provider] getCustomer error:', err?.data?.error || err?.message || err);
        dispatch({type: PROVIDER_SHOW_LOADER, payload: false});
        dispatch({type: PROVIDER_REQUEST_MADE, payload: false});
        if (resetOffset) dispatch({type: PROVIDER_LIST, payload: []});
      })
    }
  }
};

export const getProduct = (keyword, resetOffset) => {
  return(dispatch, getState) =>{
    const { offset,  list, requestMade} = getState().providerData;
    const { user } = getState().userData;
    if(resetOffset){
      dispatch({type: PROVIDER_LIST, payload: null});
      //dispatch({type: PROVIDER_SEARCH_BTN, payload: []}); 
    }
    let page = resetOffset ? 0 : offset;
    if(!requestMade || resetOffset){
      dispatch({type: PROVIDER_REQUEST_MADE, payload: true});
      dispatch({type: PROVIDER_SHOW_LOADER, payload: true});
      
      Token.getToken()
      .then(token => {
        Product.getProductsKits({
          token,
          page,
          company:user.company,
          branchOffice:user.branch_office,
          keyword
        })
        .then(response => {
          dispatch({type: PROVIDER_SHOW_LOADER, payload: false});
          let currentList = resetOffset ? null : list;
          if(currentList != null){
            if(response.length > 0){
              var nextPage = page + 1;
              dispatch({type: PROVIDER_LIST_OFFSET, payload: nextPage});
              dispatch({type: PROVIDER_REQUEST_MADE, payload: false});
              var presentList_ = currentList.concat(response);
              dispatch({type: PROVIDER_LIST, payload: presentList_});
            }
          }
          else{
            var nextPage = page + 1;
            dispatch({type: PROVIDER_LIST_OFFSET, payload: nextPage});
            dispatch({type: PROVIDER_LIST, payload: response});
            dispatch({type: PROVIDER_REQUEST_MADE, payload: false});
          }
        })
      })
    }
  }
};

export const getBranch = (company, branch, keyword, resetOffset) => {
  // El endpoint legacy /api/branch/:company ya no existe en el back NestJS.
  // Usamos /api/v2/branches?scope=company que devuelve TODAS las sucursales
  // activas de la empresa del user. Filtramos en cliente la del propio user
  // (no se traslada a sí mismo) y aplicamos keyword filter local — la lista
  // suele ser corta (< 20), no necesita paginación real.
  return (dispatch, getState) => {
    const { user, password } = getState().userData;
    if (!user?.email || !password) return;
    if (resetOffset) {
      dispatch({ type: PROVIDER_LIST, payload: null });
    }
    const { requestMade } = getState().providerData;
    if (requestMade && !resetOffset) return;
    dispatch({ type: PROVIDER_REQUEST_MADE, payload: true });
    dispatch({ type: PROVIDER_SHOW_LOADER, payload: true });

    branchApi.getCompanyBranches(user.email, password)
      .then((response) => {
        dispatch({ type: PROVIDER_SHOW_LOADER, payload: false });
        const all = Array.isArray(response) ? response : [];
        const ownBranchId = Number(branch);
        const kw = (keyword || '').toLowerCase();
        const filtered = all
          .filter((b) => b.id !== ownBranchId)
          .filter((b) => !kw || (b.name || '').toLowerCase().includes(kw))
          .map((b) => ({ nid: b.id, label: b.name, name: b.name }));
        dispatch({ type: PROVIDER_LIST, payload: filtered });
        dispatch({ type: PROVIDER_LIST_OFFSET, payload: filtered.length });
        dispatch({ type: PROVIDER_REQUEST_MADE, payload: false });
      })
      .catch(() => {
        dispatch({ type: PROVIDER_SHOW_LOADER, payload: false });
        dispatch({ type: PROVIDER_LIST, payload: [] });
        dispatch({ type: PROVIDER_REQUEST_MADE, payload: false });
      });
  };
};

export const clear = () => {
  return(dispatch) =>{
    dispatch({ type: PROVIDER_CLEAR});
    dispatch({type: PROVIDER_SEARCH_BTN, payload: []});
  }
};

export const selectProvider = (item, from) => {
  return(dispatch, getState) =>{
    switch (from) {
      case 'providerNew':
        dispatch({ type: ADD_INVENTORY_CUSTOMER_CHANGE, payload: item });
        break;
      case 'provider':
        dispatch({ type: BUY_PROVIDER_CHANGE, payload: item });
        dispatch({ type: BUY_FORM_FAIL, payload: null });
        break;
      case 'warehouse':
        dispatch({ type: REMISSION_WAREHOUSE_CHANGE, payload: item });
        dispatch({ type: REMISSION_FORM_FAIL, payload: null });
        break;

      case 'transporter':
        dispatch({ type: REMISSION_TRANSPORTER_CHANGE, payload: item });
        dispatch({ type: REMISSION_FORM_FAIL, payload: null });
        break;
      
      case 'customer':
        dispatch({ type: REMISSION_CUSTOMER_CHANGE, payload: item });
        dispatch({ type: NEW_SALE_CUSTOMER_CHANGE, payload: item });
        dispatch({ type: REMISSION_FORM_FAIL, payload: null });
        break;

      case 'branch':
        dispatch({ type: TRANSFER_BRANCH_CHANGE, payload: item });
        dispatch({ type: TRANSFER_FORM_FAIL, payload: null });
        break;
      
      case 'transfer_product':
        const product_trans = getState().transferData.product;
        const inde = product_trans.findIndex(e => e.nid == item.nid);
    
        if(inde !== -1){
          product_trans[inde].qty ++;
        }
        else{
          item.qty = 1;
          item.price = '0';
          product_trans.push(item)
        }
    
        dispatch({ type: TRANSFER_PRODUCT_CHANGE, payload: product_trans });
        dispatch({ type: TRANSFER_FORM_FAIL, payload: null });
        break;
      case 'buy_product':
        const product_buyed = getState().buyData.product;
        const ind = product_buyed.findIndex(e => e.nid == item.nid);
    
        if(ind !== -1){
          product_buyed[ind].qty ++;
        }
        else{
          item.qty = 1;
          item.price = '0';
          product_buyed.push(item)
        }
    
        dispatch({ type: BUY_PRODUCT_CHANGE, payload: product_buyed });
        dispatch({ type: BUY_FORM_FAIL, payload: null });

        break;
      case 'product':
        const { product, total } = getState().remissionData;
        const index = product.findIndex(e => e.nid == item.nid);
        let newtotal = total;
        if(index !== -1){
          if(product[index].qty < item.available){
            product[index].qty ++;
            newtotal = total + parseInt(item.price)
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
            newtotal = total + parseInt(item.price)
          }
          else{
            dispatch({
              type: DIALOG_SHOW,
              payload: { 
                title:'No puedes agregar el producto',
                message:'El producto seleccionado no posee cantidades disponibles en inventario.',
              }
            });
          }
        }
        dispatch({ type: REMISSION_TOTAL_CHANGE, payload: newtotal });
        dispatch({ type: REMISSION_PRODUCT_CHANGE, payload: product });
        dispatch({ type: REMISSION_FORM_FAIL, payload: null });
        break;
      case 'kit':
        const { pro, tot } = getState().kitData;
        const i = pro.findIndex(e => e.nid == item.nid);
        if(i !== -1){
          pro[i].qty ++;
        }
        else{
          item.qty = 1;
          pro.push(item)
        }
        //let ntotal = tot + parseInt(item.price);
        //dispatch({ type: KIT_TOTAL_CHANGE, payload: ntotal });
        dispatch({ type: KIT_PRODUCT_CHANGE, payload: pro });
        dispatch({ type: KIT_FORM_FAIL, payload: null });
        break;
    }
  }
};

export const textChange = (word) => {
  return (dispatch) => {
    dispatch({type: PROVIDER_TEXT_CHANGE, payload: word});
    if(word != null && word != ''){
      dispatch({type: PROVIDER_SEARCH_BTN, payload: [{Name: 'Buscar "' + word + '"'}]});
    }
    else{
      dispatch({type: PROVIDER_SEARCH_BTN, payload: []});
      //dispatch(getStores('', true))
    }
  };
};

export const clearSearch = () => {
  return (dispatch) => {
    dispatch({type: PROVIDER_SEARCH_BTN, payload: []});
  };
};

export const showSubscriptionMessage = (title, message, navigation) => {
  return (dispatch) => {
    dispatch({
      type: DIALOG_SHOW,
      payload: { 
        title,
        message,
        acceptTitle:'Ver planes',
        showCancelButton:true,
        acceptAction:() => {
          navigation.navigate('Billing'),
          dispatch(hide())
        }
      }
    });
  };
};

export const hide = () => {
  return(dispatch) => {
    dispatch({ type: DIALOG_VISIBLE, payload: false})
    dispatch({ type: DIALOG_RESET})
  };
};
