import { useSyncExternalStore } from 'react';
import { clienteApi } from '../services/api';
import { obtenerMensajeApi } from '../services/crearClienteApi';
import { obtenerSesionActiva, EVENTO_SESION_ACTUALIZADA } from './auth';

export const EVENTO_CARRITO_ACTUALIZADO = 'ferrefix:carrito_actualizado';
let items = [];
let revision = 0;
let cola = Promise.resolve();
let inicializado = false;
let estado = { cargando: false, error: '' };
const mediaBase = (import.meta.env.VITE_MEDIA_URL || '/media').replace(/\/$/, '');
const notificar = () => window.dispatchEvent(new CustomEvent(EVENTO_CARRITO_ACTUALIZADO));
const publicar = cambios => { estado = { ...estado, ...cambios }; notificar(); };
export const obtenerCarrito = () => items;
const suscribir = callback => {
  window.addEventListener(EVENTO_CARRITO_ACTUALIZADO, callback);
  return () => window.removeEventListener(EVENTO_CARRITO_ACTUALIZADO, callback);
};
export const useEstadoCarrito = () => useSyncExternalStore(suscribir, () => estado);
const adaptar = data => data.map(item => ({ ...item,
  imagen: item.imagen?.startsWith('/media/') ? mediaBase + item.imagen.slice(6) : item.imagen,
}));
window.addEventListener(EVENTO_SESION_ACTUALIZADA, () => {
  revision += 1; items = []; inicializado = false; publicar({ cargando: false, error: '' });
});

function encolar(operacion) {
  const sesion = obtenerSesionActiva();
  const actual = revision;
  const solicitud = cola.then(async () => {
    if (actual !== revision || sesion !== obtenerSesionActiva()) return { ok: false, error: 'La sesión cambió.' };
    publicar({ cargando: true, error: '' });
    try {
      if (!inicializado) {
        const { data } = await clienteApi.http.get('/ordenes/carrito', { withCredentials: true });
        if (actual !== revision || sesion !== obtenerSesionActiva()) return { ok: false, error: 'La sesión cambió.' };
        items = adaptar(data); inicializado = true;
      }
      const { data } = await operacion();
      if (actual !== revision || sesion !== obtenerSesionActiva()) return { ok: false, error: 'La sesión cambió.' };
      items = adaptar(data); publicar({ cargando: false });
      return { ok: true };
    } catch (error) {
      const mensaje = obtenerMensajeApi(error);
      if (actual === revision) publicar({ cargando: false, error: mensaje });
      return { ok: false, error: mensaje };
    }
  });
  cola = solicitud.catch(() => {});
  return solicitud;
}

export const cargarCarrito = () => encolar(() => clienteApi.http.get('/ordenes/carrito', { withCredentials: true }));
export const agregarAlCarrito = (producto, cantidad = 1) => encolar(() =>
  clienteApi.http.post(`/ordenes/carrito/items/${encodeURIComponent(producto.idProducto)}`, { cantidad }, { withCredentials: true }));
export const actualizarCantidad = (id, cantidad) => Number(cantidad) <= 0 ? eliminarDelCarrito(id) : encolar(() =>
  clienteApi.http.put(`/ordenes/carrito/items/${encodeURIComponent(id)}`, { cantidad: Number(cantidad) }, { withCredentials: true }));
export const eliminarDelCarrito = id => encolar(() =>
  clienteApi.http.delete(`/ordenes/carrito/items/${encodeURIComponent(id)}`, { withCredentials: true }));
export const vaciarCarrito = () => encolar(() => clienteApi.http.delete('/ordenes/carrito', { withCredentials: true }));

export function sincronizarCarrito(productos) {
  if (!items.length) return;
  items = items.map(item => {
    const p = productos.find(producto => producto.idProducto === item.idProducto);
    return p ? { ...item, ...p, cantidad: item.cantidad, disponible: true } : { ...item, stock: 0, disponible: false };
  });
  notificar();
}

export function obtenerTotalesCarrito(metodoEntrega = 'despacho') {
  const totalArticulos = items.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = items.reduce((acc, item) => acc + item.precioVenta * item.cantidad, 0);
  const despacho = metodoEntrega === 'retiro' || subtotal > 50000 || subtotal === 0 ? 0 : 3990;
  return { totalArticulos, subtotal, despacho, total: subtotal + despacho };
}
