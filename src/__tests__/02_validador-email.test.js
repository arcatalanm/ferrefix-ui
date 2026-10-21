// Test: validadores.email: acepta un correo con formato válido, rechaza un correo sin arroba y exige el campo cuando solo hay espacios
// Función: validadores.email()

import { describe, test, expect } from 'vitest';
import { validadores } from '../data/validaciones.js';

describe('Validador de correo electrónico', () => {
  test('validadores.email: acepta un correo con formato válido, rechaza un correo sin arroba y exige el campo cuando solo hay espacios', () => {
    expect(validadores.email('contacto@ferrefix.cl')).toBe('');

    expect(validadores.email('correo-sin-arroba')).toBe(
      'Ingresa un correo válido (ej: nombre@correo.cl).'
    );

    expect(validadores.email('   ')).toBe('El correo electrónico es obligatorio.');
  });
});
