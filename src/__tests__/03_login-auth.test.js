// Test: iniciarSesion: autentica credenciales válidas de administrador, rechaza una contraseña incorrecta y normaliza el correo con espacios y mayúsculas
// Función: iniciarSesion()

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { iniciarSesion, obtenerSesionActiva } from '../data/auth.js';

describe('Autenticación — iniciarSesion', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('iniciarSesion: autentica credenciales válidas de administrador, rechaza una contraseña incorrecta y normaliza el correo con espacios y mayúsculas', () => {
    const correcto = iniciarSesion('admin@ferrefix.cl', 'admin123');
    expect(correcto.ok).toBe(true);
    expect(correcto.usuario.rol).toBe('admin');
    expect(obtenerSesionActiva().email).toBe('admin@ferrefix.cl');

    const incorrecto = iniciarSesion('admin@ferrefix.cl', 'password_errada');
    expect(incorrecto.ok).toBe(false);
    expect(incorrecto.mensaje).toContain('Credenciales inválidas');

    const conEspacios = iniciarSesion('   ADMIN@FERREFIX.CL   ', 'admin123');
    expect(conEspacios.ok).toBe(true);
    expect(conEspacios.usuario.email).toBe('admin@ferrefix.cl');
  });
});
