// ============================================================
// MÓDULOS 8–10: Productos y Órdenes
//
// NOTA SOBRE EL USO DE MOCKS (vi.spyOn / vi.mock):
// ------------------------------------------------------------
// En este proyecto Vitest corre con jsdom, lo que significa que
// localStorage ya existe y su comportamiento es predecible y
// determinista: siempre guarda, siempre retorna lo que se guardó.
// Por eso NO se mockea localStorage en ningún módulo — hacerlo
// solo agregaría complejidad sin aportar valor real al test.
//
// El ÚNICO mock aplicado es vi.spyOn(Date, 'now') en el Módulo 10
// (crearOrden), porque Date.now() es NO determinista: su valor
// cambia en cada ejecución y forma parte del idOrden generado.
// Al fijarlo, el test 39 puede verificar el idOrden exacto en
// lugar de solo el prefijo — eso sí hace el test más robusto.
//
// Regla aplicada: se mockea lo que no se puede predecir o controlar,
// no lo que ya se sabe cómo termina.
// ============================================================
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { crearProducto, actualizarProducto, obtenerProductos, restablecerProductos } from '../data/productos.js';
import { crearOrden } from '../data/ordenes.js';

// ─── MÓDULO 8: crearProducto ────────────────────────────────
describe('Módulo 8: crearProducto', () => {
  it('29. Caso correcto: crea e inserta un nuevo producto al catálogo con atributos válidos', () => {
    const nuevo = crearProducto({
      nombre: 'Martillo de Uña 16oz',
      marca: 'Stanley',
      precioVenta: 12990,
      stock: 15
    });
    expect(nuevo.idProducto).toBeDefined();
    expect(nuevo.nombre).toBe('Martillo de Uña 16oz');
    expect(nuevo.stock).toBe(15);
  });

  it('30. Caso borde: asigna imagen por defecto cuando se omite o viene vacía la URL', () => {
    const nuevo = crearProducto({
      nombre: 'Serrucho Manual',
      marca: 'Bahco',
      imagen: ''
    });
    expect(nuevo.imagen).toBeTruthy();
  });

  it('31. Caso borde: convierte valores de precio y stock de string a tipo numérico', () => {
    const nuevo = crearProducto({
      nombre: 'Cinta Métrica 5m',
      marca: 'Lufkin',
      precioVenta: '4990',
      stock: '25'
    });
    expect(typeof nuevo.precioVenta).toBe('number');
    expect(nuevo.precioVenta).toBe(4990);
    expect(typeof nuevo.stock).toBe('number');
    expect(nuevo.stock).toBe(25);
  });

  it('32. Caso fuera del negocio: asigna 0 por defecto si el stock no es numérico', () => {
    const nuevo = crearProducto({
      nombre: 'Clavos 2 Pulgadas',
      stock: 'invalido'
    });
    expect(nuevo.stock).toBe(0);
  });
});

// ─── MÓDULO 9: actualizarProducto ──────────────────────────
// Cada test crea su propio producto para no mutar el catálogo compartido.
describe('Módulo 9: actualizarProducto', () => {
  it('33. Caso correcto: actualiza el stock disponible de un producto creado en el test', () => {
    const prod = crearProducto({ nombre: 'Producto Test 33', stock: 50, precioVenta: 10000 });
    const actualizado = actualizarProducto(prod.idProducto, { stock: 99 });
    expect(actualizado).not.toBeNull();
    expect(actualizado.stock).toBe(99);
  });

  it('34. Caso de error: retorna null cuando el id de producto no existe en el catálogo', () => {
    const resultado = actualizarProducto('ID_FANTASMA_999999', { stock: 10 });
    expect(resultado).toBeNull();
  });

  it('35. Caso borde: actualiza únicamente el precio manteniendo intacto el stock actual', () => {
    const prod = crearProducto({ nombre: 'Producto Test 35', stock: 42, precioVenta: 5000 });
    const actualizado = actualizarProducto(prod.idProducto, { precioVenta: 88880 });
    expect(actualizado.precioVenta).toBe(88880);
    expect(actualizado.stock).toBe(42);
  });

  it('36. Caso fuera del negocio: maneja id null sin romper la aplicación y retorna null', () => {
    const resultado = actualizarProducto(null, { stock: 5 });
    expect(resultado).toBeNull();
  });
});

// ─── MÓDULO 10: crearOrden ──────────────────────────────────
// MOCK APLICADO: vi.spyOn(Date, 'now') → razón: Date.now() es no determinista.
// Su valor varía en cada ejecución y se incrusta en el idOrden generado
// (`ORD-2024-${Date.now().toString().slice(-6)}`). Al fijarlo, el test 39
// puede afirmar el idOrden exacto en lugar de solo verificar el prefijo.
describe('Módulo 10: crearOrden', () => {
  beforeEach(() => {
    // Fija Date.now() → slice(-6) producirá siempre "000042"
    vi.spyOn(Date, 'now').mockReturnValue(1000000000042);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('37. Caso correcto: genera una orden con prefijo de boleta BOL-2024- según la implementación', () => {
    const orden = crearOrden({
      cliente: { nombre: 'Cliente Boleta' },
      total: 45990
    });
    expect(orden.numeroBoleta).toContain('BOL-2024-');
    expect(orden.estado).toBe('Completada');
  });

  it('38. Caso borde: respeta el estado personalizado que se proporciona al crear la orden', () => {
    const orden = crearOrden({
      cliente: { nombre: 'Cliente Pendiente' },
      estado: 'En Preparación'
    });
    expect(orden.estado).toBe('En Preparación');
  });

  it('39. Caso borde: genera idOrden exacto usando el timestamp mockeado fijo (ORD-2024-000042)', () => {
    const orden = crearOrden({ total: 10000 });
    // Date.now() mockeado → slice(-6) = "000042" → valor predecible y verificable
    expect(orden.idOrden).toBe('ORD-2024-000042');
  });

  it('40. Caso fuera del negocio: genera una estructura de orden segura ante un objeto vacío', () => {
    const orden = crearOrden({});
    expect(orden.idOrden).toBeDefined();
    expect(orden.numeroBoleta).toBeDefined();
    expect(orden.fecha).toBeDefined();
  });
});
