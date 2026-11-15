import { describe, it, expect, beforeEach } from 'vitest';
import { obtenerDescripcionMaquina, guardarDescripcionMaquina } from '../data/descripcionesMaquina';

describe('descripciones de maquinaria (guardado local)', () => {
  beforeEach(() => localStorage.clear());

  it('devuelve vacío si no hay descripción', () => {
    expect(obtenerDescripcionMaquina('MAQ-1')).toBe('');
  });
  it('guarda y recupera por máquina', () => {
    guardarDescripcionMaquina('MAQ-1', '<p>Hola</p>');
    guardarDescripcionMaquina('MAQ-2', '<p>Otra</p>');
    expect(obtenerDescripcionMaquina('MAQ-1')).toBe('<p>Hola</p>');
    expect(obtenerDescripcionMaquina('MAQ-2')).toBe('<p>Otra</p>');
  });
  it('guardar vacío elimina la descripción', () => {
    guardarDescripcionMaquina('MAQ-1', '<p>Hola</p>');
    guardarDescripcionMaquina('MAQ-1', '');
    expect(obtenerDescripcionMaquina('MAQ-1')).toBe('');
  });
  it('ignora datos corruptos en el almacenamiento', () => {
    localStorage.setItem('ferrefix:descripciones_maquina', '{no es json');
    expect(obtenerDescripcionMaquina('MAQ-1')).toBe('');
  });
});
