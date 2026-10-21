// Test: agregarAlCarrito: agrega un producto con stock suficiente, rechaza una cantidad mayor al stock y bloquea un producto agotado
// Función: agregarAlCarrito()

import { describe, test, expect, beforeEach } from 'vitest';
import { agregarAlCarrito, obtenerCarrito, vaciarCarrito } from '../data/carrito.js';

describe('Carrito — agregarAlCarrito', () => {
  beforeEach(() => {
    vaciarCarrito();
  });

  test('agregarAlCarrito: agrega un producto con stock suficiente, rechaza una cantidad mayor al stock y bloquea un producto agotado', () => {
    const producto = {
      idProducto: '101',
      nombre: 'Esmeril',
      stock: 10,
      precioVenta: 45000
    };
    const correcto = agregarAlCarrito(producto, 2);
    expect(correcto.ok).toBe(true);
    expect(correcto.cantidadTotal).toBe(2);
    expect(obtenerCarrito()).toHaveLength(1);

    const sinStockSuficiente = {
      idProducto: '102',
      nombre: 'Sierra',
      stock: 3,
      precioVenta: 80000
    };
    const error = agregarAlCarrito(sinStockSuficiente, 5);
    expect(error.ok).toBe(false);
    expect(error.error).toContain('disponibles en stock');

    const agotado = {
      idProducto: '103',
      nombre: 'Pintura',
      stock: 0,
      precioVenta: 15000
    };
    const borde = agregarAlCarrito(agotado, 1);
    expect(borde.ok).toBe(false);
    expect(borde.error).toContain('no cuenta con stock');
  });
});
