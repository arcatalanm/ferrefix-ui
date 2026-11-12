import { useSyncExternalStore } from 'react';
import { clienteApi, alExpirarSesion } from '../services/api';
import { crearAuthApi } from '../services/crearAuthApi';
import { obtenerMensajeApi } from '../services/crearClienteApi';

export const EVENTO_SESION_ACTUALIZADA = 'ferrefix:sesion_actualizada';
const authApi = crearAuthApi(clienteApi);
let sesion = null;
let temporizador;
let revision = 0;
let revisionPerfil = 0;

const notificar = () => window.dispatchEvent(new CustomEvent(EVENTO_SESION_ACTUALIZADA));
export const obtenerSesionActiva = () => sesion;
const suscribir = (callback) => {
  window.addEventListener(EVENTO_SESION_ACTUALIZADA, callback);
  return () => window.removeEventListener(EVENTO_SESION_ACTUALIZADA, callback);
};
export const useSesion = () => useSyncExternalStore(suscribir, obtenerSesionActiva, () => null);

export function cerrarSesion() {
  revision += 1;
  clearTimeout(temporizador);
  clienteApi.limpiarToken();
  sesion = null;
  notificar();
}
alExpirarSesion(cerrarSesion);

const fallo = (error) => ({
  ok: false,
  mensaje: obtenerMensajeApi(error),
  errores: error.response?.data?.errores || {},
});

async function autenticar(operacion) {
  cerrarSesion();
  const actual = revision;
  try {
    const data = await operacion();
    if (actual !== revision) return { ok: false, mensaje: 'La solicitud de acceso fue cancelada.' };
    clienteApi.establecerToken(data.accessToken);
    sesion = Object.freeze({ ...data.usuario });
    temporizador = setTimeout(cerrarSesion, data.expiresIn * 1000);
    notificar();
    return { ok: true, usuario: sesion };
  } catch (error) {
    return fallo(error);
  }
}

export const iniciarSesion = (identificador, password) =>
  autenticar(() => authApi.iniciarSesion(identificador.trim(), password));

export const registrarUsuario = ({ nombre, segNombre = '', apellidoPaterno, apellidoMaterno = '', email, password, rut, telefono = '',
  direccion = '', region = '', comuna = '' }) =>
  autenticar(() => authApi.registrar({
    nombre: nombre.trim(), email: email.trim().toLowerCase(), password,
    segNombre: segNombre.trim(), apellidoPaterno: apellidoPaterno.trim(), apellidoMaterno: apellidoMaterno.trim(),
    rut, telefono, direccion, region, comuna,
  }));

export async function refrescarPerfil() {
  if (!sesion) return { ok: false, mensaje: 'Inicia sesión para consultar tu perfil.' };
  const actual = revision;
  const perfilActual = ++revisionPerfil;
  try {
    const usuario = await authApi.obtenerPerfil();
    if (actual !== revision) return { ok: false, mensaje: 'La sesión cambió.' };
    if (perfilActual !== revisionPerfil) return { ok: true, usuario: sesion };
    sesion = Object.freeze({ ...usuario });
    notificar();
    return { ok: true, usuario: sesion };
  } catch (error) {
    return fallo(error);
  }
}

export async function actualizarDatosUsuario(datos) {
  if (!sesion) return { ok: false, mensaje: 'Inicia sesión para guardar tus datos.' };
  const actual = revision;
  const perfilActual = ++revisionPerfil;
  try {
    const usuario = await authApi.actualizarPerfil(datos);
    if (actual !== revision) return { ok: false, mensaje: 'La sesión cambió.' };
    if (perfilActual !== revisionPerfil) return { ok: true, usuario: sesion };
    sesion = Object.freeze({ ...usuario });
    notificar();
    return { ok: true, usuario: sesion };
  } catch (error) {
    return fallo(error);
  }
}
