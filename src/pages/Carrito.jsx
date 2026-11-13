import { useState, useEffect, useRef } from 'react';
import ProgresoCompra from '../components/ProgresoCompra';
import ResumenCompra from '../components/ResumenCompra';
import SelectorCantidad from '../components/SelectorCantidad';
import { Link, useLocation } from 'react-router-dom';
import {
  obtenerCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  obtenerTotalesCarrito,
  cargarCarrito,
  useEstadoCarrito,
  EVENTO_CARRITO_ACTUALIZADO
} from '../data/carrito';
import { useSesion, obtenerSesionActiva, EVENTO_SESION_ACTUALIZADA } from '../data/auth';
import { nombreCompleto } from '../utils/usuario';
import { crearOrden } from '../data/ordenes';
import { unidadVenta, cantidadPresentaciones } from '../utils/presentacionProducto';
import { REGIONES_CHILE, normalizarRegion, obtenerComunas } from '../data/chile';
import {
  validadores,
  validarFormulario,
  formatearRut,
  formatearTelefono
} from '../data/validaciones';

const REGLAS_VALIDACION = {
  nombre: validadores.nombre,
  rut: validadores.rut,
  email: validadores.email,
  telefono: validadores.telefono,
  direccion: validadores.direccion,
  region: validadores.requerido('La región'),
  comuna: validadores.requerido('La comuna')
};

