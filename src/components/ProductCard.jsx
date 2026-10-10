import { Link } from 'react-router-dom';

function ProductCard({ producto }) {
  if (!producto) return null;

  const { idProducto, nombre, marca, categoria, precioVenta, imagen } = producto;

  // Formatear el precio al estándar de pesos chilenos (CLP) ej: $54.990
  const precioFormateado = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(precioVenta);

  return (
    <div className="product-card">
      {/* Contenedor de la foto y badge de categoría */}
      <div className="product-card-img-wrapper">
        <img 
          src={imagen} 
          alt={nombre} 
          className="product-card-img"
          loading="lazy" 
        />
        {categoria && (
          <span className="product-card-badge">
            {categoria}
          </span>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="product-card-body">
        {marca && <span className="product-card-brand">{marca}</span>}

        <h3 className="product-card-title" title={nombre}>
          {nombre}
        </h3>

        <div className="product-card-price">
          {precioFormateado}
        </div>

        <div className="product-card-footer">
          {/* Al hacer clic, redirigirá al detalle del producto: /producto/:id */}
          <Link 
            to={`/producto/${idProducto}`} 
            className="product-card-btn"
          >
            Ver Detalle
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
