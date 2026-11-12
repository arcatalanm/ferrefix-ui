import { useSyncExternalStore } from 'react';
import { clienteApi } from '../services/api';
import { obtenerMensajeApi } from '../services/crearClienteApi';
import { sincronizarCarrito } from './carrito';

export const EVENTO_PRODUCTOS_ACTUALIZADOS = 'ferrefix:productos_actualizados';
const TAMANO_MAXIMO_IMAGEN_BYTES = 6 * 1024 * 1024;
export const CATEGORIAS_PRODUCTOS = ['Todas','Construcción','Maderas','Herramientas','Fijaciones','Gasfitería','Electricidad','Pinturas','Cerámicas','Seguridad'];
let productos = [];
let estado = { cargando: true, error: '' };
let pendiente;
let revision = 0;
const mediaBase = (import.meta.env.VITE_MEDIA_URL || '/media').replace(/\/$/, '');
const rutaImagen = url => url?.startsWith(mediaBase + '/') ? '/media/' + url.slice(mediaBase.length + 1) : url;
const adaptar = p => ({ ...p, imagen: p.imagen?.startsWith('/media/') ? mediaBase + p.imagen.slice(6) : p.imagen });
const notificar = () => window.dispatchEvent(new CustomEvent(EVENTO_PRODUCTOS_ACTUALIZADOS));
const sincronizarBorrador = () => {
  try { sincronizarCarrito(productos); }
  catch (error) { console.warn('No se pudo actualizar el borrador del carrito.', error); }
};
const publicarProductos = () => { sincronizarBorrador(); notificar(); };
const suscribir = callback => {
  window.addEventListener(EVENTO_PRODUCTOS_ACTUALIZADOS, callback);
  return () => window.removeEventListener(EVENTO_PRODUCTOS_ACTUALIZADOS, callback);
};
export const useEstadoCatalogo = () => useSyncExternalStore(suscribir, () => estado);
export const obtenerProductos = () => productos;
export const obtenerProductoPorId = id => productos.find(p => String(p.idProducto) === String(id)) || null;

export function cargarProductos() {
  if (pendiente) return pendiente;
  const actual = revision;
  estado = { cargando: true, error: '' };
  notificar();
  pendiente = (async () => {
    try {
      const nuevos = [];
      let pagina = 0;
      let totalPaginas = 1;
      do {
        const { data } = await clienteApi.http.get('catalogo/productos', { params: { pagina, tamano: 100 } });
        nuevos.push(...data.contenido.map(adaptar));
        totalPaginas = data.totalPaginas;
        pagina += 1;
      } while (pagina < totalPaginas);
      if (revision === actual) { productos = nuevos; sincronizarBorrador(); }
      estado = { cargando: false, error: '' };
      return true;
    } catch (error) {
      estado = { cargando: false, error: obtenerMensajeApi(error) };
      return false;
    } finally {
      pendiente = null;
      notificar();
    }
  })();
  return pendiente;
}

const escritura = p => ({
  nombre: p.nombre, marca: p.marca, categoria: p.categoria,
  precioVenta: Number(p.precioVenta), stock: Number(p.stock),
  unidadVenta: p.unidadVenta || 'unidad', contenidoPresentacion: p.contenidoPresentacion ?? '1 unidad',
  descripcionCorta: p.descripcionCorta || '', descripcionLarga: p.descripcionLarga || '',
  imagen: rutaImagen(p.imagen),
  especificaciones: p.especificaciones || {},
});

export async function crearProducto(datos) {
  const { data } = await clienteApi.http.post('catalogo/productos', escritura(datos));
  const producto = adaptar(data);
  revision += 1;
  productos = [...productos, producto];
  publicarProductos();
  return producto;
}
export async function actualizarProducto(id, datos) {
  const { data } = await clienteApi.http.put('catalogo/productos/' + encodeURIComponent(id), escritura(datos));
  const producto = adaptar(data);
  revision += 1;
  productos = productos.map(p => p.idProducto === id ? producto : p);
  publicarProductos();
  return producto;
}
export async function eliminarProducto(id) {
  await clienteApi.http.delete('catalogo/productos/' + encodeURIComponent(id));
  revision += 1;
  productos = productos.filter(p => p.idProducto !== id);
  publicarProductos();
}
export async function subirImagenProducto(archivo) {
  if (!archivo) return null;
  if (!['image/jpeg','image/png','image/webp'].includes(archivo.type)) throw new Error('Usa una imagen JPG, PNG o WebP.');
  if (archivo.size > TAMANO_MAXIMO_IMAGEN_BYTES) throw new Error('La imagen supera los 6 MB.');
  const form = new FormData();
  form.append('archivo', archivo);
  const { data } = await clienteApi.http.post('catalogo/imagenes', form);
  return mediaBase + data.url.slice(6);
}
