import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mostrarToast } from '../components/ToastNotificacion';
import {
  obtenerMaquinarias,
  registrarArriendo,
  EVENTO_MAQUINARIAS_ACTUALIZADAS,
  useEstadoArriendos,
  cargarMaquinarias,
  calcularFechaTermino,
  fechaHoyChile
} from '../data/maquinarias';
import EspacioImagen from '../components/EspacioImagen';
import { obtenerSesionActiva, useSesion, EVENTO_SESION_ACTUALIZADA } from '../data/auth';
import { nombreCompleto } from '../utils/usuario';
import { REGIONES_CHILE, normalizarRegion, obtenerComunas } from '../data/chile';
import {
  validadores,
  validarFormulario,
  formatearTelefono
} from '../data/validaciones';

const REGLAS_VALIDACION = {
  rutUsuario: validadores.rut,
  nombreUsuario: validadores.nombre,
  email: validadores.email,
  telefono: validadores.telefono,
  direccion: validadores.direccion,
  region: validadores.requerido('La región'),
  comuna: validadores.requerido('La comuna'),
  diasArriendo: (valor) => {
    const dias = Number(valor);
    if (!Number.isInteger(dias) || dias < 1) return 'Ingresa al menos 1 día completo de arriendo.';
    if (dias > 90) return 'El máximo de arriendo es de 90 días.';
    return '';
  },
  fechaInicio: (valor) => !valor || valor < fechaHoyChile() ? 'Selecciona una fecha desde hoy.' : ''
};

