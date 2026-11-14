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

import { cargarCarrito, obtenerTotalesCarrito } from '../data/carrito.js';

describe('Carrito — obtenerTotalesCarrito', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('obtenerTotalesCarrito: aplica despacho gratis sobre $50.000, cobra despacho justo en el límite, respeta el retiro y devuelve cero con el carrito vacío', async () => {
    http.get.mockResolvedValue({
      data: [{ idProducto: '201', nombre: 'Generador', stock: 5, precioVenta: 60000, cantidad: 1 }],
    });
    await cargarCarrito();

    const sobreElLimite = obtenerTotalesCarrito();
    expect(sobreElLimite.subtotal).toBe(60000);
    expect(sobreElLimite.despacho).toBe(0);
    expect(sobreElLimite.total).toBe(60000);
    expect(sobreElLimite.totalArticulos).toBe(1);

    http.get.mockResolvedValueOnce({
      data: [{ idProducto: '202', nombre: 'Brocas', stock: 1, precioVenta: 50000, cantidad: 1 }],
    });
    await cargarCarrito();

    const enElLimite = obtenerTotalesCarrito();
    expect(enElLimite.subtotal).toBe(50000);
    expect(enElLimite.despacho).toBe(3990);
    expect(enElLimite.total).toBe(53990);

    const conRetiro = obtenerTotalesCarrito('retiro');
    expect(conRetiro.despacho).toBe(0);
    expect(conRetiro.total).toBe(50000);

    http.get.mockResolvedValueOnce({ data: [] });
    await cargarCarrito();
    const vacio = obtenerTotalesCarrito();
    expect(vacio.totalArticulos).toBe(0);
    expect(vacio.subtotal).toBe(0);
    expect(vacio.total).toBe(0);
  });
});
