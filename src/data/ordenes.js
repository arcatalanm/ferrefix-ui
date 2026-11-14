import { useSyncExternalStore } from 'react';
import { clienteApi } from '../services/api';
import { obtenerMensajeApi } from '../services/crearClienteApi';
import { obtenerSesionActiva, EVENTO_SESION_ACTUALIZADA } from './auth';
import { cargarCarrito } from './carrito';

export const EVENTO_ORDENES_ACTUALIZADAS = 'ferrefix:ordenes_actualizadas';
let ordenes = [];
let revision = 0;
let estado = { cargando: false, error: '' };
const notificar = () => window.dispatchEvent(new CustomEvent(EVENTO_ORDENES_ACTUALIZADAS));
const publicar = cambios => { estado = { ...estado, ...cambios }; notificar(); };
const suscribir = callback => {
  window.addEventListener(EVENTO_ORDENES_ACTUALIZADAS, callback);
  return () => window.removeEventListener(EVENTO_ORDENES_ACTUALIZADAS, callback);
};
export const useEstadoOrdenes = () => useSyncExternalStore(suscribir, () => estado);
export const obtenerOrdenes = () => ordenes;
const adaptar = orden => ({ ...orden, fecha: new Date(orden.fecha).toLocaleString('es-CL', { timeZone: 'America/Santiago' }) });
window.addEventListener(EVENTO_SESION_ACTUALIZADA, () => {
  revision += 1; ordenes = []; publicar({ cargando: false, error: '' });
});

export async function cargarOrdenes() {
  const actual = ++revision;
  const sesion = obtenerSesionActiva();
  if (!sesion) { ordenes = []; publicar({ cargando: false, error: '' }); return; }
  publicar({ cargando: true, error: '' });
  try {
    const { data } = await clienteApi.http.get('/ordenes/pedidos');
    if (actual !== revision || sesion !== obtenerSesionActiva()) return;
    ordenes = data.map(adaptar); publicar({ cargando: false });
  } catch (error) {
    if (actual === revision && sesion === obtenerSesionActiva()) publicar({ cargando: false, error: obtenerMensajeApi(error) });
  }
}

export async function crearOrden(datos) {
  const sesion = obtenerSesionActiva();
  try {
    const { data } = await clienteApi.http.post('/ordenes/pedidos', datos, { withCredentials: true });
    if (sesion !== obtenerSesionActiva()) return { ok: false, error: 'La sesión cambió. Consulta tus pedidos antes de volver a confirmar.' };
    await Promise.all([cargarOrdenes(), cargarCarrito()]);
    if (sesion !== obtenerSesionActiva()) return { ok: false, error: 'La sesión cambió.' };
    return { ok: true, orden: adaptar(data) };
  } catch (error) {
    return { ok: false, error: obtenerMensajeApi(error), errores: error.response?.data?.errores || {} };
  }
}

// Solo se permite enviar al usuario a estos hosts de Transbank (integración y producción).
const HOSTS_WEBPAY = ['webpay3gint.transbank.cl', 'webpay3g.transbank.cl'];

/** Pide al backend crear la transacción Webpay del pedido. Devuelve { ok, url, token } o { ok:false, error, estado }. */
export async function iniciarPagoWebpay(idOrden) {
  try {
    const { data } = await clienteApi.http.post(
      `/ordenes/pedidos/${encodeURIComponent(idOrden)}/pago/webpay`, null, { withCredentials: true });
    const destino = new URL(data.url);
    if (!data.token || destino.protocol !== 'https:' || !HOSTS_WEBPAY.includes(destino.hostname)) {
      throw new Error('Destino de pago no permitido');
    }
    return { ok: true, url: destino.href, token: data.token };
  } catch (error) {
    return { ok: false, error: obtenerMensajeApi(error), estado: error.response?.status };
  }
}

/** Redirige el navegador a Webpay con un formulario POST (campo token_ws). Sale de la SPA. */
export function enviarAWebpay({ url, token }) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  form.style.display = 'none';
  const campo = document.createElement('input');
  campo.type = 'hidden';
  campo.name = 'token_ws';
  campo.value = token;
  form.appendChild(campo);
  document.body.appendChild(form);
  form.submit();
}

/** Lee un pedido (dueño por JWT o por cookie de invitado). */
export async function obtenerOrden(idOrden) {
  try {
    const { data } = await clienteApi.http.get(
      `/ordenes/pedidos/${encodeURIComponent(idOrden)}`, { withCredentials: true });
    return { ok: true, orden: adaptar(data) };
  } catch (error) {
    return { ok: false, error: obtenerMensajeApi(error), estado: error.response?.status };
  }
}