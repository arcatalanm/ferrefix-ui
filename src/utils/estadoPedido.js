const CLASES = {
  'Pagado': 'success',
  'Completada': 'success',
  'Pendiente de pago': 'warning',
  'Pago rechazado': 'danger',
  'Pago anulado': 'secondary',
};

/** Clases Bootstrap 5.3 del badge según el estado del pedido. */
export const claseInsigniaPedido = (estado) => {
  const tono = CLASES[estado] || 'secondary';
  return `badge bg-${tono}-subtle text-${tono} border border-${tono}-subtle`;
};