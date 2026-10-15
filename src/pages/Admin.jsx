import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  obtenerProductos, 
  crearProducto, 
  actualizarProducto, 
  eliminarProducto, 
  restablecerProductos,
  CATEGORIAS_PRODUCTOS,
  EVENTO_PRODUCTOS_ACTUALIZADOS 
} from '../data/productos';
import { obtenerOrdenes, EVENTO_ORDENES_ACTUALIZADAS } from '../data/ordenes';
import { 
  obtenerSesionActiva, 
  iniciarSesion, 
  cerrarSesion, 
  EVENTO_SESION_ACTUALIZADA 
} from '../data/auth';

const FORM_INICIAL = {
  idProducto: '',
  nombre: '',
  marca: '',
  categoria: 'Herramientas',
  precioVenta: '',
  stock: '',
  descripcion: '',
  imagen: ''
};

function Admin() {
  // Autenticación
  const [sesion, setSesion] = useState(obtenerSesionActiva);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState('');

  // Datos
  const [productos, setProductos] = useState(obtenerProductos);
  const [ordenes, setOrdenes] = useState(obtenerOrdenes);
  const [tabActiva, setTabActiva] = useState('dashboard'); // 'dashboard' | 'productos' | 'ordenes'
  
  // Filtros de inventario
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroStockCritico, setFiltroStockCritico] = useState(false);

  // Modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState(FORM_INICIAL);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [mensajeAlerta, setMensajeAlerta] = useState(null);

  // Sincronización en tiempo real
  useEffect(() => {
    const handleProductos = () => setProductos(obtenerProductos());
    const handleOrdenes = () => setOrdenes(obtenerOrdenes());
    const handleSesion = () => setSesion(obtenerSesionActiva());

    window.addEventListener(EVENTO_PRODUCTOS_ACTUALIZADOS, handleProductos);
    window.addEventListener(EVENTO_ORDENES_ACTUALIZADAS, handleOrdenes);
    window.addEventListener(EVENTO_SESION_ACTUALIZADA, handleSesion);

    return () => {
      window.removeEventListener(EVENTO_PRODUCTOS_ACTUALIZADOS, handleProductos);
      window.removeEventListener(EVENTO_ORDENES_ACTUALIZADAS, handleOrdenes);
      window.removeEventListener(EVENTO_SESION_ACTUALIZADA, handleSesion);
    };
  }, []);

  const mostrarMensaje = (texto, tipo = 'dark') => {
    setMensajeAlerta({ texto, tipo });
    setTimeout(() => {
      setMensajeAlerta(null);
    }, 3500);
  };

  // Métricas
  const metricas = useMemo(() => {
    const totalProductos = productos.length;
    const stockCriticoCount = productos.filter((p) => Number(p.stock) <= 5).length;
    const valorInventario = productos.reduce(
      (acc, p) => acc + (Number(p.precioVenta) || 0) * (Number(p.stock) || 0),
      0
    );
    const totalVentas = ordenes.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

    return {
      totalProductos,
      stockCriticoCount,
      valorInventario,
      totalVentas,
      totalOrdenes: ordenes.length
    };
  }, [productos, ordenes]);

  // Filtro de productos
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const coincideTexto = 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
        String(p.idProducto).includes(busqueda);
      
      const coincideCat = 
        filtroCategoria === 'Todas' || 
        p.categoria.toLowerCase() === filtroCategoria.toLowerCase();

      const coincideStock = !filtroStockCritico || Number(p.stock) <= 5;

      return coincideTexto && coincideCat && coincideStock;
    });
  }, [productos, busqueda, filtroCategoria, filtroStockCritico]);

  // Manejo de Modal Crear / Editar
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setFormData({
      ...FORM_INICIAL,
      idProducto: String(Date.now()).slice(-8)
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (prod) => {
    setModoEdicion(true);
    setFormData({
      idProducto: prod.idProducto,
      nombre: prod.nombre,
      marca: prod.marca,
      categoria: prod.categoria,
      precioVenta: prod.precioVenta,
      stock: prod.stock,
      descripcion: prod.descripcion || '',
      imagen: prod.imagen || ''
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setFormData(FORM_INICIAL);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.marca.trim()) {
      mostrarMensaje('Nombre y marca son requeridos.', 'danger');
      return;
    }

    if (modoEdicion) {
      actualizarProducto(formData.idProducto, {
        nombre: formData.nombre.trim(),
        marca: formData.marca.trim(),
        categoria: formData.categoria,
        precioVenta: Number(formData.precioVenta) || 0,
        stock: Number(formData.stock) || 0,
        descripcion: formData.descripcion.trim(),
        imagen: formData.imagen.trim() || undefined
      });
      mostrarMensaje(`Producto "${formData.nombre}" actualizado.`);
    } else {
      crearProducto({
        idProducto: formData.idProducto,
        nombre: formData.nombre.trim(),
        marca: formData.marca.trim(),
        categoria: formData.categoria,
        precioVenta: Number(formData.precioVenta) || 0,
        stock: Number(formData.stock) || 0,
        descripcion: formData.descripcion.trim(),
        imagen: formData.imagen.trim() || '/arriendo-bosch.jpg'
      });
      mostrarMensaje(`Producto "${formData.nombre}" registrado al final del catálogo con éxito.`);
    }

    cerrarModal();
  };

  const ejecutarEliminacion = () => {
    if (productoAEliminar) {
      eliminarProducto(productoAEliminar.idProducto);
      mostrarMensaje(`Producto "${productoAEliminar.nombre}" eliminado del catálogo.`);
      setProductoAEliminar(null);
    }
  };

  const handleRestablecer = () => {
    if (window.confirm('¿Restablecer el inventario a los 10 productos base de fábrica?')) {
      restablecerProductos();
      mostrarMensaje('Inventario restablecido a valores iniciales de fábrica.');
    }
  };

  const formatearCLP = (valor) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(valor);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorLogin('');
    const res = iniciarSesion(loginEmail, loginPassword);
    if (!res.ok) {
      setErrorLogin(res.mensaje);
      return;
    }
    if (res.usuario.rol !== 'admin') {
      setErrorLogin('Acceso denegado: Esta cuenta no tiene permisos de administrador.');
      return;
    }
    setSesion(res.usuario);
  };

  const handleCerrarSesion = () => {
    cerrarSesion();
    setSesion(null);
  };

  // ==============================================================
  // PANTALLA DE ACCESO RESTRINGIDO (LOGIN ADMIN CUADRADO Y SOBRIO)
  // ==============================================================
  if (!sesion || sesion.rol !== 'admin') {
    return (
      <div className="admin-wrapper py-5 d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-9 col-md-6 col-lg-4">
              <div className="admin-box p-4 bg-white shadow-sm">
                
                <div className="border-bottom pb-3 mb-3">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="fw-bold text-dark font-monospace" style={{ letterSpacing: '1px' }}>
                      FERREFIX
                    </span>
                    <span className="text-muted small">|</span>
                    <span className="small text-secondary fw-semibold">Control de Acceso</span>
                  </div>
                  <h1 className="h5 fw-bold text-dark mb-0">Iniciar Sesión Administrador</h1>
                </div>

                {errorLogin && (
                  <div className="alert alert-danger py-2 px-3 small rounded-1 mb-3" role="alert">
                    {errorLogin}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">Correo Electrónico</label>
                    <input 
                      type="email" 
                      className="form-control form-control-sm rounded-1"
                      placeholder="admin@ferrefix.cl"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">Contraseña</label>
                    <input 
                      type="password" 
                      className="form-control form-control-sm rounded-1"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-dark btn-sm w-100 fw-semibold rounded-1 py-2 mb-3"
                  >
                    Ingresar al Panel
                  </button>
                </form>

                <div className="p-3 bg-light border rounded-1 small text-secondary mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <strong className="text-dark">Credenciales de Acceso:</strong>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-link p-0 text-dark fw-bold text-decoration-none"
                      onClick={() => {
                        setLoginEmail('admin@ferrefix.cl');
                        setLoginPassword('admin123');
                        setErrorLogin('');
                      }}
                    >
                      Autocompletar
                    </button>
                  </div>
                  <div>Usuario: <code>admin@ferrefix.cl</code></div>
                  <div>Clave: <code>admin123</code></div>
                </div>

                <div className="text-center pt-2 border-top">
                  <Link to="/" className="text-decoration-none text-muted small">
                    ← Volver a la Tienda
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // PANEL ADMINISTRATIVO PRINCIPAL (CUADRADO, PROFESIONAL, SIN IA)
  // ==============================================================
  return (
    <div className="admin-wrapper">

      {/* Barra de Navegación Exclusiva del Panel Admin */}
      <nav className="admin-navbar py-2 px-3">
        <div className="container-fluid d-flex flex-wrap align-items-center justify-content-between gap-2">
          
          {/* Marca / Identificador */}
          <div className="d-flex align-items-center gap-3">
            <Link to="/admin" className="text-decoration-none d-flex align-items-center gap-2">
              <span className="fw-bold text-white fs-5" style={{ fontFamily: '"Oswald", sans-serif', letterSpacing: '1px' }}>
                FERREFIX
              </span>
              <span className="badge bg-secondary text-white fw-normal font-monospace rounded-1 px-2" style={{ fontSize: '0.72rem' }}>
                ADMIN
              </span>
            </Link>

            {/* Pestañas de la barra */}
            <div className="d-flex align-items-center gap-1 ms-2">
              <button 
                type="button"
                className={`admin-nav-btn ${tabActiva === 'dashboard' ? 'active' : ''}`}
                onClick={() => setTabActiva('dashboard')}
              >
                Dashboard
              </button>
              <button 
                type="button"
                className={`admin-nav-btn ${tabActiva === 'productos' ? 'active' : ''}`}
                onClick={() => setTabActiva('productos')}
              >
                Productos ({productos.length})
              </button>
              <button 
                type="button"
                className={`admin-nav-btn ${tabActiva === 'ordenes' ? 'active' : ''}`}
                onClick={() => setTabActiva('ordenes')}
              >
                Órdenes ({ordenes.length})
              </button>
            </div>
          </div>

          {/* Acciones del Administrador en la barra */}
          <div className="d-flex align-items-center gap-2">
            <button 
              type="button" 
              className="btn btn-warning btn-sm fw-semibold text-dark rounded-1 px-3"
              onClick={abrirModalCrear}
            >
              + Agregar Producto
            </button>

            <button 
              type="button" 
              className="btn btn-outline-secondary btn-sm text-light border-secondary rounded-1 px-2"
              onClick={handleRestablecer}
              title="Restablecer base de datos inicial de fábrica"
            >
              Restablecer BD
            </button>

            <div className="vr bg-secondary mx-1 d-none d-md-block" style={{ height: '24px' }}></div>

            <span className="text-white-50 small d-none d-md-inline font-monospace">
              {sesion.email}
            </span>

            <button 
              type="button" 
              className="btn btn-outline-light btn-sm rounded-1 px-2"
              onClick={handleCerrarSesion}
              title="Cerrar Sesión de Administrador"
            >
              Salir
            </button>
          </div>

        </div>
      </nav>

      {/* Contenedor Principal */}
      <main className="container-fluid px-3 px-md-4 py-4">

        {/* Notificación informativa */}
        {mensajeAlerta && (
          <div className="admin-box p-3 mb-3 bg-white d-flex justify-content-between align-items-center" role="alert">
            <span className="small fw-semibold text-dark">
              {mensajeAlerta.texto}
            </span>
            <button 
              type="button" 
              className="btn-close btn-close-sm" 
              onClick={() => setMensajeAlerta(null)}
              aria-label="Cerrar"
            ></button>
          </div>
        )}

        {/* ============================================================== */}
        {/* VISTA: DASHBOARD                                               */}
        {/* ============================================================== */}
        {tabActiva === 'dashboard' && (
          <div>
            {/* 4 Cajas KPI Cuadradas y Sobrias */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="admin-kpi-box">
                  <div className="text-secondary small fw-semibold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                    Productos en Catálogo
                  </div>
                  <div className="fs-3 fw-bold text-dark mt-1">
                    {metricas.totalProductos}
                  </div>
                  <div className="text-muted small mt-1" style={{ fontSize: '0.8rem' }}>
                    Artículos registrados
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="admin-kpi-box">
                  <div className="text-secondary small fw-semibold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                    Stock Crítico (≤ 5 unids)
                  </div>
                  <div className="fs-3 fw-bold text-dark mt-1">
                    {metricas.stockCriticoCount}
                  </div>
                  <div className="text-muted small mt-1" style={{ fontSize: '0.8rem' }}>
                    {metricas.stockCriticoCount > 0 ? 'Requieren reposición' : 'Niveles óptimos'}
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="admin-kpi-box">
                  <div className="text-secondary small fw-semibold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                    Valor Total Inventario
                  </div>
                  <div className="fs-3 fw-bold text-dark mt-1 font-monospace" style={{ fontSize: '1.4rem' }}>
                    {formatearCLP(metricas.valorInventario)}
                  </div>
                  <div className="text-muted small mt-1" style={{ fontSize: '0.8rem' }}>
                    Precio venta × stock
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="admin-kpi-box">
                  <div className="text-secondary small fw-semibold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                    Ventas Registradas
                  </div>
                  <div className="fs-3 fw-bold text-dark mt-1 font-monospace" style={{ fontSize: '1.4rem' }}>
                    {formatearCLP(metricas.totalVentas)}
                  </div>
                  <div className="text-muted small mt-1" style={{ fontSize: '0.8rem' }}>
                    {metricas.totalOrdenes} órdenes procesadas
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de Inventario Crítico extendida a ancho completo */}
            <div className="row g-4">
              <div className="col-12">
                <div className="admin-box p-3 bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <div>
                      <h2 className="h6 fw-bold text-dark mb-0">Inventario con Stock Crítico (≤ 5)</h2>
                      <span className="text-muted small">Productos que requieren reposición prioritaria de inventario</span>
                    </div>
                    <button 
                      type="button"
                      className="btn btn-outline-dark btn-sm rounded-1"
                      onClick={() => {
                        setTabActiva('productos');
                        setFiltroStockCritico(true);
                      }}
                    >
                      Ir a Inventario Completo →
                    </button>
                  </div>

                  {metricas.stockCriticoCount === 0 ? (
                    <div className="p-3 text-secondary bg-light text-center rounded-1 small">
                      Todos los productos cuentan con stock superior a 5 unidades.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table admin-table align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th className="text-center">Stock Disponible</th>
                            <th className="text-end">Precio (CLP)</th>
                            <th className="text-end">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productos
                            .filter((p) => Number(p.stock) <= 5)
                            .map((p) => (
                              <tr key={p.idProducto}>
                                <td className="font-monospace small text-muted">#{p.idProducto}</td>
                                <td>
                                  <div className="fw-semibold text-dark small">{p.nombre}</div>
                                  <div className="text-muted" style={{ fontSize: '0.78rem' }}>{p.marca}</div>
                                </td>
                                <td><span className="badge bg-light text-dark border rounded-1">{p.categoria}</span></td>
                                <td className="text-center">
                                  <span className="badge bg-secondary text-white rounded-1">
                                    {p.stock} unids (Bajo)
                                  </span>
                                </td>
                                <td className="text-end font-monospace small">{formatearCLP(p.precioVenta)}</td>
                                <td className="text-end">
                                  <button 
                                    type="button"
                                    className="btn btn-sm btn-outline-dark rounded-1 py-0 px-2"
                                    onClick={() => abrirModalEditar(p)}
                                  >
                                    Editar Stock
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VISTA: INVENTARIO DE PRODUCTOS (CRUD)                          */}
        {/* ============================================================== */}
        {tabActiva === 'productos' && (
          <div className="admin-box p-3 bg-white">
            
            {/* Barra de Filtros y Búsqueda */}
            <div className="row g-2 align-items-center mb-3 pb-3 border-bottom">
              <div className="col-12 col-md-4">
                <input 
                  type="text" 
                  className="form-control form-control-sm rounded-1"
                  placeholder="Buscar por nombre, marca o código..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="col-6 col-md-3">
                <select 
                  className="form-select form-select-sm rounded-1"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  {CATEGORIAS_PRODUCTOS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="col-6 col-md-3">
                <button 
                  type="button"
                  className={`btn btn-sm w-100 rounded-1 ${filtroStockCritico ? 'btn-dark' : 'btn-outline-dark'}`}
                  onClick={() => setFiltroStockCritico(!filtroStockCritico)}
                >
                  {filtroStockCritico ? 'Mostrando solo críticos (≤ 5)' : 'Filtrar stock crítico'}
                </button>
              </div>

              <div className="col-12 col-md-2 text-md-end">
                <button 
                  type="button" 
                  className="btn btn-warning btn-sm w-100 fw-semibold text-dark rounded-1"
                  onClick={abrirModalCrear}
                >
                  + Agregar Producto
                </button>
              </div>
            </div>

            {/* Tabla de Productos */}
            <div className="table-responsive">
              <table className="table admin-table align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: '45px' }}></th>
                    <th>Código</th>
                    <th>Nombre / Descripción</th>
                    <th>Marca</th>
                    <th>Categoría</th>
                    <th className="text-end">Precio (CLP)</th>
                    <th className="text-center">Stock</th>
                    <th className="text-end" style={{ width: '130px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted small">
                        No se encontraron productos registrados con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    productosFiltrados.map((prod) => {
                      const esBajo = Number(prod.stock) <= 5;
                      return (
                        <tr key={prod.idProducto}>
                          <td>
                            <img 
                              src={prod.imagen || '/banner-web.webp'} 
                              alt={prod.nombre} 
                              className="border rounded-1 bg-white object-fit-contain"
                              style={{ width: '38px', height: '38px' }}
                              onError={(e) => { e.target.src = '/banner-web.webp'; }}
                            />
                          </td>
                          <td className="font-monospace small text-muted">
                            #{prod.idProducto}
                          </td>
                          <td>
                            <div className="fw-semibold text-dark small">{prod.nombre}</div>
                          </td>
                          <td className="small text-secondary">{prod.marca}</td>
                          <td>
                            <span className="badge bg-light text-dark border rounded-1">
                              {prod.categoria}
                            </span>
                          </td>
                          <td className="text-end font-monospace small fw-semibold">
                            {formatearCLP(prod.precioVenta)}
                          </td>
                          <td className="text-center">
                            <span className={`badge rounded-1 ${esBajo ? 'bg-dark text-warning border' : 'bg-light text-dark border'}`}>
                              {prod.stock} unids {esBajo ? '(Bajo)' : ''}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button 
                                type="button"
                                className="btn btn-outline-dark rounded-1 px-2 py-0 me-1"
                                onClick={() => abrirModalEditar(prod)}
                                title="Editar producto"
                              >
                                Editar
                              </button>
                              <button 
                                type="button"
                                className="btn btn-outline-danger rounded-1 px-2 py-0"
                                onClick={() => setProductoAEliminar(prod)}
                                title="Eliminar producto"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top small text-muted">
              <span>Mostrando {productosFiltrados.length} de {productos.length} productos en total</span>
              <span>Categoría: {filtroCategoria}</span>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* VISTA: ÓRDENES / BOLETAS                                      */}
        {/* ============================================================== */}
        {tabActiva === 'ordenes' && (
          <div className="admin-box p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div>
                <h2 className="h6 fw-bold text-dark mb-0">Registro de Órdenes y Ventas</h2>
                <span className="text-muted small">Listado de transacciones registradas</span>
              </div>
              <span className="badge bg-light text-dark border rounded-1">
                {ordenes.length} órdenes registradas
              </span>
            </div>

            <div className="table-responsive">
              <table className="table admin-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>N° Orden</th>
                    <th>Fecha / Hora</th>
                    <th>Cliente</th>
                    <th>Dirección de Entrega</th>
                    <th>Método de Pago</th>
                    <th className="text-end">Total Pagado</th>
                    <th>Estado</th>
                    <th className="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.map((ord) => (
                    <tr key={ord.idOrden}>
                      <td className="font-monospace small fw-bold text-dark">
                        #{ord.idOrden}
                      </td>
                      <td className="small text-muted">{ord.fecha}</td>
                      <td>
                        <div className="fw-semibold text-dark small">{ord.cliente.nombre}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{ord.cliente.email}</div>
                      </td>
                      <td className="small text-muted text-truncate" style={{ maxWidth: '220px' }}>
                        {ord.cliente.direccion}
                      </td>
                      <td className="small text-secondary">{ord.metodoPago}</td>
                      <td className="text-end font-monospace small fw-bold text-dark">
                        {formatearCLP(ord.total)}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border rounded-1">
                          {ord.estado}
                        </span>
                      </td>
                      <td className="text-end">
                        <button 
                          type="button"
                          className="btn btn-sm btn-outline-dark rounded-1 py-0 px-2"
                          onClick={() => setOrdenSeleccionada(ord)}
                        >
                          Ver Boleta
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </main>

      {/* ============================================================== */}
      {/* MODAL: FORMULARIO AGREGAR / EDITAR PRODUCTO (CUADRADO)         */}
      {/* ============================================================== */}
      {modalAbierto && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-1 border-0 shadow">
              
              <div className="modal-header border-bottom bg-light py-2 px-3">
                <h5 className="modal-title fw-bold text-dark h6 mb-0">
                  {modoEdicion ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                </h5>
                <button type="button" className="btn-close btn-close-sm" onClick={cerrarModal} aria-label="Cerrar"></button>
              </div>

              <form onSubmit={handleSubmitForm}>
                <div className="modal-body p-3">
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-secondary mb-1">Código ID</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm rounded-1 font-monospace"
                        value={formData.idProducto}
                        disabled={modoEdicion}
                        onChange={(e) => setFormData({ ...formData, idProducto: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold text-secondary mb-1">Nombre del Producto *</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm rounded-1"
                        placeholder="Ej: Taladro Percutor 20V Max XR"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">Marca *</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm rounded-1"
                        placeholder="Ej: DeWalt, Bosch, Makita..."
                        value={formData.marca}
                        onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">Categoría *</label>
                      <select 
                        className="form-select form-select-sm rounded-1"
                        value={formData.categoria}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      >
                        {CATEGORIAS_PRODUCTOS.filter(c => c !== 'Todas').map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">Precio Unitario (CLP) *</label>
                      <input 
                        type="number" 
                        min="0"
                        step="100"
                        className="form-control form-control-sm rounded-1 font-monospace"
                        placeholder="129990"
                        value={formData.precioVenta}
                        onChange={(e) => setFormData({ ...formData, precioVenta: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">Stock Disponible *</label>
                      <input 
                        type="number" 
                        min="0"
                        className="form-control form-control-sm rounded-1 font-monospace"
                        placeholder="10"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary mb-1">URL de Imagen (Opcional)</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm rounded-1"
                        placeholder="Por defecto: /arriendo-bosch.jpg"
                        value={formData.imagen}
                        onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary mb-1">Descripción</label>
                      <textarea 
                        className="form-control form-control-sm rounded-1"
                        rows="3"
                        placeholder="Descripción técnica del producto..."
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top py-2 px-3">
                  <button type="button" className="btn btn-sm btn-outline-secondary rounded-1" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-sm btn-warning text-dark fw-semibold rounded-1 px-3">
                    {modoEdicion ? 'Guardar Cambios' : 'Registrar Producto'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIRMACIÓN DE ELIMINACIÓN                             */}
      {/* ============================================================== */}
      {productoAEliminar && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-1 border-0 shadow">
              <div className="modal-body p-4 text-center">
                <h5 className="fw-bold text-dark h6 mb-2">¿Eliminar producto?</h5>
                <p className="small text-secondary mb-4">
                  Se dará de baja el producto <strong>"{productoAEliminar.nombre}"</strong> (#{productoAEliminar.idProducto}) del catálogo en localStorage.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary rounded-1 px-3" 
                    onClick={() => setProductoAEliminar(null)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-danger rounded-1 px-3" 
                    onClick={ejecutarEliminacion}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: VER BOLETA                                              */}
      {/* ============================================================== */}
      {ordenSeleccionada && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-1 border-0 shadow">
              <div className="modal-header border-bottom py-2 px-3 bg-light">
                <h5 className="modal-title h6 fw-bold mb-0">
                  Boleta Electrónica #{ordenSeleccionada.idOrden}
                </h5>
                <button type="button" className="btn-close btn-close-sm" onClick={() => setOrdenSeleccionada(null)}></button>
              </div>

              <div className="modal-body p-3">
                <div className="border-bottom pb-2 mb-3">
                  <div className="fw-bold text-dark">FERREFIX</div>
                  <small className="text-muted">RUT: 76.845.120-K | Antonio Varas 666, Providencia</small>
                </div>

                <div className="small mb-3">
                  <div><strong>Fecha:</strong> {ordenSeleccionada.fecha}</div>
                  <div><strong>Cliente:</strong> {ordenSeleccionada.cliente.nombre}</div>
                  <div><strong>Email:</strong> {ordenSeleccionada.cliente.email}</div>
                  <div><strong>Dirección:</strong> {ordenSeleccionada.cliente.direccion}</div>
                  <div><strong>Método:</strong> {ordenSeleccionada.metodoPago}</div>
                </div>

                <div className="table-responsive border rounded-1 mb-3">
                  <table className="table table-sm align-middle mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th>Ítem</th>
                        <th className="text-center">Cant.</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordenSeleccionada.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.nombre}</td>
                          <td className="text-center">{item.cantidad}</td>
                          <td className="text-end font-monospace">{formatearCLP(item.precioUnitario * item.cantidad)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                  <span className="fw-bold text-dark">Total:</span>
                  <span className="fw-bold text-dark fs-5 font-monospace">{formatearCLP(ordenSeleccionada.total)}</span>
                </div>
              </div>

              <div className="modal-footer border-top py-2 px-3 bg-light">
                <button 
                  type="button" 
                  className="btn btn-outline-dark btn-sm rounded-1"
                  onClick={() => window.print()}
                >
                  Imprimir Boleta
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm rounded-1" 
                  onClick={() => setOrdenSeleccionada(null)}
                >
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Admin;