function Carrito() {
  const [items, setItems] = useState(obtenerCarrito);
  const [totales, setTotales] = useState(obtenerTotalesCarrito);
  const sesion = useSesion();
  const estadoCarrito = useEstadoCarrito();
  const [guardando, setGuardando] = useState(false);
  const idSolicitud = useRef(crypto.randomUUID());

  const location = useLocation();
  const [pasoActual, setPasoActual] = useState(() => sesion && new URLSearchParams(location.search).get('paso') === 'entrega' ? 'entrega' : 'carrito');
  const [ordenCreada, setOrdenCreada] = useState(null);
  const [alertaStock, setAlertaStock] = useState(null);

  const regionInicial = sesion?.region ? normalizarRegion(sesion.region) : '';
  const [regionSeleccionada, setRegionSeleccionada] = useState(regionInicial);
  const [formCliente, setFormCliente] = useState({
    nombre: nombreCompleto(sesion),
    rut: sesion?.rut || '',
    email: sesion ? sesion.email : '',
    telefono: sesion?.telefono || '',
    direccion: sesion?.direccion || '',
    region: regionInicial,
    comuna: sesion?.comuna || '',
    indicaciones: '',
    metodoEntrega: 'despacho',
    metodoPago: 'WebPay Plus (Débito)'
  });
  const [errores, setErrores] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    const sincronizarSesion = () => {
      const usuario = obtenerSesionActiva();
      idSolicitud.current = crypto.randomUUID();
      setOrdenCreada(null);
      setPasoActual('carrito');
      const region = usuario?.region ? normalizarRegion(usuario.region) : '';
      setRegionSeleccionada(region);
      setFormCliente({
        nombre: nombreCompleto(usuario), rut: usuario?.rut || '', email: usuario?.email || '',
        telefono: usuario?.telefono || '', direccion: usuario?.direccion || '', region,
        comuna: usuario?.comuna || '', indicaciones: '', metodoEntrega: 'despacho', metodoPago: 'WebPay Plus (Débito)',
      });
      setErrores({});
      setTouched({});
    };
    window.addEventListener(EVENTO_SESION_ACTUALIZADA, sincronizarSesion);
    return () => window.removeEventListener(EVENTO_SESION_ACTUALIZADA, sincronizarSesion);
  }, []);

  useEffect(() => {
    const handleActualizar = () => {
      setItems(obtenerCarrito());
      setTotales(obtenerTotalesCarrito());
    };
    window.addEventListener(EVENTO_CARRITO_ACTUALIZADO, handleActualizar);
    return () => window.removeEventListener(EVENTO_CARRITO_ACTUALIZADO, handleActualizar);
  }, []);

  const formatearCLP = (valor) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(valor || 0);
  };

  const handleModificarCantidad = async (idProducto, nuevaCantidad) => {
    setAlertaStock(null);
    const resultado = await actualizarCantidad(idProducto, nuevaCantidad);
    if (resultado && resultado.error) {
      setAlertaStock(resultado.error);
      setTimeout(() => setAlertaStock(null), 4000);
    }
  };

  const handleEliminarItem = async (idProducto) => {
    const resultado = await eliminarDelCarrito(idProducto);
    if (!resultado.ok) setAlertaStock(resultado.error);
  };

  const validarCampo = (campo, valor) => {
    const validador = REGLAS_VALIDACION[campo];
    if (!validador) return;
    const mensaje = validador(valor);
    setErrores((prev) => ({ ...prev, [campo]: mensaje }));
  };

  const handleChange = (campo, valor) => {
    setFormCliente((prev) => ({ ...prev, [campo]: valor }));
    if (touched[campo]) validarCampo(campo, valor);
  };

  const handleBlur = (campo) => {
    setTouched((prev) => ({ ...prev, [campo]: true }));
    validarCampo(campo, formCliente[campo]);
  };

  const claseCampo = (campo, base = 'form-control form-control-sm rounded-1') =>
    `${base}${errores[campo] ? ' is-invalid' : ''}`;

  const handleCambiarRegion = (nuevaRegion) => {
    const regionNorm = nuevaRegion ? normalizarRegion(nuevaRegion) : '';
    setRegionSeleccionada(regionNorm);
    const comuna = '';
    setFormCliente((prev) => ({ ...prev, region: nuevaRegion, comuna }));
    setErrores((prev) => ({ ...prev, comuna: '' }));
  };

  const cambiarPaso = paso => {
    setPasoActual(paso);
    setAlertaStock(null);
    window.scrollTo(0, 0);
  };

  const validarEntrega = () => {
    const nuevosErrores = validarFormulario(REGLAS_VALIDACION, formCliente);
    setErrores(nuevosErrores);
    setTouched(Object.fromEntries(Object.keys(REGLAS_VALIDACION).map(campo => [campo, true])));
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleContinuarEntrega = e => {
    e.preventDefault();
    if (validarEntrega()) cambiarPaso('pago');
  };

  const handleProcesarCompra = async (e) => {
    e.preventDefault();

    if (items.length === 0 || guardando || estadoCarrito.cargando) return;

    if (!validarEntrega()) { cambiarPaso('entrega'); return; }

    setAlertaStock(null);
    setGuardando(true);
    const sesionActual = obtenerSesionActiva();
    const { nombre, rut, email, telefono, direccion, region, comuna, metodoEntrega, metodoPago, indicaciones } = formCliente;
    const resultado = await crearOrden({
      idSolicitud: idSolicitud.current,
      cliente: { nombre, rut, email, telefono, direccion, region, comuna },
      items: items.map(({ idProducto, cantidad }) => ({ idProducto, cantidad })),
      metodoEntrega, metodoPago, indicaciones,
    });
    setGuardando(false);
    if (sesionActual !== obtenerSesionActiva()) return;
    if (!resultado.ok) {
      setAlertaStock(resultado.error);
      setErrores(Object.fromEntries(Object.entries(resultado.errores || {}).map(([campo, mensaje]) => [campo.replace(/^cliente\./, ''), mensaje])));
      if (Object.keys(resultado.errores || {}).some(campo => campo.startsWith('cliente.'))) setPasoActual('entrega');
      return;
    }
    setOrdenCreada(resultado.orden);
    setPasoActual('exito');
    idSolicitud.current = crypto.randomUUID();
    window.scrollTo(0, 0);
  };

  const cabeceraCarrito = (
  <div className="carrito-cabecera">
    <div>
      <h1 className="marca-titulo marca-tam-2 mb-1">
        Carrito de Compras
      </h1>
      <p className="marca-nota mb-0">
        Revisa tus productos seleccionados y confirma las cantidades antes de pagar.
      </p>
    </div>

  </div>
  );

  // Los precios finales ya incluyen IVA: desglosarlo no cambia el total cobrado.
  const totalOrden = Number(ordenCreada?.total || 0);
  const netoOrden = Math.round(totalOrden / 1.19);
  const ivaOrden = totalOrden - netoOrden;

  return (
    <div className="carrito-page py-4 py-lg-5">
      <div className="container">
        {estadoCarrito.error && <div className="alert alert-danger" role="alert">
          {estadoCarrito.error}
          <button type="button" className="btn btn-outline-dark btn-sm ms-2" onClick={cargarCarrito}>Reintentar</button>
        </div>}
        {estadoCarrito.cargando && <p role="status">Actualizando carrito…</p>}

        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb carrito-breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
            <li className="breadcrumb-item"><Link to="/catalogo">Catálogo</Link></li>
            <li className="breadcrumb-item active" aria-current="page">
              {pasoActual === 'carrito' && 'Carrito de Compras'}
              {pasoActual === 'sesion' && 'Inicio de sesión'}
              {pasoActual === 'entrega' && 'Entrega'}
              {pasoActual === 'pago' && 'Pago'}
              {pasoActual === 'exito' && 'Confirmación de Compra'}
            </li>
          </ol>
        </nav>

        <ProgresoCompra pasoActual={pasoActual} onVolver={cambiarPaso}
          bloqueado={guardando || pasoActual === 'exito'} />

        {alertaStock && (
          <div className="alert alert-warning alert-dismissible fade show rounded-2 shadow-sm d-flex align-items-center mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill marca-icono me-2"></i>
            <div>{alertaStock}</div>
            <button type="button" className="btn-close" onClick={() => setAlertaStock(null)}></button>
          </div>
        )}

        {pasoActual === 'carrito' && (
          <div>
            {items.length === 0 && cabeceraCarrito}

            {items.length === 0 ? (

              <div className="bg-white border rounded-1 p-5 marca-centro my-4 shadow-sm">
                <i className="bi bi-cart-x carrito-vacio-icon mb-3 d-block"></i>
                <h2 className="marca-titulo marca-tam-4 mb-2">Tu carrito está actualmente vacío</h2>
                <p className="marca-nota mb-4">
                  No has añadido herramientas ni materiales aún. Explora nuestro catálogo con stock disponible.
                </p>
                <Link to="/catalogo" className="btn btn-ambar marca-strong rounded-1 px-4 py-2 shadow-sm">
                  <i className="bi bi-box-seam me-2"></i>
                  Explorar Catálogo de Productos
                </Link>
              </div>
            ) : (

              <div className="row g-4">

                <div className="col-12 col-lg-8">
                  {cabeceraCarrito}
                  <div className="carrito-productos">
                    {items.map(item => (
                      <article className="carrito-producto" key={item.idProducto} aria-label={item.nombre}>
                        <Link to={`/producto/${item.idProducto}`} className="carrito-producto-imagen">
                          <img src={item.imagen} alt={item.nombre} onError={({ currentTarget }) => {
                            if (currentTarget.getAttribute('src') !== '/banner-web.webp') currentTarget.src = '/banner-web.webp';
                          }} />
                        </Link>
                        <div className="carrito-producto-info">
                          <Link to={`/producto/${item.idProducto}`} className="carrito-item-nombre">{item.nombre}</Link>
                          <strong>{item.marca}</strong>
                          <span className="marca-nota">Código: {item.idProducto}</span>
                          {item.contenidoPresentacion && <span className="marca-nota">{item.contenidoPresentacion}</span>}
                        </div>
                        <div className="carrito-producto-precio"><strong>{formatearCLP(item.precioVenta)}</strong><span className="marca-nota">por {unidadVenta(item)}</span></div>
                        <button type="button" className="carrito-quitar" onClick={() => handleEliminarItem(item.idProducto)}
                          disabled={estadoCarrito.cargando} aria-label={`Quitar ${item.nombre}`}><i className="bi bi-trash3" aria-hidden="true" /></button>
                        <div className="carrito-producto-cantidad">
                          <SelectorCantidad cantidad={item.cantidad} maximo={item.stock} etiqueta={`Cantidad de ${item.nombre}`}
                            disabled={estadoCarrito.cargando || item.stock <= 0} onChange={valor => handleModificarCantidad(item.idProducto, valor)} />
                          <span className="marca-nota">Máx. {cantidadPresentaciones(item, item.stock)}</span>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <Link to="/catalogo" className="btn btn-outline-dark btn-sm rounded-1">
                      ← Seguir Comprando
                    </Link>
                    <span className="marca-nota">
                      Precios con IVA incluido.
                    </span>
                  </div>
                </div>

                <div className="col-12 col-lg-4">
                  <ResumenCompra items={items} totales={totales} inicial>
                    <button type="button" className="btn btn-dark compra-continuar"
                      disabled={estadoCarrito.cargando || Boolean(estadoCarrito.error)}
                      onClick={() => cambiarPaso(sesion ? 'entrega' : 'sesion')}>Continuar <i className="bi bi-arrow-right ms-2" aria-hidden="true" /></button>
                  </ResumenCompra>
                </div>

              </div>
            )}
          </div>
        )}

        {pasoActual === 'sesion' && (
          <div className="row g-4">
            <div className="col-12 col-lg-8">
              <section className="compra-formulario">
                <h1 className="marca-titulo marca-tam-2 mb-3">Inicio de sesión</h1>
                {sesion ? <>
                  <p>Estás comprando como <strong>{nombreCompleto(sesion)}</strong>.</p>
                  <button type="button" className="btn btn-dark compra-continuar" onClick={() => cambiarPaso('entrega')}>Continuar a entrega</button>
                </> : <>
                  <p className="marca-parrafo">Ingresa a tu cuenta para usar tus datos guardados y consultar tus pedidos.</p>
                  <Link to="/login?volver=%2Fcarrito%3Fpaso%3Dentrega" className="btn btn-dark compra-continuar mb-3">Iniciar sesión</Link>
                  <button type="button" className="btn btn-outline-dark compra-continuar" onClick={() => cambiarPaso('entrega')}>Continuar como invitado</button>
                </>}
              </section>
            </div>
            <div className="col-12 col-lg-4"><ResumenCompra items={items} totales={totales} /></div>
          </div>
        )}

        {(pasoActual === 'entrega' || pasoActual === 'pago') && (
          <div className="row g-4">
            <div className="col-12 col-lg-8">
              <div className="compra-formulario">
                <h1 className="marca-titulo marca-tam-2 mb-2">{pasoActual === 'entrega' ? 'Datos de entrega' : 'Método de pago'}</h1>
                <p className="marca-nota mb-4">{pasoActual === 'entrega' ? 'Completa tus datos y la dirección donde recibirás tu compra.' : 'Selecciona cómo quieres pagar y revisa tu pedido.'}</p>
                <form id="compra-formulario" onSubmit={pasoActual === 'entrega' ? handleContinuarEntrega : handleProcesarCompra} noValidate>
                  <div hidden={pasoActual !== 'entrega'}>
                  <h3 className="checkout-section-title marca-titulo marca-tam-6 mb-3">
                    1. Información del Cliente
                  </h3>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                      <label className="form-label marca-label">Nombre y Apellido *</label>
                      <input
                        type="text"
                        className={claseCampo('nombre')}
                        placeholder="Ej: Pedro González"
                        value={formCliente.nombre}
                        onChange={(e) => handleChange('nombre', e.target.value)}
                        onBlur={() => handleBlur('nombre')}
                        required
                      />
                      {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label marca-label">RUT *</label>
                      <input
                        type="text"
                        className={claseCampo('rut')}
                        placeholder="Ej: 12.345.678-9"
                        value={formCliente.rut}
                        onChange={(e) => handleChange('rut', formatearRut(e.target.value))}
                        onBlur={() => handleBlur('rut')}
                        maxLength={12}
                        required
                      />
                      {errores.rut && <div className="invalid-feedback">{errores.rut}</div>}
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label marca-label">Correo Electrónico *</label>
                      <input
                        type="email"
                        className={claseCampo('email')}
                        placeholder="ejemplo@correo.cl"
                        value={formCliente.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        required
                      />
                      {errores.email && <div className="invalid-feedback">{errores.email}</div>}
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label marca-label">Teléfono de Contacto *</label>
                      <input
                        type="tel"
                        className={claseCampo('telefono')}
                        placeholder="+56 9 1234 5678"
                        value={formCliente.telefono}
                        onChange={(e) => handleChange('telefono', formatearTelefono(e.target.value))}
                        onBlur={() => handleBlur('telefono')}
                        inputMode="tel"
                        maxLength={17}
                        required
                      />
                      {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
                    </div>
                  </div>

                  <h3 className="checkout-section-title marca-titulo marca-tam-6 mb-3">
                    2. Dirección y Opciones de Entrega
                  </h3>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-5">
                      <label className="form-label marca-label">Región *</label>
                      <select
                        className={claseCampo('region', 'form-select form-select-sm rounded-1')}
                        value={regionSeleccionada}
                        onChange={(e) => handleCambiarRegion(e.target.value)}
                        onBlur={() => handleBlur('region')}
                        required
                      >
                        <option value="">Selecciona una región</option>
                        {REGIONES_CHILE.map((r) => (
                          <option key={r.region} value={r.region}>{r.region}</option>
                        ))}
                      </select>
                      {errores.region && <div className="invalid-feedback">{errores.region}</div>}
                    </div>

                    <div className="col-12 col-md-7">
                      <label className="form-label marca-label">
                        Comuna (Selecciona de las disponibles) *
                      </label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-light"><i className="bi bi-search marca-muted"></i></span>
                        <select
                          className={`form-select form-select-sm rounded-end-1${errores.comuna ? ' is-invalid' : ''}`}
                          value={formCliente.comuna}
                          onChange={(e) => handleChange('comuna', e.target.value)}
                          onBlur={() => handleBlur('comuna')}
                          required
                          disabled={!regionSeleccionada}
                        >
                          <option value="">Selecciona una comuna</option>
                          {(regionSeleccionada ? obtenerComunas(regionSeleccionada) : []).map((com) => (
                            <option key={com} value={com}>{com}</option>
                          ))}
                        </select>
                      </div>
                      {errores.comuna && <div className="invalid-feedback d-block">{errores.comuna}</div>}
                    </div>

                    <div className="col-12 col-md-8">
                      <label className="form-label marca-label">Calle, Número y Depto *</label>
                      <input
                        type="text"
                        className={claseCampo('direccion')}
                        placeholder="Ej: Av. Providencia 1240, Depto 502"
                        value={formCliente.direccion}
                        onChange={(e) => handleChange('direccion', e.target.value)}
                        onBlur={() => handleBlur('direccion')}
                        required
                      />
                      {errores.direccion && <div className="invalid-feedback">{errores.direccion}</div>}
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label marca-label">Indicaciones de Entrega (Opcional)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm rounded-1"
                        placeholder="Ej: Dejar con conserje"
                        value={formCliente.indicaciones}
                        onChange={(e) => setFormCliente({ ...formCliente, indicaciones: e.target.value })}
                      />
                    </div>
                  </div>

                  </div>
                  <div hidden={pasoActual !== 'pago'}>
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
                      <label className="form-check-label marca-strong marca-fino" htmlFor="webpay">
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
                      <label className="form-check-label marca-strong marca-fino" htmlFor="credito">
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
                      <label className="form-check-label marca-strong marca-fino" htmlFor="transferencia">
                        Transferencia Electrónica Directa
                      </label>
                    </div>
                  </div>

                  </div>
                </form>

              </div>
            </div>
            <div className="col-12 col-lg-4">
              <ResumenCompra items={items} totales={totales}>
                <button type="submit" form="compra-formulario" className="btn btn-dark compra-continuar"
                  disabled={guardando || estadoCarrito.cargando || Boolean(estadoCarrito.error) || items.length === 0}>
                  {pasoActual === 'entrega' ? 'Continuar al pago' : guardando ? 'Guardando pedido…' : 'Registrar pedido'}
                </button>
                <button type="button" className="btn btn-link compra-volver" disabled={guardando}
                  onClick={() => cambiarPaso(pasoActual === 'pago' ? 'entrega' : 'carrito')}>Volver a {pasoActual === 'pago' ? 'entrega' : 'mi carrito'}</button>
              </ResumenCompra>
            </div>
          </div>
        )}

        {pasoActual === 'exito' && ordenCreada && (
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-7">
              <div className="boleta-compra bg-white border rounded-1 shadow-sm p-4 p-md-5">

                <div className="marca-centro pb-4 border-bottom mb-4">
                  <h1 className="marca-titulo marca-tam-4 mb-1">
                    {['Pagado', 'Completada'].includes(ordenCreada.estado) ? 'Pago procesado' : 'Pedido registrado'}
                  </h1>
                </div>

                <div className="mb-4 marca-fino">
                  <h2 className="marca-titulo marca-tam-5 mb-3">Detalle de la boleta</h2>
                  <div className="row g-2">
                    <div className="col-12 mb-2">
                      <strong className="d-block marca-muted">Número de orden:</strong>
                      <span className="boleta-numero marca-mono">{ordenCreada.idOrden}</span>
                    </div>
                    <div className="col-sm-6">
                      <strong className="d-block marca-muted">Cliente:</strong>
                      <span className="marca-strong">{ordenCreada.cliente.nombre}</span>
                    </div>
                    <div className="col-sm-6">
                      <strong className="d-block marca-muted">RUT:</strong>
                      <span className="marca-oscuro">{ordenCreada.cliente.rut}</span>
                    </div>
                    <div className="col-sm-6 mt-2">
                      <strong className="d-block marca-muted">Correo:</strong>
                      <span className="marca-oscuro">{ordenCreada.cliente.email}</span>
                    </div>
                    <div className="col-12 mt-2">
                      <strong className="d-block marca-muted">Dirección de Entrega:</strong>
                      <span className="marca-oscuro">{ordenCreada.cliente.direccion}</span>
                    </div>
                    <div className="col-sm-6 mt-2">
                      <strong className="d-block marca-muted">Fecha del pedido:</strong>
                      <span className="marca-oscuro">{ordenCreada.fecha}</span>
                    </div>
                    <div className="col-sm-6 mt-2">
                      <strong className="d-block marca-muted">Método de Pago:</strong>
                      <span className="marca-oscuro">{ordenCreada.metodoPago}</span>
                    </div>
                  </div>
                </div>

                <div className="table-responsive border rounded-1 mb-4">
                  <table className="table table-sm align-middle mb-0 marca-fino">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th className="marca-centro">Cant.</th>
                        <th className="marca-derecha">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordenCreada.items.map((it, idx) => (
                        <tr key={idx}>
                          <td>{it.nombre}</td>
                          <td className="marca-centro">{it.cantidad}</td>
                          <td className="marca-derecha marca-mono">{formatearCLP(it.precioUnitario * it.cantidad)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="boleta-importes p-3 bg-platino border rounded-1 mb-4">
                  <dl className="mb-0">
                    <div className="boleta-importe marca-fino">
                      <dt>Productos (IVA incluido)</dt>
                      <dd>{formatearCLP(ordenCreada.subtotal)}</dd>
                    </div>
                    <div className="boleta-importe marca-fino mb-3">
                      <dt>Despacho (IVA incluido)</dt>
                      <dd>{Number(ordenCreada.despacho) === 0 ? 'Gratis' : formatearCLP(ordenCreada.despacho)}</dd>
                    </div>
                    <div className="boleta-importe marca-fino border-top pt-3">
                      <dt>Monto neto</dt>
                      <dd>{formatearCLP(netoOrden)}</dd>
                    </div>
                    <div className="boleta-importe marca-fino">
                      <dt>IVA (19%)</dt>
                      <dd>{formatearCLP(ivaOrden)}</dd>
                    </div>
                    <div className="boleta-importe border-top pt-3 mt-3">
                      <dt className="marca-bold marca-tam-5">Total</dt>
                      <dd className="marca-total">{formatearCLP(totalOrden)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  <Link to="/catalogo" className="btn btn-ambar btn-sm marca-strong rounded-1 px-4">
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
