import { Link } from 'react-router-dom';

function ProductCard({ producto }) {
  if (!producto) return null;

  const { idProducto, nombre, marca, categoria, precioVenta, imagen } = producto;

  // Formatear el precio a pesos chilenos (CLP)
  const precioFormateado = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(precioVenta);

  return (
    <div className="product-card">
      <Link to={`/producto/${idProducto}`} className='text-decoration-none'>

        {/* Contenedor de la foto */}
        <div className="product-card-img-wrapper">
          <img 
            src={imagen} 
            alt={nombre} 
            className="product-card-img"
            loading="lazy" 
          />
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
        </div>

      </Link>
    </div>
  );
}

export default ProductCard;