function Arriendos() {
  const navigate = useNavigate();
  const sesion = useSesion();
  const estadoArriendos = useEstadoArriendos();
  const [guardando, setGuardando] = useState(false);
  const [maquinarias, setMaquinarias] = useState(obtenerMaquinarias);
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState(null);
  const [contratoGenerado, setContratoGenerado] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [errores, setErrores] = useState({});
  const [touched, setTouched] = useState({});

  const [regionSeleccionada, setRegionSeleccionada] = useState('');
  const [form, setForm] = useState({
    rutUsuario: '',
    nombreUsuario: nombreCompleto(sesion),
    email: sesion ? sesion.email : '',
    telefono: '',
    direccion: '',
    region: '',
    comuna: '',
    diasArriendo: 3,
    fechaInicio: fechaHoyChile()
  });

  useEffect(() => {
    const handleUpdate = () => setMaquinarias(obtenerMaquinarias());
    let idUsuario = obtenerSesionActiva()?.idUsuario;
    const handleSesion = () => {
      const nuevoId = obtenerSesionActiva()?.idUsuario;
      if (nuevoId !== idUsuario) {
        setMaquinaSeleccionada(null);
        setContratoGenerado(null);
        setErrorMsg('');
        idUsuario = nuevoId;
      }
    };
    window.addEventListener(EVENTO_MAQUINARIAS_ACTUALIZADAS, handleUpdate);
    window.addEventListener(EVENTO_SESION_ACTUALIZADA, handleSesion);
    return () => {
      window.removeEventListener(EVENTO_MAQUINARIAS_ACTUALIZADAS, handleUpdate);
      window.removeEventListener(EVENTO_SESION_ACTUALIZADA, handleSesion);
    };
  }, []);

  const formatearCLP = (valor) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(valor || 0);
  };

  const abrirModalArriendo = (maq) => {
    const sesionActiva = obtenerSesionActiva();
    if (!sesionActiva) {
      mostrarToast({
        titulo: 'Inicio de Sesión Requerido',
        mensaje: 'Debes iniciar sesión con tu cuenta para arrendar maquinaria en faena.',
        tipo: 'warning'
      });
      navigate('/login');
      return;
    }
    if (!sesionActiva.rut || !sesionActiva.apellidoPaterno) {
      mostrarToast({ titulo: 'Completa tu perfil', mensaje: 'Guarda tu RUT y apellido paterno antes de arrendar.', tipo: 'warning' });
      navigate('/cuenta');
      return;
    }
    setMaquinaSeleccionada(maq);
    const regionUsuario = sesionActiva.region ? normalizarRegion(sesionActiva.region) : '';
    const comunasDisponibles = regionUsuario ? obtenerComunas(regionUsuario) : [];
    const comunaUsuario = (sesionActiva.comuna && comunasDisponibles.includes(sesionActiva.comuna))
      ? sesionActiva.comuna
      : '';

    setForm((prev) => ({
      ...prev,
      rutUsuario: sesionActiva.rut || '',
      nombreUsuario: nombreCompleto(sesionActiva),
      email: sesionActiva.email || '',
      telefono: sesionActiva.telefono || '',
      direccion: sesionActiva.direccion || '',
      region: regionUsuario,
      comuna: comunaUsuario
    }));
    setRegionSeleccionada(regionUsuario);
    setErrorMsg('');
    setErrores({});
    setTouched({});
  };

  const cerrarModal = () => {
    if (guardando) return;
    setMaquinaSeleccionada(null);
    setErrorMsg('');
  };

  const handleChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (touched[campo]) {
      const validador = REGLAS_VALIDACION[campo];
      if (validador) setErrores((prev) => ({ ...prev, [campo]: validador(valor) }));
    }
  };

  const handleBlur = (campo) => {
    setTouched((prev) => ({ ...prev, [campo]: true }));
    const validador = REGLAS_VALIDACION[campo];
    if (validador) setErrores((prev) => ({ ...prev, [campo]: validador(form[campo]) }));
  };

  const claseCampo = (campo, base = 'form-control form-control-sm rounded-1') =>
    `${base}${errores[campo] ? ' is-invalid' : ''}`;

  const handleCambiarRegion = (nuevaRegion) => {
    const regionNorm = nuevaRegion ? normalizarRegion(nuevaRegion) : '';
    setRegionSeleccionada(regionNorm);
    const comuna = '';
    setForm((prev) => ({ ...prev, region: regionNorm, comuna }));
    setErrores((prev) => ({ ...prev, comuna: '' }));
  };

  const handleConfirmarArriendo = async (e) => {
    e.preventDefault();
    if (guardando) return;
    setErrorMsg('');

    const nuevosErrores = validarFormulario(REGLAS_VALIDACION, form);
    setErrores(nuevosErrores);
    setTouched(
      Object.keys(REGLAS_VALIDACION).reduce((acc, campo) => ({ ...acc, [campo]: true }), {})
    );

    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    const idUsuario = obtenerSesionActiva()?.idUsuario;
    setGuardando(true);
    const res = await registrarArriendo({
      idMaquina: maquinaSeleccionada.idMaquina,
      telefono: form.telefono,
      direccion: form.direccion,
      region: regionSeleccionada,
      comuna: form.comuna,
      diasArriendo: form.diasArriendo,
      fechaInicio: form.fechaInicio
    });
    setGuardando(false);
    if (idUsuario !== obtenerSesionActiva()?.idUsuario) return;

    if (!res.ok) {
      setErrorMsg(res.error);
      setErrores(res.errores || {});
      return;
    }

    setErrores({});
    setTouched({});
    setContratoGenerado(res.contrato);
    setMaquinaSeleccionada(null);
  };

  return (
    <div className="arriendos-page py-4 py-lg-5">
      <div className="container">

        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb arriendos-breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Arriendo de Maquinaria</li>
          </ol>
        </nav>

        <div className="brand-hero rounded-1 p-4 p-md-5 mb-5">
          <h1 className="brand-hero-title mb-3">
            Arriendo de Maquinaria Profesional en Santiago
          </h1>
          <p className="brand-hero-text mb-0">
            Equipos de alto rendimiento listos para operar en faena sin requerir inversión en compras de capital. Registro y verificación de arriendo por <strong>RUN de cliente</strong> con entrega garantizada y servicio técnico en obra.
          </p>
        </div>

        <div id="catalogo-maquinas" className="mb-4">
          <div className="mb-3">
            <h2 className="arriendos-section-title mb-1">
              Equipos y Maquinarias en Arriendo
            </h2>
            <span className="arriendos-section-sub">Tarifas diarias transparentes con mantención oficial de fábrica</span>
          </div>

          {estadoArriendos.errorMaquinas && <div className="alert alert-danger" role="alert">
            {estadoArriendos.errorMaquinas}
            <button type="button" className="btn btn-outline-dark btn-sm ms-2" onClick={cargarMaquinarias}>Reintentar</button>
          </div>}
          {estadoArriendos.cargandoMaquinas && maquinarias.length === 0 && <p role="status">Cargando maquinaria…</p>}
          {!estadoArriendos.cargandoMaquinas && !estadoArriendos.errorMaquinas && maquinarias.length === 0 && <p>No hay maquinaria disponible en el catálogo.</p>}
          <div className="row g-4">
            {maquinarias.map((maq) => {
              const estaDisponible = maq.estado === 'Disponible';
              const imagenMaquina = maq.imagen;

              return (
                <div key={maq.idMaquina} className="col-12 col-md-6">
                  <div className={`arriendo-card shadow-sm h-100 d-flex flex-column ${estaDisponible ? 'arriendo-card--disponible' : 'arriendo-card--arrendada'}`}>

                    <EspacioImagen
                      src={imagenMaquina}
                      alt={`${maq.nombre} - ${maq.marca}`}
                      proporcion="16x9"
                      icono="bi-tools"
                      etiqueta={`Maquinaria ${maq.marca}`}
                      className="arriendo-card-imagen"
                    />

                    <div className="p-4 d-flex flex-column justify-content-between flex-grow-1">
                      <div>
                        <div className="mb-2">
                          <span className={`arriendo-estado-badge ${estaDisponible ? 'arriendo-estado-badge--disponible' : 'arriendo-estado-badge--arrendada'}`}>
                            {maq.estado}
                          </span>
                        </div>

                        <h3 className="arriendo-nombre mb-1">
                          {maq.nombre}
                        </h3>
                        <div className="arriendo-meta mb-2">{maq.marca} | {maq.categoria}</div>

                        <div className="arriendo-specs-list mb-3">
                          <ul className="list-unstyled mb-0">
                            {Object.entries(maq.especificaciones).slice(0, 3).map(([k, v]) => (
                              <li key={k}><strong>{k}:</strong> {v}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="arriendo-card-footer d-flex justify-content-between align-items-center">
                        <div>
                          <span className="arriendo-rate-label d-block">Tarifa por día:</span>
                          <span className="arriendo-rate-value">
                            {formatearCLP(maq.tarifaDia)}
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`btn btn-sm rounded-1 px-3 ${estaDisponible ? 'btn-ambar arriendo-btn' : 'btn-outline-secondary'}`}
                          disabled={!estaDisponible}
                          onClick={() => abrirModalArriendo(maq)}
                        >
                          {estaDisponible ? 'Arrendar' : 'No Disponible'}
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {maquinaSeleccionada && (
        <div className="modal modal-backdrop-custom fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-1 border-0 shadow">

              <div className="modal-header arriendo-modal-head border-bottom py-2 px-3">
                <h5 className="modal-title arriendo-modal-title mb-0">
                  Solicitud de Arriendo de Equipo: {maquinaSeleccionada.nombre}
                </h5>
                <button type="button" className="btn-close btn-close-sm" onClick={cerrarModal}></button>
              </div>

              <form onSubmit={handleConfirmarArriendo} noValidate>
                <div className="modal-body p-3 p-md-4">

                  <div className="arriendo-summary p-3 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <strong className="arriendo-summary-name d-block">{maquinaSeleccionada.nombre}</strong>
                      <small className="arriendo-summary-meta">Código: {maquinaSeleccionada.idMaquina} | Marca: {maquinaSeleccionada.marca}</small>
                    </div>
                    <div className="arriendo-summary-end">
                      <span className="arriendo-summary-label d-block">Tarifa Diaria:</span>
                      <strong className="arriendo-summary-value">{formatearCLP(maquinaSeleccionada.tarifaDia)}</strong>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="alert alert-danger arriendo-alert py-2 px-3 rounded-1 mb-3">
                      <i className="bi bi-exclamation-triangle-fill me-1"></i>
                      {errorMsg}
                    </div>
                  )}

                  <h4 className="arriendo-modal-section-title mb-3">
                    1. Identificación del Cliente (Validación de RUN)
                  </h4>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                      <label className="form-label arriendo-label mb-1">
                        RUN / RUT del Usuario *
                      </label>
                      <input
                        type="text"
                        className={claseCampo('rutUsuario', 'form-control form-control-sm rounded-1 arriendo-mono')}
                        placeholder="Ej: 12.345.678-9"
                        value={form.rutUsuario}
                        readOnly
                        maxLength={12}
                        required
                      />
                      {errores.rutUsuario
                        ? <div className="invalid-feedback d-block">{errores.rutUsuario}</div>
                        : <small className="arriendo-help-text">Requerido para la emisión del contrato</small>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label arriendo-label mb-1">
                        Nombre Completo del Responsable *
                      </label>
                      <input
                        type="text"
                        className={claseCampo('nombreUsuario')}
                        placeholder="Ej: Juan Carlos Soto"
                        value={form.nombreUsuario}
                        readOnly
                        required
                      />
                      {errores.nombreUsuario && <div className="invalid-feedback">{errores.nombreUsuario}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label arriendo-label mb-1">
                        Correo Electrónico (Gmail o Corporativo) *
                      </label>
                      <input
                        type="email"
                        className={claseCampo('email')}
                        placeholder="ejemplo@gmail.com"
                        value={form.email}
                        readOnly
                        required
                      />
                      {errores.email && <div className="invalid-feedback">{errores.email}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label arriendo-label mb-1">
                        Teléfono Móvil de Contacto *
                      </label>
                      <input
                        type="tel"
                        className={claseCampo('telefono')}
                        placeholder="+56 9 9876 5432"
                        value={form.telefono}
                        onChange={(e) => handleChange('telefono', formatearTelefono(e.target.value))}
                        onBlur={() => handleBlur('telefono')}
                        inputMode="tel"
                        maxLength={17}
                        required
                      />
                      {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
                    </div>
                  </div>

                  <h4 className="arriendo-modal-section-title mb-3">
                    2. Ubicación de la Faena / Obra
                  </h4>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-5">
                      <label className="form-label arriendo-label mb-1">
                        Región *
                      </label>
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
                      <label className="form-label arriendo-label mb-1">
                        Comuna (Opciones autorizadas) *
                      </label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text arriendo-input-icon"><i className="bi bi-search"></i></span>
                        <select
                          className={`form-select form-select-sm rounded-end-1${errores.comuna ? ' is-invalid' : ''}`}
                          value={form.comuna}
                          disabled={!regionSeleccionada}
                          onChange={(e) => handleChange('comuna', e.target.value)}
                          onBlur={() => handleBlur('comuna')}
                          required
                        >
                          <option value="">Selecciona una comuna</option>
                          {(regionSeleccionada ? obtenerComunas(regionSeleccionada) : []).map((com) => (
                            <option key={com} value={com}>{com}</option>
                          ))}
                        </select>
                      </div>
                      {errores.comuna && <div className="invalid-feedback d-block">{errores.comuna}</div>}
                    </div>

                    <div className="col-12">
                      <label className="form-label arriendo-label mb-1">
                        Dirección Exacta de la Obra *
                      </label>
                      <input
                        type="text"
                        className={claseCampo('direccion')}
                        placeholder="Ej: Pasaje Los Aromos 740, Faena Constructora Sur"
                        value={form.direccion}
                        onChange={(e) => handleChange('direccion', e.target.value)}
                        onBlur={() => handleBlur('direccion')}
                        required
                      />
                      {errores.direccion && <div className="invalid-feedback">{errores.direccion}</div>}
                    </div>
                  </div>

                  <h4 className="arriendo-modal-section-title mb-3">
                    3. Período de Arriendo y Cálculo de Tarifa
                  </h4>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label arriendo-label mb-1">Fecha de Inicio *</label>
                      <input
                        type="date"
                        className={claseCampo('fechaInicio')}
                        value={form.fechaInicio}
                        min={fechaHoyChile()}
                        onChange={(e) => handleChange('fechaInicio', e.target.value)}
                        onBlur={() => handleBlur('fechaInicio')}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label arriendo-label mb-1">Días de Arriendo *</label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        className={claseCampo('diasArriendo', 'form-control form-control-sm rounded-1 arriendo-mono')}
                        value={form.diasArriendo}
                        onChange={(e) => handleChange('diasArriendo', e.target.value)}
                        onBlur={() => handleBlur('diasArriendo')}
                        required
                      />
                      {errores.diasArriendo && <div className="invalid-feedback">{errores.diasArriendo}</div>}
                    </div>
                    <div className="col-12">
                      {errores.fechaInicio && <div className="invalid-feedback d-block">{errores.fechaInicio}</div>}
                      <span className="arriendo-help-text">Fecha de término: {calcularFechaTermino(form.fechaInicio, form.diasArriendo) || 'Selecciona el período'} (día incluido)</span>
                    </div>
                  </div>

                  <div className="arriendo-summary p-3 d-flex justify-content-between align-items-center">
                    <div>
                      <span className="arriendo-total-label d-block">
                        {form.diasArriendo} día(s) × {formatearCLP(maquinaSeleccionada.tarifaDia)}
                      </span>
                      <strong className="arriendo-total-name">Total del Contrato de Arriendo:</strong>
                    </div>
                    <strong className="arriendo-total-value">
                      {formatearCLP(maquinaSeleccionada.tarifaDia * form.diasArriendo)}
                    </strong>
                  </div>

                </div>

                <div className="modal-footer arriendo-modal-foot border-top py-2 px-3">
                  <button type="button" className="btn btn-outline-secondary btn-sm rounded-1" onClick={cerrarModal} disabled={guardando}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-ambar arriendo-btn btn-sm rounded-1 px-4 shadow-sm" disabled={guardando}>
                    {guardando ? 'Confirmando…' : 'Confirmar Arriendo'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {contratoGenerado && (
        <div className="modal modal-backdrop-custom fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-1 border-0 shadow">
              <div className="modal-header arriendo-modal-head border-bottom py-2 px-3">
                <h5 className="modal-title arriendo-modal-title mb-0">
                  Contrato de Arriendo #{contratoGenerado.idContrato}
                </h5>
                <button type="button" className="btn-close btn-close-sm" onClick={() => setContratoGenerado(null)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="arriendo-contract-head pb-3 border-bottom mb-3">
                  <div className="arriendo-ok-icon mb-1">✓</div>
                  <h6 className="arriendo-contract-title mb-2">¡Arriendo Registrado Exitosamente!</h6>
                  <span className="arriendo-contract-code">
                    Código: #{contratoGenerado.idContrato}
                  </span>
                </div>

                <div className="arriendo-contract-list mb-3">
                  <div><strong>Máquina:</strong> {contratoGenerado.nombreMaquina} (#{contratoGenerado.idMaquina})</div>
                  <div><strong>Cliente:</strong> {contratoGenerado.usuario.nombre}</div>
                  <div><strong>RUN:</strong> {contratoGenerado.usuario.rut}</div>
                  <div><strong>Contacto:</strong> {contratoGenerado.usuario.telefono} | {contratoGenerado.usuario.email}</div>
                  <div><strong>Faena:</strong> {contratoGenerado.usuario.direccion}, {contratoGenerado.usuario.comuna}</div>
                  <div><strong>Vigencia:</strong> {contratoGenerado.fechaInicio} al {contratoGenerado.fechaTermino} ({contratoGenerado.diasArriendo} días)</div>
                </div>

                <div className="arriendo-summary p-3 d-flex justify-content-between align-items-center">
                  <span className="arriendo-total-name">Total Arriendo:</span>
                  <span className="arriendo-contract-total">{formatearCLP(contratoGenerado.totalPagar)}</span>
                </div>
              </div>

              <div className="modal-footer arriendo-modal-foot border-top py-2 px-3">
                <button type="button" className="btn btn-ambar arriendo-btn btn-sm rounded-1" onClick={() => setContratoGenerado(null)}>
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Arriendos;
