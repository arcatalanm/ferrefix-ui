// Test: crearProducto: inserta un producto válido en el catálogo, convierte un precio inválido en 0 y aplica imagen por defecto cuando la URL está vacía
// Función: crearProducto()

import { describe, test, expect, beforeEach } from 'vitest';
import {
  crearProducto,
  obtenerProductos,
  restablecerProductos
} from '../data/productos.js';

describe('Catálogo — crearProducto', () => {
  beforeEach(() => {
    restablecerProductos();
  });

  test('crearProducto: inserta un producto válido en el catálogo, convierte un precio inválido en 0 y aplica imagen por defecto cuando la URL está vacía', () => {
    const cantidadInicial = obtenerProductos().length;
    const nuevo = crearProducto({
      nombre: 'Martillo de Uña 16oz',
      marca: 'Stanley',
      precioVenta: 12990,
      stock: 15
    });
    expect(nuevo.idProducto).toBeDefined();
    expect(nuevo.nombre).toBe('Martillo de Uña 16oz');
    expect(nuevo.stock).toBe(15);
    expect(obtenerProductos().length).toBe(cantidadInicial + 1);

    const precioInvalido = crearProducto({
      nombre: 'Producto Error Precio',
      precioVenta: 'no_es_precio'
    });
    expect(precioInvalido.precioVenta).toBe(0);

    const sinImagen = crearProducto({
      nombre: 'Serrucho Manual',
      marca: 'Bahco',
      imagen: '',
      stock: 'invalido'
    });
    expect(sinImagen.imagen).toBe('/placeholder-producto.webp');
    expect(sinImagen.stock).toBe(0);
  });
});
