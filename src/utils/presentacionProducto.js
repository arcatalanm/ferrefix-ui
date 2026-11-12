export const UNIDADES_VENTA = ['unidad', 'caja', 'bolsa', 'kilo', 'pack', 'saco', 'rollo', 'metro', 'litro'];

export const unidadVenta = producto => producto.unidadVenta || 'unidad';

export function cantidadPresentaciones(producto, cantidad) {
  const unidad = unidadVenta(producto);
  const plural = unidad === 'unidad' ? 'unidades' : unidad + 's';
  return `${cantidad} ${Number(cantidad) === 1 ? unidad : plural}`;
}
