// Test: ProductCard: renderiza nombre, marca, precio y enlace de detalle, no falla con producto null y usa la imagen de respaldo cuando falta la imagen
// Función: ProductCard()

import { describe, test, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';

const productoMock = {
  idProducto: '5422223214',
  nombre: 'Taladro Percutor Inalámbrico 20V',
  marca: 'DeWalt',
  precioVenta: 129990,
  imagen: '/taladro.webp'
};

const renderizar = (producto) =>
  render(
    <MemoryRouter>
      <ProductCard producto={producto} />
    </MemoryRouter>
  );

describe('Componente ProductCard', () => {
  afterEach(() => {
    cleanup();
  });

  test('ProductCard: renderiza nombre, marca, precio y enlace de detalle, no falla con producto null y usa la imagen de respaldo cuando falta la imagen', () => {
    renderizar(productoMock);
    expect(screen.getByText('Taladro Percutor Inalámbrico 20V')).toBeTruthy();
    expect(screen.getByText('DeWalt')).toBeTruthy();
    expect(screen.getByText(/\$129\.990/)).toBeTruthy();
    const enlace = screen.getByRole('link');
    expect(enlace.getAttribute('href')).toBe('/producto/5422223214');
    expect(screen.getByRole('img').getAttribute('alt')).toBe(
      'Taladro Percutor Inalámbrico 20V'
    );

    const sinProducto = renderizar(null);
    expect(sinProducto.container.firstChild).toBeNull();
    cleanup();

    renderizar({ idProducto: '999', nombre: 'Producto Básico', precioVenta: 0 });
    const imagenRespaldo = screen.getByRole('img').getAttribute('src');
    expect(imagenRespaldo).toBe('/producto-sin-imagen.svg');
    expect(screen.getByText(/\$0/)).toBeTruthy();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/producto/999');
  });
});
