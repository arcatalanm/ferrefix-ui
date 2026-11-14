

import { describe, test, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid.jsx';

const productosMock = [
  { idProducto: '1', nombre: 'Taladro', marca: 'DeWalt', precioVenta: 100000, imagen: '/a.webp' },
  { idProducto: '2', nombre: 'Sierra', marca: 'Makita', precioVenta: 150000, imagen: '/b.webp' }
];

const renderizar = (productos, onResetFilters) =>
  render(
    <MemoryRouter>
      <ProductGrid productos={productos} onResetFilters={onResetFilters} />
    </MemoryRouter>
  );

describe('Componente ProductGrid', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test('ProductGrid: renderiza una tarjeta con enlace por cada producto, muestra el estado vacío sin botón y ejecuta el callback de restablecer filtros cuando existe', () => {
    renderizar(productosMock);
    expect(screen.getByText('Taladro')).toBeTruthy();
    expect(screen.getByText('Sierra')).toBeTruthy();
    // Cada tarjeta tiene dos enlaces al detalle: la imagen y el título.
    const enlaces = screen.getAllByRole('link');
    expect(enlaces).toHaveLength(4);
    expect(enlaces.map((enlace) => enlace.getAttribute('href')))
      .toEqual(['/producto/1', '/producto/1', '/producto/2', '/producto/2']);

    cleanup();
    renderizar([]);
    expect(screen.getByText('No se encontraron productos')).toBeTruthy();
    expect(screen.queryByText('Restablecer filtros')).toBeNull();

    cleanup();
    const onResetFilters = vi.fn();
    renderizar([], onResetFilters);
    const boton = screen.getByText('Restablecer filtros');
    fireEvent.click(boton);
    expect(onResetFilters).toHaveBeenCalledTimes(1);
  });
});
