const fieldErrors = (field, errors) => {
  
  if (errors !== null && typeof errors[field] !== 'undefined') {
    return errors[field];
  } else {
    return '';
  }
}

export{
  fieldErrors,
}