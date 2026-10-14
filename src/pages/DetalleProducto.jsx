import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { obtenerProductoPorId, EVENTO_PRODUCTOS_ACTUALIZADOS } from '../data/productos';

function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cantidad, setCantidad] = useState(1);
  const [agregadoAlCarrito, setAgregadoAlCarrito] = useState(false);

  // Buscar el producto correspondiente de forma reactiva desde localStorage
  const [producto, setProducto] = useState(() => obtenerProductoPorId(id));

  // Escuchar si el producto fue modificado (ej. stock actualizado o precio)
  useEffect(() => {
    setProducto(obtenerProductoPorId(id));

    const handleActualizacion = () => {
      setProducto(obtenerProductoPorId(id));
    };

    window.addEventListener(EVENTO_PRODUCTOS_ACTUALIZADOS, handleActualizacion);
    return () => {
      window.removeEventListener(EVENTO_PRODUCTOS_ACTUALIZADOS, handleActualizacion);
    };
  }, [id]);

  // Scroll automático hacia arriba al cargar la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Si no se encuentra el producto
  if (!producto) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="detalle-no-encontrado-card bg-platino p-5 rounded-4 shadow-sm mx-auto">
          <i className="bi bi-exclamation-triangle display-2 text-warning mb-3 d-block"></i>
          <h2 className="fw-bold mb-3">Producto no encontrado</h2>
          <p className="text-secondary mb-4">
            El producto con código <strong>#{id}</strong> no existe o no se encuentra disponible actualmente en nuestro catálogo.
          </p>
          <Link to="/catalogo" className="btn btn-warning fw-semibold px-4 py-2 rounded-3 shadow-sm">
            <i className="bi bi-arrow-left me-2"></i>
            Volver al Catálogo
          </Link>
        </div>
      </div>
    );
  }

  // Formatear precio a CLP
  const precioFormateado = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(producto.precioVenta);

  // Manejo del selector de cantidad
  const handleRestar = () => {
    if (cantidad > 1) setCantidad((prev) => prev - 1);
  };

  const handleSumar = () => {
    if (cantidad < producto.stock) setCantidad((prev) => prev + 1);
  };

  const handleAgregarCarrito = () => {
    setAgregadoAlCarrito(true);
    setTimeout(() => {
      setAgregadoAlCarrito(false);
    }, 3000);
  };



  return (
    <div className="detalle-producto-page py-4 py-lg-5 bg-white">
      <div className="container">

        {/* Migas de pan y botón volver */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb small mb-0">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none text-muted">Inicio</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/catalogo" className="text-decoration-none text-muted">Catálogo</Link>
              </li>
              <li className="breadcrumb-item">
                <Link 
                  to={`/catalogo?categoria=${encodeURIComponent(producto.categoria)}`} 
                  className="text-decoration-none text-muted"
                >
                  {producto.categoria}
                </Link>
              </li>
              <li className="breadcrumb-item detalle-breadcrumb-item active text-truncate fw-semibold text-dark" aria-current="page">
                {producto.nombre}
              </li>
            </ol>
          </nav>

          <button 
            type="button" 
            onClick={() => navigate('/catalogo')} 
            className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-inline-flex align-items-center gap-1 shadow-none"
          >
            <i className="bi bi-arrow-left"></i>
            Volver al catálogo
          </button>
        </div>

        {/* Sección Principal del Producto */}
        <div className="row g-4 g-lg-5 mb-5 align-items-start">

          {/* Columna Izquierda: Imagen destacada */}
          <div className="col-12 col-lg-6">
            <div className="detalle-img-card rounded-4 p-3 p-md-4 border bg-platino shadow-sm position-relative overflow-hidden">
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="img-fluid w-100 object-fit-contain rounded-3 detalle-producto-foto"
              />
            </div>

            {/* Garantías y Confianza */}
            <div className="row g-2 mt-3 text-center small text-secondary">
              <div className="col-4">
                <div className="p-2 border rounded-3 bg-light">
                  <i className="bi bi-truck fs-4 text-warning d-block mb-1"></i>
                  <span>Envío a todo Chile</span>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 border rounded-3 bg-light">
                  <i className="bi bi-shield-check fs-4 text-warning d-block mb-1"></i>
                  <span>Garantía Oficial</span>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 border rounded-3 bg-light">
                  <i className="bi bi-shop fs-4 text-warning d-block mb-1"></i>
                  <span>Retiro en Tienda</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Información, Precio y Compra */}
          <div className="col-12 col-lg-6">
            <div className="detalle-info-panel">
              
              {/* Marca */}
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-warning text-dark fw-bold px-2 py-1 rounded">
                  {producto.marca}
                </span>
                <span className="text-muted small">Código Ref: #{producto.idProducto}</span>
              </div>

              {/* Título */}
              <h1 className="detalle-producto-titulo fw-bold text-dark mb-3">
                {producto.nombre}
              </h1>

              {/* Calificación estética */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="text-warning">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                </div>
                <span className="small text-secondary fw-semibold">
                  5.0 (Valoraciones de clientes)
                </span>
              </div>

              {/* Precio */}
              <div className="detalle-precio-box p-3 bg-light rounded-4 mb-4 border border-light-subtle">
                <div className="small text-muted mb-1">Precio con IVA incluido:</div>
                <div className="detalle-precio-valor display-6 fw-bold text-dark">
                  {precioFormateado}
                </div>
              </div>

              {/* Breve extracto */}
              <p className="text-secondary lh-base mb-4">
                {producto.descripcion}
              </p>

              {/* Controles de Compra */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase text-secondary mb-2">
                  Cantidad:
                </label>
                <div className="d-flex align-items-center gap-3">
                  <div className="input-group detalle-cantidad-group">
                    <button 
                      className="btn btn-outline-secondary px-3" 
                      type="button"
                      onClick={handleRestar}
                      disabled={cantidad <= 1}
                      aria-label="Restar una unidad"
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <input 
                      type="text" 
                      className="form-control text-center fw-bold bg-white" 
                      value={cantidad} 
                      readOnly 
                    />
                    <button 
                      className="btn btn-outline-secondary px-3" 
                      type="button"
                      onClick={handleSumar}
                      disabled={cantidad >= producto.stock}
                      aria-label="Sumar una unidad"
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                  <span className="small text-muted">
                    Máximo: {producto.stock} unidades
                  </span>
                </div>
              </div>

              {/* Botón de Acción */}
              <div className="d-grid gap-2 mb-4">
                <button
                  type="button"
                  onClick={handleAgregarCarrito}
                  className="btn btn-warning btn-lg fw-bold py-3 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                >
                  <i className="bi bi-cart-plus-fill fs-5"></i>
                  Agregar al Carrito
                </button>
              </div>

              {/* Mensaje de confirmación temporal */}
              {agregadoAlCarrito && (
                <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 rounded-3 mb-4 shadow-sm animate__animated animate__fadeIn">
                  <i className="bi bi-check-circle-fill fs-5"></i>
                  <div>
                    ¡Agregaste <strong>{cantidad} {cantidad === 1 ? 'unidad' : 'unidades'}</strong> de este producto a tu pedido!
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Especificaciones y Ficha Técnica Completa */}
        <div className="detalle-ficha-seccion border-top pt-5">
          <div className="row g-4">
            
            <div className="col-12 col-lg-6">
              <h3 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-info-circle text-warning"></i>
                Descripción Detallada
              </h3>
              <p className="text-secondary lh-lg mb-4">
                {producto.descripcion}
              </p>
              <div className="p-3 bg-light rounded-3 border">
                <h6 className="fw-bold mb-2 text-dark">
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                  ¿Prefieres comprar presencialmente?
                </h6>
                <p className="small text-muted mb-0">
                  Encuentra este producto en nuestro local ubicado en <strong>Antonio Varas 666, Providencia</strong>. Consulta disponibilidad y atención personalizada con nuestros expertos ferreteros.
                </p>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <h3 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-tools text-warning"></i>
                Ficha Técnica
              </h3>
              
              {producto.especificaciones ? (
                <div className="table-responsive rounded-3 border overflow-hidden">
                  <table className="table table-striped table-hover mb-0 align-middle">
                    <tbody>
                      {Object.entries(producto.especificaciones).map(([clave, valor]) => (
                        <tr key={clave}>
                          <th scope="row" className="bg-platino text-dark py-3 ps-3 w-40 small fw-semibold">
                            {clave}
                          </th>
                          <td className="py-3 ps-3 text-secondary small">
                            {valor}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No hay especificaciones adicionales registradas.</p>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default DetalleProducto;
