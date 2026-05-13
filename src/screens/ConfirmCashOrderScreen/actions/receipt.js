// Arma el payload de impresión para una venta en efectivo a partir
// del response de createSale y del estado de la pantalla.
export const buildReceiptFromCashSale = ({user, response, product, total, paid, customer}) => {
  const items = (product || []).map((p) => ({
    name: p.label || p.name || p.product,
    qty: p.qty,
    price: p.price,
    subtotal: (p.price || 0) * (p.qty || 0),
  }));
  const change = paid != null ? Math.max(0, Number(paid) - Number(total)) : 0;
  return {
    companyName: user?.company_name,
    branchName: user?.branch_office_name,
    branchPhone: user?.branch_office_phone,
    consecutive: response?.consecutive,
    movementType: response?.title || 'Venta',
    date: response?.date,
    items,
    total,
    paid: paid ?? total,
    change,
    paymentMethods: [{type: {label: 'Efectivo'}, value: paid ?? total}],
    customer: customer ? customer.label : null,
  };
};
