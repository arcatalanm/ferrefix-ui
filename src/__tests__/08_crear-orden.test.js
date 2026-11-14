import { describe, test, expect, beforeEach, vi } from 'vitest';

const datos = vi.hoisted(() => ({
  sesion: { idUsuario: 'u1' },
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('../services/api', () => ({
  clienteApi: { http: datos.http },
  alExpirarSesion: vi.fn(),
}));
vi.mock('../data/auth', () => ({
  obtenerSesionActiva: () => datos.sesion,
  EVENTO_SESION_ACTUALIZADA: 'sesion-prueba',
}));

import { crearOrden, obtenerOrdenes } from '../data/ordenes.js';

const ordenBackend = {
  idOrden: 'ORD-BACK-1',
  fecha: '2024-01-01T12:00:00Z',
  estado: 'Pendiente de pago',
  total: 45990,
};

describe('Órdenes — crearOrden', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    datos.http.get.mockImplementation((url) => Promise.resolve({
      data: url === '/ordenes/pedidos' ? [ordenBackend] : [],
    }));
  });

  test('crearOrden: envía la solicitud al backend, adapta la orden creada y refresca el historial', async () => {
    datos.http.post.mockResolvedValue({ data: ordenBackend });

    const resultado = await crearOrden({
      cliente: { nombre: 'Cliente Boleta' },
      total: 45990,
    });

    expect(resultado.ok).toBe(true);
    expect(resultado.orden.idOrden).toBe('ORD-BACK-1');
    expect(resultado.orden.fecha).toBeTruthy();
    expect(obtenerOrdenes()[0].idOrden).toBe('ORD-BACK-1');
    expect(datos.http.post).toHaveBeenCalledWith(
      '/ordenes/pedidos',
      expect.objectContaining({ cliente: { nombre: 'Cliente Boleta' } }),
      { withCredentials: true }
    );
  });

  test('crearOrden: propaga el error del backend sin tocar el historial', async () => {
    datos.http.post.mockRejectedValue({
      response: { status: 409, data: { detail: 'Ya existe un pedido con este identificador.' } },
    });

    const resultado = await crearOrden({});

    expect(resultado.ok).toBe(false);
    expect(resultado.error).toContain('Ya existe un pedido');
  });
});
