import ProductCard from './ProductCard';

function ProductGrid({ productos = [], onResetFilters }) {
  if (!productos || productos.length === 0) {
    return (
      <div className="product-grid-empty text-center py-5 px-3 bg-platino rounded-4 my-4">
        <i className="bi bi-search display-3 text-secondary mb-3 d-block"></i>
        <h4 className="fw-bold text-dark mb-2">No se encontraron productos</h4>
        <p className="product-grid-empty-desc text-muted mb-4 mx-auto">
          No encontramos ningún artículo que coincida con tus criterios de búsqueda o filtros seleccionados.
        </p>
        {onResetFilters && (
          <button 
            type="button" 
            onClick={onResetFilters} 
            className="btn btn-warning fw-semibold px-4 py-2 rounded-3 shadow-sm"
          >
            <i className="bi cart-plus-fill me-2"></i>
            Restablecer filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="row g-2 row-cols-2 row-cols-md-3 row-cols-lg-4 product-grid-container">
      {productos.map((producto) => (
        <div key={producto.idProducto} className="col d-flex">
          <ProductCard producto={producto} />
        </div>
      ))}
    </div>
  );
}

export default ProductGrid;
