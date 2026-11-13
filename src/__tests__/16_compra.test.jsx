import { useState } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SelectorCantidad from '../components/SelectorCantidad';
import Carrito from '../pages/Carrito';

const datos = vi.hoisted(() => ({ sesion: null, crearOrden: vi.fn(), actualizarCantidad: vi.fn() }));
const producto = { idProducto: '1', nombre: 'Taladro', marca: 'Bosch', cantidad: 15, stock: 250, precioVenta: 1000 };
vi.mock('../data/carrito', () => ({
  obtenerCarrito: () => [producto], obtenerTotalesCarrito: () => ({ totalArticulos: 15, subtotal: 15000, despacho: 3990, total: 18990 }),
  useEstadoCarrito: () => ({ cargando: false, error: '' }), EVENTO_CARRITO_ACTUALIZADO: 'carrito-prueba',
  actualizarCantidad: (...args) => datos.actualizarCantidad(...args), eliminarDelCarrito: vi.fn(), vaciarCarrito: vi.fn(), cargarCarrito: vi.fn(),
}));
vi.mock('../data/auth', () => ({ useSesion: () => datos.sesion, obtenerSesionActiva: () => datos.sesion, EVENTO_SESION_ACTUALIZADA: 'sesion-prueba' }));
vi.mock('../data/ordenes', () => ({ crearOrden: (...args) => datos.crearOrden(...args) }));

beforeEach(() => { datos.sesion = null; vi.clearAllMocks(); vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function Cantidad() {
  const [cantidad, setCantidad] = useState(1);
  return <SelectorCantidad cantidad={cantidad} maximo={250} onChange={setCantidad} />;
}

test('permite escribir dos y tres dígitos, confirmar con Enter y seguir usando los botones', () => {
  render(<Cantidad />);
  const input = screen.getByRole('textbox', { name: 'Cantidad' });
  fireEvent.change(input, { target: { value: '15' } });
  fireEvent.blur(input);
  expect(input.value).toBe('15');
  fireEvent.change(input, { target: { value: '123' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  fireEvent.click(screen.getByRole('button', { name: 'Sumar una unidad' }));
  expect(input.value).toBe('124');
  fireEvent.click(screen.getByRole('button', { name: 'Restar una unidad' }));
  expect(input.value).toBe('123');
});

test('controla vacío, cero, stock máximo y rechaza decimales y letras', () => {
  render(<Cantidad />);
  const input = screen.getByRole('textbox');
  for (const valor of ['', '0']) {
    fireEvent.change(input, { target: { value: valor } });
    fireEvent.blur(input);
    expect(input.value).toBe('1');
  }
  for (const valor of ['-2', '1.5', 'abc']) {
    fireEvent.change(input, { target: { value: valor } });
    expect(input.value).toBe('1');
  }
  fireEvent.change(input, { target: { value: '999' } });
  fireEvent.blur(input);
  expect(input.value).toBe('250');
  expect(screen.getByRole('button', { name: 'Sumar una unidad' }).disabled).toBe(true);
});

test('el selector bloquea las acciones cuando no hay stock', () => {
  render(<SelectorCantidad cantidad={1} maximo={0} disabled onChange={vi.fn()} />);
  expect(screen.getByRole('textbox').disabled).toBe(true);
  expect(screen.getAllByRole('button').every(button => button.disabled)).toBe(true);
});

const mostrarCarrito = (ruta = '/carrito') => render(<MemoryRouter initialEntries={[ruta]}><Carrito /></MemoryRouter>);
const paso = () => document.querySelector('[aria-current="step"]')?.textContent;

test('recorre sesión y entrega, conserva datos al volver y bloquea pago con datos incompletos', () => {
  mostrarCarrito();
  expect(screen.queryByText(/Vendido por:/)).toBeNull();
  expect(screen.queryByText(/Subtotal:/)).toBeNull();
  expect(screen.queryByRole('button', { name: /Vaciar Carrito/ })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /^Continuar$/ }));
  expect(paso()).toContain('Inicio de sesión');
  expect(screen.getByRole('link', { name: 'Iniciar sesión' }).getAttribute('href')).toBe('/login?volver=%2Fcarrito%3Fpaso%3Dentrega');
  fireEvent.click(screen.getByRole('button', { name: 'Continuar como invitado' }));
  expect(paso()).toContain('Entrega');
  fireEvent.change(screen.getByPlaceholderText('Ej: Pedro González'), { target: { value: 'Pedro González' } });
  fireEvent.click(screen.getByRole('button', { name: 'Continuar al pago' }));
  expect(screen.getByText('El RUT es obligatorio.')).toBeTruthy();
  expect(paso()).toContain('Entrega');
  expect(datos.crearOrden).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /Carro de compras/ }));
  fireEvent.click(screen.getByRole('button', { name: /^Continuar$/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Continuar como invitado' }));
  expect(screen.getByPlaceholderText('Ej: Pedro González').value).toBe('Pedro González');
});

test('confirma la compra con la orden integrada y desglosa el IVA incluido sin cambiar el total', async () => {
  datos.sesion = { nombre: 'Pedro', apellidoPaterno: 'González', rut: '12.345.678-5', email: 'pedro@example.com', telefono: '+56 9 1234 5678', direccion: 'Providencia 123', region: 'Metropolitana de Santiago', comuna: 'Providencia' };
  datos.crearOrden.mockImplementation(async solicitud => ({ ok: true, orden: { ...solicitud, idOrden: 'ORD-1', estado: 'Pagado', subtotal: 15000, despacho: 3990, total: 18990, items: [{ ...producto, precioUnitario: 1000 }] } }));
  mostrarCarrito('/carrito?paso=entrega');
  expect(paso()).toContain('Entrega');
  fireEvent.click(screen.getByRole('button', { name: 'Continuar al pago' }));
  expect(paso()).toContain('Pago');
  fireEvent.click(screen.getByRole('radio', { name: 'Transferencia Electrónica Directa' }));
  fireEvent.click(screen.getByRole('button', { name: 'Registrar pedido' }));
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Pago procesado' })).toBeTruthy());
  expect(datos.crearOrden).toHaveBeenCalledWith(expect.objectContaining({ metodoPago: 'Transferencia Bancaria', items: [{ idProducto: '1', cantidad: 15 }] }));
  expect(paso()).toContain('¡Listo!');
  expect(document.querySelectorAll('.compra-progreso .es-completo')).toHaveLength(4);
  expect(screen.queryByText(/pendiente de pago/i)).toBeNull();
  expect(screen.getByText('ORD-1').closest('.marca-chip')).toBeNull();
  expect(document.querySelector('.boleta-compra .bi-check-lg')).toBeNull();
  expect(screen.getByText('Monto neto').parentElement.textContent).toContain('$15.958');
  expect(screen.getByText('IVA (19%)').parentElement.textContent).toContain('$3.032');
  expect(screen.getByText('Total', { selector: 'dt' }).parentElement.textContent).toContain('$18.990');
  expect(screen.getByText('Despacho (IVA incluido)').parentElement.textContent).toContain('$3.990');
});
