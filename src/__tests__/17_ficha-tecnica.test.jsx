import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Admin from '../pages/Admin';
import DetalleProducto from '../pages/DetalleProducto';
import EditorFichaTecnica from '../components/EditorFichaTecnica';
import { guardarMaquinaria } from '../data/maquinarias';
import { cargarProductos } from '../data/productos';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
const datosOrdenes = vi.hoisted(() => ({ ordenes: [], maquinas: [] }));
vi.mock('../services/api', () => ({ clienteApi: { http: api } }));
vi.mock('../data/auth', () => ({ obtenerSesionActiva: () => ({ rol: 'admin', email: 'admin@example.com' }), iniciarSesion: vi.fn(), cerrarSesion: vi.fn(), EVENTO_SESION_ACTUALIZADA: 'sesion-prueba' }));
vi.mock('../data/ordenes', () => ({ obtenerOrdenes: () => datosOrdenes.ordenes, useEstadoOrdenes: () => ({}), cargarOrdenes: vi.fn(), EVENTO_ORDENES_ACTUALIZADAS: 'ordenes-prueba' }));
vi.mock('../data/maquinarias', () => ({ obtenerContratosArriendo: () => [], obtenerMaquinarias: () => datosOrdenes.maquinas, useEstadoArriendos: () => ({}), cargarContratosArriendo: vi.fn(), cargarMaquinarias: vi.fn(), guardarMaquinaria: vi.fn(), EVENTO_MAQUINARIAS_ACTUALIZADAS: 'arriendos-prueba' }));
vi.mock('../data/carrito', () => ({ sincronizarCarrito: vi.fn(), agregarAlCarrito: vi.fn() }));
vi.mock('../components/GeneradorProductos', () => ({ default: () => null }));
vi.mock('../components/ImagenProductoUploader', () => ({ default: ({ onSeleccionar }) => <button type="button" onClick={() => onSeleccionar(new File(['imagen'], 'producto.webp', { type: 'image/webp' }))}>Seleccionar imagen de prueba</button> }));

const producto = {
  idProducto: '1', nombre: 'Taladro', marca: 'Bosch', categoria: 'Herramientas', precioVenta: 11900, stock: 20,
  imagen: '/media/taladro.webp', unidadVenta: 'unidad', contenidoPresentacion: '1 unidad',
  descripcionCorta: 'Taladro profesional.', descripcionDetalle: '<h3>Ficha técnica</h3><ul><li><strong>Peso:</strong> 2 kg</li></ul>',
};

