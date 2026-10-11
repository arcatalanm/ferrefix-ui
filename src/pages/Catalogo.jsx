import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import { PRODUCTOS, CATEGORIAS_PRODUCTOS } from '../data/productos';

function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derivar la categoría seleccionada directamente desde la URL
  const categoriaSeleccionada = searchParams.get('categoria') || 'Todas';
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [ordenPrecio, setOrdenPrecio] = useState('default');

  // Manejar cambio de categoría y actualizar URL de forma reactiva
  const handleCambiarCategoria = (cat) => {
    if (cat === 'Todas') {
      searchParams.delete('categoria');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ categoria: cat });
    }
  };

  // Restablecer todos los filtros
  const handleResetFilters = () => {
    setBusquedaTexto('');
    setOrdenPrecio('default');
    setSearchParams({});
  };

  // Filtrado y ordenamiento con useMemo para máximo rendimiento
  const productosFiltrados = useMemo(() => {
    let resultado = [...PRODUCTOS];

    // Filtrar por categoría
    if (categoriaSeleccionada !== 'Todas') {
      resultado = resultado.filter(
        (p) => p.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase()
      );
    }

    // Filtrar por texto (nombre o marca)
    if (busquedaTexto.trim() !== '') {
      const termino = busquedaTexto.toLowerCase().trim();
      resultado = resultado.filter(
        (p) =>
          p.nombre.toLowerCase().includes(termino) ||
          p.marca.toLowerCase().includes(termino)
      );
    }

    // Ordenar por precio o nombre
    if (ordenPrecio === 'precio-asc') {
      resultado.sort((a, b) => a.precioVenta - b.precioVenta);
    } else if (ordenPrecio === 'precio-desc') {
      resultado.sort((a, b) => b.precioVenta - a.precioVenta);
    } else if (ordenPrecio === 'nombre-asc') {
      resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    return resultado;
  }, [categoriaSeleccionada, busquedaTexto, ordenPrecio]);

  return (
    <div className="catalogo-page py-4 py-md-5">
      <div className="container">

        {/* Encabezado del Catálogo */}
        <div className="catalogo-header mb-4">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb small mb-2">
              <li className="breadcrumb-item"><a href="/" className="text-decoration-none text-muted">Inicio</a></li>
              <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">Catálogo de Productos</li>
            </ol>
          </nav>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h1 className="catalogo-titulo fw-bold mb-1">Catálogo de Productos</h1>
              <p className="text-secondary mb-0">
                Explora nuestra variedad de herramientas, materiales de construcción y artículos de ferretería.
              </p>
            </div>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="catalogo-bar-filtros bg-white p-3 p-md-4 rounded-4 shadow-sm border mb-4">
          <div className="row g-3 align-items-center">
            
            {/* Input de Búsqueda por texto */}
            <div className="col-12 col-md-6 col-lg-5">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0 shadow-none"
                  placeholder="Buscar por nombre o marca (ej. Taladro, Bosch)..."
                  value={busquedaTexto}
                  onChange={(e) => setBusquedaTexto(e.target.value)}
                />
                {busquedaTexto && (
                  <button
                    className="btn btn-outline-secondary border-start-0 border-light-subtle shadow-none"
                    type="button"
                    onClick={() => setBusquedaTexto('')}
                    title="Limpiar búsqueda"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Ordenamiento por precio */}
            <div className="col-12 col-sm-6 col-md-3 col-lg-4 ms-auto">
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="ordenarPor" className="form-label small fw-semibold text-secondary text-nowrap mb-0">
                  <i className="bi bi-arrow-down-up me-1"></i> Ordenar:
                </label>
                <select
                  id="ordenarPor"
                  className="form-select form-select-sm shadow-none"
                  value={ordenPrecio}
                  onChange={(e) => setOrdenPrecio(e.target.value)}
                >
                  <option value="default">Recomendados / Defecto</option>
                  <option value="precio-asc">Precio: Menor a Mayor</option>
                  <option value="precio-desc">Precio: Mayor a Menor</option>
                  <option value="nombre-asc">Nombre: A - Z</option>
                </select>
              </div>
            </div>

            {/* Botón reset rápido si hay filtros activos */}
            {(categoriaSeleccionada !== 'Todas' || busquedaTexto !== '' || ordenPrecio !== 'default') && (
              <div className="col-12 col-sm-auto">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-sm btn-outline-danger w-100 rounded-3 d-flex align-items-center justify-content-center gap-1"
                >
                  <i className="bi bi-trash3"></i>
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          {/* Filtro por Categorías */}
          <hr className="my-3 text-secondary opacity-25" />
          <div className="catalogo-categorias-container">
            <span className="small fw-bold text-uppercase text-secondary d-block mb-2">
              Categorías:
            </span>
            <div className="d-flex flex-wrap gap-2">
              {CATEGORIAS_PRODUCTOS.map((cat) => {
                const esActiva = categoriaSeleccionada.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCambiarCategoria(cat)}
                    className={`btn btn-sm rounded-pill px-3 py-1 transition-all ${
                      esActiva 
                        ? 'btn-dark fw-bold shadow-sm' 
                        : 'btn-outline-secondary'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grilla de Productos */}
        <ProductGrid 
          productos={productosFiltrados} 
          onResetFilters={handleResetFilters}
        />

      </div>
    </div>
  );
}

export default Catalogo;
