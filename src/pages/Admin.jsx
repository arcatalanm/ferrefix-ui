import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  subirImagenProducto,
  CATEGORIAS_PRODUCTOS,
  EVENTO_PRODUCTOS_ACTUALIZADOS
} from '../data/productos';
import { obtenerOrdenes, EVENTO_ORDENES_ACTUALIZADAS, cargarOrdenes, useEstadoOrdenes } from '../data/ordenes';
import {
  obtenerSesionActiva,
  iniciarSesion,
  cerrarSesion,
  EVENTO_SESION_ACTUALIZADA
} from '../data/auth';
import ImagenProductoUploader from '../components/ImagenProductoUploader';
import GeneradorProductos from '../components/GeneradorProductos';
import { validadores } from '../data/validaciones';
import { obtenerContratosArriendo, EVENTO_MAQUINARIAS_ACTUALIZADAS, useEstadoArriendos, cargarContratosArriendo } from '../data/maquinarias';
import { obtenerMensajeApi } from '../services/crearClienteApi';
import { UNIDADES_VENTA, unidadVenta, cantidadPresentaciones } from '../utils/presentacionProducto';

const FORM_INICIAL = {
  idProducto: '',
  nombre: '',
  marca: '',
  categoria: 'Herramientas',
  precioVenta: '',
  stock: '',
  unidadVenta: 'unidad',
  contenidoPresentacion: '1 unidad',
  descripcionCorta: '',
  descripcionLarga: '',
  imagen: ''
};

