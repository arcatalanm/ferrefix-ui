import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { obtenerSesionActiva, actualizarDatosUsuario, refrescarPerfil, EVENTO_SESION_ACTUALIZADA } from "../data/auth";
import { obtenerOrdenes, EVENTO_ORDENES_ACTUALIZADAS, cargarOrdenes, useEstadoOrdenes } from "../data/ordenes";
import { obtenerContratosArriendo, EVENTO_MAQUINARIAS_ACTUALIZADAS, useEstadoArriendos, cargarContratosArriendo } from "../data/maquinarias";
import { REGIONES_CHILE, normalizarRegion, obtenerComunas } from "../data/chile";
import { validadores, formatearRut, formatearTelefono } from "../data/validaciones";
import { mostrarToast } from "../components/ToastNotificacion";
import { nombreCompleto } from "../utils/usuario";

export default function CuentaCliente() {
  const estadoOrdenes = useEstadoOrdenes();
  const estadoArriendos = useEstadoArriendos();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabActiva = ["datos", "compras", "arriendos"].includes(searchParams.get("tab")) ? searchParams.get("tab") : "datos";

  const [sesion, setSesion] = useState(obtenerSesionActiva);
  const [ordenes, setOrdenes] = useState([]);
  const [arriendos, setArriendos] = useState([]);

  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formDatos, setFormDatos] = useState({
    nombre: "",
    segNombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    rut: "",
    email: "",
    telefono: "",
    direccion: "",
    region: "",
    comuna: ""
  });
  const [errores, setErrores] = useState({});

  useEffect(() => {
    const handleSesion = () => {
      const s = obtenerSesionActiva();
      setSesion(s);
      if (s) {
        setFormDatos({
          nombre: s.nombre || "",
          segNombre: s.segNombre || "",
          apellidoPaterno: s.apellidoPaterno || "",
          apellidoMaterno: s.apellidoMaterno || "",
          rut: s.rut || "",
          email: s.email || "",
          telefono: s.telefono || "",
          direccion: s.direccion || "",
          region: s.region ? normalizarRegion(s.region) : "",
          comuna: s.comuna || ""
        });
      }
    };

    handleSesion();
    window.addEventListener(EVENTO_SESION_ACTUALIZADA, handleSesion);
    if (obtenerSesionActiva()) {
      refrescarPerfil().then((res) => {
        if (!res.ok) mostrarToast({ titulo: 'No se pudo consultar el perfil', mensaje: res.mensaje, tipo: 'danger' });
      });
    }
    return () => window.removeEventListener(EVENTO_SESION_ACTUALIZADA, handleSesion);
  }, []);

  useEffect(() => {
    if (!sesion) return;

    const cargarCompras = () => {
      const todas = obtenerOrdenes();
      const mias = todas.filter(
        (o) =>
          o.idUsuario === sesion.idUsuario
      );
      setOrdenes(mias);
    };

    const cargarArriendos = () => {
      const todos = obtenerContratosArriendo();
      const mios = todos.filter(
        (c) =>
          c.usuario?.idUsuario === sesion.idUsuario
      );
      setArriendos(mios);
    };

    cargarCompras();
    cargarArriendos();

    window.addEventListener(EVENTO_ORDENES_ACTUALIZADAS, cargarCompras);
    window.addEventListener(EVENTO_MAQUINARIAS_ACTUALIZADAS, cargarArriendos);

    return () => {
      window.removeEventListener(EVENTO_ORDENES_ACTUALIZADAS, cargarCompras);
      window.removeEventListener(EVENTO_MAQUINARIAS_ACTUALIZADAS, cargarArriendos);
    };
  }, [sesion]);

  const cambiarTab = (nuevaTab) => {
    setSearchParams({ tab: nuevaTab });
  };

  const formatearCLP = (valor) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0
    }).format(valor || 0);
  };

  const handleGuardarDatos = async (e) => {
    e.preventDefault();
    if (guardando) return;
    const errs = {};

    for (const [campo, etiqueta, obligatorio] of [
      ['nombre', 'El primer nombre', true], ['segNombre', 'El segundo nombre', false],
      ['apellidoPaterno', 'El apellido paterno', true], ['apellidoMaterno', 'El apellido materno', false],
    ]) {
      const error = validadores.nombrePersona(etiqueta, obligatorio)(formDatos[campo]);
      if (error) errs[campo] = error;
    }
    const errRut = validadores.rut(formDatos.rut);
    if (errRut) errs.rut = errRut;
    const errTel = validadores.telefonoOpcional(formDatos.telefono);
    if (errTel) errs.telefono = errTel;
    if (formDatos.direccion.trim() && !formDatos.region) errs.region = 'Selecciona una región.';
    if (formDatos.direccion.trim() && !formDatos.comuna) errs.comuna = 'Selecciona una comuna.';

    setErrores(errs);
    if (Object.keys(errs).length > 0) return;

    setGuardando(true);
    const res = await actualizarDatosUsuario(formDatos);
    setGuardando(false);
    if (!res.ok) { setErrores(res.errores || {}); mostrarToast({ titulo: "No se guardaron los datos", mensaje: res.mensaje, tipo: "danger" }); return; }
    if (res.ok) {
      setEditando(false);
      mostrarToast({
        titulo: "¡Datos Actualizados!",
        mensaje: "Tus datos de despacho han sido guardados con éxito para futuras compras.",
        tipo: "success"
      });
    }
  };

  if (!sesion) {
    return (
      <div className="cuenta-cliente-page py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6 text-center">
              <div className="auth-card p-5 shadow-sm rounded-1 bg-white border">
                <i className="bi bi-shield-lock text-warning display-4 mb-3 d-block"></i>
                <h1 className="marca-titulo h3 mb-2">Acceso a Mi Cuenta Ferrefix</h1>
                <p className="text-secondary mb-4">
                  Inicia sesión con tu cuenta de cliente para revisar tu historial de compras, contratos de maquinaria y gestionar tus datos de despacho automático.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <Link to="/login?volver=/cuenta" className="btn btn-ambar px-4 py-2 rounded-1 fw-bold">
                    Iniciar Sesión
                  </Link>
                  <Link to="/registro" className="btn btn-outline-dark px-4 py-2 rounded-1">
                    Registrarme
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
    <div className="cuenta-cliente-page py-4 py-lg-5">
      <div className="container">

        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb mb-0 small">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Inicio</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Mi Cuenta</li>
          </ol>
        </nav>

        <div className="brand-hero rounded-1 p-4 p-md-5 mb-4 shadow-sm">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h1 className="brand-hero-title mb-1">
                Bienvenido/a, {sesion.nombre}
              </h1>
              <p className="brand-hero-text mb-0">
                Gestiona tus datos de despacho automático para checkout rápido, revisa tus pedidos y supervisa tus equipos arrendados.
              </p>
            </div>
          </div>
        </div>

        <div className="cuenta-tabs-bar mb-4 border-bottom d-flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn rounded-1 px-4 py-2 fw-semibold border-0 ${tabActiva === "datos" ? "btn-ambar shadow-sm" : "btn-light text-secondary"}`}
            onClick={() => cambiarTab("datos")}
          >
            <i className="bi bi-person-vcard me-2"></i>
            Mis Datos y Despacho
          </button>
          <button
            type="button"
            className={`btn rounded-1 px-4 py-2 fw-semibold border-0 ${tabActiva === "compras" ? "btn-ambar shadow-sm" : "btn-light text-secondary"}`}
            onClick={() => cambiarTab("compras")}
          >
            <i className="bi bi-bag-check me-2"></i>
            Historial de Compras ({ordenes.length})
          </button>
          <button
            type="button"
            className={`btn rounded-1 px-4 py-2 fw-semibold border-0 ${tabActiva === "arriendos" ? "btn-ambar shadow-sm" : "btn-light text-secondary"}`}
            onClick={() => cambiarTab("arriendos")}
          >
            <i className="bi bi-tools me-2"></i>
            Mis Arriendos ({arriendos.length})
          </button>
        </div>

        {tabActiva === "datos" && (
          <div className="row g-4">
            <div className="col-12 col-lg-7">
              <div className="info-card shadow-sm p-4 p-md-5 h-100">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                  <div>
                    <h2 className="info-section-title mb-1">Ficha de Despacho del Cliente</h2>
                    <span className="text-muted small">Estos datos se cargan automáticamente en el Checkout para compras en 1 clic</span>
                  </div>
                  {!editando && (
                    <button
                      type="button"
                      className="btn btn-outline-dark btn-sm rounded-1 px-3"
                      onClick={() => setEditando(true)}
                    >
                      <i className="bi bi-pencil me-1"></i> Modificar
                    </button>
                  )}
                </div>

                {editando ? (
                  <form onSubmit={handleGuardarDatos} noValidate>
                    <div className="row g-3">
                      {[
                        ['nombre', 'Primer nombre', true], ['segNombre', 'Segundo nombre', false],
                        ['apellidoPaterno', 'Apellido paterno', true], ['apellidoMaterno', 'Apellido materno', false],
                      ].map(([campo, etiqueta, obligatorio]) => (
                        <div className="col-12 col-md-6" key={campo}>
                          <label htmlFor={`cuenta-${campo}`} className="form-label small fw-semibold">{etiqueta}{obligatorio ? ' *' : ' (opcional)'}</label>
                          <input id={`cuenta-${campo}`} className={`form-control form-control-sm rounded-1 ${errores[campo] ? 'is-invalid' : ''}`}
                            value={formDatos[campo]} maxLength={120} required={obligatorio}
                            onChange={(e) => setFormDatos({ ...formDatos, [campo]: e.target.value })} />
                          {errores[campo] && <div className="invalid-feedback">{errores[campo]}</div>}
                        </div>
                      ))}

                      <div className="col-12 col-md-6">
                        <label htmlFor="cuentacliente-campo-2" className="form-label small fw-semibold">RUN / RUT *</label>
                        <input id="cuentacliente-campo-2"
                          type="text"
                          className={`form-control form-control-sm rounded-1 font-monospace ${errores.rut ? "is-invalid" : ""}`}
                          value={formDatos.rut}
                          onChange={(e) => setFormDatos({ ...formDatos, rut: formatearRut(e.target.value) })}
                          maxLength={12}
                          placeholder="Ej: 15.432.890-K"
                          required
                        />
                        {errores.rut && <div className="invalid-feedback">{errores.rut}</div>}
                      </div>

                      <div className="col-12 col-md-6">
                        <label htmlFor="cuentacliente-campo-3" className="form-label small fw-semibold">Correo Electrónico</label>
                        <input id="cuentacliente-campo-3"
                          type="email"
                          className="form-control form-control-sm rounded-1 bg-light"
                          value={formDatos.email}
                          disabled
                        />
                        <span className="text-muted small">El correo es tu identificador de cuenta</span>
                      </div>

                      <div className="col-12 col-md-6">
                        <label htmlFor="cuentacliente-campo-4" className="form-label small fw-semibold">Teléfono de contacto (opcional)</label>
                        <input id="cuentacliente-campo-4"
                          type="tel"
                          className={`form-control form-control-sm rounded-1 ${errores.telefono ? "is-invalid" : ""}`}
                          value={formDatos.telefono}
                          onChange={(e) => setFormDatos({ ...formDatos, telefono: formatearTelefono(e.target.value) })}
                          placeholder="+56 9 8765 4321"
                          maxLength={17}
                        />
                        {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
                      </div>

                      <div className="col-12 col-md-6">
                        <label htmlFor="cuentacliente-campo-5" className="form-label small fw-semibold">Región de despacho</label>
                        <select id="cuentacliente-campo-5"
                          className={`form-select form-select-sm rounded-1 ${errores.region ? 'is-invalid' : ''}`}
                          value={formDatos.region}
                          onChange={(e) => {
                            const nuevaRegion = e.target.value;
                            setFormDatos({
                              ...formDatos,
                              region: nuevaRegion,
                              comuna: ""
                            });
                          }}
                        >
                          <option value="">Selecciona una región</option>
                          {REGIONES_CHILE.map((r) => (
                            <option key={r.region} value={r.region}>{r.region}</option>
                          ))}
                        </select>
                        {errores.region && <div className="invalid-feedback">{errores.region}</div>}
                      </div>

                      <div className="col-12 col-md-6">
                        <label htmlFor="cuentacliente-campo-6" className="form-label small fw-semibold">Comuna de despacho</label>
                        <select id="cuentacliente-campo-6"
                          className={`form-select form-select-sm rounded-1 ${errores.comuna ? 'is-invalid' : ''}`}
                          value={formDatos.comuna}
                          disabled={!formDatos.region}
                          onChange={(e) => setFormDatos({ ...formDatos, comuna: e.target.value })}
                        >
                          <option value="">Selecciona una comuna</option>
                          {(formDatos.region ? obtenerComunas(formDatos.region) : []).map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        {errores.comuna && <div className="invalid-feedback">{errores.comuna}</div>}
                      </div>

                      <div className="col-12">
                        <label htmlFor="cuentacliente-campo-7" className="form-label small fw-semibold">Dirección de entrega (opcional)</label>
                        <input id="cuentacliente-campo-7"
                          type="text"
                          className={`form-control form-control-sm rounded-1 ${errores.direccion ? "is-invalid" : ""}`}
                          value={formDatos.direccion}
                          onChange={(e) => setFormDatos({ ...formDatos, direccion: e.target.value })}
                          placeholder="Ej: Av. Providencia 1240, Depto 502"
                        />
                        {errores.direccion && <div className="invalid-feedback">{errores.direccion}</div>}
                      </div>

                      <div className="col-12 pt-3 d-flex gap-2 justify-content-end border-top">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm rounded-1 px-3"
                          onClick={() => setEditando(false)}
                          disabled={guardando}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={guardando}
                          className="btn btn-ambar btn-sm rounded-1 px-4 fw-bold shadow-sm"
                        >
                          {guardando ? 'Guardando…' : 'Guardar Datos de Despacho'}
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-1 border">
                        <span className="text-muted d-block small mb-1">Nombre Completo:</span>
                        <strong className="text-dark">{nombreCompleto(sesion) || "No informado"}</strong>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-1 border">
                        <span className="text-muted d-block small mb-1">RUN / RUT Cliente:</span>
                        <strong className="text-dark font-monospace">{sesion.rut || "No informado"}</strong>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-1 border">
                        <span className="text-muted d-block small mb-1">Correo Electrónico:</span>
                        <strong className="text-dark font-monospace">{sesion.email}</strong>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-1 border">
                        <span className="text-muted d-block small mb-1">Teléfono Móvil:</span>
                        <strong className="text-dark">{sesion.telefono || "No informado"}</strong>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="p-3 bg-light rounded-1 border">
                        <span className="text-muted d-block small mb-1">Dirección de Despacho Habitual:</span>
                        <strong className="text-dark d-block">
                          {sesion.direccion ? `${sesion.direccion}, ${sesion.comuna}, ${sesion.region}` : "Sin dirección guardada aún."}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tabActiva === "compras" && (
          <div className="info-card shadow-sm p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-2">
              <div>
                <h2 className="info-section-title mb-1">Historial de Compras Realizadas</h2>
                <span className="text-muted small">Consulta el estado, los productos y la entrega de tus pedidos</span>
              </div>
              <span className="badge bg-dark px-3 py-2 font-monospace">Total Compras: {ordenes.length}</span>
            </div>

            {estadoOrdenes.error && <div className="alert alert-danger" role="alert">
              {estadoOrdenes.error}
              <button type="button" className="btn btn-outline-dark btn-sm ms-2" onClick={cargarOrdenes}>Reintentar</button>
            </div>}
            {estadoOrdenes.cargando && <p role="status">Actualizando pedidos…</p>}
            {ordenes.length === 0 ? (!estadoOrdenes.cargando && !estadoOrdenes.error &&
              <div className="text-center py-5">
                <i className="bi bi-cart-x text-muted display-4 mb-3 d-block"></i>
                <h3 className="h5 text-dark mb-2">Aún no registras compras con tu cuenta</h3>
                <p className="text-secondary small mb-4">
                  Explora nuestro catálogo con herramientas y materiales profesionales para comenzar tu primer pedido.
                </p>
                <Link to="/catalogo" className="btn btn-ambar px-4 py-2 rounded-1 fw-bold">
                  Explorar Catálogo
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {ordenes.map((ord) => (
                  <div key={ord.idOrden} className="border rounded-1 p-3 p-md-4 bg-white shadow-sm">
                    <div className="d-flex flex-wrap justify-content-between align-items-center pb-2 mb-3 border-bottom gap-2">
                      <div>
                        <span className="badge bg-success-subtle text-success border border-success-subtle me-2">
                          ● {ord.estado || "Pendiente de confirmación"}
                        </span>
                        <strong className="text-dark me-2">Orden #{ord.idOrden}</strong>
                        {ord.numeroBoleta && (
                          <span className="badge bg-secondary-subtle text-secondary font-monospace">
                            Boleta: {(ord.numeroBoleta || "Sin documento emitido")}
                          </span>
                        )}
                      </div>
                      <div className="text-muted small">
                        <i className="bi bi-calendar3 me-1"></i> {ord.fecha}
                      </div>
                    </div>

                    <div className="table-responsive mb-3">
                      <table className="table table-sm align-middle mb-0">
                        <thead className="table-light small">
                          <tr>
                            <th>Producto</th>
                            <th className="text-center">Cant.</th>
                            <th className="text-end">P. Unitario</th>
                            <th className="text-end">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ord.items && ord.items.map((item, idx) => (
                            <tr key={idx} className="small">
                              <td className="fw-semibold text-dark">{item.nombre}</td>
                              <td className="text-center">{item.cantidad}</td>
                              <td className="text-end font-monospace">{formatearCLP(item.precioUnitario)}</td>
                              <td className="text-end font-monospace">{formatearCLP(item.precioUnitario * item.cantidad)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="d-flex flex-wrap justify-content-between align-items-center pt-2 border-top bg-light p-2 rounded-1">
                      <div className="small text-muted">
                        <div><strong>Medio de Pago:</strong> {ord.metodoPago || "Por coordinar"}</div>
                        <div><strong>Dirección de Entrega:</strong> {ord.cliente?.direccion || "Despacho registrado"}</div>
                      </div>
                      <div className="text-end">
                        <span className="text-muted small d-block">Importe del pedido:</span>
                        <strong className="text-success fs-5 font-monospace">{formatearCLP(ord.total)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tabActiva === "arriendos" && (
          <div className="info-card shadow-sm p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-2">
              <div>
                <h2 className="info-section-title mb-1">Mis Contratos de Arriendo de Maquinaria</h2>
                <span className="text-muted small">Control de equipos en obra, vigencia de contratos y tarifas diarias</span>
              </div>
              <Link to="/arriendos" className="btn btn-ambar btn-sm rounded-1 px-3 fw-bold">
                <i className="bi bi-plus-circle me-1"></i> Arrendar Nuevo Equipo
              </Link>
            </div>

            {estadoArriendos.errorContratos && <div className="alert alert-danger" role="alert">
              {estadoArriendos.errorContratos}
              <button type="button" className="btn btn-outline-dark btn-sm ms-2" onClick={cargarContratosArriendo}>Reintentar</button>
            </div>}
            {estadoArriendos.cargandoContratos && <p role="status">Actualizando arriendos…</p>}
            {arriendos.length === 0 ? (!estadoArriendos.cargandoContratos && !estadoArriendos.errorContratos &&
              <div className="text-center py-5">
                <i className="bi bi-truck text-muted display-4 mb-3 d-block"></i>
                <h3 className="h5 text-dark mb-2">No tienes maquinarias arrendadas actualmente</h3>
                <p className="text-secondary small mb-4">
                  Contamos con martillos demoledores Bosch, betoneras Ingco, placas compactadoras Husqvarna y generadores Krafter listos para tu faena.
                </p>
                <Link to="/arriendos" className="btn btn-ambar px-4 py-2 rounded-1 fw-bold">
                  Ver Equipos Disponibles
                </Link>
              </div>
            ) : (
              <div className="row g-3">
                {arriendos.map((contrato) => (
                  <div key={contrato.idContrato} className="col-12 col-md-6">
                    <div className="border rounded-1 p-4 bg-white shadow-sm h-100 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className={`badge ${contrato.estado === "Vigente" ? "bg-success" : "bg-secondary"}`}>
                            ● {contrato.estado || "Reservado"}
                          </span>
                          <span className="badge bg-light text-dark border font-monospace">
                            Contrato #{contrato.idContrato}
                          </span>
                        </div>

                        <h3 className="h5 fw-bold text-dark mb-1">{contrato.nombreMaquina}</h3>
                        <div className="text-muted small mb-3">Marca: {contrato.marcaMaquina || "Industrial"}</div>

                        <div className="p-3 bg-light rounded-1 border mb-3 small">
                          <div><strong>Tarifa diaria:</strong> {formatearCLP(contrato.tarifaDia)} / día</div>
                          <div><strong>Período:</strong> {contrato.fechaInicio} al {contrato.fechaTermino} ({contrato.diasArriendo} días)</div>
                          <div><strong>Lugar de Faena:</strong> {contrato.usuario?.direccion || "Obra informada"}, {contrato.usuario?.comuna || ""}</div>
                          <div><strong>Fecha de Solicitud:</strong> {contrato.fechaContrato}</div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                        <span className="text-muted small">Costo Total Arriendo:</span>
                        <strong className="text-dark fs-5 font-monospace">{formatearCLP(contrato.totalPagar)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
