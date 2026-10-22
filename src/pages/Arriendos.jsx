import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  obtenerMaquinarias, 
  registrarArriendo, 
  EVENTO_MAQUINARIAS_ACTUALIZADAS 
} from '../data/maquinarias';
import { obtenerSesionActiva, obtenerPerfilCliente } from '../data/auth';
import { REGIONES_CHILE, REGION_POR_DEFECTO, obtenerComunas, obtenerComunaPorDefecto } from '../data/chile';
import {
  validadores,
  validarFormulario,
  formatearRut,
  formatearTelefono
} from '../data/validaciones';

// Reglas de validación del formulario de arriendo.
const REGLAS_VALIDACION = {
  rutUsuario: validadores.rut,
  nombreUsuario: validadores.nombre,
  email: validadores.email,
  telefono: validadores.telefono,
  direccion: validadores.direccion,
  comuna: validadores.requerido('La comuna'),
  diasArriendo: (valor) => {
    const dias = Number(valor);
    if (!dias || dias < 1) return 'Ingresa al menos 1 día de arriendo.';
    if (dias > 90) return 'El máximo de arriendo es de 90 días.';
    return '';
  }
};

const PREGUNTAS_ARRIENDO = [
  {
    categoria: 'Requisitos',
    pregunta: '¿Qué necesito para arrendar una máquina?',
    respuesta: 'Debes tener una cuenta de cliente activa en Ferrefix y completar el formulario con tu RUN, datos de contacto y la dirección de la faena. Al confirmar, el equipo coordina la entrega y la revisión técnica del equipo.'
  },
  {
    categoria: 'Despacho',
    pregunta: '¿El flete está incluido en la tarifa diaria?',
    respuesta: 'La tarifa diaria cubre el uso del equipo y su mantención preventiva. El flete se calcula según la comuna y el tamaño de la máquina; lo coordinamos contigo antes de cerrar el arriendo y queda detallado en la cotización.'
  },
  {
    categoria: 'Garantías',
    pregunta: '¿Qué pasa si la máquina falla durante la faena?',
    respuesta: 'Todas las máquinas incluyen soporte técnico y mantención. Si detectas una falla, contáctanos de inmediato: coordinamos revisión en obra o el reemplazo del equipo según disponibilidad, sin cobrar el día detenido por falla atribuible al equipo.'
  },
  {
    categoria: 'Devoluciones',
    pregunta: '¿Cómo extiendo o devuelvo el arriendo?',
    respuesta: 'Puedes solicitar una extensión antes de la fecha de devolución, sujeto a disponibilidad del equipo. Para devolver, coordina el retiro o entrega en tienda; la máquina debe volver limpia y con sus accesorios para cerrar el contrato.'
  }
];

