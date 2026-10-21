import { describe, it, expect } from 'vitest';
import { crearProducto, actualizarProducto, obtenerProductos } from '../data/productos.js';
import { crearOrden } from '../data/ordenes.js';

// MÓDULO 8: crearProducto
describe('Módulo 8: crearProducto', () => {
  it('29. Caso correcto: crea e inserta un nuevo producto al catálogo con atributos válidos', () => {
    const nuevo = crearProducto({
      nombre: 'Martillo de Uña 16oz',
      marca: 'Stanley',
      precioVenta: 12990,
      stock: 15
    });
    expect(nuevo.idProducto).toBeDefined();
    expect(nuevo.nombre).toBe('Martillo de Uña 16oz');
    expect(nuevo.stock).toBe(15);
  });

  it('30. Caso de error: asigna imagen por defecto cuando se omite o viene vacía la URL', () => {
    const nuevo = crearProducto({
      nombre: 'Serrucho Manual',
      marca: 'Bahco',
      imagen: ''
    });
    expect(nuevo.imagen).toBeTruthy();
  });

  it('31. Caso borde: convierte valores de precio y stock de string a tipo numérico', () => {
    const nuevo = crearProducto({
      nombre: 'Cinta Métrica 5m',
      marca: 'Lufkin',
      precioVenta: '4990',
      stock: '25'
    });
    expect(typeof nuevo.precioVenta).toBe('number');
    expect(nuevo.precioVenta).toBe(4990);
    expect(typeof nuevo.stock).toBe('number');
    expect(nuevo.stock).toBe(25);
  });

  it('32. Caso fuera del negocio: asigna 0 por defecto si el stock no es numérico', () => {
    const nuevo = crearProducto({
      nombre: 'Clavos 2 Pulgadas',
      stock: 'invalido'
    });
    expect(nuevo.stock).toBe(0);
  });
});

// MÓDULO 9: actualizarProducto
describe('Módulo 9: actualizarProducto', () => {
  it('33. Caso correcto: actualiza el stock disponible de un producto existente', () => {
    const productos = obtenerProductos();
    const id = productos[0].idProducto;
    const actualizado = actualizarProducto(id, { stock: 99 });
    expect(actualizado.stock).toBe(99);
  });

  it('34. Caso de error: retorna null cuando el id de producto no existe en el catálogo', () => {
    const resultado = actualizarProducto('ID_FANTASMA_999999', { stock: 10 });
    expect(resultado).toBeNull();
  });

  it('35. Caso borde: actualiza únicamente el precio manteniendo intacto el stock actual', () => {
    const productos = obtenerProductos();
    const prod = productos[0];
    const stockPrevio = prod.stock;
    const actualizado = actualizarProducto(prod.idProducto, { precioVenta: 88880 });
    expect(actualizado.precioVenta).toBe(88880);
    expect(actualizado.stock).toBe(stockPrevio);
  });

  it('36. Caso fuera del negocio: maneja id null sin romper la aplicación y retorna null', () => {
    const resultado = actualizarProducto(null, { stock: 5 });
    expect(resultado).toBeNull();
  });
});

// MÓDULO 10: crearOrden
describe('Módulo 10: crearOrden', () => {
  it('37. Caso correcto: genera una orden con correlativo oficial de boleta (BOL-2024-XXXX)', () => {
    const orden = crearOrden({
      cliente: { nombre: 'Cliente Boleta' },
      total: 45990
    });
    expect(orden.numeroBoleta).toContain('BOL-2024-');
    expect(orden.estado).toBe('Completada');
  });

  it('38. Caso de error: respeta un estado explícito distinto al por defecto', () => {
    const orden = crearOrden({
      cliente: { nombre: 'Cliente Pendiente' },
      estado: 'En Preparación'
    });
    expect(orden.estado).toBe('En Preparación');
  });

  it('39. Caso borde: genera correlativo de orden ORD- si no se proporciona uno explícito', () => {
    const orden = crearOrden({ total: 10000 });
    expect(orden.idOrden.startsWith('ORD-')).toBe(true);
  });

  it('40. Caso fuera del negocio: genera una estructura de orden segura ante un objeto vacío', () => {
    const orden = crearOrden({});
    expect(orden.idOrden).toBeDefined();
    expect(orden.numeroBoleta).toBeDefined();
    expect(orden.fecha).toBeDefined();
  });
});
