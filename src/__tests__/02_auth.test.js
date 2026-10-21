// ============================================================
// MÓDULOS 6–7: Autenticación
// FIX #02 — se eliminó el import de beforeEach que no se usaba.
// ============================================================
import { describe, it, expect, vi } from 'vitest';
import { iniciarSesion, registrarUsuario } from '../data/auth.js';

// ─── MÓDULO 6: iniciarSesion ────────────────────────────────
describe('Módulo 6: iniciarSesion', () => {
  it('21. Caso correcto: inicia sesión con credenciales válidas registradas', () => {
    const res = iniciarSesion('admin@ferrefix.cl', 'admin123');
    expect(res.ok).toBe(true);
    expect(res.usuario.rol).toBe('admin');
  });

  it('22. Caso de error: rechaza el acceso ante una contraseña equivocada', () => {
    const res = iniciarSesion('admin@ferrefix.cl', 'password_errada');
    expect(res.ok).toBe(false);
    expect(res.mensaje).toContain('Credenciales inválidas');
  });

  it('23. Caso borde: procesa correctamente el correo con espacios adicionales y mayúsculas', () => {
    const res = iniciarSesion('   ADMIN@FERREFIX.CL   ', 'admin123');
    expect(res.ok).toBe(true);
  });

  it('24. Caso fuera del negocio: rechaza inicio de sesión para un usuario no existente', () => {
    const res = iniciarSesion('inexistente@correo.cl', '123456');
    expect(res.ok).toBe(false);
  });
});

// ─── MÓDULO 7: registrarUsuario ─────────────────────────────
describe('Módulo 7: registrarUsuario', () => {
  it('25. Caso correcto: registra exitosamente un nuevo cliente con datos válidos', () => {
    const res = registrarUsuario({
      nombre: 'Nuevo Cliente',
      email: 'cliente_test_25@ferrefix.cl',
      password: 'password123'
    });
    expect(res.ok).toBe(true);
    expect(res.usuario.email).toBe('cliente_test_25@ferrefix.cl');
  });

  it('26. Caso de error: rechaza el registro cuando el correo ya existe en el sistema', () => {
    const res = registrarUsuario({
      nombre: 'Admin Duplicado',
      email: 'admin@ferrefix.cl',
      password: 'admin123'
    });
    expect(res.ok).toBe(false);
    expect(res.mensaje).toContain('Ya existe una cuenta registrada');
  });

  it('27. Caso borde: normaliza a minúsculas y elimina espacios en el correo al registrar', () => {
    const res = registrarUsuario({
      nombre: 'Cliente Con Espacios',
      email: '  NUEVO_CLIENTE_27@CORREO.CL  ',
      password: 'pass'
    });
    expect(res.ok).toBe(true);
    expect(res.usuario.email).toBe('nuevo_cliente_27@correo.cl');
  });

  // FIX #28 — Caso distinto al 26: aquí se verifica que el código lanza TypeError
  // cuando se pasa email: null, lo cual documenta una limitación real de la función.
  // Usar toThrow es la aserción correcta para este comportamiento fuera del negocio.
  it('28. Caso fuera del negocio: lanza error si el correo enviado es null (dato de tipo incorrecto)', () => {
    expect(() => {
      registrarUsuario({ nombre: 'Sin Email', email: null, password: '1234' });
    }).toThrow();
  });
});