function Arriendos() {
  const navigate = useNavigate();
  const sesion = obtenerSesionActiva();
  const perfil = sesion ? obtenerPerfilCliente(sesion.email) : null;
  const regionInicial = perfil?.region || REGION_POR_DEFECTO;
  const comunaInicial = perfil?.comuna || obtenerComunaPorDefecto(regionInicial);

  const [maquinarias, setMaquinarias] = useState(obtenerMaquinarias);
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState(null);
  const [contratoGenerado, setContratoGenerado] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [errores, setErrores] = useState({});
  const [touched, setTouched] = useState({});
  const [faqAbierta, setFaqAbierta] = useState(0);

  // Formulario de arriendo con datos precargados desde el perfil del cliente.
  const [regionSeleccionada, setRegionSeleccionada] = useState(regionInicial);
  const [form, setForm] = useState({
    rutUsuario: perfil?.rut || '',
    nombreUsuario: perfil?.nombre || (sesion ? sesion.nombre : ''),
    email: perfil?.email || (sesion ? sesion.email : ''),
    telefono: perfil?.telefono || '',
    direccion: perfil?.direccion || '',
    region: regionInicial,
    comuna: comunaInicial,
    diasArriendo: 3,
    fechaInicio: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    const handleUpdate = () => setMaquinarias(obtenerMaquinarias());
    window.addEventListener(EVENTO_MAQUINARIAS_ACTUALIZADAS, handleUpdate);
    return () => window.removeEventListener(EVENTO_MAQUINARIAS_ACTUALIZADAS, handleUpdate);
  }, []);

  const formatearCLP = (valor) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(valor || 0);
  };

  const abrirModalArriendo = (maq) => {
    if (!sesion) {
      navigate('/login', { state: { from: '/arriendos' } });
      return;
    }
    setMaquinaSeleccionada(maq);
    setErrorMsg('');
    setErrores({});
    setTouched({});
  };

  const cerrarModal = () => {
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
    setRegionSeleccionada(nuevaRegion);
    const comuna = obtenerComunaPorDefecto(nuevaRegion);
    setForm((prev) => ({ ...prev, region: nuevaRegion, comuna }));
    setErrores((prev) => ({ ...prev, comuna: '' }));
  };

  const handleConfirmarArriendo = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const nuevosErrores = validarFormulario(REGLAS_VALIDACION, form);
    setErrores(nuevosErrores);
    setTouched(
      Object.keys(REGLAS_VALIDACION).reduce((acc, campo) => ({ ...acc, [campo]: true }), {})
    );

    if (Object.keys(nuevosErrores).length > 0) {
      setErrorMsg('Revisa los campos marcados en rojo antes de confirmar el arriendo.');
      return;
    }

    const res = registrarArriendo({
      idMaquina: maquinaSeleccionada.idMaquina,
      idUsuario: sesion?.idUsuario || null,
      rutUsuario: form.rutUsuario,
      nombreUsuario: form.nombreUsuario,
      email: form.email,
      telefono: form.telefono,
      direccion: form.direccion,
      region: regionSeleccionada,
      comuna: form.comuna,
      diasArriendo: form.diasArriendo,
      fechaInicio: form.fechaInicio
    });

    if (!res.ok) {
      setErrorMsg(res.error);
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

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb arriendos-breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Arriendo de Maquinaria</li>
          </ol>
        </nav>

        {/* Hero Banner */}
        <div className="brand-hero rounded-1 p-4 p-md-5 mb-5">
          <h1 className="brand-hero-title mb-3">
            Arriendo de Maquinaria Profesional en Santiago
          </h1>
          <p className="brand-hero-text mb-0">
            Equipos de alto rendimiento listos para operar en faena sin requerir inversión en compras de capital. Registro y verificación de arriendo por <strong>RUN de cliente</strong> con entrega garantizada y servicio técnico en obra.
          </p>
        </div>

        {!sesion && (
          <div className="alert alert-warning border rounded-1 d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
            <div>
              <i className="bi bi-person-lock me-1"></i>
              Para arrendar una máquina debes iniciar sesión con tu cuenta de cliente.
            </div>
            <Link to="/login" state={{ from: '/arriendos' }} className="btn btn-sm btn-dark rounded-1">
              Iniciar sesión
            </Link>
          </div>
        )}

        {/* Catálogo de Maquinarias para Arriendo */}
        <div id="catalogo-maquinas" className="mb-4">
          <div className="mb-3">
            <h2 className="arriendos-section-title mb-1">
              Equipos y Maquinarias en Arriendo
            </h2>
            <span className="arriendos-section-sub">Tarifas diarias transparentes con mantención oficial de fábrica</span>
          </div>

          <div className="row g-4">
            {maquinarias.map((maq) => {
              const estaDisponible = maq.estado === 'Disponible';

              return (
                <div key={maq.idMaquina} className="col-12 col-md-6">
                  <div className={`arriendo-card shadow-sm h-100 d-flex flex-column ${estaDisponible ? 'arriendo-card--disponible' : 'arriendo-card--arrendada'}`}>

                    <div className="p-4 d-flex flex-column justify-content-between flex-grow-1">
                      <div>
                        <div className="mb-2">
                          <span className={`arriendo-estado-badge ${estaDisponible ? 'arriendo-estado-badge--disponible' : 'arriendo-estado-badge--arrendada'}`}>
                            {estaDisponible ? '● Disponible' : '■ En Faena (Arrendada)'}
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

        {/* Servicios de arriendo: flete, garantías y preguntas frecuentes */}
        <section id="servicios-arriendo" className="mt-5">
          <div className="mb-3">
            <h2 className="arriendos-section-title mb-1">
              Flete, garantías y soporte para tu faena
            </h2>
            <span className="arriendos-section-sub">
              Todo lo que necesitas saber antes de arrendar con Ferrefix.
            </span>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="info-mini-card h-100 p-4 shadow-sm d-flex flex-column">
                <i className="bi bi-truck info-mini-icon mb-3"></i>
                <h3 className="info-mini-title h6 mb-2">Flete y despacho</h3>
                <p className="info-mini-text flex-grow-1">
                  Coordinamos retiro en tienda o entrega de la máquina en la dirección de la faena.
                  El costo se calcula según comuna y equipo.
                </p>
                <Link to="/fletes" className="btn btn-sm btn-outline-dark rounded-1 align-self-start">
                  Ver cobertura y plazos
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="info-mini-card h-100 p-4 shadow-sm d-flex flex-column">
                <i className="bi bi-shield-check info-mini-icon mb-3"></i>
                <h3 className="info-mini-title h6 mb-2">Garantías y mantención</h3>
                <p className="info-mini-text flex-grow-1">
                  Cada equipo incluye mantención preventiva, revisión técnica y soporte ante fallas
                  durante el período de arriendo.
                </p>
                <Link to="/garantias" className="btn btn-sm btn-outline-dark rounded-1 align-self-start">
                  Conocer garantías
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="info-mini-card h-100 p-4 shadow-sm d-flex flex-column">
                <i className="bi bi-question-circle info-mini-icon mb-3"></i>
                <h3 className="info-mini-title h6 mb-2">Preguntas frecuentes</h3>
                <p className="info-mini-text flex-grow-1">
                  Resolvemos las dudas más comunes sobre requisitos, flete, devoluciones y
                  extensiones de arriendo.
                </p>
                <a href="#preguntas-arriendo" className="btn btn-sm btn-outline-dark rounded-1 align-self-start">
                  Ver preguntas
                </a>
              </div>
            </div>
          </div>

          <div id="preguntas-arriendo" className="info-card shadow-sm p-4 p-md-5 mt-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h2 className="info-section-title mb-0">Preguntas frecuentes de arriendo</h2>
              <Link to="/faq" className="btn btn-sm btn-outline-dark rounded-1">
                Ver todas las preguntas
              </Link>
            </div>

            <div>
              {PREGUNTAS_ARRIENDO.map((item, indice) => (
                <div className="faq-item" key={item.pregunta}>
                  <button
                    type="button"
                    className="faq-button"
                    onClick={() => setFaqAbierta(faqAbierta === indice ? -1 : indice)}
                    aria-expanded={faqAbierta === indice}
                  >
                    <span>
                      <span className="faq-categoria d-block mb-1">{item.categoria}</span>
                      <span className="faq-pregunta">{item.pregunta}</span>
                    </span>
                    <i className={`bi bi-chevron-down faq-chevron ${faqAbierta === indice ? 'faq-chevron--abierta' : ''}`}></i>
                  </button>
                  <div className={`faq-body ${faqAbierta === indice ? 'faq-body--abierta' : ''}`}>
                    <p className="mb-0">{item.respuesta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* ============================================================== */}
      {/* MODAL: FORMULARIO DE ARRIENDO CON RUN Y SELECTOR DE COMUNA     */}
      {/* ============================================================== */}
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

                  {/* Ficha Resumen de la Máquina */}
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
                        onChange={(e) => handleChange('rutUsuario', formatearRut(e.target.value))}
                        onBlur={() => handleBlur('rutUsuario')}
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
                        onChange={(e) => handleChange('nombreUsuario', e.target.value)}
                        onBlur={() => handleBlur('nombreUsuario')}
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
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
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
                        className="form-select form-select-sm rounded-1"
                        value={regionSeleccionada}
                        onChange={(e) => handleCambiarRegion(e.target.value)}
                      >
                        {REGIONES_CHILE.map((r) => (
                          <option key={r.region} value={r.region}>{r.region}</option>
                        ))}
                      </select>
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
                          onChange={(e) => handleChange('comuna', e.target.value)}
                          onBlur={() => handleBlur('comuna')}
                          required
                        >
                          {obtenerComunas(regionSeleccionada).map((com) => (
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
                        className="form-control form-control-sm rounded-1"
                        value={form.fechaInicio}
                        onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
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
                  </div>

                  {/* Cálculo en vivo */}
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
                  <button type="button" className="btn btn-outline-secondary btn-sm rounded-1" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-ambar arriendo-btn btn-sm rounded-1 px-4 shadow-sm">
                    Confirmar Arriendo
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: COMPROBANTE DE CONTRATO DE ARRIENDO GENERADO            */}
      {/* ============================================================== */}
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
                  <div><strong>Vigencia:</strong> {contratoGenerado.diasArriendo} días desde {contratoGenerado.fechaInicio}</div>
                  <div><strong>Fecha de devolución:</strong> {contratoGenerado.fechaDevolucion}</div>
                </div>

                <div className="arriendo-summary p-3 d-flex justify-content-between align-items-center">
                  <span className="arriendo-total-name">Total Arriendo:</span>
                  <span className="arriendo-contract-total">{formatearCLP(contratoGenerado.totalPagar)}</span>
                </div>
              </div>

              <div className="modal-footer arriendo-modal-foot border-top py-2 px-3">
                <button type="button" className="btn btn-outline-dark btn-sm rounded-1" onClick={() => window.print()}>
                  Imprimir Contrato
                </button>
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
