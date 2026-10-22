// Test: crearOrden: genera una orden nueva con id mockeado, aplica el estado "Completada" ante un estado vacío y construye una orden segura con objeto vacío
// Función: crearOrden()

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { crearOrden, obtenerOrdenes } from '../data/ordenes.js';

describe('Órdenes — crearOrden (con mock de Date.now)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(Date, 'now').mockReturnValue(1000000000042);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('crearOrden: genera una orden nueva con id mockeado, aplica el estado "Completada" ante un estado vacío y construye una orden segura con objeto vacío', () => {
    const orden = crearOrden({
      cliente: { nombre: 'Cliente Orden' },
      total: 45990
    });
    expect(orden.idOrden).toBe('ORD-2024-000042');
    expect(orden.estado).toBe('Completada');
    expect(obtenerOrdenes()[0].idOrden).toBe('ORD-2024-000042');

    const sinEstado = crearOrden({
      cliente: { nombre: 'Cliente Sin Estado' },
      estado: ''
    });
    expect(sinEstado.estado).toBe('Completada');

    const vacia = crearOrden({});
    expect(vacia.idOrden).toBeDefined();
    expect(vacia.fecha).toBeDefined();
  });
});
