// ===============================================================
// SISTEMA DE AUTENTICACIÓN Y ROLES EN LOCALSTORAGE
// Simulación de control de acceso para Administradores y Clientes
// ===============================================================

const STORAGE_KEY_USUARIOS = 'ferrefix_usuarios_v1';
const STORAGE_KEY_SESION = 'ferrefix_sesion_activa_v1';
export const EVENTO_SESION_ACTUALIZADA = 'ferrefix:sesion_actualizada';

// Usuarios precargados por defecto
const USUARIOS_PRECARGADOS = [
  {
    idUsuario: 'USR-001',
    nombre: 'Administrador Ferrefix',
    email: 'admin@ferrefix.cl',
    password: 'admin123',
    rol: 'admin'
  },
  {
    idUsuario: 'USR-002',
    nombre: 'Ariel (Administrador)',
    email: 'ariel@ferrefix.cl',
    password: 'admin123',
    rol: 'admin'
  },
  {
    idUsuario: 'USR-003',
    nombre: 'Juan Maestro',
    email: 'cliente@ferrefix.cl',
    password: 'cliente123',
    rol: 'cliente'
  }
];

const notificarSesion = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENTO_SESION_ACTUALIZADA));
  }
};

/**
 * Obtiene la lista de usuarios registrados desde localStorage
 */
export const obtenerUsuarios = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return USUARIOS_PRECARGADOS;
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY_USUARIOS);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(USUARIOS_PRECARGADOS));
      return USUARIOS_PRECARGADOS;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer usuarios de localStorage:', error);
    return USUARIOS_PRECARGADOS;
  }
};

/**
 * Retorna el usuario de la sesión actual o null si no ha iniciado sesión
 */
export const obtenerSesionActiva = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY_SESION);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error al leer sesión de localStorage:', error);
    return null;
  }
};

/**
 * Valida credenciales e inicia sesión guardando en localStorage
 */
export const iniciarSesion = (email, password) => {
  const usuarios = obtenerUsuarios();
  const usuarioEncontrado = usuarios.find(
    (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.password === password
  );

  if (!usuarioEncontrado) {
    return { 
      ok: false, 
      mensaje: 'Credenciales inválidas. Verifica tu correo y contraseña.' 
    };
  }

  const sesion = {
    idUsuario: usuarioEncontrado.idUsuario,
    nombre: usuarioEncontrado.nombre,
    email: usuarioEncontrado.email,
    rol: usuarioEncontrado.rol,
    fechaIngreso: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEY_SESION, JSON.stringify(sesion));
  notificarSesion();
  return { ok: true, usuario: sesion };
};

/**
 * Cierra la sesión activa
 */
export const cerrarSesion = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY_SESION);
    notificarSesion();
  }
};

/**
 * Verifica si el usuario actual tiene permisos de Administrador
 */
export const esAdministrador = () => {
  const sesion = obtenerSesionActiva();
  return sesion !== null && sesion.rol === 'admin';
};

/**
 * Registra un nuevo usuario cliente en localStorage y activa su sesión
 */
export const registrarUsuario = ({ nombre, email, password }) => {
  const usuarios = obtenerUsuarios();
  const existe = usuarios.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  if (existe) {
    return { ok: false, mensaje: 'Ya existe una cuenta registrada con este correo electrónico.' };
  }

  const nuevoUsuario = {
    idUsuario: `USR-${Date.now().toString().slice(-6)}`,
    nombre: nombre.trim(),
    email: email.toLowerCase().trim(),
    password,
    rol: 'cliente'
  };

  const listaActualizada = [...usuarios, nuevoUsuario];
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(listaActualizada));
  }

  // Iniciar sesión automáticamente
  const sesion = {
    idUsuario: nuevoUsuario.idUsuario,
    nombre: nuevoUsuario.nombre,
    email: nuevoUsuario.email,
    rol: nuevoUsuario.rol,
    fechaIngreso: new Date().toISOString()
  };
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY_SESION, JSON.stringify(sesion));
  }
  notificarSesion();
  return { ok: true, usuario: sesion };
};

