// Test: Formulario Login: acepta credenciales bien formadas, detecta email inválido y contraseña vacía, y valida un email con espacios adicionales
// Función: validarFormulario()

import { describe, test, expect } from 'vitest';
import { validarFormulario, validadores } from '../data/validaciones.js';

const REGLAS_LOGIN = {
  email: validadores.email,
  password: validadores.requerido('La contraseña')
};

describe('Formulario Login', () => {
  test('Formulario Login: acepta credenciales bien formadas, detecta email inválido y contraseña vacía, y valida un email con espacios adicionales', () => {
    const correcto = validarFormulario(REGLAS_LOGIN, {
      email: 'admin@ferrefix.cl',
      password: 'admin123'
    });
    expect(Object.keys(correcto)).toHaveLength(0);

    const conErrores = validarFormulario(REGLAS_LOGIN, {
      email: 'no-es-email',
      password: ''
    });
    expect(conErrores.email).toBeTruthy();
    expect(conErrores.password).toBeTruthy();
    expect(Object.keys(conErrores)).toHaveLength(2);

    const conEspacios = validarFormulario(REGLAS_LOGIN, {
      email: '  admin@ferrefix.cl  ',
      password: 'admin123'
    });
    expect(conEspacios.email).toBeUndefined();
    expect(conEspacios.password).toBeUndefined();
    expect(Object.keys(conEspacios)).toHaveLength(0);
  });
});
