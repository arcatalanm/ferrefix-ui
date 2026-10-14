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
  // Estado de autenticación desde localStorage
  const [sesion, setSesion] = useState(obtenerSesionActiva);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState('');

  const [productos, setProductos] = useState(obtenerProductos);
  const [ordenes, setOrdenes] = useState(obtenerOrdenes);
  const [tabActiva, setTabActiva] = useState('dashboard'); // 'dashboard' | 'productos' | 'ordenes'
  
  // Filtros del panel de inventario
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroStockCritico, setFiltroStockCritico] = useState(false);

  // Estados de modales y formularios
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState(FORM_INICIAL);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [mensajeAlerta, setMensajeAlerta] = useState(null);

  // Sincronizar en tiempo real con cambios en el storage
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

  // Notificación tipo Toast/Alerta
  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensajeAlerta({ texto, tipo });
    setTimeout(() => {
      setMensajeAlerta(null);
    }, 3500);
  };

  // Métricas calculadas para el Dashboard
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

  // Filtrado de la tabla de productos
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

  // Manejo de Modal Crear/Editar
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
      mostrarMensaje('Nombre y marca son campos requeridos.', 'danger');
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
      mostrarMensaje(`Producto "${formData.nombre}" actualizado correctamente.`);
    } else {
      crearProducto({
        idProducto: formData.idProducto,
        nombre: formData.nombre.trim(),
        marca: formData.marca.trim(),
        categoria: formData.categoria,
        precioVenta: Number(formData.precioVenta) || 0,
        stock: Number(formData.stock) || 0,
        descripcion: formData.descripcion.trim(),
        imagen: formData.imagen.trim() || '/banner-web.webp'
      });
      mostrarMensaje(`Producto "${formData.nombre}" creado exitosamente.`);
    }

    cerrarModal();
  };

  const confirmarEliminar = (prod) => {
    setProductoAEliminar(prod);
  };

  const ejecutarEliminacion = () => {
    if (productoAEliminar) {
      eliminarProducto(productoAEliminar.idProducto);
      mostrarMensaje(`Producto "${productoAEliminar.nombre}" eliminado del catálogo.`, 'warning');
      setProductoAEliminar(null);
    }
  };

  const handleRestablecer = () => {
    if (window.confirm('¿Estás seguro de restablecer el catálogo al estado original de fábrica?')) {
      restablecerProductos();
      mostrarMensaje('Catálogo restablecido con los 10 productos base de fábrica.', 'info');
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
      setErrorLogin('Acceso denegado: Esta cuenta no posee permisos de administrador.');
      return;
    }
    setSesion(res.usuario);
  };

  const handleCerrarSesion = () => {
    cerrarSesion();
    setSesion(null);
  };

  // Si no está autenticado como administrador, se muestra la pantalla de login protegida
  if (!sesion || sesion.rol !== 'admin') {
    return (
      <div className="admin-login-screen bg-light py-5 min-vh-75 d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-5">
              <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white">
                <div className="text-center mb-4">
                  <div className="p-3 bg-dark text-warning rounded-circle d-inline-flex mb-3 shadow-sm">
                    <i className="bi bi-shield-lock-fill fs-1"></i>
                  </div>
                  <h2 className="fw-bold text-dark h4 mb-1" style={{ fontFamily: '"Oswald", sans-serif' }}>
                    Acceso Administrativo
                  </h2>
                  <p className="text-muted small mb-0">
                    Esta ruta es de acceso restringido. Ingresa tus credenciales de administrador para continuar.
                  </p>
                </div>

                {errorLogin && (
                  <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                    <div>{errorLogin}</div>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Correo Electrónico</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-envelope text-muted"></i>
                      </span>
                      <input 
                        type="email" 
                        className="form-control border-start-0 bg-light"
                        placeholder="admin@ferrefix.cl"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-semibold">Contraseña</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-key text-muted"></i>
                      </span>
                      <input 
                        type="password" 
                        className="form-control border-start-0 bg-light"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-warning w-100 fw-semibold text-dark py-2 rounded-3 shadow-sm mb-3"
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Ingresar al Panel
                  </button>
                </form>

                {/* Tarjeta de credenciales de prueba precargadas en localStorage */}
                <div className="bg-platino p-3 rounded-3 small text-muted border mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <strong className="text-dark">
                      <i className="bi bi-person-badge me-1"></i>
                      Credenciales de Prueba (localStorage):
                    </strong>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-link p-0 text-decoration-none text-dark fw-bold"
                      onClick={() => {
                        setLoginEmail('admin@ferrefix.cl');
                        setLoginPassword('admin123');
                        setErrorLogin('');
                      }}
                    >
                      Autocompletar
                    </button>
                  </div>
                  <div><strong>Email:</strong> <code>admin@ferrefix.cl</code></div>
                  <div><strong>Contraseña:</strong> <code>admin123</code></div>
                  <div className="mt-1 text-muted" style={{ fontSize: '0.78rem' }}>
                    * También disponible: <code>ariel@ferrefix.cl</code> / <code>admin123</code>
                  </div>
                </div>

                <div className="text-center">
                  <Link to="/" className="text-decoration-none text-secondary small">
                    <i className="bi bi-arrow-left me-1"></i>
                    Volver a la tienda
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page bg-light py-4 py-md-5">
      <div className="container">

        {/* Encabezado del Backoffice */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-dark text-warning px-3 py-2 fs-6 rounded-pill">
                <i className="bi bi-shield-lock-fill me-1"></i> Backoffice
              </span>
              <span className="badge bg-secondary-subtle text-secondary px-2 py-1 rounded">
                Simulación BD (localStorage)
              </span>
            </div>
            <h1 className="h3 fw-bold mb-0 text-dark">
              Panel Administrativo Ferrefix
            </h1>
            <p className="text-muted small mb-0">
              Gestión centralizada de catálogo, inventario, productos críticos y órdenes.
            </p>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="badge bg-white text-dark border px-3 py-2 rounded-pill small">
              <i className="bi bi-person-check-fill text-success me-1"></i>
              {sesion.nombre}
            </span>
            <button 
              type="button" 
              className="btn btn-outline-danger btn-sm rounded-3 d-flex align-items-center gap-1"
              onClick={handleRestablecer}
              title="Restaura los 10 productos base iniciales"
            >
              <i className="bi bi-arrow-counterclockwise"></i>
              Restablecer BD
            </button>
            <Link to="/catalogo" className="btn btn-outline-dark btn-sm rounded-3 d-flex align-items-center gap-1">
              <i className="bi bi-shop"></i>
              Ver Catálogo
            </Link>
            <button 
              type="button" 
              className="btn btn-danger btn-sm rounded-3 d-flex align-items-center gap-1"
              onClick={handleCerrarSesion}
              title="Cerrar sesión de administrador"
            >
              <i className="bi bi-box-arrow-right"></i>
              Salir
            </button>
          </div>
        </div>

        {/* Toast / Alerta interactiva */}
        {mensajeAlerta && (
          <div className={`alert alert-${mensajeAlerta.tipo} alert-dismissible fade show rounded-3 shadow-sm d-flex align-items-center`} role="alert">
            <i className="bi bi-info-circle-fill me-2 fs-5"></i>
            <div>{mensajeAlerta.texto}</div>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setMensajeAlerta(null)} 
              aria-label="Cerrar"
            ></button>
          </div>
        )}

        {/* Pestañas de navegación del Backoffice */}
        <ul className="nav nav-pills bg-white p-2 rounded-4 shadow-sm mb-4 border">
          <li className="nav-item">
            <button 
              className={`nav-link px-4 py-2 rounded-3 fw-semibold ${tabActiva === 'dashboard' ? 'active bg-warning text-dark' : 'text-secondary'}`}
              onClick={() => setTabActiva('dashboard')}
            >
              <i className="bi bi-speedometer2 me-2"></i>
              Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link px-4 py-2 rounded-3 fw-semibold ${tabActiva === 'productos' ? 'active bg-warning text-dark' : 'text-secondary'}`}
              onClick={() => setTabActiva('productos')}
            >
              <i className="bi bi-boxes me-2"></i>
              Gestión de Productos ({productos.length})
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link px-4 py-2 rounded-3 fw-semibold ${tabActiva === 'ordenes' ? 'active bg-warning text-dark' : 'text-secondary'}`}
              onClick={() => setTabActiva('ordenes')}
            >
              <i className="bi bi-receipt me-2"></i>
              Órdenes / Boletas ({ordenes.length})
            </button>
          </li>
        </ul>

        {/* ============================================================== */}
        {/* VISTA 1: DASHBOARD (MÉTRICAS Y STOCK CRÍTICO)                  */}
        {/* ============================================================== */}
        {tabActiva === 'dashboard' && (
          <div className="admin-tab-content">
            {/* Tarjetas KPI */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <span className="text-muted small fw-medium">Total Productos</span>
                      <h3 className="fw-bold text-dark mt-1 mb-0">{metricas.totalProductos}</h3>
                      <small className="text-success fw-semibold">
                        <i className="bi bi-check-circle me-1"></i>En catálogo
                      </small>
                    </div>
                    <div className="p-3 bg-primary-subtle text-primary rounded-4">
                      <i className="bi bi-box-seam fs-3"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <span className="text-muted small fw-medium">Stock Crítico (≤ 5)</span>
                      <h3 className="fw-bold text-danger mt-1 mb-0">{metricas.stockCriticoCount}</h3>
                      <small className="text-muted">Requieren reposición</small>
                    </div>
                    <div className="p-3 bg-danger-subtle text-danger rounded-4">
                      <i className="bi bi-exclamation-triangle fs-3"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <span className="text-muted small fw-medium">Valor del Inventario</span>
                      <h4 className="fw-bold text-dark mt-1 mb-0">{formatearCLP(metricas.valorInventario)}</h4>
                      <small className="text-muted">Cálculo precio × stock</small>
                    </div>
                    <div className="p-3 bg-warning-subtle text-warning-emphasis rounded-4">
                      <i className="bi bi-cash-stack fs-3"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <span className="text-muted small fw-medium">Ventas Registradas</span>
                      <h4 className="fw-bold text-success mt-1 mb-0">{formatearCLP(metricas.totalVentas)}</h4>
                      <small className="text-muted">{metricas.totalOrdenes} órdenes totales</small>
                    </div>
                    <div className="p-3 bg-success-subtle text-success rounded-4">
                      <i className="bi bi-receipt-cutoff fs-3"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accesos rápidos & Alerta de Stock Crítico */}
            <div className="row g-4">
              <div className="col-12 col-lg-8">
                <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0 text-dark">
                      <i className="bi bi-exclamation-octagon-fill text-danger me-2"></i>
                      Atención: Productos con Stock Crítico
                    </h5>
                    <button 
                      className="btn btn-outline-danger btn-sm rounded-3"
                      onClick={() => {
                        setTabActiva('productos');
                        setFiltroStockCritico(true);
                      }}
                    >
                      Ver en Inventario
                    </button>
                  </div>

                  {metricas.stockCriticoCount === 0 ? (
                    <div className="alert alert-success mb-0 rounded-3">
                      <i className="bi bi-shield-check me-2"></i>
                      Todo el inventario cuenta con stock suficiente superior a 5 unidades.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light small">
                          <tr>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Stock</th>
                            <th>Precio</th>
                            <th className="text-end">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productos
                            .filter((p) => Number(p.stock) <= 5)
                            .map((p) => (
                              <tr key={p.idProducto}>
                                <td>
                                  <div className="fw-semibold text-dark">{p.nombre}</div>
                                  <small className="text-muted">ID: {p.idProducto} | {p.marca}</small>
                                </td>
                                <td><span className="badge bg-light text-dark border">{p.categoria}</span></td>
                                <td>
                                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                                    {p.stock} unids.
                                  </span>
                                </td>
                                <td className="fw-semibold">{formatearCLP(p.precioVenta)}</td>
                                <td className="text-end">
                                  <button 
                                    className="btn btn-sm btn-outline-warning text-dark rounded-3"
                                    onClick={() => abrirModalEditar(p)}
                                  >
                                    <i className="bi bi-pencil-fill me-1"></i>Reponer
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

              {/* Tarjeta de acciones rápidas */}
              <div className="col-12 col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
                  <h5 className="fw-bold mb-3 text-dark">
                    <i className="bi bi-lightning-charge-fill text-warning me-2"></i>
                    Acciones de Gestión
                  </h5>
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-warning fw-semibold text-dark py-2 rounded-3 shadow-sm"
                      onClick={abrirModalCrear}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Registrar Nuevo Producto
                    </button>
                    <button 
                      className="btn btn-outline-dark py-2 rounded-3"
                      onClick={() => setTabActiva('productos')}
                    >
                      <i className="bi bi-table me-2"></i>
                      Ver Tabla de Inventario Completa
                    </button>
                    <button 
                      className="btn btn-outline-secondary py-2 rounded-3"
                      onClick={() => setTabActiva('ordenes')}
                    >
                      <i className="bi bi-receipt me-2"></i>
                      Consultar Órdenes y Boletas
                    </button>
                  </div>

                  <hr className="my-4" />

                  <div className="p-3 bg-platino rounded-3 text-muted small">
                    <strong className="text-dark d-block mb-1">
                      <i className="bi bi-hdd-network me-1"></i>
                      Persistencia Activa
                    </strong>
                    Cualquier alta, baja o edición realizada se almacena de inmediato en <code>localStorage</code> y se refleja en la tienda en tiempo real.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VISTA 2: GESTIÓN DE PRODUCTOS (CRUD COMPLETO)                  */}
        {/* ============================================================== */}
        {tabActiva === 'productos' && (
          <div className="admin-tab-content">
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
              
              {/* Barra superior de herramientas y filtros */}
              <div className="row g-3 align-items-center mb-4">
                <div className="col-12 col-md-5">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input 
                      type="text" 
                      className="form-control border-start-0 bg-light"
                      placeholder="Buscar por nombre, marca o ID..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                    {busqueda && (
                      <button 
                        className="btn btn-light border-start-0" 
                        onClick={() => setBusqueda('')}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    )}
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <select 
                    className="form-select bg-light"
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                  >
                    {CATEGORIAS_PRODUCTOS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="col-6 col-md-2">
                  <button 
                    className={`btn w-100 rounded-3 ${filtroStockCritico ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={() => setFiltroStockCritico(!filtroStockCritico)}
                  >
                    <i className="bi bi-funnel me-1"></i>
                    {filtroStockCritico ? 'Críticos (≤ 5)' : 'Filtrar Críticos'}
                  </button>
                </div>

                <div className="col-12 col-md-2 text-md-end">
                  <button 
                    className="btn btn-warning fw-semibold text-dark w-100 rounded-3 shadow-sm"
                    onClick={abrirModalCrear}
                  >
                    <i className="bi bi-plus-lg me-1"></i>
                    Nuevo
                  </button>
                </div>
              </div>

              {/* Tabla de Productos */}
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th style={{ width: '60px' }}>Foto</th>
                      <th>Producto / Marca</th>
                      <th>Categoría</th>
                      <th>Precio Unitario</th>
                      <th>Stock Disponible</th>
                      <th className="text-end" style={{ width: '150px' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">
                          <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                          No se encontraron productos con los criterios seleccionados.
                        </td>
                      </tr>
                    ) : (
                      productosFiltrados.map((prod) => {
                        const stockNum = Number(prod.stock);
                        const esCritico = stockNum <= 5;
                        const esMedio = stockNum > 5 && stockNum <= 10;

                        return (
                          <tr key={prod.idProducto}>
                            <td>
                              <img 
                                src={prod.imagen || '/banner-web.webp'} 
                                alt={prod.nombre} 
                                className="rounded-3 border object-fit-contain bg-white"
                                style={{ width: '48px', height: '48px' }}
                                onError={(e) => { e.target.src = '/banner-web.webp'; }}
                              />
                            </td>
                            <td>
                              <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '280px' }}>
                                {prod.nombre}
                              </div>
                              <small className="text-muted">
                                ID: <span className="font-monospace">{prod.idProducto}</span> | Marca: <strong>{prod.marca}</strong>
                              </small>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {prod.categoria}
                              </span>
                            </td>
                            <td className="fw-bold text-dark">
                              {formatearCLP(prod.precioVenta)}
                            </td>
                            <td>
                              <span 
                                className={`badge px-2 py-1 rounded-pill ${
                                  esCritico 
                                    ? 'bg-danger-subtle text-danger border border-danger-subtle' 
                                    : esMedio
                                    ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                                    : 'bg-success-subtle text-success border border-success-subtle'
                                }`}
                              >
                                {prod.stock} unid. {esCritico && '⚠️ Crítico'}
                              </span>
                            </td>
                            <td className="text-end">
                              <div className="btn-group btn-group-sm">
                                <Link 
                                  to={`/producto/${prod.idProducto}`} 
                                  className="btn btn-outline-secondary"
                                  title="Ver en la tienda"
                                  target="_blank"
                                >
                                  <i className="bi bi-eye"></i>
                                </Link>
                                <button 
                                  className="btn btn-outline-primary"
                                  title="Editar producto"
                                  onClick={() => abrirModalEditar(prod)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-danger"
                                  title="Eliminar producto"
                                  onClick={() => confirmarEliminar(prod)}
                                >
                                  <i className="bi bi-trash3"></i>
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

              {/* Pie de tabla con resumen */}
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top small text-muted">
                <span>Mostrando {productosFiltrados.length} de {productos.length} productos</span>
                <span>Filtro activo: {filtroCategoria} {filtroStockCritico ? '(Solo críticos)' : ''}</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VISTA 3: ÓRDENES / BOLETAS (SEGUIMIENTO DE VENTAS)              */}
        {/* ============================================================== */}
        {tabActiva === 'ordenes' && (
          <div className="admin-tab-content">
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-bold mb-1 text-dark">
                    <i className="bi bi-receipt-cutoff text-warning me-2"></i>
                    Historial de Boletas y Órdenes
                  </h5>
                  <p className="text-muted small mb-0">
                    Registro de compras realizadas por clientes en la plataforma.
                  </p>
                </div>
                <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-semibold">
                  {ordenes.length} Órdenes procesadas
                </span>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>N° Orden</th>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Dirección</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th className="text-end">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenes.map((ord) => (
                      <tr key={ord.idOrden}>
                        <td className="fw-bold font-monospace text-dark">
                          #{ord.idOrden}
                        </td>
                        <td className="small text-muted">{ord.fecha}</td>
                        <td>
                          <div className="fw-semibold text-dark">{ord.cliente.nombre}</div>
                          <small className="text-muted">{ord.cliente.email}</small>
                        </td>
                        <td className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                          {ord.cliente.direccion}
                        </td>
                        <td className="fw-bold text-success">
                          {formatearCLP(ord.total)}
                        </td>
                        <td>
                          <span className={`badge px-2 py-1 rounded-pill ${
                            ord.estado === 'Completada' 
                              ? 'bg-success-subtle text-success' 
                              : 'bg-info-subtle text-info-emphasis'
                          }`}>
                            {ord.estado}
                          </span>
                        </td>
                        <td className="text-end">
                          <button 
                            className="btn btn-sm btn-outline-dark rounded-3"
                            onClick={() => setOrdenSeleccionada(ord)}
                          >
                            <i className="bi bi-receipt me-1"></i>Ver Boleta
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* MODAL: CREAR / EDITAR PRODUCTO (CRUD)                          */}
      {/* ============================================================== */}
      {modalAbierto && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom bg-light rounded-top-4">
                <h5 className="modal-title fw-bold text-dark">
                  <i className={`bi ${modoEdicion ? 'bi-pencil-square text-primary' : 'bi-plus-circle-fill text-warning'} me-2`}></i>
                  {modoEdicion ? 'Editar Producto' : 'Registrar Nuevo Producto'}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModal} aria-label="Cerrar"></button>
              </div>

              <form onSubmit={handleSubmitForm}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Código / ID</label>
                      <input 
                        type="text" 
                        className="form-control bg-light font-monospace"
                        value={formData.idProducto}
                        disabled={modoEdicion}
                        onChange={(e) => setFormData({ ...formData, idProducto: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold">Nombre del Producto *</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="Ej: Taladro Percutor 20V..."
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Marca *</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="Ej: DeWalt, Bosch, Makita..."
                        value={formData.marca}
                        onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Categoría *</label>
                      <select 
                        className="form-select"
                        value={formData.categoria}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      >
                        {CATEGORIAS_PRODUCTOS.filter(c => c !== 'Todas').map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Precio de Venta (CLP) *</label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input 
                          type="number" 
                          min="0"
                          step="100"
                          className="form-control"
                          placeholder="59990"
                          value={formData.precioVenta}
                          onChange={(e) => setFormData({ ...formData, precioVenta: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Stock Inicial / Disponible *</label>
                      <input 
                        type="number" 
                        min="0"
                        className="form-control"
                        placeholder="10"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">URL de Imagen (Opcional)</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="https://ejemplo.com/foto.jpg o dejar vacío para imagen predeterminada"
                        value={formData.imagen}
                        onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Descripción Técnica</label>
                      <textarea 
                        className="form-control"
                        rows="3"
                        placeholder="Especificaciones, usos recomendados y detalles del producto..."
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top rounded-bottom-4">
                  <button type="button" className="btn btn-secondary rounded-3" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-warning fw-semibold text-dark rounded-3 px-4 shadow-sm">
                    <i className="bi bi-check-lg me-1"></i>
                    {modoEdicion ? 'Guardar Cambios' : 'Crear Producto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIRMAR ELIMINACIÓN                                   */}
      {/* ============================================================== */}
      {productoAEliminar && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-body p-4 text-center">
                <i className="bi bi-exclamation-triangle-fill text-danger display-4 mb-3 d-block"></i>
                <h5 className="fw-bold mb-2">¿Eliminar este producto?</h5>
                <p className="text-muted small mb-4">
                  Esta acción dará de baja el producto <strong>"{productoAEliminar.nombre}"</strong> (#{productoAEliminar.idProducto}) de la base de datos simulada en <code>localStorage</code>.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button 
                    type="button" 
                    className="btn btn-light px-4 rounded-3" 
                    onClick={() => setProductoAEliminar(null)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger px-4 rounded-3 fw-semibold" 
                    onClick={ejecutarEliminacion}
                  >
                    Sí, Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: VISTA DE BOLETA / DETALLE DE ORDEN                      */}
      {/* ============================================================== */}
      {ordenSeleccionada && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom bg-light rounded-top-4">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-receipt text-warning me-2"></i>
                  Boleta Electrónica #{ordenSeleccionada.idOrden}
                </h5>
                <button type="button" className="btn-close" onClick={() => setOrdenSeleccionada(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="border-bottom pb-3 mb-3">
                  <div className="fw-bold text-dark fs-5">FERREFIX SpA</div>
                  <small className="text-muted">RUT: 76.845.120-K | Antonio Varas 666, Providencia</small>
                </div>

                <div className="mb-3 small">
                  <div><strong>Fecha:</strong> {ordenSeleccionada.fecha}</div>
                  <div><strong>Cliente:</strong> {ordenSeleccionada.cliente.nombre}</div>
                  <div><strong>Email:</strong> {ordenSeleccionada.cliente.email}</div>
                  <div><strong>Dirección:</strong> {ordenSeleccionada.cliente.direccion}</div>
                  <div><strong>Método:</strong> {ordenSeleccionada.metodoPago}</div>
                </div>

                <div className="table-responsive border rounded-3 mb-3">
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
                          <td className="text-end">{formatearCLP(item.precioUnitario * item.cantidad)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                  <span className="fw-bold text-dark fs-5">Total Pagado:</span>
                  <span className="fw-bold text-success fs-5">{formatearCLP(ordenSeleccionada.total)}</span>
                </div>
              </div>
              <div className="modal-footer bg-light border-top rounded-bottom-4">
                <button 
                  type="button" 
                  className="btn btn-outline-dark btn-sm rounded-3"
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer me-1"></i>Imprimir Boleta
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm rounded-3" 
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
