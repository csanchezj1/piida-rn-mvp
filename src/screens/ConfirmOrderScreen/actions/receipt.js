// Payload de impresión para venta NO efectivo (transferencia, crédito,
// pago parcial, mixto). NO abre cajón.
export const buildReceiptFromOrderSale = ({
  user,
  response,
  product,
  payment,
  total,
  sumTotal,
  orderPayment,
  customer,
  observations,
}) => {
  const items = (product || []).map((p) => ({
    name: p.label || p.name || p.product,
    qty: p.qty,
    price: p.price,
    subtotal: (p.price || 0) * (p.qty || 0),
  }));
  const isPartial = orderPayment?.value === 45;
  const paid = isPartial ? sumTotal : total;
  return {
    companyName: user?.company_name,
    branchName: user?.branch_office_name,
    branchPhone: user?.branch_office_phone,
    consecutive: response?.consecutive,
    movementType: response?.title || 'Venta',
    date: response?.date,
    items,
    total,
    paid,
    paymentMethods: payment,
    customer: customer ? customer.label : null,
    observations,
  };
};
