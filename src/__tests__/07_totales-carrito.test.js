// Test: obtenerTotalesCarrito: aplica despacho gratis sobre $50.000, recupera un carrito corrupto con totales en cero y cobra despacho justo en el límite de $50.000
// Función: obtenerTotalesCarrito()

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  agregarAlCarrito,
  obtenerTotalesCarrito,
  vaciarCarrito
} from '../data/carrito.js';

describe('Carrito — obtenerTotalesCarrito (con mocks)', () => {
  beforeEach(() => {
    vaciarCarrito();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('obtenerTotalesCarrito: aplica despacho gratis sobre $50.000, recupera un carrito corrupto con totales en cero y cobra despacho justo en el límite de $50.000', () => {
    agregarAlCarrito(
      { idProducto: '201', nombre: 'Generador', stock: 5, precioVenta: 60000 },
      1
    );
    const sobreElLimite = obtenerTotalesCarrito();
    expect(sobreElLimite.subtotal).toBe(60000);
    expect(sobreElLimite.despacho).toBe(0);
    expect(sobreElLimite.total).toBe(60000);
    expect(sobreElLimite.totalArticulos).toBe(1);

    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValueOnce('{json-invalido');
    const corrupto = obtenerTotalesCarrito();
    expect(corrupto.totalArticulos).toBe(0);
    expect(corrupto.subtotal).toBe(0);
    expect(corrupto.total).toBe(0);
    expect(errorLog).toHaveBeenCalled();
    vi.restoreAllMocks();

    vaciarCarrito();
    agregarAlCarrito(
      { idProducto: '202', nombre: 'Brocas', stock: 1, precioVenta: 50000 },
      1
    );
    const enElLimite = obtenerTotalesCarrito();
    expect(enElLimite.subtotal).toBe(50000);
    expect(enElLimite.despacho).toBe(3990);
    expect(enElLimite.total).toBe(53990);
  });
});
