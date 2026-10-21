// Test: registrarUsuario: crea un cliente nuevo con id mockeado, rechaza un correo ya registrado y normaliza el correo a minúsculas
// Función: registrarUsuario()

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { registrarUsuario, obtenerUsuarios, obtenerSesionActiva } from '../data/auth.js';

describe('Autenticación — registrarUsuario (con mock de Date.now)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(Date, 'now').mockReturnValue(1000000000042);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('registrarUsuario: crea un cliente nuevo con id mockeado, rechaza un correo ya registrado y normaliza el correo a minúsculas', () => {
    const correcto = registrarUsuario({
      nombre: 'Nuevo Cliente',
      email: 'nuevo@ferrefix.cl',
      password: 'password123'
    });
    expect(correcto.ok).toBe(true);
    expect(correcto.usuario.rol).toBe('cliente');
    expect(correcto.usuario.idUsuario).toBe('USR-000042');
    expect(obtenerSesionActiva().email).toBe('nuevo@ferrefix.cl');
    expect(obtenerUsuarios().some((u) => u.email === 'nuevo@ferrefix.cl')).toBe(true);

    const duplicado = registrarUsuario({
      nombre: 'Admin Duplicado',
      email: 'admin@ferrefix.cl',
      password: 'admin123'
    });
    expect(duplicado.ok).toBe(false);
    expect(duplicado.mensaje).toContain('Ya existe una cuenta registrada');

    const conEspacios = registrarUsuario({
      nombre: 'Cliente Con Espacios',
      email: '  NUEVO_CLIENTE_27@CORREO.CL  ',
      password: 'pass123'
    });
    expect(conEspacios.ok).toBe(true);
    expect(conEspacios.usuario.email).toBe('nuevo_cliente_27@correo.cl');
  });
});
