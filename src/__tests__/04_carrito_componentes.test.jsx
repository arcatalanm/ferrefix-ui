// ============================================================
// MÓDULOS 11–13: Carrito y Componente ProductCard
// ============================================================
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { agregarAlCarrito, obtenerTotalesCarrito, vaciarCarrito } from '../data/carrito.js';
import ProductCard from '../components/ProductCard.jsx';

// ─── MÓDULO 11: agregarAlCarrito ────────────────────────────
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

// ─── MÓDULO 12: obtenerTotalesCarrito ──────────────────────
// FIX #46 — Renombrado: no es "caso de error" (cobrar despacho es comportamiento correcto).
// FIX #48 — Fortalecido: además de typeof, se verifica que los valores sean >= 0
//           y que subtotal y total sean iguales al calcular con carrito vacío.
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

  // FIX #46 — Era "caso de error" pero cobrar despacho es una regla de negocio normal.
  it('46. Caso borde: aplica despacho de $3.990 cuando el subtotal no supera los $50.000', () => {
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

  // FIX #48 — Fortalecido: no solo typeof, también se validan los valores específicos
  // y que la suma subtotal + despacho === total (consistencia interna).
  it('48. Caso fuera del negocio: retorna estructura numérica consistente (tipos y coherencia aritmética)', () => {
    // Se agrega un producto para tener valores no triviales
    const prod = { idProducto: '203', nombre: 'Destornillador', stock: 5, precioVenta: 30000 };
    agregarAlCarrito(prod, 1);
    const totales = obtenerTotalesCarrito();

    // Tipos correctos
    expect(typeof totales.subtotal).toBe('number');
    expect(typeof totales.total).toBe('number');
    expect(typeof totales.despacho).toBe('number');

    // Valores no negativos
    expect(totales.subtotal).toBeGreaterThanOrEqual(0);
    expect(totales.despacho).toBeGreaterThanOrEqual(0);
    expect(totales.total).toBeGreaterThan(0);

    // Coherencia aritmética: total = subtotal + despacho
    expect(totales.total).toBe(totales.subtotal + totales.despacho);
  });
});

// ─── MÓDULO 13: Componente <ProductCard /> ──────────────────
// FIX #50 — Renombrado: mostrar precio formateado es comportamiento correcto, no "caso de error".
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

  // FIX #50 — Era "caso de error" pero formatear y mostrar el precio es comportamiento correcto.
  it('50. Caso borde: formatea y muestra el precio en pesos chilenos ($ CLP)', () => {
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
