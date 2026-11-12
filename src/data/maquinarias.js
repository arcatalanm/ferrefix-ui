import { useSyncExternalStore } from 'react';
import { clienteApi } from '../services/api';
import { obtenerMensajeApi } from '../services/crearClienteApi';
import { obtenerSesionActiva, EVENTO_SESION_ACTUALIZADA } from './auth';

export const EVENTO_MAQUINARIAS_ACTUALIZADAS = 'ferrefix:maquinarias_actualizadas';
let maquinarias = [];
let contratos = [];
let revisionMaquinas = 0;
let revisionContratos = 0;
const mediaBase = (import.meta.env.VITE_MEDIA_URL || '/media').replace(/\/$/, '');
let estado = { cargandoMaquinas: false, cargandoContratos: false, errorMaquinas: '', errorContratos: '' };

const notificar = () => window.dispatchEvent(new CustomEvent(EVENTO_MAQUINARIAS_ACTUALIZADAS));
const actualizarEstado = (cambios) => { estado = { ...estado, ...cambios }; notificar(); };
const suscribir = (callback) => {
  window.addEventListener(EVENTO_MAQUINARIAS_ACTUALIZADAS, callback);
  return () => window.removeEventListener(EVENTO_MAQUINARIAS_ACTUALIZADAS, callback);
};
export const useEstadoArriendos = () => useSyncExternalStore(suscribir, () => estado, () => estado);
export const obtenerMaquinarias = () => maquinarias;
export const obtenerContratosArriendo = () => contratos;

window.addEventListener(EVENTO_SESION_ACTUALIZADA, () => {
  revisionContratos += 1;
  contratos = [];
  actualizarEstado({ cargandoContratos: false, errorContratos: '' });
});

export const fechaHoyChile = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());

export function calcularFechaTermino(fechaInicio, dias) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio) || !Number.isInteger(Number(dias)) || dias < 1 || dias > 90) return '';
  const fecha = new Date(`${fechaInicio}T12:00:00Z`);
  if (Number.isNaN(fecha.getTime())) return '';
  fecha.setUTCDate(fecha.getUTCDate() + Number(dias) - 1);
  return fecha.toISOString().slice(0, 10);
}

const adaptarContrato = (contrato) => ({
  ...contrato,
  fechaContrato: new Date(contrato.fechaContrato).toLocaleString('es-CL', { timeZone: 'America/Santiago' }),
});

export async function cargarMaquinarias() {
  const actual = ++revisionMaquinas;
  actualizarEstado({ cargandoMaquinas: true, errorMaquinas: '' });
  try {
    const { data } = await clienteApi.http.get('/ordenes/maquinas', { omitirAuth: true });
    if (actual !== revisionMaquinas) return;
    maquinarias = data.map(maquina => ({
      ...maquina,
      imagen: maquina.imagen?.startsWith('/media/') ? mediaBase + maquina.imagen.slice(6) : maquina.imagen,
    }));
    actualizarEstado({ cargandoMaquinas: false });
  } catch (error) {
    if (actual === revisionMaquinas) actualizarEstado({ cargandoMaquinas: false, errorMaquinas: obtenerMensajeApi(error) });
  }
}

export async function cargarContratosArriendo() {
  const actual = ++revisionContratos;
  const sesion = obtenerSesionActiva();
  if (!sesion) {
    contratos = [];
    actualizarEstado({ cargandoContratos: false, errorContratos: '' });
    return;
  }
  actualizarEstado({ cargandoContratos: true, errorContratos: '' });
  try {
    const { data } = await clienteApi.http.get('/ordenes/arriendos');
    if (actual !== revisionContratos || sesion !== obtenerSesionActiva()) return;
    contratos = data.map(adaptarContrato);
    actualizarEstado({ cargandoContratos: false });
  } catch (error) {
    if (actual === revisionContratos && sesion === obtenerSesionActiva()) {
      actualizarEstado({ cargandoContratos: false, errorContratos: obtenerMensajeApi(error) });
    }
  }
}

export async function registrarArriendo({ idMaquina, fechaInicio, diasArriendo, telefono, direccion, region, comuna }) {
  const sesion = obtenerSesionActiva();
  if (!sesion) return { ok: false, error: 'Inicia sesión para arrendar maquinaria.' };
  try {
    const { data } = await clienteApi.http.post('/ordenes/arriendos', {
      idMaquina, fechaInicio, fechaTermino: calcularFechaTermino(fechaInicio, diasArriendo),
      telefono: telefono.trim(), direccion: direccion.trim(), region, comuna,
    });
    if (sesion !== obtenerSesionActiva()) return { ok: false, error: 'La sesión cambió. Consulta el contrato en tu cuenta.' };
    const contrato = adaptarContrato(data);
    contratos = [contrato, ...contratos.filter(c => c.idContrato !== contrato.idContrato)];
    notificar();
    await Promise.all([cargarMaquinarias(), cargarContratosArriendo()]);
    if (sesion !== obtenerSesionActiva()) return { ok: false, error: 'La sesión cambió. Consulta el contrato en tu cuenta.' };
    return { ok: true, contrato };
  } catch (error) {
    if (error.response?.status === 409) await cargarMaquinarias();
    return { ok: false, error: obtenerMensajeApi(error), errores: error.response?.data?.errores || {} };
  }
}
