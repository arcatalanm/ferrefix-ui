// ============================================================
// FORMULARIOS — Pruebas de integración de validarFormulario()
//
// Estos tests verifican el comportamiento REAL de los formularios
// del sistema: Login/Registro, Cotización y Checkout del Carrito.
// Se testea validarFormulario() con las reglas exactas que usa
// cada página, no reglas inventadas — base en el código real.
// ============================================================
import { describe, it, expect } from 'vitest';
import { validarFormulario, validadores } from '../data/validaciones.js';

// ─── Reglas por formulario (copiadas del código de cada página) ─
const REGLAS_LOGIN = {
  email: validadores.email,
  password: validadores.requerido('La contraseña')
};

const REGLAS_REGISTRO = {
  nombre: validadores.nombre,
  email: validadores.email,
  password: validadores.password
};

const REGLAS_COTIZACION = {
  nombre: validadores.razonSocial,
  rut: validadores.rut,
  email: validadores.email,
  telefono: validadores.telefono,
  detalle: validadores.detalle
};

const REGLAS_CHECKOUT = {
  nombre: validadores.nombre,
  rut: validadores.rut,
  email: validadores.email,
  telefono: validadores.telefono,
  direccion: validadores.direccion,
  comuna: validadores.requerido('La comuna')
};

// ─── FORMULARIO 1: Login ────────────────────────────────────
describe('Formulario Login — validarFormulario(REGLAS_LOGIN)', () => {
  it('F1. Caso correcto: sin errores con credenciales bien formadas', () => {
    const errores = validarFormulario(REGLAS_LOGIN, {
      email: 'admin@ferrefix.cl',
      password: 'admin123'
    });
    expect(Object.keys(errores).length).toBe(0);
  });

  it('F2. Caso de error: detecta email inválido y contraseña vacía simultáneamente', () => {
    const errores = validarFormulario(REGLAS_LOGIN, {
      email: 'no-es-email',
      password: ''
    });
    expect(errores.email).toBeTruthy();
    expect(errores.password).toBeTruthy();
    expect(Object.keys(errores).length).toBe(2);
  });

  it('F3. Caso borde: falla solo en email cuando la contraseña es válida', () => {
    const errores = validarFormulario(REGLAS_LOGIN, {
      email: '',
      password: 'abc123'
    });
    expect(errores.email).toBeTruthy();
    expect(errores.password).toBeUndefined();
  });

  it('F4. Caso fuera del negocio: objeto vacío produce error en todos los campos requeridos', () => {
    const errores = validarFormulario(REGLAS_LOGIN, {});
    expect(Object.keys(errores).length).toBe(2);
  });
});

// ─── FORMULARIO 2: Registro ─────────────────────────────────
describe('Formulario Registro — validarFormulario(REGLAS_REGISTRO)', () => {
  it('F5. Caso correcto: sin errores con nombre, email y contraseña válidos', () => {
    const errores = validarFormulario(REGLAS_REGISTRO, {
      nombre: 'Juan Pérez',
      email: 'juan@ferrefix.cl',
      password: 'segura123'
    });
    expect(Object.keys(errores).length).toBe(0);
  });

  it('F6. Caso de error: contraseña menor a 6 caracteres genera error específico', () => {
    const errores = validarFormulario(REGLAS_REGISTRO, {
      nombre: 'Juan Pérez',
      email: 'juan@ferrefix.cl',
      password: '123'
    });
    expect(errores.password).toContain('6 caracteres');
  });

  it('F7. Caso borde: nombre con números genera error y los otros campos pasan', () => {
    const errores = validarFormulario(REGLAS_REGISTRO, {
      nombre: 'Juan123',
      email: 'juan@correo.cl',
      password: 'valida99'
    });
    expect(errores.nombre).toContain('números');
    expect(errores.email).toBeUndefined();
    expect(errores.password).toBeUndefined();
  });

  it('F8. Caso fuera del negocio: todos los campos undefined producen 3 errores obligatorios', () => {
    const errores = validarFormulario(REGLAS_REGISTRO, {
      nombre: undefined,
      email: undefined,
      password: undefined
    });
    expect(Object.keys(errores).length).toBe(3);
  });
});

