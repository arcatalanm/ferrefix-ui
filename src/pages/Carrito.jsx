import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  obtenerCarrito, 
  actualizarCantidad, 
  eliminarDelCarrito, 
  vaciarCarrito, 
  obtenerTotalesCarrito, 
  EVENTO_CARRITO_ACTUALIZADO 
} from '../data/carrito';
import { obtenerSesionActiva } from '../data/auth';
import { crearOrden } from '../data/ordenes';
import { obtenerProductoPorId, actualizarProducto } from '../data/productos';

const REGIONES_CHILE = [
  {
    region: 'Región Metropolitana',
    comunas: [
      'Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'Cerrillos',
      'Maipú', 'Puente Alto', 'La Florida', 'San Miguel', 'San Bernardo',
      'Quilicura', 'Pudahuel', 'Recoleta', 'Independencia', 'Huechuraba',
      'Vitacura', 'Lo Barnechea', 'Peñalolén', 'Macul', 'Estación Central'
    ]
  },
  {
    region: 'Región de Valparaíso',
    comunas: ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Concón', 'Quillota', 'San Antonio']
  },
  {
    region: 'Región del Biobío',
    comunas: ['Concepción', 'Talcahuano', 'San Pedro de la Paz', 'Chiguayante', 'Coronel', 'Los Ángeles']
  }
];

