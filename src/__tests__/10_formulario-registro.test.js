// Test: Formulario Registro: acepta nombre, correo y contraseña válidos, rechaza una contraseña de 5 caracteres y acepta los límites mínimos de 3 y 6 caracteres
// Función: validarFormulario()

import { describe, test, expect } from 'vitest';
import { validarFormulario, validadores } from '../data/validaciones.js';

const REGLAS_REGISTRO = {
  nombre: validadores.nombre,
  email: validadores.email,
  password: validadores.password
};

describe('Formulario Registro de Cliente', () => {
  test('Formulario Registro: acepta nombre, correo y contraseña válidos, rechaza una contraseña de 5 caracteres y acepta los límites mínimos de 3 y 6 caracteres', () => {
    const correcto = validarFormulario(REGLAS_REGISTRO, {
      nombre: 'Juan Pérez',
      email: 'juan@ferrefix.cl',
      password: 'segura123'
    });
    expect(Object.keys(correcto)).toHaveLength(0);

    const passwordCorta = validarFormulario(REGLAS_REGISTRO, {
      nombre: 'Juan Pérez',
      email: 'juan@ferrefix.cl',
      password: '12345'
    });
    expect(passwordCorta.password).toContain('6 caracteres');
    expect(passwordCorta.nombre).toBeUndefined();
    expect(passwordCorta.email).toBeUndefined();

    const enElLimite = validarFormulario(REGLAS_REGISTRO, {
      nombre: 'Ana',
      email: 'ana@correo.cl',
      password: '123456'
    });
    expect(Object.keys(enElLimite)).toHaveLength(0);
  });
});
