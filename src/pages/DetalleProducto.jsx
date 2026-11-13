import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { obtenerProductos, EVENTO_PRODUCTOS_ACTUALIZADOS, useEstadoCatalogo } from '../data/productos';
import { agregarAlCarrito } from '../data/carrito';
import { mostrarToast } from '../components/ToastNotificacion';
import SelectorCantidad from '../components/SelectorCantidad';
import { unidadVenta, cantidadPresentaciones } from '../utils/presentacionProducto';

function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cargando, error } = useEstadoCatalogo();

  const [cantidad, setCantidad] = useState(1);
  const [botonAnimado, setBotonAnimado] = useState(false);

  const [productos, setProductos] = useState(obtenerProductos);

  const producto = productos.find((p) => String(p.idProducto) === String(id)) || null;

  useEffect(() => {
    const handleActualizacion = () => {
      setProductos(obtenerProductos());
    };

    window.addEventListener(EVENTO_PRODUCTOS_ACTUALIZADOS, handleActualizacion);
    return () => {
      window.removeEventListener(EVENTO_PRODUCTOS_ACTUALIZADOS, handleActualizacion);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!producto && (cargando || error)) return null;
  if (!producto) {
    return (
      <div className="container py-5 marca-centro my-5">
        <div className="detalle-no-encontrado-card bg-platino p-5 rounded-4 shadow-sm mx-auto">
          <i className="bi bi-exclamation-triangle detalle-error-icon mb-3 d-block"></i>
          <h2 className="marca-titulo marca-tam-4 mb-3">Producto no encontrado</h2>
          <p className="marca-parrafo mb-4">
            El producto con código <strong>#{id}</strong> no existe o no se encuentra disponible actualmente en nuestro catálogo.
          </p>
          <Link to="/catalogo" className="btn btn-ambar marca-strong px-4 py-2 rounded-3 shadow-sm">
            <i className="bi bi-arrow-left me-2"></i>
            Volver al Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const precioFormateado = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(producto.precioVenta);

  const handleAgregarCarrito = async () => {
    const cantidadValidada = Math.min(producto.stock, Math.max(1, Number(cantidad) || 1));
    if (cantidadValidada <= 0) return;
    setCantidad(cantidadValidada);
    const res = await agregarAlCarrito(producto, cantidadValidada);
    if (!res.ok) {
      mostrarToast({
        titulo: "Stock Insuficiente",
        mensaje: res.error,
        tipo: "danger"
      });
    } else {
      setBotonAnimado(true);
      setTimeout(() => setBotonAnimado(false), 1800);

      mostrarToast({
        titulo: "¡Añadido al Carrito!",
        mensaje: `${producto.nombre} (${cantidadPresentaciones(producto, cantidadValidada)})`,
        tipo: "success",
        imagen: producto.imagen,
        link: "/carrito",
        linkTexto: "Ver Carrito"
      });
    }
  };

  return (
    <div className="detalle-producto-page py-4 py-lg-5 bg-white">
      <div className="container">

        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb detalle-breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/">Inicio</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/catalogo">Catálogo</Link>
              </li>
              <li className="breadcrumb-item">
                <Link
                  to={`/catalogo?categoria=${encodeURIComponent(producto.categoria)}`}
                >
                  {producto.categoria}
                </Link>
              </li>
              <li className="breadcrumb-item detalle-breadcrumb-item active" aria-current="page">
                {producto.nombre}
              </li>
            </ol>
          </nav>

          <button
            type="button"
            onClick={() => window.history.state?.idx > 0 ? navigate(-1) : navigate('/catalogo')}
            className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-inline-flex align-items-center gap-1 shadow-none"
          >
            <i className="bi bi-arrow-left"></i>
            Volver al catálogo
          </button>
        </div>

        <div className="detalle-principal">
          <div className="detalle-galeria">
            <div className="detalle-img-card">
              <img src={producto.imagen} alt={producto.nombre} className="detalle-producto-foto" />
            </div>
          </div>

          <section className="detalle-info-panel" aria-labelledby="producto-titulo">
            <div className="detalle-info-cabecera">
              <span className="marca-etiqueta">{producto.marca}</span>
              <h1 id="producto-titulo" className="detalle-producto-titulo">{producto.nombre}</h1>
              <p className="marca-nota mb-0">Código del producto: {producto.idProducto}</p>
            </div>
            <div className="detalle-precio-box">
              <span className="marca-nota">Precio por {unidadVenta(producto)}</span>
              <div className="detalle-precio-valor">{precioFormateado}</div>
              <span className="marca-nota">IVA incluido</span>
            </div>
            <div className="detalle-info-extra">
              {producto.contenidoPresentacion && <p className="marca-nota">Contenido por {unidadVenta(producto)}: {producto.contenidoPresentacion}</p>}
              {producto.descripcionCorta && <p className="marca-parrafo mb-0 detalle-texto">{producto.descripcionCorta}</p>}
            </div>
          </section>

          <aside className="detalle-compra" aria-label="Compra y entrega">
            <div className="detalle-compra-card">
              <label htmlFor="producto-cantidad" className="marca-strong">Cantidad</label>
              <SelectorCantidad id="producto-cantidad" cantidad={cantidad} maximo={producto.stock}
                onChange={setCantidad} disabled={producto.stock <= 0} describedBy="producto-stock" />
              <p id="producto-stock" className="marca-nota mt-2 mb-4">{producto.stock > 0 ? `Disponible: ${cantidadPresentaciones(producto, producto.stock)}` : 'Sin stock disponible'}</p>
              <button type="button" onClick={handleAgregarCarrito} disabled={producto.stock <= 0}
                className={`btn w-100 detalle-agregar ${botonAnimado ? 'btn-success' : 'btn-ambar'}`}>
                <i className={`bi ${botonAnimado ? 'bi-check2-circle' : 'bi-cart-plus'} me-2`} aria-hidden="true" />
                {producto.stock <= 0 ? 'Agotado temporalmente' : botonAnimado ? '¡Añadido al carrito!' : 'Agregar al carrito'}
              </button>
            </div>
            <details className="detalle-entrega" open>
              <summary><i className="bi bi-geo-alt" aria-hidden="true" /> Opciones de entrega <i className="bi bi-chevron-down" aria-hidden="true" /></summary>
              <div className="detalle-entrega-opcion">
                <i className="bi bi-box-seam" aria-hidden="true" />
                <div><h2>Despacho a domicilio</h2><p>Revisa los datos y el costo de envío al continuar tu compra.</p><Link to="/fletes">Ver información de despacho</Link></div>
              </div>
              <div className="detalle-entrega-opcion">
                <i className="bi bi-shop" aria-hidden="true" />
                <div><h2>Retiro en tienda</h2><p>Antonio Varas 666, Providencia.</p><Link to="/contacto">Consultar disponibilidad de retiro</Link></div>
              </div>
            </details>
          </aside>
        </div>

        <section className="detalle-descripcion" aria-labelledby="descripcion-titulo">
          <h2 id="descripcion-titulo">Descripción del producto</h2>
          <p className="marca-parrafo detalle-texto mb-0">{producto.descripcionLarga || producto.descripcionCorta || 'No hay una descripción adicional disponible.'}</p>
        </section>
        <section className="detalle-ficha-seccion" aria-labelledby="especificaciones-titulo">
          <h2 id="especificaciones-titulo">Especificaciones</h2>
          {Object.keys(producto.especificaciones || {}).length > 0 ? (
            <dl className="detalle-especificaciones">
              {Object.entries(producto.especificaciones).map(([clave, valor]) => (
                <div className="detalle-especificacion" key={clave}><dt>{clave}</dt><dd>{valor}</dd></div>
              ))}
            </dl>
          ) : <p className="marca-muted">No hay especificaciones adicionales registradas.</p>}
        </section>
      </div>
    </div>
  );
}

export default DetalleProducto;
