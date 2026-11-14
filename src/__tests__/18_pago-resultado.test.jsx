import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PagoResultado from '../pages/PagoResultado';

const datos = vi.hoisted(() => ({ obtenerOrden: vi.fn() }));
vi.mock('../data/ordenes', () => ({ obtenerOrden: (...args) => datos.obtenerOrden(...args) }));
vi.mock('../data/auth', () => ({ useSesion: () => null }));

const orden = (estado) => ({
  idOrden: 'ORD-1', estado, subtotal: 15000, despacho: 3990, total: 18990, metodoPago: 'WebPay Plus (Débito)',
  fecha: '13-11-2026', cliente: { nombre: 'Pedro', rut: '12345678-5', email: 'p@e.cl', direccion: 'Calle 1' },
  items: [{ nombre: 'Taladro', cantidad: 15, precioUnitario: 1000 }],
});
const mostrar = (ruta) => render(<MemoryRouter initialEntries={[ruta]}><PagoResultado /></MemoryRouter>);

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

test('muestra la boleta cuando el pedido está pagado', async () => {
  datos.obtenerOrden.mockResolvedValue({ ok: true, orden: orden('Pagado') });
  mostrar('/pago/resultado?estado=pagado&pedido=ORD-1');
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Pago procesado' })).toBeTruthy());
  expect(datos.obtenerOrden).toHaveBeenCalledWith('ORD-1');
});

test('confía en el estado del backend y no en el parámetro de la URL', async () => {
  datos.obtenerOrden.mockResolvedValue({ ok: true, orden: orden('Pago rechazado') });
  mostrar('/pago/resultado?estado=pagado&pedido=ORD-1'); // URL manipulada
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Pago rechazado' })).toBeTruthy());
  expect(screen.queryByRole('heading', { name: 'Pago procesado' })).toBeNull();
  expect(screen.getByRole('link', { name: 'Volver al carrito' })).toBeTruthy();
});

test('muestra un mensaje neutro si no se puede leer el pedido', async () => {
  datos.obtenerOrden.mockResolvedValue({ ok: false, error: 'Pedido no encontrado.', estado: 404 });
  mostrar('/pago/resultado?estado=pagado&pedido=ORD-1');
  await waitFor(() => expect(screen.getByRole('heading', { name: 'No pudimos mostrar tu pedido' })).toBeTruthy());
  expect(screen.queryByRole('heading', { name: 'Pago procesado' })).toBeNull();
});