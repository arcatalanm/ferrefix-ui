import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Admin from '../pages/Admin';
import DetalleProducto from '../pages/DetalleProducto';
import EditorFichaTecnica from '../components/EditorFichaTecnica';
import { cargarProductos } from '../data/productos';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
const datosOrdenes = vi.hoisted(() => ({ ordenes: [] }));
vi.mock('../services/api', () => ({ clienteApi: { http: api } }));
vi.mock('../data/auth', () => ({ obtenerSesionActiva: () => ({ rol: 'admin', email: 'admin@example.com' }), iniciarSesion: vi.fn(), cerrarSesion: vi.fn(), EVENTO_SESION_ACTUALIZADA: 'sesion-prueba' }));
vi.mock('../data/ordenes', () => ({ obtenerOrdenes: () => datosOrdenes.ordenes, useEstadoOrdenes: () => ({}), cargarOrdenes: vi.fn(), EVENTO_ORDENES_ACTUALIZADAS: 'ordenes-prueba' }));
vi.mock('../data/maquinarias', () => ({ obtenerContratosArriendo: () => [], useEstadoArriendos: () => ({}), cargarContratosArriendo: vi.fn(), EVENTO_MAQUINARIAS_ACTUALIZADAS: 'arriendos-prueba' }));
vi.mock('../data/carrito', () => ({ sincronizarCarrito: vi.fn(), agregarAlCarrito: vi.fn() }));
vi.mock('../components/GeneradorProductos', () => ({ default: () => null }));
vi.mock('../components/ImagenProductoUploader', () => ({ default: ({ onSeleccionar }) => <button type="button" onClick={() => onSeleccionar(new File(['imagen'], 'producto.webp', { type: 'image/webp' }))}>Seleccionar imagen de prueba</button> }));

const producto = {
  idProducto: '1', nombre: 'Taladro', marca: 'Bosch', categoria: 'Herramientas', precioVenta: 11900, stock: 20,
  imagen: '/media/taladro.webp', unidadVenta: 'unidad', contenidoPresentacion: '1 unidad',
  especificaciones: { Peso: '2 kg', Potencia: '800 W', Material: 'Acero' },
};

beforeEach(async () => {
  vi.clearAllMocks();
  datosOrdenes.ordenes = [];
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  api.get.mockResolvedValue({ data: { contenido: [producto], totalPaginas: 1 } });
  api.post.mockImplementation(async (ruta, datos) => ({ data: ruta === 'catalogo/imagenes' ? { url: '/media/nuevo.webp' } : { ...datos, idProducto: '2' } }));
  api.put.mockImplementation(async (_ruta, datos) => ({ data: { ...datos, idProducto: '1' } }));
  await cargarProductos();
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const mostrarAdmin = () => render(<MemoryRouter><Admin /></MemoryRouter>);
const cambiar = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
const agregarDetalle = (indice, atributo, valor) => {
  fireEvent.click(screen.getByRole('button', { name: 'Agregar detalle técnico' }));
  cambiar(`Atributo ${indice}`, atributo);
  cambiar(`Valor ${indice}`, valor);
};
const nuevoProducto = () => {
  fireEvent.click(screen.getAllByRole('button', { name: '+ Agregar Producto' })[0]);
  for (const [placeholder, value] of [['Ej: Taladro Percutor 20V Max XR', 'Sierra circular'], ['Ej: DeWalt, Bosch, Makita...', 'Bosch'], ['129990', '11900'], ['10', '20']]) {
    fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Seleccionar imagen de prueba' }));
};
const enviar = nombre => fireEvent.submit(screen.getByRole('button', { name: nombre }).closest('form'));

test('crea un producto con atributos propios, los envía como diccionario y los muestra en su ficha pública', async () => {
  const vista = mostrarAdmin();
  nuevoProducto();
  agregarDetalle(1, ' Peso ', ' 2,5 kg ');
  agregarDetalle(2, 'Diámetro', '185 mm');
  fireEvent.click(screen.getByRole('button', { name: 'Agregar detalle técnico' }));
  enviar('Registrar Producto');
  await waitFor(() => expect(api.post).toHaveBeenCalledWith('catalogo/productos', expect.objectContaining({ especificaciones: { Peso: '2,5 kg', Diámetro: '185 mm' } })));
  await waitFor(() => expect(screen.queryByText('Agregar Nuevo Producto')).toBeNull());
  vista.unmount();
  render(<MemoryRouter initialEntries={['/producto/2']}><Routes><Route path="/producto/:id" element={<DetalleProducto />} /></Routes></MemoryRouter>);
  expect(screen.getByText('Peso', { selector: 'dt' })).toBeTruthy();
  expect(screen.getByText('2,5 kg', { selector: 'dd' })).toBeTruthy();
  expect(screen.getByText('185 mm', { selector: 'dd' })).toBeTruthy();
});

test('carga la ficha existente, permite renombrar, cambiar valores y quitar todos los atributos', async () => {
  mostrarAdmin();
  fireEvent.click(screen.getByRole('button', { name: 'Productos', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Editar', exact: true }));
  expect(screen.getByLabelText('Atributo 1').value).toBe('Peso');
  expect(screen.getByLabelText('Valor 1').value).toBe('2 kg');
  cambiar('Atributo 1', 'Peso del equipo');
  cambiar('Valor 1', '2,8 kg');
  fireEvent.click(screen.getByRole('button', { name: 'Quitar detalle 2: Potencia' }));
  enviar('Guardar Cambios');
  await waitFor(() => expect(api.put).toHaveBeenCalledWith('catalogo/productos/1', expect.objectContaining({ especificaciones: { 'Peso del equipo': '2,8 kg', Material: 'Acero' } })));
  await waitFor(() => expect(screen.queryByText('Editar Producto')).toBeNull());
  fireEvent.click(screen.getByRole('button', { name: 'Editar', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Quitar detalle 1: Peso del equipo' }));
  fireEvent.click(screen.getByRole('button', { name: 'Quitar detalle 1: Material' }));
  enviar('Guardar Cambios');
  await waitFor(() => expect(api.put).toHaveBeenLastCalledWith('catalogo/productos/1', expect.objectContaining({ especificaciones: {} })));
});

test('bloquea filas incompletas y atributos repetidos antes de subir la imagen y conserva lo escrito', async () => {
  mostrarAdmin();
  nuevoProducto();
  agregarDetalle(1, 'Peso', '2 kg');
  agregarDetalle(2, ' peso ', '');
  enviar('Registrar Producto');
  expect(screen.getAllByText('Este atributo está repetido.')).toHaveLength(2);
  expect(screen.getByText('Escribe el valor de este atributo.')).toBeTruthy();
  expect(api.post).not.toHaveBeenCalled();
  cambiar('Atributo 2', 'Potencia');
  cambiar('Valor 2', '800 W');
  expect(screen.queryByText('Este atributo está repetido.')).toBeNull();
  enviar('Registrar Producto');
  await waitFor(() => expect(api.post).toHaveBeenCalledWith('catalogo/productos', expect.objectContaining({ especificaciones: { Peso: '2 kg', Potencia: '800 W' } })));
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
