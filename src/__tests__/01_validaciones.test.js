import { describe, it, expect } from 'vitest';
import { validarRut, validadores } from '../data/validaciones.js';

// MÓDULO 1: validarRut
describe('Módulo 1: validarRut', () => {
  it('1. Caso correcto: valida un RUT chileno con dígito verificador numérico', () => {
    expect(validarRut('11.111.111-1')).toBe(true);
  });

  it('2. Caso de error: rechaza un RUT cuando el dígito verificador es incorrecto', () => {
    expect(validarRut('11.111.111-2')).toBe(false);
  });

  it('3. Caso borde: acepta RUT válido con dígito verificador K en minúscula', () => {
    expect(validarRut('10.000.013-k')).toBe(true);
  });

  it('4. Caso fuera del negocio: retorna false si el valor recibido es null', () => {
    expect(validarRut(null)).toBe(false);
  });
});

// MÓDULO 2: validadores.email
describe('Módulo 2: validadores.email', () => {
  it('5. Caso correcto: retorna string vacío cuando el correo tiene formato válido', () => {
    expect(validadores.email('contacto@ferrefix.cl')).toBe('');
  });

  it('6. Caso de error: retorna mensaje de error si el correo no tiene formato válido', () => {
    expect(validadores.email('correo-sin-arroba')).toBe('Ingresa un correo válido (ej: nombre@correo.cl).');
  });

  it('7. Caso borde: indica obligatoriedad cuando el string está vacío', () => {
    expect(validadores.email('')).toBe('El correo electrónico es obligatorio.');
  });

  it('8. Caso fuera del negocio: maneja valor undefined indicando campo obligatorio', () => {
    expect(validadores.email(undefined)).toBe('El correo electrónico es obligatorio.');
  });
});

// MÓDULO 3: validadores.nombre
describe('Módulo 3: validadores.nombre', () => {
  it('9. Caso correcto: acepta un nombre válido con apellidos', () => {
    expect(validadores.nombre('Juan Carlos Pérez')).toBe('');
  });

  it('10. Caso de error: rechaza nombres que contengan números', () => {
    expect(validadores.nombre('Juan 123')).toBe('El nombre no puede contener números.');
  });

  it('11. Caso borde: rechaza nombres con longitud menor al mínimo de 3 caracteres', () => {
    expect(validadores.nombre('Al')).toBe('El nombre debe tener al menos 3 caracteres.');
  });

  it('12. Caso fuera del negocio: maneja valor null indicando que el nombre es obligatorio', () => {
    expect(validadores.nombre(null)).toBe('El nombre es obligatorio.');
  });
});

// MÓDULO 4: validadores.telefono
describe('Módulo 4: validadores.telefono', () => {
  it('13. Caso correcto: acepta un teléfono móvil chileno válido con prefijo +56', () => {
    expect(validadores.telefono('+56 9 1234 5678')).toBe('');
  });

  it('14. Caso de error: rechaza números con cantidad insuficiente de dígitos', () => {
    expect(validadores.telefono('12345')).toBe('Teléfono chileno inválido (ej: +56 9 1234 5678).');
  });

  it('15. Caso borde: indica obligatoriedad ante un string vacío', () => {
    expect(validadores.telefono('')).toBe('El teléfono es obligatorio.');
  });

  it('16. Caso fuera del negocio: maneja valor null indicando campo obligatorio', () => {
    expect(validadores.telefono(null)).toBe('El teléfono es obligatorio.');
  });
});

// MÓDULO 5: validadores.direccion
describe('Módulo 5: validadores.direccion', () => {
  it('17. Caso correcto: acepta una dirección con numeración y caracteres válidos', () => {
    expect(validadores.direccion('Av. Antonio Varas #666, Providencia')).toBe('');
  });

  it('18. Caso de error: rechaza direcciones con caracteres prohibidos no autorizados', () => {
    expect(validadores.direccion('Casa $%%')).toBe('La dirección contiene caracteres no permitidos.');
  });

  it('19. Caso borde: rechaza direcciones con menos de 5 caracteres mínimos', () => {
    expect(validadores.direccion('Av 1')).toBe('La dirección debe tener al menos 5 caracteres.');
  });

  it('20. Caso fuera del negocio: maneja valor undefined indicando campo obligatorio', () => {
    expect(validadores.direccion(undefined)).toBe('La dirección es obligatoria.');
  });
});
