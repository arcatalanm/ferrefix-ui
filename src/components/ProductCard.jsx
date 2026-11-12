import { Link } from 'react-router-dom';
import { agregarAlCarrito } from '../data/carrito';
import { mostrarToast } from './ToastNotificacion';
import { unidadVenta, cantidadPresentaciones } from '../utils/presentacionProducto';

const moneda = new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
});
const atributosClave = /voltaje|potencia|medida|diámetro|largo|longitud|piezas|cantidad|material|formato|capacidad/i;

function ProductCard({ producto }) {
  if (!producto) return null;

  const { idProducto, nombre, marca, precioVenta, imagen, stock } = producto;
  const rutaProducto = `/producto/${idProducto}`;

  const precioAnterior = Number(producto.precioAnterior);
  const descuento = Number.isFinite(precioAnterior) && precioAnterior > precioVenta && precioVenta >= 0
    ? Math.floor((1 - precioVenta / precioAnterior) * 100) : 0;
  const atributos = Object.entries(producto.especificaciones || {})
    .filter(([, valor]) => String(valor ?? '').trim())
    .sort(([a], [b]) => Number(atributosClave.test(b)) - Number(atributosClave.test(a)));
  const especificaciones = (producto.contenidoPresentacion
    ? [['Presentación', producto.contenidoPresentacion], ...atributos.filter(([clave]) => clave !== 'Presentación')]
    : atributos).slice(0, 3);

  const handleAgregarCarrito = async () => {
    try {
      const resultado = await agregarAlCarrito(producto);
      mostrarToast(resultado.ok ? {
        titulo: 'Añadido al carrito', mensaje: `${nombre} (${cantidadPresentaciones(producto, 1)})`,
        imagen, link: '/carrito', linkTexto: 'Ver carrito',
      } : {
        titulo: 'No se pudo agregar', mensaje: resultado.error, tipo: 'danger',
      });
    } catch {
      mostrarToast({
        titulo: 'No se pudo guardar el carrito',
        mensaje: 'No se pudo guardar el carrito en el servidor. Inténtalo nuevamente.',
        tipo: 'danger',
      });
    }
  };

  return (
    <article className="card product-card h-100 w-100">
      <div className="product-card-img-wrapper">
        <Link to={rutaProducto} className="product-card-image-link" aria-label={`Ver ${nombre}`}>
          <img src={imagen || '/banner-web.webp'} alt={nombre} className="product-card-img" loading="lazy"
            onError={(e) => {
              if (!e.currentTarget.src.endsWith('/banner-web.webp')) e.currentTarget.src = '/banner-web.webp';
            }}
          />
        </Link>
        {descuento > 0 && <span className="badge product-card-badge">-{descuento}%</span>}
      </div>
      <div className="card-body product-card-body d-flex flex-column">
        <span className="product-card-brand text-truncate mb-2" title={marca}>{marca || 'Sin marca'}</span>
        <Link to={rutaProducto} className="product-card-link">
          <h3 className="product-card-title" title={nombre}>{nombre}</h3>
        </Link>
        <div className="product-card-specs d-flex flex-wrap align-content-start gap-1 mb-3">
          {especificaciones.map(([clave, valor]) => (
            <span key={clave} className="badge rounded-pill product-card-spec" title={`${clave}: ${valor}`}>{clave}: {valor}</span>
          ))}
        </div>
        <div className="product-card-footer mt-auto">
          <div className="d-flex align-items-baseline gap-2 flex-wrap">
            <span className="product-card-price"><span className="visually-hidden">Precio actual: </span>{moneda.format(precioVenta)}</span>
            {descuento > 0 && <del className="product-card-old-price"><span className="visually-hidden">Precio anterior: </span>{moneda.format(precioAnterior)}</del>}
          </div>
          <div className="d-flex align-items-baseline justify-content-between gap-2 mb-1">
            <span className="product-card-unit">Por {unidadVenta(producto)}</span>
            <span className="product-card-stock text-end">
              {stock > 0 ? `${stock} ${stock === 1 ? 'disponible' : 'disponibles'}` : 'Sin stock'}
            </span>
          </div>
          <button type="button" className="btn btn-ambar product-card-add w-100" disabled={stock <= 0} onClick={handleAgregarCarrito}>
            <i className="bi bi-cart-plus me-2" aria-hidden="true"></i>{stock > 0 ? 'Agregar al carro' : 'Sin stock'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
