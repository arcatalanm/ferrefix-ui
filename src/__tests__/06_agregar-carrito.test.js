import { describe, test, expect, beforeEach, vi } from 'vitest';

const http = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../services/api', () => ({
  clienteApi: { http },
  alExpirarSesion: vi.fn(),
}));
vi.mock('../data/auth', () => ({
  obtenerSesionActiva: () => null,
  EVENTO_SESION_ACTUALIZADA: 'sesion-prueba',
}));

import { agregarAlCarrito, obtenerCarrito } from '../data/carrito.js';

describe('Carrito — agregarAlCarrito', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: [] });
  });

  test('agregarAlCarrito: envía la cantidad al backend, actualiza el carrito con su respuesta y propaga los errores de stock', async () => {
    const producto = { idProducto: '101', nombre: 'Esmeril', stock: 10, precioVenta: 45000 };
    http.post.mockResolvedValue({
      data: [{ idProducto: '101', nombre: 'Esmeril', stock: 10, precioVenta: 45000, cantidad: 2 }],
    });

    const correcto = await agregarAlCarrito(producto, 2);
    expect(correcto.ok).toBe(true);
    expect(obtenerCarrito()).toHaveLength(1);
    expect(obtenerCarrito()[0].cantidad).toBe(2);
    expect(http.post).toHaveBeenCalledWith(
      '/ordenes/carrito/items/101',
      { cantidad: 2 },
      { withCredentials: true }
    );

    const sinStockSuficiente = { idProducto: '102', nombre: 'Sierra', stock: 3, precioVenta: 80000 };
    http.post.mockRejectedValue({
      response: { data: { detail: 'Solo hay 3 unidades disponibles en stock.' } },
    });
    const error = await agregarAlCarrito(sinStockSuficiente, 5);
    expect(error.ok).toBe(false);
    expect(error.error).toContain('disponibles en stock');

    const agotado = { idProducto: '103', nombre: 'Pintura', stock: 0, precioVenta: 15000 };
    http.post.mockRejectedValue({
      response: { data: { detail: 'El producto no cuenta con stock disponible.' } },
    });
    const borde = await agregarAlCarrito(agotado, 1);
    expect(borde.ok).toBe(false);
    expect(borde.error).toContain('no cuenta con stock');
  });
});