beforeEach(async () => {
  vi.clearAllMocks();
  datosOrdenes.ordenes = [];
  datosOrdenes.maquinas = [];
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  api.get.mockResolvedValue({ data: { contenido: [producto], totalPaginas: 1 } });
  api.post.mockImplementation(async (ruta, datos) => ({ data: ruta === 'catalogo/imagenes' ? { url: '/media/nuevo.webp' } : { ...datos, idProducto: '2' } }));
  api.put.mockImplementation(async (_ruta, datos) => ({ data: { ...datos, idProducto: '1' } }));
  await cargarProductos();
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const mostrarAdmin = () => render(<MemoryRouter><Admin /></MemoryRouter>);
const nuevoProducto = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Crear', exact: true }));
  for (const [placeholder, value] of [['Ej: Taladro Percutor 20V Max XR', 'Sierra circular'], ['Ej: DeWalt, Bosch, Makita...', 'Bosch'], ['129990', '11900'], ['10', '20']]) {
    fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Seleccionar imagen de prueba' }));
};
const enviar = nombre => fireEvent.submit(screen.getByRole('button', { name: nombre }).closest('form'));

test('crea un producto y envía la descripción detallada enriquecida sin especificaciones separadas', async () => {
  const vista = mostrarAdmin();
  nuevoProducto();
  fireEvent.paste(screen.getByRole('textbox', { name: /detallada y ficha/ }), { clipboardData: { getData: tipo => tipo === 'text/html' ? '<p>Potencia de 1200 W.</p>' : tipo === 'text/plain' ? 'Potencia de 1200 W.' : '', files: [], items: [], types: ['text/html', 'text/plain'] } });
  enviar('Registrar Producto');
  await waitFor(() => expect(api.post).toHaveBeenCalledWith('catalogo/productos', expect.objectContaining({ descripcionDetalle: expect.stringContaining('Potencia de 1200 W.'), descripcionCorta: '' })));
  expect(api.post.mock.calls.find(([url]) => url === 'catalogo/productos')[1]).not.toHaveProperty('especificaciones');
  await waitFor(() => expect(screen.queryByText('Agregar Nuevo Producto')).toBeNull());
  vista.unmount();
  render(<MemoryRouter initialEntries={['/producto/2']}><Routes><Route path="/producto/:id" element={<DetalleProducto />} /></Routes></MemoryRouter>);
  expect(screen.getByText('Potencia de 1200 W.')).toBeTruthy();
});

test('edita producto usando descripcionDetalle y no emite el campo especificaciones', async () => {
  mostrarAdmin();
  fireEvent.click(screen.getByRole('button', { name: 'Productos', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Editar', exact: true }));
  enviar('Guardar Cambios');
  await waitFor(() => expect(api.put).toHaveBeenCalledWith('catalogo/productos/1', expect.objectContaining({ descripcionDetalle: expect.stringContaining('Peso') })));
  expect(api.put.mock.calls.at(-1)[1]).not.toHaveProperty('especificaciones');
});

test('el formulario ya no ofrece un editor separado de ficha técnica', () => {
  mostrarAdmin();
  fireEvent.click(screen.getByRole('button', { name: 'Crear', exact: true }));
  expect(screen.getByText('Descripción detalle y ficha técnica *')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Agregar detalle técnico' })).toBeNull();
});

test('respeta los límites de la ficha admitidos por el catálogo', () => {
  const filas = Array.from({ length: 30 }, (_, indice) => ({ id: String(indice), atributo: `Dato ${indice}`, valor: 'Valor' }));
  render(<EditorFichaTecnica filas={filas} onChange={vi.fn()} errores={{}} />);
  expect(screen.getByRole('button', { name: 'Agregar detalle técnico' }).disabled).toBe(true);
  expect(screen.getByLabelText('Atributo 1').maxLength).toBe(120);
  expect(screen.getByLabelText('Valor 1').maxLength).toBe(500);
});

test('administración suma pagos simulados y ventas completadas sin contar pendientes ni cancelaciones', () => {
  datosOrdenes.ordenes = [
    { idOrden: '1', estado: 'Pagado', total: 18990 },
    { idOrden: '2', estado: 'Completada', total: 10000 },
    { idOrden: '3', estado: 'Pendiente de pago', total: 80000 },
    { idOrden: '4', estado: 'Cancelada', total: 90000 },
  ];
  mostrarAdmin();
  expect(screen.getByText('Ventas Registradas').parentElement.textContent).toContain('$28.990');
});

test('ordena la navegacion y elimina los accesos anteriores', () => {
  mostrarAdmin();
  const nav = screen.getByRole('navigation');
  expect(Array.from(nav.querySelectorAll('.admin-nav-btn'), b => b.textContent)).toEqual(['Dashboard', 'Productos', 'Maquinaria', 'Órdenes', 'Arriendos', 'Generadores', 'Crear']);
  expect(screen.queryByRole('button', { name: 'Descripciones' })).toBeNull();
  expect(screen.queryByRole('button', { name: '+ Agregar Producto' })).toBeNull();
});

test('lista y filtra maquinaria y abre su ficha para editar', async () => {
  datosOrdenes.maquinas = [
    { idMaquina: 'M1', nombre: 'Betonera', marca: 'Bosch', categoria: 'Construccion', tarifaDia: 15000, estado: 'Mantenci\u00f3n', descripcionDetalle: '<p>Capacidad de 120 litros</p>' },
    { idMaquina: 'M2', nombre: 'Demoledor', marca: 'Makita', categoria: 'Demolicion', tarifaDia: 20000, estado: 'Disponible', descripcionDetalle: '<p>Potencia 1200 W</p>' },
  ];
  mostrarAdmin();
  fireEvent.click(screen.getByRole('button', { name: 'Maquinaria', exact: true }));
  expect(screen.getByRole('table')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Filtrar estado de maquinaria'), { target: { value: 'Mantenci\u00f3n' } });
  expect(screen.queryByText('Demoledor')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Editar', exact: true }));
  expect(screen.getByLabelText('Estado').value).toBe('MANTENCION');
  fireEvent.submit(screen.getByRole('button', { name: 'Guardar cambios', exact: true }).closest('form'));
  await waitFor(() => expect(guardarMaquinaria).toHaveBeenCalledWith('M1', expect.objectContaining({ estado: 'MANTENCION', descripcionDetalle: expect.stringContaining('120 litros') })));
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Listado de maquinaria' })).toBeTruthy());
});

test('Crear permite registrar maquinaria con descripcion enriquecida', async () => {
  mostrarAdmin();
  fireEvent.click(screen.getByRole('button', { name: 'Crear', exact: true }));
  fireEvent.change(screen.getByLabelText('Tipo de art\u00edculo'), { target: { value: 'maquinaria' } });
  fireEvent.click(screen.getByRole('button', { name: 'Seleccionar imagen de prueba' }));
  for (const [label, value] of [['Nombre', 'Betonera nueva'], ['Marca', 'Bosch'], ['Categor\u00eda', 'Construccion'], ['Tarifa diaria', '15000']]) fireEvent.change(screen.getByLabelText(label), { target: { value } });
  fireEvent.paste(screen.getByRole('textbox', { name: /detallada y ficha/ }), { clipboardData: { getData: tipo => tipo === 'text/html' ? '<p><strong>Capacidad:</strong> 120 litros</p>' : '', files: [], items: [], types: ['text/html'] } });
  fireEvent.submit(screen.getByRole('button', { name: 'Crear maquinaria' }).closest('form'));
  await waitFor(() => expect(guardarMaquinaria).toHaveBeenCalledWith(null, expect.objectContaining({ nombre: 'Betonera nueva', tarifaDia: 15000, imagen: '/media/nuevo.webp', descripcionDetalle: expect.stringContaining('<strong>Capacidad:</strong>') })));
});
