import { useSyncExternalStore } from 'react';
import { clienteApi } from '../services/api';
import { obtenerMensajeApi } from '../services/crearClienteApi';

export const TOTAL_SLOTS_OFERTA = 4;
export const ENLACE_POR_DEFECTO = '/catalogo';
export const EVENTO_GENERADORES_ACTUALIZADOS = 'ferrefix:generadores_actualizados';
let ofertas = Array(TOTAL_SLOTS_OFERTA).fill(null);
let estado = { cargando: false, error: '' };
let revision = 0;
const mediaBase = (import.meta.env.VITE_MEDIA_URL || '/media').replace(/\/$/, '');
const adaptar = oferta => ({ ...oferta, imagen: oferta.imagen?.startsWith('/media/') ? mediaBase + oferta.imagen.slice(6) : oferta.imagen });
const publicar = cambios => {
  estado = { ...estado, ...cambios };
  window.dispatchEvent(new CustomEvent(EVENTO_GENERADORES_ACTUALIZADOS));
};
const suscribir = callback => {
  window.addEventListener(EVENTO_GENERADORES_ACTUALIZADOS, callback);
  return () => window.removeEventListener(EVENTO_GENERADORES_ACTUALIZADOS, callback);
};
export const useEstadoGeneradores = () => useSyncExternalStore(suscribir, () => estado);
export const obtenerOfertasGeneradas = () => ofertas;
export const obtenerEnlacesOferta = () => ofertas.map(oferta => oferta?.enlace || null);

export async function cargarOfertas() {
  const actual = ++revision;
  publicar({ cargando: true, error: '' });
  try {
    const { data } = await clienteApi.http.get('/catalogo/ofertas', { omitirAuth: true });
    if (actual !== revision) return;
    ofertas = Array(TOTAL_SLOTS_OFERTA).fill(null);
    data.forEach(oferta => { ofertas[oferta.indice] = adaptar(oferta); });
    publicar({ cargando: false });
  } catch (error) {
    if (actual === revision) publicar({ cargando: false, error: obtenerMensajeApi(error) });
  }
}

export async function guardarOfertaGenerada(indice, { imagen, enlace, alt }) {
  try {
    const { data } = await clienteApi.http.put(`/catalogo/ofertas/${indice}`, { imagen, enlace, alt });
    revision += 1;
    ofertas = ofertas.map((oferta, i) => i === indice ? adaptar(data) : oferta);
    publicar({ cargando: false, error: '' });
    return true;
  } catch (error) { throw new Error(obtenerMensajeApi(error), { cause: error }); }
}

export async function eliminarOfertaGenerada(indice) {
  try {
    await clienteApi.http.delete(`/catalogo/ofertas/${indice}`);
    revision += 1; ofertas = ofertas.map((oferta, i) => i === indice ? null : oferta);
    publicar({ cargando: false, error: '' });
    return true;
  } catch (error) { throw new Error(obtenerMensajeApi(error), { cause: error }); }
}
