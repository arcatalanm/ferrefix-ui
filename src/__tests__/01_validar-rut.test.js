// Test: validarRut: acepta un RUT válido, rechaza un dígito verificador incorrecto y normaliza la K minúscula
// Función: validarRut()

import { describe, test, expect } from 'vitest';
import { validarRut } from '../data/validaciones.js';

describe('Función validarRut', () => {
  test('validarRut: acepta un RUT válido, rechaza un dígito verificador incorrecto y normaliza la K minúscula', () => {
    expect(validarRut('11.111.111-1')).toBe(true);

    expect(validarRut('11.111.111-2')).toBe(false);

    expect(validarRut('10.000.013-k')).toBe(true);
  });
});
