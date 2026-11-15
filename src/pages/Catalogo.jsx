import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import FiltroBusqueda from '../components/FiltroBusqueda';
import { contarPor, rangoPrecios, filtrarItems, ordenarItems, leerFiltros, escribirFiltros, hayFiltrosActivos } from '../utils/filtros';
import {
  obtenerProductos,
  CATEGORIAS_PRODUCTOS,
  EVENTO_PRODUCTOS_ACTUALIZADOS
} from '../data/productos';

function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [productos, setProductos] = useState(obtenerProductos);

  useEffect(() => {
    const handleActualizacion = () => {
      setProductos(obtenerProductos());
    };

    window.addEventListener(EVENTO_PRODUCTOS_ACTUALIZADOS, handleActualizacion);
    return () => {
      window.removeEventListener(EVENTO_PRODUCTOS_ACTUALIZADOS, handleActualizacion);
    };
  }, []);

  const filtros = leerFiltros(searchParams);
  const cambiarFiltros = (cambios) => setSearchParams(escribirFiltros(searchParams, cambios));
  const handleResetFilters = () => setSearchParams({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [filtros.categoria]);

  const categoriasProductos = useMemo(() => {
    const cuentas = new Map(contarPor(productos, 'categoria').map((c) => [c.valor.toLowerCase(), c.cantidad]));
    return CATEGORIAS_PRODUCTOS.filter((c) => c !== 'Todas').map((valor) => ({ valor, cantidad: cuentas.get(valor.toLowerCase()) || 0 }));
  }, [productos]);
  const rango = useMemo(() => rangoPrecios(productos, 'precioVenta'), [productos]);

  const productosFiltrados = useMemo(() => ordenarItems(
    filtrarItems(productos, filtros, { campoPrecio: 'precioVenta', camposTexto: ['nombre', 'marca'] }),
    filtros.orden, 'precioVenta'),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [productos, searchParams]);

  return (
    <div className="catalogo-page py-4 py-md-5">
      <div className="container">

        <div className="catalogo-header mb-4">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb catalogo-breadcrumb mb-2">
              <li className="breadcrumb-item"><a href="/">Inicio</a></li>
              <li className="breadcrumb-item active" aria-current="page">Catálogo de Productos</li>
            </ol>
          </nav>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h1 className="catalogo-titulo mb-1">Catálogo de Productos</h1>
              <p className="marca-parrafo mb-0">
                Explora nuestra variedad de herramientas, materiales de construcción y artículos de ferretería.
              </p>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-3">
            <FiltroBusqueda
              busqueda={{ valor: filtros.q, onChange: (v) => cambiarFiltros({ q: v }), placeholder: 'Nombre o marca (ej. Taladro, Bosch)', etiqueta: 'Buscar productos' }}
              categorias={{ opciones: categoriasProductos, seleccionada: filtros.categoria, onChange: (v) => cambiarFiltros({ categoria: v }) }}
              precio={{ ...rango, valorMin: filtros.precioMin, valorMax: filtros.precioMax, titulo: 'Precio',
                onChange: (min, max) => cambiarFiltros({ precioMin: min, precioMax: max }) }}
              marcas={{ opciones: contarPor(productos, 'marca'), seleccionadas: filtros.marcas, onChange: (v) => cambiarFiltros({ marcas: v }) }}
              hayFiltros={hayFiltrosActivos(filtros)}
              onLimpiar={handleResetFilters}
            />
          </div>
          <div className="col-12 col-lg-9">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <span className="arriendos-section-sub" role="status">
                Mostrando {productosFiltrados.length} de {productos.length} productos
              </span>
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="ordenarPor" className="form-label marca-label marca-nowrap mb-0">
                  <i className="bi bi-arrow-down-up me-1" aria-hidden="true"></i> Ordenar:
                </label>
                <select id="ordenarPor" className="form-select form-select-sm shadow-none" value={filtros.orden}
                  onChange={(e) => cambiarFiltros({ orden: e.target.value })}>
                  <option value="default">Recomendados / Catálogo Base</option>
                  <option value="ultimas-llegadas">Últimas Llegadas / Nuevos Ingresos</option>
                  <option value="nombre-asc">Nombre: A - Z</option>
                  <option value="precio-asc">Precio: Menor a Mayor</option>
                  <option value="precio-desc">Precio: Mayor a Menor</option>
                </select>
              </div>
            </div>
            <ProductGrid
              productos={productosFiltrados}
              onResetFilters={handleResetFilters}
            />
          </div>
        </div>


      </div>
    </div>
  );
}

export default Catalogo;
