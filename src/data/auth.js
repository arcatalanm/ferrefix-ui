// SISTEMA DE AUTENTICACIÓN Y ROLES EN LOCALSTORAGE

const STORAGE_KEY_USUARIOS = 'ferrefix_usuarios_v1';
const STORAGE_KEY_SESION = 'ferrefix_sesion_activa_v1';
export const EVENTO_SESION_ACTUALIZADA = 'ferrefix:sesion_actualizada';

// Usuarios precargados por defecto con datos completos de despacho
const USUARIOS_PRECARGADOS = [
  {
    idUsuario: 'USR-001',
    nombre: 'Administrador Ferrefix',
    rut: '11.222.333-4',
    email: 'admin@ferrefix.cl',
    password: 'admin123',
    telefono: '+56 9 9345 6575',
    direccion: 'Av. Andrés Bello 2457, Local 12',
    region: 'Región Metropolitana',
    comuna: 'Providencia',
    rol: 'admin'
  },
  {
    idUsuario: 'USR-003',
    nombre: 'Juan Maestro',
    rut: '15.432.890-K',
    email: 'cliente@ferrefix.cl',
    password: 'cliente123',
    telefono: '+56 9 8765 4321',
    direccion: 'Av. Providencia 1240, Depto 502',
    region: 'Región Metropolitana',
    comuna: 'Providencia',
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
    const usuarios = JSON.parse(data);
    // Asegurar que usuarios existentes tengan datos base
    return usuarios.map((u) => {
      const precargado = USUARIOS_PRECARGADOS.find((p) => p.email.toLowerCase() === u.email.toLowerCase());
      return {
        ...precargado,
        ...u
      };
    });
  } catch (error) {
    console.error('Error al leer usuarios de localStorage:', error);
    return USUARIOS_PRECARGADOS;
  }
};

/**
 * Retorna el usuario de la sesión actual enriquecido con sus datos de perfil
 */
export const obtenerSesionActiva = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY_SESION);
    if (!data) return null;
    const sesion = JSON.parse(data);
    const usuarios = obtenerUsuarios();
    const usuarioFull = usuarios.find(
      (u) => u.idUsuario === sesion.idUsuario || u.email.toLowerCase() === sesion.email.toLowerCase()
    );
    if (usuarioFull) {
      return {
        ...usuarioFull,
        ...sesion,
        rut: sesion.rut || usuarioFull.rut || '',
        telefono: sesion.telefono || usuarioFull.telefono || '',
        direccion: sesion.direccion || usuarioFull.direccion || '',
        region: sesion.region || usuarioFull.region || 'Región Metropolitana',
        comuna: sesion.comuna || usuarioFull.comuna || 'Providencia'
      };
    }
    return sesion;
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
    rut: usuarioEncontrado.rut || '',
    email: usuarioEncontrado.email,
    telefono: usuarioEncontrado.telefono || '',
    direccion: usuarioEncontrado.direccion || '',
    region: usuarioEncontrado.region || 'Región Metropolitana',
    comuna: usuarioEncontrado.comuna || 'Providencia',
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
export const registrarUsuario = ({ nombre, email, password, rut = '', telefono = '', direccion = '', region = 'Región Metropolitana', comuna = 'Providencia' }) => {
  const usuarios = obtenerUsuarios();
  const existe = usuarios.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  if (existe) {
    return { ok: false, mensaje: 'Ya existe una cuenta registrada con este correo electrónico.' };
  }

  const nuevoUsuario = {
    idUsuario: `USR-${Date.now().toString().slice(-6)}`,
    nombre: nombre.trim(),
    rut: rut.trim(),
    email: email.toLowerCase().trim(),
    password,
    telefono: telefono.trim(),
    direccion: direccion.trim(),
    region,
    comuna,
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
    rut: nuevoUsuario.rut,
    email: nuevoUsuario.email,
    telefono: nuevoUsuario.telefono,
    direccion: nuevoUsuario.direccion,
    region: nuevoUsuario.region,
    comuna: nuevoUsuario.comuna,
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
 * Actualiza los datos de perfil y despacho del usuario activo
 */
export const actualizarDatosUsuario = (datosActualizados) => {
  const sesion = obtenerSesionActiva();
  if (!sesion) {
    return { ok: false, mensaje: 'No hay sesión activa.' };
  }

  const usuarios = obtenerUsuarios();
  const index = usuarios.findIndex((u) => u.idUsuario === sesion.idUsuario || u.email.toLowerCase() === sesion.email.toLowerCase());

  if (index === -1) {
    return { ok: false, mensaje: 'Usuario no encontrado.' };
  }

  const usuarioModificado = {
    ...usuarios[index],
    ...datosActualizados,
    nombre: (datosActualizados.nombre || usuarios[index].nombre).trim(),
    rut: (datosActualizados.rut || usuarios[index].rut || '').trim(),
    telefono: (datosActualizados.telefono || usuarios[index].telefono || '').trim(),
    direccion: (datosActualizados.direccion || usuarios[index].direccion || '').trim(),
    region: datosActualizados.region || usuarios[index].region || 'Región Metropolitana',
    comuna: datosActualizados.comuna || usuarios[index].comuna || 'Providencia'
  };

  usuarios[index] = usuarioModificado;

  const sesionActualizada = {
    ...sesion,
    ...usuarioModificado
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(usuarios));
    localStorage.setItem(STORAGE_KEY_SESION, JSON.stringify(sesionActualizada));
  }

  notificarSesion();
  return { ok: true, usuario: sesionActualizada };
};