// ─── FORMULARIO 3: Cotización ───────────────────────────────
describe('Formulario Cotización — validarFormulario(REGLAS_COTIZACION)', () => {
  it('F9. Caso correcto: sin errores con todos los campos del formulario válidos', () => {
    const errores = validarFormulario(REGLAS_COTIZACION, {
      nombre: 'Constructora ABC Ltda.',
      rut: '76.123.456-0',
      email: 'contacto@constructora.cl',
      telefono: '+56 9 8765 4321',
      detalle: 'Necesito cotización de 50 sacos de cemento para obra.'
    });
    expect(Object.keys(errores).length).toBe(0);
  });

  it('F10. Caso de error: RUT con dígito verificador incorrecto genera error en campo rut', () => {
    const errores = validarFormulario(REGLAS_COTIZACION, {
      nombre: 'Empresa Válida Ltda.',
      rut: '76.123.456-7',       // DV incorrecto
      email: 'ok@empresa.cl',
      telefono: '+56 9 1234 5678',
      detalle: 'Cotización de materiales para proyecto de construcción.'
    });
    expect(errores.rut).toBeTruthy();
    expect(errores.nombre).toBeUndefined();
  });

  it('F11. Caso borde: detalle con menos de 10 caracteres genera error de longitud mínima', () => {
    const errores = validarFormulario(REGLAS_COTIZACION, {
      nombre: 'Empresa OK Ltda.',
      rut: '76.123.456-0',
      email: 'ok@empresa.cl',
      telefono: '+56 9 1234 5678',
      detalle: 'Poco.'             // < 10 caracteres
    });
    expect(errores.detalle).toContain('10 caracteres');
  });

  it('F12. Caso fuera del negocio: formulario vacío produce errores en los 5 campos obligatorios', () => {
    const errores = validarFormulario(REGLAS_COTIZACION, {});
    expect(Object.keys(errores).length).toBe(5);
  });
});

// ─── FORMULARIO 4: Checkout del Carrito ─────────────────────
describe('Formulario Checkout — validarFormulario(REGLAS_CHECKOUT)', () => {
  it('F13. Caso correcto: sin errores con datos de despacho completos y válidos', () => {
    const errores = validarFormulario(REGLAS_CHECKOUT, {
      nombre: 'María González',
      rut: '11.111.111-1',
      email: 'maria@correo.cl',
      telefono: '+56 9 9876 5432',
      direccion: 'Av. Providencia 1234, Depto 5B',
      comuna: 'Providencia'
    });
    expect(Object.keys(errores).length).toBe(0);
  });

  it('F14. Caso de error: dirección con caracteres prohibidos ($, %) genera error específico', () => {
    const errores = validarFormulario(REGLAS_CHECKOUT, {
      nombre: 'Pedro Soto',
      rut: '11.111.111-1',
      email: 'pedro@correo.cl',
      telefono: '+56 9 1111 2222',
      direccion: 'Calle $%& inválida',
      comuna: 'Santiago'
    });
    expect(errores.direccion).toContain('no permitidos');
  });

  it('F15. Caso borde: comuna vacía genera error y el resto de campos válidos no falla', () => {
    const errores = validarFormulario(REGLAS_CHECKOUT, {
      nombre: 'Ana López',
      rut: '11.111.111-1',
      email: 'ana@correo.cl',
      telefono: '+56 9 3333 4444',
      direccion: 'Los Aromos 456, Las Condes',
      comuna: ''                   // vacía
    });
    expect(errores.comuna).toBeTruthy();
    expect(errores.nombre).toBeUndefined();
    expect(errores.email).toBeUndefined();
  });

  it('F16. Caso fuera del negocio: formulario completamente vacío genera los 6 errores requeridos', () => {
    const errores = validarFormulario(REGLAS_CHECKOUT, {});
    expect(Object.keys(errores).length).toBe(6);
  });
});
