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
const CLAVE_SESION = 'ferrefix:sesion';

function guardarSesion(data) {
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify({
      accessToken: data.accessToken,
      usuario: data.usuario,
      expiraEn: Date.now() + data.expiresIn * 1000,
    }));
  } catch { /* almacenamiento no disponible: la sesión queda solo en memoria */ }
}

function borrarSesionGuardada() {
  try { localStorage.removeItem(CLAVE_SESION); } catch { /* nada que borrar */ }
  // Limpia la entrada de versiones anteriores que guardaban en sessionStorage.
  try { sessionStorage.removeItem(CLAVE_SESION); } catch { /* nada que borrar */ }
}

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
  borrarSesionGuardada();
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
    guardarSesion(data);
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

/** Restaura la sesión guardada (p. ej. al volver desde Webpay o abrir otra pestaña). */
export function restaurarSesion() {
  if (sesion) return;
  let guardada;
  try { guardada = JSON.parse(localStorage.getItem(CLAVE_SESION) || 'null'); } catch { guardada = null; }
  // Migra la sesión que versiones anteriores guardaban en sessionStorage.
  if (!guardada) {
    try { guardada = JSON.parse(sessionStorage.getItem(CLAVE_SESION) || 'null'); } catch { guardada = null; }
  }
  if (!guardada?.accessToken || !guardada.usuario || guardada.expiraEn <= Date.now()) {
    borrarSesionGuardada();
    return;
  }
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(guardada));
    sessionStorage.removeItem(CLAVE_SESION);
  } catch { /* almacenamiento no disponible */ }
  clienteApi.establecerToken(guardada.accessToken);
  sesion = Object.freeze({ ...guardada.usuario });
  temporizador = setTimeout(cerrarSesion, guardada.expiraEn - Date.now());
  notificar();
  // Valida el token contra el backend y refresca el perfil. Si el token ya no sirve (401),
  // el interceptor de axios llama a cerrarSesion() y se limpia todo.
  refrescarPerfil();
}
