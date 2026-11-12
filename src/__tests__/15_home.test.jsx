import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/Home';
import CarruselHome from '../components/CarruselHome';
const productos = ['5422223224', '5422223225', '5422223226', '5422223227', '5422223228', '5422223229', '5422223230', '5422223231'].map(idProducto => ({ idProducto, nombre: 'Producto ' + idProducto }));

const datos = vi.hoisted(() => ({ productos: [], ofertas: [] }));
vi.mock('../data/productos', () => ({ obtenerProductos: () => datos.productos, EVENTO_PRODUCTOS_ACTUALIZADOS: 'actualizar-home' }));
vi.mock('../data/generadores', () => ({ obtenerOfertasGeneradas: () => datos.ofertas, ENLACE_POR_DEFECTO: '/catalogo', EVENTO_GENERADORES_ACTUALIZADOS: 'actualizar-ofertas' }));

beforeEach(() => {
  datos.productos = productos;
  datos.ofertas = [null, null, null, null];
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
const mostrar = componente => render(<MemoryRouter>{componente}</MemoryRouter>);

test('recupera las nueve categorías, los dos banners y las ocho tarjetas diseñadas con enlaces reales', () => {
  mostrar(<Home />);
  expect(screen.getByRole('link', { name: 'Cerámicas' }).getAttribute('href')).toBe('/catalogo?categoria=Cer%C3%A1micas');
  const categorias = document.querySelectorAll('.categoria-item-enlace');
  expect(categorias).toHaveLength(9);
  const tarjetas = document.querySelectorAll('.oferta-link');
  expect(tarjetas).toHaveLength(8);
  expect(tarjetas[0].getAttribute('href')).toBe('/producto/5422223228');
  expect(tarjetas[0].querySelector('img').getAttribute('src')).toContain('guantes-de-nitrilo-card.webp');
  expect(tarjetas[4].getAttribute('href')).toBe('/producto/5422223224');
  expect(tarjetas[4].querySelector('img').getAttribute('src')).toContain('oferta-1-cubierta-melamina');
  expect(screen.getByRole('img', { name: 'Maderas estructurales para tu construcción' }).closest('a').getAttribute('href')).toBe('/catalogo?categoria=Maderas');

  datos.ofertas = [null, { imagen: '/uploads/personalizada.webp', enlace: '/catalogo', alt: 'Oferta personalizada' }, null, null];
  act(() => window.dispatchEvent(new Event('actualizar-ofertas')));
  expect(screen.getByRole('img', { name: 'Oferta personalizada' }).getAttribute('src')).toBe('/uploads/personalizada.webp');
  expect(screen.getByRole('img', { name: 'Oferta personalizada' }).closest('a').getAttribute('href')).toBe('/producto/5422223225');
  fireEvent.error(screen.getByRole('img', { name: 'Oferta personalizada' }));
  const maderaRestaurada = screen.getByRole('img', { name: 'Producto 5422223225' });
  expect(maderaRestaurada.getAttribute('src')).toContain('oferta-2-osb-multiplac.webp');
  expect(maderaRestaurada.closest('a').getAttribute('href')).toBe('/producto/5422223225');

  datos.productos = productos.filter(p => p.idProducto !== '5422223228');
  act(() => window.dispatchEvent(new Event('actualizar-home')));
  expect(document.querySelector('a[href="/producto/5422223228"]')).toBeNull();
});

test('el carrusel conserva el avance automático y los controles originales sin botón de pausa', () => {
  vi.useFakeTimers();
  mostrar(<CarruselHome />);
  expect(screen.getByRole('link', { name: 'Ver productos DeWalt' }).getAttribute('href')).toBe('/catalogo?q=DeWalt');
  act(() => vi.advanceTimersByTime(5000));
  expect(screen.getByRole('link', { name: 'Ver productos Makita' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: /Pausar|Reanudar/ })).toBeNull();
  act(() => vi.advanceTimersByTime(5000));
  expect(screen.getByRole('link', { name: 'Ver productos Bosch' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  expect(screen.getByRole('link', { name: 'Ver productos DeWalt' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));
  expect(screen.getByRole('link', { name: 'Ver productos Bosch' })).toBeTruthy();
});

test('el movimiento reducido detiene el temporizador sin impedir la navegación manual', () => {
  vi.useFakeTimers();
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  mostrar(<CarruselHome />);
  act(() => vi.advanceTimersByTime(15000));
  expect(screen.getByRole('link', { name: 'Ver productos DeWalt' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Pausar carrusel' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Mostrar Bosch' }));
  expect(screen.getByRole('link', { name: 'Ver productos Bosch' })).toBeTruthy();
});