function Carrito() {
  const [items, setItems] = useState(obtenerCarrito);
  const [totales, setTotales] = useState(obtenerTotalesCarrito);
  const [sesion, setSesion] = useState(obtenerSesionActiva);

  // Pasos: 'carrito' | 'checkout' | 'exito' | 'error'
  const [pasoActual, setPasoActual] = useState('carrito');
  const [ordenCreada, setOrdenCreada] = useState(null);
  const [alertaStock, setAlertaStock] = useState(null);

  // Formulario de despacho (Inicia vacío con placeholders de ejemplo; autocompleta nombre y correo si hay sesión)
  const [regionSeleccionada, setRegionSeleccionada] = useState('Región Metropolitana');
  const [formCliente, setFormCliente] = useState({
    nombre: sesion ? sesion.nombre : '',
    email: sesion ? sesion.email : '',
    telefono: '',
    direccion: '',
    region: 'Región Metropolitana',
    comuna: 'Santiago',
    indicaciones: '',
    metodoEntrega: 'despacho', // 'despacho' | 'retiro'
    metodoPago: 'WebPay Plus (Débito)'
  });

  // Sincronizar en tiempo real
  useEffect(() => {
    const handleActualizar = () => {
      setItems(obtenerCarrito());
      setTotales(obtenerTotalesCarrito());
    };
    window.addEventListener(EVENTO_CARRITO_ACTUALIZADO, handleActualizar);
    return () => window.removeEventListener(EVENTO_CARRITO_ACTUALIZADO, handleActualizar);
  }, []);

  // Formateador CLP
  const formatearCLP = (valor) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(valor || 0);
  };

  // Controles de cantidad con validación estricta de stock
  const handleModificarCantidad = (idProducto, nuevaCantidad) => {
    setAlertaStock(null);
    const resultado = actualizarCantidad(idProducto, nuevaCantidad);
    if (resultado && resultado.error) {
      setAlertaStock(resultado.error);
      setTimeout(() => setAlertaStock(null), 4000);
    }
  };

  const handleEliminarItem = (idProducto) => {
    eliminarDelCarrito(idProducto);
  };

  const handleVaciar = () => {
    if (window.confirm('¿Seguro que deseas vaciar todos los productos del carrito?')) {
      vaciarCarrito();
    }
  };

  // Procesar orden / checkout
  const handleProcesarCompra = (e) => {
    e.preventDefault();

    if (items.length === 0) return;

    // 1. Descontar stock de la base de datos simulada
    items.forEach((item) => {
      const prod = obtenerProductoPorId(item.idProducto);
      if (prod) {
        const nuevoStock = Math.max(0, Number(prod.stock) - Number(item.cantidad));
        actualizarProducto(item.idProducto, { stock: nuevoStock });
      }
    });

    // 2. Registrar la orden en el módulo de órdenes
    const ordenGenerada = crearOrden({
      idOrden: `ORD-${Date.now().toString().slice(-6)}`,
      cliente: {
        nombre: formCliente.nombre,
        email: formCliente.email,
        telefono: formCliente.telefono,
        direccion: `${formCliente.direccion}, ${formCliente.comuna}, ${formCliente.region}`
      },
      items: items.map((i) => ({
        idProducto: i.idProducto,
        nombre: i.nombre,
        cantidad: i.cantidad,
        precioUnitario: i.precioVenta
      })),
      total: totales.total,
      metodoPago: formCliente.metodoPago,
      estado: 'Completada'
    });

    // 3. Vaciar carrito y mostrar confirmación
    vaciarCarrito();
    setOrdenCreada(ordenGenerada);
    setPasoActual('exito');
    window.scrollTo(0, 0);
  };

  return (
    <div className="carrito-page py-4 py-lg-5 bg-light min-vh-75">
      <div className="container">

        {/* Migas de pan */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small mb-0">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Inicio</Link></li>
            <li className="breadcrumb-item"><Link to="/catalogo" className="text-decoration-none text-muted">Catálogo</Link></li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">
              {pasoActual === 'carrito' && 'Carrito de Compras'}
              {pasoActual === 'checkout' && 'Paso de Pago y Despacho'}
              {pasoActual === 'exito' && 'Confirmación de Compra'}
            </li>
          </ol>
        </nav>

        {/* Alerta de validación de stock */}
        {alertaStock && (
          <div className="alert alert-warning alert-dismissible fade show rounded-2 shadow-sm d-flex align-items-center mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill fs-5 me-2"></i>
            <div>{alertaStock}</div>
            <button type="button" className="btn-close" onClick={() => setAlertaStock(null)}></button>
          </div>
        )}

        {/* ============================================================== */}
        {/* PASO 1: VISTA DE PRODUCTOS EN EL CARRITO                      */}
        {/* ============================================================== */}
        {pasoActual === 'carrito' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h1 className="h3 fw-bold text-dark mb-1" style={{ fontFamily: '"Oswald", sans-serif' }}>
                  Carrito de Compras
                </h1>
                <p className="text-muted small mb-0">
                  Revisa tus productos seleccionados y confirma las cantidades antes de pagar.
                </p>
              </div>

              {items.length > 0 && (
                <button 
                  type="button" 
                  className="btn btn-outline-danger btn-sm rounded-1"
                  onClick={handleVaciar}
                >
                  <i className="bi bi-trash3 me-1"></i>
                  Vaciar Carrito
                </button>
              )}
            </div>

            {items.length === 0 ? (
              // Carrito Vacío
              <div className="bg-white border rounded-1 p-5 text-center my-4 shadow-sm">
                <i className="bi bi-cart-x text-muted display-2 mb-3 d-block"></i>
                <h2 className="h4 fw-bold text-dark mb-2">Tu carrito está actualmente vacío</h2>
                <p className="text-muted mb-4 small">
                  No has añadido herramientas ni materiales aún. Explora nuestro catálogo con stock disponible.
                </p>
                <Link to="/catalogo" className="btn btn-warning fw-semibold text-dark rounded-1 px-4 py-2 shadow-sm">
                  <i className="bi bi-box-seam me-2"></i>
                  Explorar Catálogo de Productos
                </Link>
              </div>
            ) : (
              // Tabla de productos y resumen
              <div className="row g-4">
                
                {/* Columna Izquierda: Listado de Productos */}
                <div className="col-12 col-lg-8">
                  <div className="bg-white border rounded-1 shadow-sm p-3">
                    <div className="table-responsive">
                      <table className="table align-middle mb-0">
                        <thead className="table-light small">
                          <tr>
                            <th style={{ width: '60px' }}>Foto</th>
                            <th>Producto</th>
                            <th className="text-end">Precio</th>
                            <th className="text-center" style={{ width: '130px' }}>Cantidad</th>
                            <th className="text-end">Subtotal</th>
                            <th className="text-end" style={{ width: '40px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => (
                            <tr key={item.idProducto}>
                              <td>
                                <img 
                                  src={item.imagen} 
                                  alt={item.nombre} 
                                  className="border rounded-1 bg-white object-fit-contain"
                                  style={{ width: '50px', height: '50px' }}
                                  onError={(e) => { e.target.src = '/banner-web.webp'; }}
                                />
                              </td>
                              <td>
                                <Link 
                                  to={`/producto/${item.idProducto}`} 
                                  className="text-decoration-none fw-semibold text-dark small d-block"
                                >
                                  {item.nombre}
                                </Link>
                                <small className="text-muted">Marca: {item.marca} | Stock: {item.stock} unids.</small>
                              </td>
                              <td className="text-end small font-monospace">
                                {formatearCLP(item.precioVenta)}
                              </td>
                              <td className="text-center">
                                <div className="input-group input-group-sm">
                                  <button 
                                    className="btn btn-outline-secondary" 
                                    type="button"
                                    onClick={() => handleModificarCantidad(item.idProducto, item.cantidad - 1)}
                                  >
                                    -
                                  </button>
                                  <input 
                                    type="text" 
                                    className="form-control text-center fw-bold bg-white"
                                    value={item.cantidad} 
                                    readOnly 
                                  />
                                  <button 
                                    className="btn btn-outline-secondary" 
                                    type="button"
                                    onClick={() => handleModificarCantidad(item.idProducto, item.cantidad + 1)}
                                    disabled={item.cantidad >= item.stock}
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="text-end fw-bold font-monospace text-dark">
                                {formatearCLP(item.precioVenta * item.cantidad)}
                              </td>
                              <td className="text-end">
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-outline-danger border-0 p-1"
                                  onClick={() => handleEliminarItem(item.idProducto)}
                                  title="Quitar producto"
                                >
                                  <i className="bi bi-trash3"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <Link to="/catalogo" className="btn btn-outline-dark btn-sm rounded-1">
                      ← Seguir Comprando
                    </Link>
                    <span className="small text-muted">
                      Precios con IVA incluido.
                    </span>
                  </div>
                </div>

                {/* Columna Derecha: Tarjeta de Resumen */}
                <div className="col-12 col-lg-4">
                  <div className="bg-white border rounded-1 shadow-sm p-4">
                    <h2 className="h5 fw-bold text-dark mb-3 border-bottom pb-2">
                      Resumen del Pedido
                    </h2>

                    <div className="d-flex justify-content-between mb-2 small text-secondary">
                      <span>Artículos ({totales.totalArticulos}):</span>
                      <span className="font-monospace fw-semibold">{formatearCLP(totales.subtotal)}</span>
                    </div>

                    <div className="d-flex justify-content-between mb-3 small text-secondary">
                      <span>Despacho a domicilio:</span>
                      <span className="font-monospace fw-semibold text-success">
                        {totales.despacho === 0 ? 'Gratis' : formatearCLP(totales.despacho)}
                      </span>
                    </div>

                    <div className="alert alert-info py-2 px-3 small rounded-1 mb-3" style={{ fontSize: '0.78rem' }}>
                      <i className="bi bi-truck me-1"></i>
                      Despacho gratis en compras superiores a $50.000 en la Región Metropolitana.
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <span className="fw-bold fs-5 text-dark">Total:</span>
                      <span className="fw-bold fs-4 text-dark font-monospace">
                        {formatearCLP(totales.total)}
                      </span>
                    </div>

                    <button 
                      type="button" 
                      className="btn btn-warning w-100 fw-bold text-dark py-3 rounded-1 shadow-sm mb-2"
                      onClick={() => setPasoActual('checkout')}
                    >
                      Continuar al Pago →
                    </button>

                    <div className="text-center small text-muted mt-2">
                      <i className="bi bi-shield-check me-1 text-success"></i>
                      Compra 100% segura con garantía de fábrica
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* PASO 2: CHECKOUT (DATOS DE DESPACHO Y PAGO)                    */}
        {/* ============================================================== */}
        {pasoActual === 'checkout' && (
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <div className="bg-white border rounded-1 shadow-sm p-4 p-md-5">
                
                <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                  <div>
                    <h2 className="h4 fw-bold text-dark mb-1" style={{ fontFamily: '"Oswald", sans-serif' }}>
                      Paso de Pago y Despacho
                    </h2>
                    <p className="text-muted small mb-0">
                      Completa los datos de envío y selecciona tu método de pago.
                    </p>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm rounded-1"
                    onClick={() => setPasoActual('carrito')}
                  >
                    ← Volver al Carrito
                  </button>
                </div>

                {sesion ? (
                  <div className="alert alert-light border small text-dark mb-4 rounded-1 d-flex align-items-center gap-2">
                    <i className="bi bi-person-check-fill text-success fs-5"></i>
                    <div>
                      Sesión activa: <strong>{sesion.nombre}</strong> ({sesion.email}). Los datos han sido precargados automáticamente.
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-warning small text-dark mb-4 rounded-1 d-flex align-items-center justify-content-between">
                    <div>
                      <i className="bi bi-info-circle-fill me-1"></i>
                      ¿Ya tienes cuenta? Inicia sesión para autocompletar tus datos.
                    </div>
                    <Link to="/login" className="btn btn-sm btn-dark rounded-1">
                      Iniciar Sesión
                    </Link>
                  </div>
                )}

                <form onSubmit={handleProcesarCompra}>
                  <h3 className="h6 fw-bold text-dark text-uppercase mb-3" style={{ letterSpacing: '0.5px' }}>
                    1. Información del Cliente
                  </h3>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Nombre y Apellido *</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm rounded-1"
                        placeholder="Ej: Pedro González"
                        value={formCliente.nombre}
                        onChange={(e) => setFormCliente({ ...formCliente, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Correo Electrónico *</label>
                      <input 
                        type="email" 
                        className="form-control form-control-sm rounded-1"
                        placeholder="ejemplo@correo.cl"
                        value={formCliente.email}
                        onChange={(e) => setFormCliente({ ...formCliente, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Teléfono de Contacto *</label>
                      <input 
                        type="tel" 
                        className="form-control form-control-sm rounded-1"
                        placeholder="+56 9 1234 5678"
                        value={formCliente.telefono}
                        onChange={(e) => setFormCliente({ ...formCliente, telefono: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <h3 className="h6 fw-bold text-dark text-uppercase mb-3" style={{ letterSpacing: '0.5px' }}>
                    2. Dirección y Opciones de Entrega
                  </h3>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-5">
                      <label className="form-label small fw-semibold">Región *</label>
                      <select 
                        className="form-select form-select-sm rounded-1"
                        value={regionSeleccionada}
                        onChange={(e) => {
                          const nuevaReg = e.target.value;
                          setRegionSeleccionada(nuevaReg);
                          const comunasDisponibles = REGIONES_CHILE.find(r => r.region === nuevaReg)?.comunas || [];
                          setFormCliente({ 
                            ...formCliente, 
                            region: nuevaReg, 
                            comuna: comunasDisponibles[0] || '' 
                          });
                        }}
                      >
                        {REGIONES_CHILE.map((r) => (
                          <option key={r.region} value={r.region}>{r.region}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-7">
                      <label className="form-label small fw-semibold">
                        Comuna (Selecciona de las disponibles) *
                      </label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-light"><i className="bi bi-search text-muted"></i></span>
                        <select 
                          className="form-select form-select-sm rounded-end-1"
                          value={formCliente.comuna}
                          onChange={(e) => setFormCliente({ ...formCliente, comuna: e.target.value })}
                          required
                        >
                          {(REGIONES_CHILE.find(r => r.region === regionSeleccionada)?.comunas || []).map((com) => (
                            <option key={com} value={com}>{com}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold">Calle, Número y Depto *</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm rounded-1"
                        placeholder="Ej: Av. Providencia 1240, Depto 502"
                        value={formCliente.direccion}
                        onChange={(e) => setFormCliente({ ...formCliente, direccion: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Indicaciones de Entrega (Opcional)</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm rounded-1"
                        placeholder="Ej: Dejar con conserje"
                        value={formCliente.indicaciones}
                        onChange={(e) => setFormCliente({ ...formCliente, indicaciones: e.target.value })}
                      />
                    </div>
                  </div>

                  <h3 className="h6 fw-bold text-dark text-uppercase mb-3" style={{ letterSpacing: '0.5px' }}>
                    3. Método de Pago Simulado
                  </h3>

                  <div className="mb-4">
                    <div className="form-check p-2 border rounded-1 mb-2 bg-light">
                      <input 
                        className="form-check-input ms-1 me-2" 
                        type="radio" 
                        name="metodoPago" 
                        id="webpay" 
                        value="WebPay Plus (Débito)"
                        checked={formCliente.metodoPago === 'WebPay Plus (Débito)'}
                        onChange={(e) => setFormCliente({ ...formCliente, metodoPago: e.target.value })}
                      />
                      <label className="form-check-label fw-semibold small text-dark" htmlFor="webpay">
                        WebPay Plus / RedCompra (Débito)
                      </label>
                    </div>

                    <div className="form-check p-2 border rounded-1 mb-2 bg-light">
                      <input 
                        className="form-check-input ms-1 me-2" 
                        type="radio" 
                        name="metodoPago" 
                        id="credito" 
                        value="Tarjeta de Crédito"
                        checked={formCliente.metodoPago === 'Tarjeta de Crédito'}
                        onChange={(e) => setFormCliente({ ...formCliente, metodoPago: e.target.value })}
                      />
                      <label className="form-check-label fw-semibold small text-dark" htmlFor="credito">
                        Tarjeta de Crédito (3 cuotas sin interés)
                      </label>
                    </div>

                    <div className="form-check p-2 border rounded-1 bg-light">
                      <input 
                        className="form-check-input ms-1 me-2" 
                        type="radio" 
                        name="metodoPago" 
                        id="transferencia" 
                        value="Transferencia Bancaria"
                        checked={formCliente.metodoPago === 'Transferencia Bancaria'}
                        onChange={(e) => setFormCliente({ ...formCliente, metodoPago: e.target.value })}
                      />
                      <label className="form-check-label fw-semibold small text-dark" htmlFor="transferencia">
                        Transferencia Electrónica Directa
                      </label>
                    </div>
                  </div>

                  {/* Resumen del cobro final */}
                  <div className="p-3 bg-platino border rounded-1 mb-4">
                    <div className="d-flex justify-content-between mb-1 small">
                      <span>Total de productos:</span>
                      <span className="font-monospace">{formatearCLP(totales.subtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2 small">
                      <span>Costo de envío:</span>
                      <span className="font-monospace text-success">
                        {totales.despacho === 0 ? 'Gratis' : formatearCLP(totales.despacho)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                      <strong className="fs-5 text-dark">Total a Pagar:</strong>
                      <strong className="fs-4 text-dark font-monospace">{formatearCLP(totales.total)}</strong>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-warning w-100 fw-bold text-dark py-3 rounded-1 shadow-sm fs-5"
                  >
                    Confirmar y Pagar {formatearCLP(totales.total)}
                  </button>

                </form>

              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PASO 3: COMPRA EXITOSA Y BOLETA (Rúbrica Duoc Figura 7)         */}
        {/* ============================================================== */}
        {pasoActual === 'exito' && ordenCreada && (
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-7">
              <div className="bg-white border rounded-1 shadow-sm p-4 p-md-5">
                
                <div className="text-center pb-4 border-bottom mb-4">
                  <div className="d-inline-flex p-3 bg-success-subtle text-success rounded-circle mb-3">
                    <i className="bi bi-check-lg display-4"></i>
                  </div>
                  <h1 className="h4 fw-bold text-dark mb-1" style={{ fontFamily: '"Oswald", sans-serif' }}>
                    ¡Se ha realizado la compra con éxito!
                  </h1>
                  <div className="d-flex justify-content-center gap-2 mt-2">
                    <span className="badge bg-dark text-warning font-monospace px-3 py-2 rounded-1">
                      Orden: #{ordenCreada.idOrden}
                    </span>
                    <span className="badge bg-secondary text-white font-monospace px-3 py-2 rounded-1">
                      N° Boleta: {ordenCreada.numeroBoleta}
                    </span>
                  </div>
                </div>

                {/* Datos del Cliente y Despacho */}
                <div className="mb-4 small">
                  <div className="row g-2">
                    <div className="col-sm-6">
                      <strong className="d-block text-secondary">Cliente:</strong>
                      <span className="text-dark fw-semibold">{ordenCreada.cliente.nombre}</span>
                    </div>
                    <div className="col-sm-6">
                      <strong className="d-block text-secondary">Correo:</strong>
                      <span className="text-dark">{ordenCreada.cliente.email}</span>
                    </div>
                    <div className="col-12 mt-2">
                      <strong className="d-block text-secondary">Dirección de Entrega:</strong>
                      <span className="text-dark">{ordenCreada.cliente.direccion}</span>
                    </div>
                    <div className="col-sm-6 mt-2">
                      <strong className="d-block text-secondary">Fecha de Pago:</strong>
                      <span className="text-dark">{ordenCreada.fecha}</span>
                    </div>
                    <div className="col-sm-6 mt-2">
                      <strong className="d-block text-secondary">Método de Pago:</strong>
                      <span className="text-dark">{ordenCreada.metodoPago}</span>
                    </div>
                  </div>
                </div>

                {/* Tabla de ítems adquiridos */}
                <div className="table-responsive border rounded-1 mb-4">
                  <table className="table table-sm align-middle mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th className="text-center">Cant.</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordenCreada.items.map((it, idx) => (
                        <tr key={idx}>
                          <td>{it.nombre}</td>
                          <td className="text-center">{it.cantidad}</td>
                          <td className="text-end font-monospace">{formatearCLP(it.precioUnitario * it.cantidad)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="d-flex justify-content-between align-items-center p-3 bg-platino border rounded-1 mb-4">
                  <span className="fw-bold text-dark fs-5">Total Pagado:</span>
                  <span className="fw-bold text-success fs-4 font-monospace">{formatearCLP(ordenCreada.total)}</span>
                </div>

                {/* Acciones */}
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  <button 
                    type="button" 
                    className="btn btn-outline-dark btn-sm rounded-1 px-3"
                    onClick={() => window.print()}
                  >
                    <i className="bi bi-printer me-1"></i>
                    Imprimir Boleta en PDF
                  </button>
                  <Link to="/catalogo" className="btn btn-warning btn-sm text-dark fw-bold rounded-1 px-4">
                    Volver al Catálogo
                  </Link>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Carrito;
