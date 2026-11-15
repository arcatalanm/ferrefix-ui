import { describe, it, expect } from 'vitest';
import {
  contarPor, rangoPrecios, filtrarItems, ordenarItems, leerFiltros, escribirFiltros, hayFiltrosActivos,
} from '../utils/filtros';

const maquinas = [
  { nombre: 'Betonera', marca: 'Ingco', categoria: 'Hormigón', tarifaDia: 18990, estado: 'Disponible' },
  { nombre: 'Generador', marca: 'Krafter', categoria: 'Energía', tarifaDia: 24990, estado: 'Disponible' },
  { nombre: 'Martillo', marca: 'Bosch', categoria: 'Demolición', tarifaDia: 28990, estado: 'Mantención' },
  { nombre: 'Placa', marca: 'Ingco', categoria: 'Compactación', tarifaDia: 22990, estado: 'Disponible' },
];
const cfg = { campoPrecio: 'tarifaDia', disponible: (m) => m.estado === 'Disponible' };
const base = { q: '', categoria: '', marcas: [], precioMin: null, precioMax: null, soloDisponibles: false };

describe('filtros', () => {
  it('cuenta por campo', () => {
    expect(contarPor(maquinas, 'marca')).toEqual([
      { valor: 'Bosch', cantidad: 1 }, { valor: 'Ingco', cantidad: 2 }, { valor: 'Krafter', cantidad: 1 },
    ]);
  });
  it('calcula el rango de precios', () => {
    expect(rangoPrecios(maquinas, 'tarifaDia')).toEqual({ min: 18990, max: 28990 });
    expect(rangoPrecios([], 'tarifaDia')).toEqual({ min: 0, max: 0 });
  });
  it('filtra por texto sin tildes ni mayúsculas', () => {
    expect(filtrarItems(maquinas, { ...base, q: 'MARTILLÓ' }, cfg)).toHaveLength(1);
    expect(filtrarItems(maquinas, { ...base, q: 'hormigon' }, { ...cfg, camposTexto: ['nombre', 'categoria'] })).toHaveLength(1);
  });
  it('filtra por marca, precio y disponibilidad', () => {
    expect(filtrarItems(maquinas, { ...base, marcas: ['ingco'] }, cfg)).toHaveLength(2);
    expect(filtrarItems(maquinas, { ...base, precioMin: 20000, precioMax: 25000 }, cfg).map((m) => m.nombre)).toEqual(['Generador', 'Placa']);
    expect(filtrarItems(maquinas, { ...base, soloDisponibles: true }, cfg)).toHaveLength(3);
  });
  it('combina filtros', () => {
    expect(filtrarItems(maquinas, { ...base, marcas: ['Ingco'], categoria: 'compactación' }, cfg).map((m) => m.nombre)).toEqual(['Placa']);
  });
  it('ordena', () => {
    expect(ordenarItems(maquinas, 'precio-desc', 'tarifaDia')[0].nombre).toBe('Martillo');
    expect(ordenarItems(maquinas, 'nombre-asc', 'tarifaDia')[0].nombre).toBe('Betonera');
    expect(ordenarItems(maquinas, 'default', 'tarifaDia').map((m) => m.nombre)).toEqual(maquinas.map((m) => m.nombre));
  });
  it('lee y escribe filtros en la URL', () => {
    const url = escribirFiltros(new URLSearchParams(), { marcas: ['Ingco', 'Bosch'], precioMin: 100, soloDisponibles: true, categoria: 'Energía' });
    const f = leerFiltros(url);
    expect(f.marcas).toEqual(['Ingco', 'Bosch']);
    expect(f.precioMin).toBe(100); expect(f.soloDisponibles).toBe(true); expect(f.categoria).toBe('Energía');
    const limpio = escribirFiltros(url, { marcas: [], soloDisponibles: false, precioMin: null });
    expect(leerFiltros(limpio).marcas).toEqual([]);
    expect(limpio.has('disp')).toBe(false);
  });
  it('trata "Todas" como sin categoría y detecta filtros activos', () => {
    expect(leerFiltros(new URLSearchParams('categoria=Todas')).categoria).toBe('');
    expect(hayFiltrosActivos(leerFiltros(new URLSearchParams()))).toBe(false);
    expect(hayFiltrosActivos(leerFiltros(new URLSearchParams('q=a')))).toBe(true);
  });
});
