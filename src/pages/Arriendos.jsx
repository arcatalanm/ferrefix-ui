import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  obtenerMaquinarias, 
  registrarArriendo, 
  EVENTO_MAQUINARIAS_ACTUALIZADAS 
} from '../data/maquinarias';
import { obtenerSesionActiva } from '../data/auth';

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

function Arriendos() {
  const sesion = obtenerSesionActiva();
  const [maquinarias, setMaquinarias] = useState(obtenerMaquinarias);
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState(null);
  const [contratoGenerado, setContratoGenerado] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Formulario de arriendo con campos limpios y placeholders de ejemplo
  const [regionSeleccionada, setRegionSeleccionada] = useState('Región Metropolitana');
  const [form, setForm] = useState({
    rutUsuario: '',
    nombreUsuario: sesion ? sesion.nombre : '',
    email: sesion ? sesion.email : '',
    telefono: '',
    direccion: '',
    comuna: 'Santiago',
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
    setMaquinaSeleccionada(maq);
    setErrorMsg('');
  };

  const cerrarModal = () => {
    setMaquinaSeleccionada(null);
    setErrorMsg('');
  };

  // Validación básica de RUN chileno
  const validarRutChileno = (rut) => {
    const limpio = rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
    return limpio.length >= 8 && limpio.length <= 9;
  };

  const handleConfirmarArriendo = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validarRutChileno(form.rutUsuario)) {
      setErrorMsg('Por favor ingresa un RUN / RUT chileno válido (Ej: 12.345.678-9).');
      return;
    }

    const res = registrarArriendo({
      idMaquina: maquinaSeleccionada.idMaquina,
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

    setContratoGenerado(res.contrato);
    setMaquinaSeleccionada(null);
  };

  return (
    <div className="arriendos-page py-4 py-lg-5 bg-light min-vh-75">
      <div className="container">
        
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small mb-0">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Inicio</Link></li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">Arriendo de Maquinaria</li>
          </ol>
        </nav>

        {/* Hero Banner Destacado con Imagen Oficial de Bosch */}
        <div className="bg-white border rounded-1 overflow-hidden shadow-sm mb-5">
          <div className="row g-0 align-items-center">
            
            <div className="col-12 col-lg-6 p-4 p-md-5">
              <span className="badge bg-dark text-warning px-3 py-2 rounded-1 fw-semibold mb-2">
                Línea Demolición y Obra Pesada
              </span>
              <h1 className="display-6 fw-bold text-dark mb-2" style={{ fontFamily: '"Oswald", sans-serif' }}>
                Arriendo de Maquinaria Profesional en Santiago
              </h1>
              <p className="text-secondary lh-base mb-4">
                Equipos de alto rendimiento listos para operar en faena sin requerir inversión en compras de capital. Registro y verificación de arriendo por <strong>RUN de cliente</strong> con entrega garantizada y servicio técnico en obra.
              </p>
              
              <div className="d-flex flex-wrap gap-2">
                <a href="#catalogo-maquinas" className="btn btn-warning text-dark fw-bold px-4 py-2 rounded-1 shadow-sm">
                  Ver Maquinarias Disponibles
                </a>
                <Link to="/contacto" className="btn btn-outline-dark px-4 py-2 rounded-1">
                  Cotizar Arriendo por Mes
                </Link>
              </div>
            </div>

            <div className="col-12 col-lg-6 bg-dark text-center">
              <img 
                src="/arriendo-bosch.jpg" 
                alt="Bosch Potencia Imparable - Martillo Demoledor en Arriendo"
                className="w-100 object-fit-cover"
                style={{ maxHeight: '380px' }}
              />
            </div>

          </div>
        </div>

        {/* Catálogo de Maquinarias para Arriendo */}
        <div id="catalogo-maquinas" className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="h4 fw-bold text-dark mb-0" style={{ fontFamily: '"Oswald", sans-serif' }}>
                Equipos y Maquinarias en Arriendo
              </h2>
              <span className="text-muted small">Tarifas diarias transparentes con mantención oficial de fábrica</span>
            </div>
            <span className="badge bg-light text-dark border rounded-1">
              {maquinarias.filter(m => m.estado === 'Disponible').length} Disponibles para retiro
            </span>
          </div>

          <div className="row g-4">
            {maquinarias.map((maq) => {
              const estaDisponible = maq.estado === 'Disponible';

              return (
                <div key={maq.idMaquina} className="col-12 col-md-6 col-lg-6">
                  <div className="bg-white border rounded-1 shadow-sm h-100 d-flex flex-column overflow-hidden">
                    
                    <div className="row g-0 flex-grow-1">
                      <div className="col-12 col-sm-5 bg-platino d-flex align-items-center justify-content-center p-3 border-end border-light-subtle">
                        <img 
                          src={maq.imagen} 
                          alt={maq.nombre}
                          className="img-fluid object-fit-contain"
                          style={{ maxHeight: '200px' }}
                          onError={(e) => { e.target.src = '/banner-web.webp'; }}
                        />
                      </div>

                      <div className="col-12 col-sm-7 p-3 d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: '0.72rem' }}>
                              #{maq.idMaquina}
                            </span>
                            <span className={`badge rounded-1 ${estaDisponible ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary text-white'}`}>
                              {estaDisponible ? '● Disponible' : '■ En Faena (Arrendada)'}
                            </span>
                          </div>

                          <h3 className="h6 fw-bold text-dark mb-1">
                            {maq.nombre}
                          </h3>
                          <div className="text-muted small mb-2">{maq.marca} | {maq.categoria}</div>

                          <div className="small text-secondary mb-3">
                            <ul className="list-unstyled mb-0" style={{ fontSize: '0.8rem' }}>
                              {Object.entries(maq.especificaciones).slice(0, 3).map(([k, v]) => (
                                <li key={k}><strong>{k}:</strong> {v}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="border-top pt-2 d-flex justify-content-between align-items-center">
                          <div>
                            <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>Tarifa por día:</span>
                            <span className="fw-bold text-dark font-monospace fs-5">
                              {formatearCLP(maq.tarifaDia)}
                            </span>
                          </div>

                          <button 
                            type="button" 
                            className={`btn btn-sm rounded-1 px-3 ${estaDisponible ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'}`}
                            disabled={!estaDisponible}
                            onClick={() => abrirModalArriendo(maq)}
                          >
                            {estaDisponible ? 'Arrendar' : 'No Disponible'}
                          </button>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* MODAL: FORMULARIO DE ARRIENDO CON RUN Y SELECTOR DE COMUNA     */}
      {/* ============================================================== */}
      {maquinaSeleccionada && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-1 border-0 shadow">
              
              <div className="modal-header border-bottom py-2 px-3 bg-light">
                <h5 className="modal-title h6 fw-bold mb-0">
                  Solicitud de Arriendo de Equipo: {maquinaSeleccionada.nombre}
                </h5>
                <button type="button" className="btn-close btn-close-sm" onClick={cerrarModal}></button>
              </div>

              <form onSubmit={handleConfirmarArriendo}>
                <div className="modal-body p-3 p-md-4">
                  
                  {/* Ficha Resumen de la Máquina */}
                  <div className="p-3 bg-platino border rounded-1 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <strong className="text-dark d-block">{maquinaSeleccionada.nombre}</strong>
                      <small className="text-muted">Código: {maquinaSeleccionada.idMaquina} | Marca: {maquinaSeleccionada.marca}</small>
                    </div>
                    <div className="text-end">
                      <span className="text-muted small d-block">Tarifa Diaria:</span>
                      <strong className="text-dark font-monospace fs-5">{formatearCLP(maquinaSeleccionada.tarifaDia)}</strong>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="alert alert-danger py-2 px-3 small rounded-1 mb-3">
                      <i className="bi bi-exclamation-triangle-fill me-1"></i>
                      {errorMsg}
                    </div>
                  )}

                  <h4 className="h6 fw-bold text-dark text-uppercase mb-3" style={{ letterSpacing: '0.5px' }}>
                    1. Identificación del Cliente (Validación de RUN)
                  </h4>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        RUN / RUT del Usuario *
                      </label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm rounded-1 font-monospace"
                        placeholder="Ej: 12.345.678-9"
                        value={form.rutUsuario}
                        onChange={(e) => setForm({ ...form, rutUsuario: e.target.value })}
                        required
                      />
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>Requerido para la emisión del contrato</small>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Nombre Completo del Responsable *
                      </label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm rounded-1"
                        placeholder="Ej: Juan Carlos Soto"
                        value={form.nombreUsuario}
                        onChange={(e) => setForm({ ...form, nombreUsuario: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Correo Electrónico (Gmail o Corporativo) *
                      </label>
                      <input 
                        type="email" 
                        className="form-control form-control-sm rounded-1"
                        placeholder="ejemplo@gmail.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Teléfono Móvil de Contacto *
                      </label>
                      <input 
                        type="tel" 
                        className="form-control form-control-sm rounded-1"
                        placeholder="+56 9 9876 5432"
                        value={form.telefono}
                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <h4 className="h6 fw-bold text-dark text-uppercase mb-3" style={{ letterSpacing: '0.5px' }}>
                    2. Ubicación de la Faena / Obra
                  </h4>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-5">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Región *
                      </label>
                      <select 
                        className="form-select form-select-sm rounded-1"
                        value={regionSeleccionada}
                        onChange={(e) => {
                          const nuevaReg = e.target.value;
                          setRegionSeleccionada(nuevaReg);
                          const comunasDisponibles = REGIONES_CHILE.find(r => r.region === nuevaReg)?.comunas || [];
                          setForm({ ...form, comuna: comunasDisponibles[0] || '' });
                        }}
                      >
                        {REGIONES_CHILE.map((r) => (
                          <option key={r.region} value={r.region}>{r.region}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-7">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Comuna (Opciones autorizadas) *
                      </label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-light"><i className="bi bi-search text-muted"></i></span>
                        <select 
                          className="form-select form-select-sm rounded-end-1"
                          value={form.comuna}
                          onChange={(e) => setForm({ ...form, comuna: e.target.value })}
                          required
                        >
                          {(REGIONES_CHILE.find(r => r.region === regionSeleccionada)?.comunas || []).map((com) => (
                            <option key={com} value={com}>{com}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Dirección Exacta de la Obra *
                      </label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm rounded-1"
                        placeholder="Ej: Pasaje Los Aromos 740, Faena Constructora Sur"
                        value={form.direccion}
                        onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <h4 className="h6 fw-bold text-dark text-uppercase mb-3" style={{ letterSpacing: '0.5px' }}>
                    3. Período de Arriendo y Cálculo de Tarifa
                  </h4>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">Fecha de Inicio *</label>
                      <input 
                        type="date" 
                        className="form-control form-control-sm rounded-1"
                        value={form.fechaInicio}
                        onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">Días de Arriendo *</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="90"
                        className="form-control form-control-sm rounded-1 font-monospace"
                        value={form.diasArriendo}
                        onChange={(e) => setForm({ ...form, diasArriendo: Math.max(1, Number(e.target.value)) })}
                        required
                      />
                    </div>
                  </div>

                  {/* Cálculo en vivo */}
                  <div className="p-3 bg-light border rounded-1 d-flex justify-content-between align-items-center">
                    <div>
                      <span className="small text-muted d-block">
                        {form.diasArriendo} día(s) × {formatearCLP(maquinaSeleccionada.tarifaDia)}
                      </span>
                      <strong className="text-dark">Total del Contrato de Arriendo:</strong>
                    </div>
                    <strong className="text-dark font-monospace fs-4">
                      {formatearCLP(maquinaSeleccionada.tarifaDia * form.diasArriendo)}
                    </strong>
                  </div>

                </div>

                <div className="modal-footer border-top py-2 px-3 bg-light">
                  <button type="button" className="btn btn-outline-secondary btn-sm rounded-1" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-warning text-dark fw-bold btn-sm rounded-1 px-4 shadow-sm">
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
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-1 border-0 shadow">
              <div className="modal-header border-bottom py-2 px-3 bg-light">
                <h5 className="modal-title h6 fw-bold mb-0">
                  Contrato de Arriendo #{contratoGenerado.idContrato}
                </h5>
                <button type="button" className="btn-close btn-close-sm" onClick={() => setContratoGenerado(null)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="text-center pb-3 border-bottom mb-3">
                  <div className="text-success fs-1 mb-1">✓</div>
                  <h6 className="fw-bold text-dark mb-1">¡Arriendo Registrado Exitosamente!</h6>
                  <span className="badge bg-dark text-warning font-monospace">
                    Código: #{contratoGenerado.idContrato}
                  </span>
                </div>

                <div className="small mb-3">
                  <div><strong>Máquina:</strong> {contratoGenerado.nombreMaquina} (#{contratoGenerado.idMaquina})</div>
                  <div><strong>Cliente:</strong> {contratoGenerado.usuario.nombre}</div>
                  <div><strong>RUN:</strong> {contratoGenerado.usuario.rut}</div>
                  <div><strong>Contacto:</strong> {contratoGenerado.usuario.telefono} | {contratoGenerado.usuario.email}</div>
                  <div><strong>Faena:</strong> {contratoGenerado.usuario.direccion}, {contratoGenerado.usuario.comuna}</div>
                  <div><strong>Vigencia:</strong> {contratoGenerado.diasArriendo} días desde {contratoGenerado.fechaInicio}</div>
                </div>

                <div className="p-3 bg-platino border rounded-1 d-flex justify-content-between align-items-center">
                  <span className="fw-bold text-dark">Total Arriendo:</span>
                  <span className="fw-bold text-success fs-5 font-monospace">{formatearCLP(contratoGenerado.totalPagar)}</span>
                </div>
              </div>

              <div className="modal-footer border-top py-2 px-3 bg-light">
                <button type="button" className="btn btn-outline-dark btn-sm rounded-1" onClick={() => window.print()}>
                  Imprimir Contrato
                </button>
                <button type="button" className="btn btn-warning text-dark fw-bold btn-sm rounded-1" onClick={() => setContratoGenerado(null)}>
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
