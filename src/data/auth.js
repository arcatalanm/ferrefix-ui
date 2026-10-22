// SISTEMA DE AUTENTICACIÓN Y ROLES EN LOCALSTORAGE

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
    rol: 'cliente',
    rut: '12.345.678-9',
    telefono: '+56 9 8765 4321',
    direccion: 'Av. Providencia 1240, Depto 502',
    region: 'Región Metropolitana',
    comuna: 'Providencia'
  }
];

const datosPerfil = (usuario = {}) => ({
  nombre: usuario.nombre || '',
  email: usuario.email || '',
  rut: usuario.rut || '',
  telefono: usuario.telefono || '',
  direccion: usuario.direccion || '',
  region: usuario.region || '',
  comuna: usuario.comuna || ''
});

// Completa cuentas creadas con versiones anteriores con los datos base conocidos.
const completarPerfilPrecargado = (usuario) => {
  const base = USUARIOS_PRECARGADOS.find(
    (u) => u.email.toLowerCase() === String(usuario.email || '').toLowerCase()
  );

  if (!base) return usuario;

  return {
    ...base,
    ...usuario,
    rut: usuario.rut || base.rut || '',
    telefono: usuario.telefono || base.telefono || '',
    direccion: usuario.direccion || base.direccion || '',
    region: usuario.region || base.region || '',
    comuna: usuario.comuna || base.comuna || ''
  };
};

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
    const usuarios = JSON.parse(data);
    return Array.isArray(usuarios) ? usuarios.map(completarPerfilPrecargado) : USUARIOS_PRECARGADOS;
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
    ...datosPerfil(usuarioEncontrado),
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
 * Registra un nuevo usuario cliente en localStorage y activa su sesión.
 * También guarda los datos de despacho para autocompletar el checkout.
 */
export const registrarUsuario = ({
  nombre,
  email,
  password,
  rut = '',
  telefono = '',
  direccion = '',
  region = '',
  comuna = ''
}) => {
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
    rol: 'cliente',
    rut: String(rut).trim(),
    telefono: String(telefono).trim(),
    direccion: String(direccion).trim(),
    region: String(region).trim(),
    comuna: String(comuna).trim()
  };

  const listaActualizada = [...usuarios, nuevoUsuario];
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(listaActualizada));
  }

  // Iniciar sesión automáticamente
  const sesion = {
    idUsuario: nuevoUsuario.idUsuario,
    ...datosPerfil(nuevoUsuario),
    rol: nuevoUsuario.rol,
    fechaIngreso: new Date().toISOString()
  };
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY_SESION, JSON.stringify(sesion));
  }
  notificarSesion();
  return { ok: true, usuario: sesion };
};

/**
 * Obtiene los datos de despacho guardados para un correo registrado.
 */
export const obtenerPerfilCliente = (email) => {
  if (!email) return null;

  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(
    (u) => u.email.toLowerCase().trim() === String(email).toLowerCase().trim()
  );

  if (!usuario) return null;

  const perfil = datosPerfil(usuario);
  if (!perfil.rut && !perfil.telefono && !perfil.direccion) {
    return null;
  }

  return perfil;
};

/**
 * Guarda o actualiza los datos de despacho del cliente y refresca la sesión.
 */
export const guardarPerfilCliente = (email, datos = {}) => {
  if (!email) return false;

  const usuarios = obtenerUsuarios();
  const indice = usuarios.findIndex(
    (u) => u.email.toLowerCase().trim() === String(email).toLowerCase().trim()
  );

  if (indice === -1) return false;

  const perfil = {
    ...datosPerfil(usuarios[indice]),
    ...datos,
    email: usuarios[indice].email
  };

  usuarios[indice] = {
    ...usuarios[indice],
    nombre: perfil.nombre || usuarios[indice].nombre,
    rut: perfil.rut,
    telefono: perfil.telefono,
    direccion: perfil.direccion,
    region: perfil.region,
    comuna: perfil.comuna
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(usuarios));

    const sesion = obtenerSesionActiva();
    if (sesion && sesion.email.toLowerCase().trim() === String(email).toLowerCase().trim()) {
      const sesionActualizada = {
        ...sesion,
        ...perfil
      };
      localStorage.setItem(STORAGE_KEY_SESION, JSON.stringify(sesionActualizada));
    }
  }

  notificarSesion();
  return true;
};

