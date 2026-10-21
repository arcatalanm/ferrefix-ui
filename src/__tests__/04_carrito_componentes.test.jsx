import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { agregarAlCarrito, obtenerTotalesCarrito, vaciarCarrito } from '../data/carrito.js';
import ProductCard from '../components/ProductCard.jsx';

// MÓDULO 11: agregarAlCarrito
describe('Módulo 11: agregarAlCarrito', () => {
  beforeEach(() => {
    vaciarCarrito();
  });

  it('41. Caso correcto: añade un producto al carrito cuando hay stock disponible', () => {
    const prod = { idProducto: '101', nombre: 'Esmeril', stock: 10, precioVenta: 45000 };
    const res = agregarAlCarrito(prod, 2);
    expect(res.ok).toBe(true);
    expect(res.cantidadTotal).toBe(2);
  });

  it('42. Caso de error: rechaza agregar cuando la cantidad solicitada excede el stock disponible', () => {
    const prod = { idProducto: '102', nombre: 'Sierra', stock: 3, precioVenta: 80000 };
    const res = agregarAlCarrito(prod, 5);
    expect(res.ok).toBe(false);
    expect(res.error).toContain('disponibles en stock');
  });

  it('43. Caso borde: rechaza inmediatamente si el producto tiene stock cero (agotado)', () => {
    const prod = { idProducto: '103', nombre: 'Pintura', stock: 0, precioVenta: 15000 };
    const res = agregarAlCarrito(prod, 1);
    expect(res.ok).toBe(false);
    expect(res.error).toContain('no cuenta con stock');
  });

  it('44. Caso fuera del negocio: retorna error si el producto es null o indefinido', () => {
    const res = agregarAlCarrito(null, 1);
    expect(res.ok).toBe(false);
  });
});

// MÓDULO 12: obtenerTotalesCarrito
describe('Módulo 12: obtenerTotalesCarrito', () => {
  beforeEach(() => {
    vaciarCarrito();
  });

  it('45. Caso correcto: aplica despacho gratis ($0) cuando la compra supera los $50.000', () => {
    const prod = { idProducto: '201', nombre: 'Generador', stock: 5, precioVenta: 60000 };
    agregarAlCarrito(prod, 1);
    const totales = obtenerTotalesCarrito();
    expect(totales.subtotal).toBe(60000);
    expect(totales.despacho).toBe(0);
    expect(totales.total).toBe(60000);
  });

  it('46. Caso con cobro: aplica despacho de $3.990 cuando el subtotal es inferior a $50.000', () => {
    const prod = { idProducto: '202', nombre: 'Brocas', stock: 10, precioVenta: 20000 };
    agregarAlCarrito(prod, 1);
    const totales = obtenerTotalesCarrito();
    expect(totales.subtotal).toBe(20000);
    expect(totales.despacho).toBe(3990);
    expect(totales.total).toBe(23990);
  });

  it('47. Caso borde: calcula subtotales y despacho en cero cuando el carrito está vacío', () => {
    const totales = obtenerTotalesCarrito();
    expect(totales.totalArticulos).toBe(0);
    expect(totales.subtotal).toBe(0);
    expect(totales.despacho).toBe(0);
    expect(totales.total).toBe(0);
  });

  it('48. Caso fuera del negocio: retorna una estructura de totales consistente con tipos numéricos', () => {
    const totales = obtenerTotalesCarrito();
    expect(typeof totales.subtotal).toBe('number');
    expect(typeof totales.total).toBe('number');
    expect(typeof totales.despacho).toBe('number');
  });
});

// MÓDULO 13: Componente <ProductCard />
describe('Módulo 13: Componente <ProductCard />', () => {
  const productoMock = {
    idProducto: '5422223214',
    nombre: 'Taladro Percutor Inalámbrico 20V',
    marca: 'DeWalt',
    precioVenta: 129990,
    imagen: '/taladro.webp'
  };

  it('49. Caso correcto: renderiza el nombre y la marca del producto en el DOM virtual', () => {
    render(
      <MemoryRouter>
        <ProductCard producto={productoMock} />
      </MemoryRouter>
    );
    expect(screen.getByText('Taladro Percutor Inalámbrico 20V')).toBeTruthy();
    expect(screen.getByText('DeWalt')).toBeTruthy();
  });

  it('50. Caso de precio: formatea y muestra el precio en pesos chilenos ($ CLP)', () => {
    render(
      <MemoryRouter>
        <ProductCard producto={productoMock} />
      </MemoryRouter>
    );
    expect(screen.getByText(/\$129\.990/)).toBeTruthy();
  });

  it('51. Caso borde: renderiza el enlace hacia la ruta de detalle envuelto en MemoryRouter', () => {
    render(
      <MemoryRouter>
        <ProductCard producto={productoMock} />
      </MemoryRouter>
    );
    const link = screen.getByRole('link');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/producto/5422223214');
  });

  it('52. Caso fuera del negocio: maneja producto null sin generar excepciones en pantalla', () => {
    const { container } = render(
      <MemoryRouter>
        <ProductCard producto={null} />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });
});