function Admin() {
  const estadoOrdenes = useEstadoOrdenes();
  const estadoArriendos = useEstadoArriendos();

  const [sesion, setSesion] = useState(obtenerSesionActiva);
  const [loginIdentificador, setLoginIdentificador] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState('');
  const [iniciandoSesion, setIniciandoSesion] = useState(false);

  const [productos, setProductos] = useState(obtenerProductos);
  const [ordenes, setOrdenes] = useState(obtenerOrdenes);
  const [arriendos, setArriendos] = useState(obtenerContratosArriendo);
  const [tabActiva, setTabActiva] = useState('dashboard');

  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroStockCritico, setFiltroStockCritico] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState(FORM_INICIAL);
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorProducto, setErrorProducto] = useState('');
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [mensajeAlerta, setMensajeAlerta] = useState(null);

  useEffect(() => {
    const handleProductos = () => setProductos(obtenerProductos());
    const handleOrdenes = () => setOrdenes(obtenerOrdenes());
    const handleArriendos = () => setArriendos(obtenerContratosArriendo());
    const handleSesion = () => setSesion(obtenerSesionActiva());

    window.addEventListener(EVENTO_PRODUCTOS_ACTUALIZADOS, handleProductos);
    window.addEventListener(EVENTO_ORDENES_ACTUALIZADAS, handleOrdenes);
    window.addEventListener(EVENTO_MAQUINARIAS_ACTUALIZADAS, handleArriendos);
    window.addEventListener(EVENTO_SESION_ACTUALIZADA, handleSesion);

    return () => {
      window.removeEventListener(EVENTO_PRODUCTOS_ACTUALIZADOS, handleProductos);
      window.removeEventListener(EVENTO_ORDENES_ACTUALIZADAS, handleOrdenes);
      window.removeEventListener(EVENTO_MAQUINARIAS_ACTUALIZADAS, handleArriendos);
      window.removeEventListener(EVENTO_SESION_ACTUALIZADA, handleSesion);
    };
  }, []);

  const mostrarMensaje = (texto, tipo = 'dark') => {
    setMensajeAlerta({ texto, tipo });
    setTimeout(() => {
      setMensajeAlerta(null);
    }, 3500);
  };

  const metricas = useMemo(() => {
    const totalProductos = productos.length;
    const stockCriticoCount = productos.filter((p) => Number(p.stock) <= 5).length;
    const valorInventario = productos.reduce(
      (acc, p) => acc + (Number(p.precioVenta) || 0) * (Number(p.stock) || 0),
      0
    );
    const totalVentas = ordenes.filter(o => o.estado === 'Completada').reduce((acc, o) => acc + (Number(o.total) || 0), 0);

    return {
      totalProductos,
      stockCriticoCount,
      valorInventario,
      totalVentas,
      totalOrdenes: ordenes.length
    };
  }, [productos, ordenes]);

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

  const abrirModalCrear = () => {
    setErrorProducto('');
    setModoEdicion(false);
    setImagenArchivo(null);
    setFormData({ ...FORM_INICIAL });
    setModalAbierto(true);
  };

  const abrirModalEditar = (prod) => {
    setErrorProducto('');
    setModoEdicion(true);
    setImagenArchivo(null);
    setFormData({
      idProducto: prod.idProducto,
      especificaciones: prod.especificaciones,
      nombre: prod.nombre,
      marca: prod.marca,
      categoria: prod.categoria,
      precioVenta: prod.precioVenta,
      stock: prod.stock,
      unidadVenta: unidadVenta(prod),
      contenidoPresentacion: prod.contenidoPresentacion ?? '1 unidad',
      descripcionCorta: prod.descripcionCorta || '',
      descripcionLarga: prod.descripcionLarga || '',
      imagen: prod.imagen || ''
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setImagenArchivo(null);
    setFormData(FORM_INICIAL);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (subiendoImagen) return;
    setErrorProducto('');
    setSubiendoImagen(true);
    try {
      let imagen = formData.imagen.trim();
      if (imagenArchivo) {
        imagen = await subirImagenProducto(imagenArchivo);
        setFormData(prev => ({ ...prev, imagen }));
        setImagenArchivo(null);
      }
      if (!imagen) throw new Error('Selecciona una imagen para el producto.');
      const datos = { ...formData, imagen };
      if (modoEdicion) await actualizarProducto(formData.idProducto, datos);
      else await crearProducto(datos);
      mostrarMensaje(modoEdicion ? 'Producto actualizado.' : 'Producto creado.');
      cerrarModal();
    } catch (error) {
      setErrorProducto(error.response ? obtenerMensajeApi(error) : error.message);
    } finally {
      setSubiendoImagen(false);
    }
  };

  const ejecutarEliminacion = async () => {
    if (!productoAEliminar || subiendoImagen) return;
    setSubiendoImagen(true);
    try {
      await eliminarProducto(productoAEliminar.idProducto);
      mostrarMensaje('Producto desactivado.');
      setProductoAEliminar(null);
    } catch (error) {
      mostrarMensaje(obtenerMensajeApi(error), 'danger');
      setProductoAEliminar(null);
    } finally {
      setSubiendoImagen(false);
    }
  };

  const formatearCLP = (valor) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(valor);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (iniciandoSesion) return;
    const error = validadores.identificador(loginIdentificador) || validadores.requerido('La contraseña')(loginPassword);
    if (error) {
      setErrorLogin(error);
      return;
    }
    setErrorLogin('');
    setIniciandoSesion(true);
    const res = await iniciarSesion(loginIdentificador, loginPassword);
    setIniciandoSesion(false);
    if (!res.ok) {
      setErrorLogin(res.mensaje);
      return;
    }
    if (res.usuario.rol !== 'admin') {

      cerrarSesion();
      setSesion(null);
      setErrorLogin('Acceso denegado: Esta cuenta no tiene permisos de administrador.');
      return;
    }
    setSesion(res.usuario);
  };

  const handleCerrarSesion = () => {
    cerrarSesion();
    setSesion(null);
  };

  if (!sesion || sesion.rol !== 'admin') {
    return (
      <div className="admin-wrapper py-5 d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-9 col-md-6 col-lg-4">
              <div className="auth-card shadow-sm p-4">

                <div className="auth-head border-bottom pb-3 mb-3">
                  <div className="mb-2">
                    <img
                      src="/banner-web.webp"
                      alt="Ferrefix"
                      className="admin-login-banner"
                    />
                  </div>
                  <h1 className="auth-title mb-0">Iniciar Sesión Administrador</h1>
                </div>

                {errorLogin && (
                  <div className="alert alert-danger auth-alert py-2 px-3 rounded-1 mb-3" role="alert">
                    {errorLogin}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label admin-label mb-1">Correo electrónico o RUT</label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-1"
                      placeholder="tucorreo@hotmail.cl / 11.111.111-1"
                      autoComplete="username"
                      maxLength={254}
                      value={loginIdentificador}
                      onChange={(e) => setLoginIdentificador(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label admin-label mb-1">Contraseña</label>
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
                    disabled={iniciandoSesion}
                    className="btn btn-ambar auth-submit btn-sm w-100 rounded-1 py-2 mb-3"
                  >
                    {iniciandoSesion ? 'Conectando…' : 'Ingresar al Panel'}
                  </button>
                </form>

                <div className="auth-foot pt-2 border-top">
                  <Link to="/" className="auth-back-link">
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

  return (
    <div className="admin-wrapper">

      <nav className="admin-navbar py-2 px-3">
        <div className="container-fluid d-flex flex-wrap align-items-center justify-content-between gap-2">

          <div className="d-flex align-items-center gap-3">

            <div className="d-flex flex-wrap align-items-center gap-1 ms-2">
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
                Productos
              </button>
              <button
                type="button"
                className={`admin-nav-btn ${tabActiva === 'ordenes' ? 'active' : ''}`}
                onClick={() => setTabActiva('ordenes')}
              >
                Órdenes
              </button>
              <button
                type="button"
                className={`admin-nav-btn ${tabActiva === 'generadores' ? 'active' : ''}`}
                onClick={() => setTabActiva('generadores')}
              >
                Generadores
              </button>
              <button type="button" className={`admin-nav-btn ${tabActiva === 'arriendos' ? 'active' : ''}`}
                onClick={() => setTabActiva('arriendos')}>Arriendos</button>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-ambar admin-btn-strong btn-sm rounded-1 px-3"
              onClick={abrirModalCrear}
            >
              + Agregar Producto
            </button>

            <div className="vr admin-vr mx-1 d-none d-md-block"></div>

            <span className="admin-user-email d-none d-md-inline">
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

      <main className="container-fluid px-3 px-md-4 py-4">

        {mensajeAlerta && (
          <div className="admin-box p-3 mb-3 d-flex justify-content-between align-items-center" role="alert">
            <span className="admin-notice-text">
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

        {tabActiva === 'dashboard' && (
          <div>

            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="admin-kpi-box">
                  <div className="admin-kpi-title">
                    Productos en Catálogo
                  </div>
                  <div className="admin-kpi-value mt-1">
                    {metricas.totalProductos}
                  </div>
                  <div className="admin-kpi-subtitle mt-1">
                    Artículos registrados
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="admin-kpi-box">
                  <div className="admin-kpi-title">
                    Stock Crítico (≤ 5 unids)
                  </div>
                  <div className="admin-kpi-value mt-1">
                    {metricas.stockCriticoCount}
                  </div>
                  <div className="admin-kpi-subtitle mt-1">
                    {metricas.stockCriticoCount > 0 ? 'Requieren reposición' : 'Niveles óptimos'}
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="admin-kpi-box">
                  <div className="admin-kpi-title">
                    Valor Total Inventario
                  </div>
                  <div className="admin-kpi-value admin-kpi-value-mono mt-1">
                    {formatearCLP(metricas.valorInventario)}
                  </div>
                  <div className="admin-kpi-subtitle mt-1">
                    Precio venta × stock
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="admin-kpi-box">
                  <div className="admin-kpi-title">
                    Ventas Registradas
                  </div>
                  <div className="admin-kpi-value admin-kpi-value-mono mt-1">
                    {formatearCLP(metricas.totalVentas)}
                  </div>
                  <div className="admin-kpi-subtitle mt-1">
                    {metricas.totalOrdenes} órdenes procesadas
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-box p-3 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h2 className="admin-section-title mb-1">Arriendos de usuarios</h2>
                <p className="admin-muted mb-0">{estadoArriendos.errorContratos ? 'No se pudieron consultar los arriendos.' : estadoArriendos.cargandoContratos ? 'Actualizando arriendos…' : `${arriendos.length} contratos registrados · ${arriendos.filter((contrato) => contrato.estado === 'Vigente').length} vigentes`}</p>
              </div>
              <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setTabActiva('arriendos')}>Ver arriendos</button>
            </div>

            <div className="row g-4">
              <div className="col-12">
                <div className="admin-box p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <div>
                      <h2 className="admin-section-title mb-0">Inventario con Stock Crítico (≤ 5)</h2>
                      <span className="admin-muted">Productos que requieren reposición prioritaria de inventario</span>
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
                    <div className="admin-empty admin-ta-center p-3">
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
                            <th className="admin-ta-center">Stock Disponible</th>
                            <th className="admin-ta-end">Precio (CLP)</th>
                            <th className="admin-ta-end">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productos
                            .filter((p) => Number(p.stock) <= 5)
                            .map((p) => (
                              <tr key={p.idProducto}>
                                <td className="admin-cell-code">#{p.idProducto}</td>
                                <td>
                                  <div className="admin-cell-strong">{p.nombre}</div>
                                  <div className="admin-item-brand">{p.marca}</div>
                                </td>
                                <td><span className="admin-badge-soft">{p.categoria}</span></td>
                                <td className="admin-ta-center">
                                  <span className="admin-badge-dark">
                                    {p.stock} unids (Bajo)
                                  </span>
                                </td>
                                <td className="admin-ta-end admin-cell-price">{formatearCLP(p.precioVenta)}</td>
                                <td className="admin-ta-end">
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

        {tabActiva === 'productos' && (
          <div className="admin-box p-3">

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

              <div className="col-12 col-md-2 admin-ta-md-end">
                <button
                  type="button"
                  className="btn btn-ambar admin-btn-strong btn-sm w-100 rounded-1"
                  onClick={abrirModalCrear}
                >
                  + Agregar Producto
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table admin-table align-middle mb-0">
                <thead>
                  <tr>
                    <th className="admin-th-thumb"></th>
                    <th>Código</th>
                    <th>Nombre / Descripción</th>
                    <th>Marca</th>
                    <th>Categoría</th>
                    <th className="admin-ta-end">Precio (CLP)</th>
                    <th className="admin-ta-center">Stock</th>
                    <th className="admin-th-actions admin-ta-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="admin-ta-center admin-muted py-4">
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
                              className="admin-prod-thumb border rounded-1 bg-white object-fit-contain"
                              onError={(e) => { e.target.src = '/banner-web.webp'; }}
                            />
                          </td>
                          <td className="admin-cell-code">
                            #{prod.idProducto}
                          </td>
                          <td>
                            <div className="admin-cell-strong">{prod.nombre}</div>
                            <small className="admin-muted">{prod.contenidoPresentacion} por {unidadVenta(prod)}</small>
                          </td>
                          <td className="admin-muted">{prod.marca}</td>
                          <td>
                            <span className="admin-badge-soft">
                              {prod.categoria}
                            </span>
                          </td>
                          <td className="admin-ta-end admin-cell-price">
                            {formatearCLP(prod.precioVenta)}
                            <small className="d-block admin-muted">por {unidadVenta(prod)}</small>
                          </td>
                          <td className="admin-ta-center">
                            <span className={`${esBajo ? 'admin-badge-warn' : 'admin-badge-soft'}`}>
                              {cantidadPresentaciones(prod, prod.stock)} {esBajo ? '(Bajo)' : ''}
                            </span>
                          </td>
                          <td className="admin-ta-end">
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

            <div className="admin-muted d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
              <span>Mostrando {productosFiltrados.length} de {productos.length} productos en total</span>
              <span>Categoría: {filtroCategoria}</span>
            </div>

          </div>
        )}

        {tabActiva === 'ordenes' && (
          <div className="admin-box p-3">
            {estadoOrdenes.error && <div className="alert alert-danger" role="alert">
              {estadoOrdenes.error}
              <button type="button" className="btn btn-outline-dark btn-sm ms-2" onClick={cargarOrdenes}>Reintentar</button>
            </div>}
            {estadoOrdenes.cargando && <p role="status">Actualizando pedidos…</p>}
            {!estadoOrdenes.cargando && !estadoOrdenes.error && ordenes.length === 0 && <p>Todavía no hay pedidos registrados.</p>}
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div>
                <h2 className="admin-section-title mb-0">Registro de órdenes</h2>
                <span className="admin-muted">Pedidos registrados</span>
              </div>
              <span className="admin-badge-soft">
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
                    <th className="admin-ta-end">Total del pedido</th>
                    <th>Estado</th>
                    <th className="admin-ta-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.map((ord) => (
                    <tr key={ord.idOrden}>
                      <td className="admin-cell-price">
                        #{ord.idOrden}
                      </td>
                      <td className="admin-muted">{ord.fecha}</td>
                      <td>
                        <div className="admin-cell-strong">{ord.cliente.nombre}</div>
                        <div className="admin-order-email">{ord.cliente.email}</div>
                      </td>
                      <td className="admin-td-address admin-muted marca-truncar">
                        {ord.cliente.direccion}
                      </td>
                      <td className="admin-muted">{ord.metodoPago}</td>
                      <td className="admin-ta-end admin-cell-price">
                        {formatearCLP(ord.total)}
                      </td>
                      <td>
                        <span className="admin-badge-soft">
                          {ord.estado}
                        </span>
                      </td>
                      <td className="admin-ta-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-dark rounded-1 py-0 px-2"
                          onClick={() => setOrdenSeleccionada(ord)}
                        >
                          Ver pedido
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {tabActiva === 'arriendos' && (
          <section className="admin-box p-3">
            <h2 className="admin-section-title">Arriendos de usuarios</h2>
            <p className="admin-muted">Historial de arriendos de maquinaria.</p>
            {estadoArriendos.errorContratos && <div className="alert alert-danger" role="alert">
              {estadoArriendos.errorContratos}
              <button type="button" className="btn btn-outline-dark btn-sm ms-2" onClick={cargarContratosArriendo}>Reintentar</button>
            </div>}
            {estadoArriendos.cargandoContratos && <p role="status">Actualizando arriendos…</p>}
            {arriendos.length === 0 ? (!estadoArriendos.cargandoContratos && !estadoArriendos.errorContratos && <p className="mb-0 py-4 text-center">Todavía no hay arriendos registrados.</p>) : (
              <div className="table-responsive">
                <table className="table admin-table align-middle mb-0">
                  <thead><tr><th>Contrato</th><th>Cliente</th><th>Maquinaria</th><th>Inicio</th><th>Término</th><th>Días</th><th>Total</th><th>Estado</th><th>Datos de entrega</th></tr></thead>
                  <tbody>{arriendos.map((contrato) => (
                    <tr key={contrato.idContrato}>
                      <td>{contrato.idContrato}<div className="admin-muted">{contrato.fechaContrato}</div></td>
                      <td>{contrato.usuario?.nombre || 'Sin nombre'}<div className="admin-muted">{contrato.usuario?.email}</div></td>
                      <td>{contrato.nombreMaquina}<div className="admin-muted">{formatearCLP(contrato.tarifaDia)} / día</div></td>
                      <td>{contrato.fechaInicio}</td><td>{contrato.fechaTermino}</td><td>{contrato.diasArriendo}</td>
                      <td className="admin-cell-price">{formatearCLP(contrato.totalPagar)}</td>
                      <td><span className="admin-badge-soft">{contrato.estado}</span></td>
                      <td><details><summary>Ver datos</summary>
                        <dl className="mb-0 mt-2">
                          <dt>RUT</dt><dd>{contrato.usuario?.rut || 'No informado'}</dd>
                          <dt>Teléfono</dt><dd>{contrato.usuario?.telefono || 'No informado'}</dd>
                          <dt>Dirección</dt><dd>{[contrato.usuario?.direccion, contrato.usuario?.comuna, contrato.usuario?.region].filter(Boolean).join(', ') || 'No informada'}</dd>
                        </dl>
                      </details></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tabActiva === 'generadores' && (
          <div>
            <GeneradorProductos productos={productos} />
          </div>
        )}

      </main>

      {modalAbierto && (
        <div className="modal modal-backdrop-custom fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-1 border-0 shadow">

              <div className="modal-header admin-modal-head border-bottom py-2 px-3">
                <h5 className="modal-title admin-modal-title mb-0">
                  {modoEdicion ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                </h5>
                <button type="button" className="btn-close btn-close-sm" onClick={cerrarModal} aria-label="Cerrar"></button>
              </div>

              <form onSubmit={handleSubmitForm}>
                {errorProducto && <div className="alert alert-danger m-3" role="alert">{errorProducto}</div>}
                <div className="modal-body p-3">
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label admin-label mb-1">Código ID</label>
                      <input
                        type="text"
                        className="form-control form-control-sm rounded-1 admin-mono"
                        value={formData.idProducto}
                        disabled
                        placeholder="Asignado al guardar"
                        readOnly
                      />
                    </div>

                    <div className="col-12 col-md-8">
                      <label className="form-label admin-label mb-1">Nombre del Producto *</label>
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
                      <label className="form-label admin-label mb-1">Marca *</label>
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
                      <label className="form-label admin-label mb-1">Categoría *</label>
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
                      <label className="form-label admin-label mb-1">Precio por {formData.unidadVenta} (CLP) *</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="form-control form-control-sm rounded-1 admin-mono"
                        placeholder="129990"
                        value={formData.precioVenta}
                        onChange={(e) => setFormData({ ...formData, precioVenta: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label admin-label mb-1">Stock disponible (cantidad de {formData.unidadVenta === 'unidad' ? 'unidades' : formData.unidadVenta + 's'}) *</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control form-control-sm rounded-1 admin-mono"
                        placeholder="10"
                        step="1"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="producto-unidad-venta" className="form-label admin-label mb-1">Unidad de venta *</label>
                      <select
                        id="producto-unidad-venta"
                        className="form-select form-select-sm rounded-1"
                        value={formData.unidadVenta}
                        onChange={(e) => setFormData({ ...formData, unidadVenta: e.target.value })}
                        required
                      >
                        {UNIDADES_VENTA.map(unidad => <option key={unidad} value={unidad}>{unidad}</option>)}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="producto-contenido" className="form-label admin-label mb-1">Contenido por {formData.unidadVenta} *</label>
                      <input
                        id="producto-contenido"
                        type="text"
                        className="form-control form-control-sm rounded-1"
                        maxLength={120}
                        placeholder="Ej.: 100 unidades, 25 kg o 1 litro"
                        value={formData.contenidoPresentacion}
                        onChange={(e) => setFormData({ ...formData, contenidoPresentacion: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label admin-label mb-1">
                        Imagen del Producto {!imagenArchivo && !formData.imagen ? '(Opcional)' : ''}
                      </label>
                      <ImagenProductoUploader
                        archivo={imagenArchivo}
                        onSeleccionar={setImagenArchivo}
                        onQuitar={() => setImagenArchivo(null)}
                        imagenActual={formData.imagen}
                      />
                      {!imagenArchivo && formData.imagen && (
                        <div className="d-flex justify-content-end mt-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary rounded-1 py-0 px-2"
                            onClick={() => setFormData({ ...formData, imagen: '' })}
                          >
                            Usar imagen por defecto
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <label htmlFor="producto-descripcion-corta" className="form-label admin-label mb-1">Descripción corta</label>
                      <textarea
                        id="producto-descripcion-corta"
                        className="form-control form-control-sm rounded-1"
                        rows="2"
                        maxLength={300}
                        placeholder="Resumen del producto (hasta 300 caracteres)..."
                        value={formData.descripcionCorta}
                        onChange={(e) => setFormData({ ...formData, descripcionCorta: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label htmlFor="producto-descripcion-larga" className="form-label admin-label mb-1">Descripción larga</label>
                      <textarea
                        id="producto-descripcion-larga"
                        className="form-control form-control-sm rounded-1"
                        rows="6"
                        maxLength={4000}
                        placeholder="Descripción completa del producto (hasta 4000 caracteres)..."
                        value={formData.descripcionLarga}
                        onChange={(e) => setFormData({ ...formData, descripcionLarga: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer admin-modal-foot border-top py-2 px-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-1"
                    onClick={cerrarModal}
                    disabled={subiendoImagen}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-ambar admin-btn-strong btn-sm rounded-1 px-3"
                    disabled={subiendoImagen}
                  >
                    {subiendoImagen
                      ? 'Guardando...'
                      : modoEdicion ? 'Guardar Cambios' : 'Registrar Producto'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {productoAEliminar && (
        <div className="modal modal-backdrop-custom fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-1 border-0 shadow">
              <div className="modal-body admin-ta-center p-4">
                <h5 className="admin-modal-title mb-2">¿Eliminar producto?</h5>
                <p className="admin-muted mb-4">
                  Se desactivará el producto <strong>"{productoAEliminar.nombre}"</strong> (#{productoAEliminar.idProducto}). Su registro se conservará.
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
                    disabled={subiendoImagen}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {ordenSeleccionada && (
        <div className="modal modal-backdrop-custom fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-1 border-0 shadow">
              <div className="modal-header admin-modal-head border-bottom py-2 px-3">
                <h5 className="modal-title admin-modal-title mb-0">
                  Pedido #{ordenSeleccionada.idOrden}
                </h5>
                <button type="button" className="btn-close btn-close-sm" onClick={() => setOrdenSeleccionada(null)}></button>
              </div>

              <div className="modal-body p-3">
                <div className="border-bottom pb-2 mb-3">
                  <div className="admin-cell-strong">FERREFIX</div>
                  <small className="admin-muted">RUT: 76.845.120-K | Antonio Varas 666, Providencia</small>
                </div>

                <div className="admin-muted mb-3">
                  <div><strong>Fecha:</strong> {ordenSeleccionada.fecha}</div>
                  <div><strong>Cliente:</strong> {ordenSeleccionada.cliente.nombre}</div>
                  <div><strong>Email:</strong> {ordenSeleccionada.cliente.email}</div>
                  <div><strong>Dirección:</strong> {ordenSeleccionada.cliente.direccion}</div>
                  <div><strong>Método:</strong> {ordenSeleccionada.metodoPago}</div>
                </div>

                <div className="table-responsive border rounded-1 mb-3">
                  <table className="table table-sm align-middle mb-0 admin-ticket-table">
                    <thead className="table-light">
                      <tr>
                        <th>Ítem</th>
                        <th className="admin-ta-center">Cant.</th>
                        <th className="admin-ta-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordenSeleccionada.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.nombre}</td>
                          <td className="admin-ta-center">{item.cantidad}</td>
                          <td className="admin-ta-end admin-mono">{formatearCLP(item.precioUnitario * item.cantidad)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                  <span className="admin-cell-strong">Total:</span>
                  <span className="admin-total-value">{formatearCLP(ordenSeleccionada.total)}</span>
                </div>
              </div>

              <div className="modal-footer admin-modal-foot border-top py-2 px-3">
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
