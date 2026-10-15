import { useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerSesionActiva } from '../data/auth';

function ContactoCotizacion() {
  const sesion = obtenerSesionActiva();

  const [form, setForm] = useState({
    nombre: sesion ? sesion.nombre : '',
    rut: '',
    email: sesion ? sesion.email : '',
    telefono: '',
    tipoProyecto: 'Herramientas de Alto Rendimiento',
    region: 'Región Metropolitana',
    detalle: '',
    despachoObra: true
  });

  const [mensajeEnviado, setMensajeEnviado] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const cotizacion = {
      idCotizacion: `COT-${Date.now().toString().slice(-6)}`,
      fecha: new Date().toLocaleString('es-CL'),
      ...form
    };

    // Guardar en localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const previas = JSON.parse(localStorage.getItem('ferrefix_cotizaciones_v1') || '[]');
      localStorage.setItem('ferrefix_cotizaciones_v1', JSON.stringify([cotizacion, ...previas]));
    }

    setMensajeEnviado(cotizacion.idCotizacion);
    setForm({
      nombre: '',
      rut: '',
      email: '',
      telefono: '',
      tipoProyecto: 'Herramientas de Alto Rendimiento',
      region: 'Región Metropolitana',
      detalle: '',
      despachoObra: true
    });
  };

  return (
    <div className="contacto-cotizacion-page py-4 py-lg-5 bg-light min-vh-75">
      <div className="container">
        
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small mb-0">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Inicio</Link></li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">Cotizaciones y Contacto</li>
          </ol>
        </nav>

        {/* Encabezado */}
        <div className="bg-white border rounded-1 p-4 p-md-5 mb-4 shadow-sm">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-8">
              <span className="badge bg-dark text-warning px-3 py-2 rounded-1 fw-semibold mb-2">
                Atención a Constructoras y Particulares
              </span>
              <h1 className="h2 fw-bold text-dark mb-2" style={{ fontFamily: '"Oswald", sans-serif' }}>
                Cotizaciones por Volumen y Contacto Comercial
              </h1>
              <p className="text-secondary mb-0">
                ¿Necesitas presupuestos especiales para tu obra, compra por mayor o arriendo corporativo? Completa el formulario y un asesor técnico de Ferrefix te enviará la propuesta formal en menos de 2 horas hábiles.
              </p>
            </div>
            <div className="col-12 col-lg-4 text-lg-end">
              <a 
                href="https://web.whatsapp.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-warning text-dark fw-bold px-4 py-3 rounded-1 shadow-sm d-inline-flex align-items-center gap-2"
              >
                <i className="bi bi-whatsapp fs-5"></i>
                WhatsApp Directo Faenas
              </a>
            </div>
          </div>
        </div>

        {/* Canales Directos */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="bg-white border rounded-1 p-3 shadow-sm h-100">
              <div className="fw-bold text-dark mb-1">Mesa Central y Cotizaciones</div>
              <div className="small text-muted mb-2">Atención telefónica de lunes a sábado</div>
              <a href="tel:+56993456575" className="text-decoration-none text-dark fw-bold font-monospace">
                +56 9 9345 6575
              </a>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="bg-white border rounded-1 p-3 shadow-sm h-100">
              <div className="fw-bold text-dark mb-1">Correo de Ventas Corporativas</div>
              <div className="small text-muted mb-2">Envío de órdenes de compra y licitaciones</div>
              <span className="text-dark fw-semibold small font-monospace">
                contacto@ferrefix.cl
              </span>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="bg-white border rounded-1 p-3 shadow-sm h-100">
              <div className="fw-bold text-dark mb-1">Casa Matriz y Mesón Técnico</div>
              <div className="small text-muted mb-2">Retiro inmediato de materiales y maquinaria</div>
              <span className="text-dark small fw-semibold">
                Antonio Varas 666, Providencia
              </span>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="bg-white border rounded-1 shadow-sm p-4 p-md-5">
              
              <div className="border-bottom pb-3 mb-4">
                <h2 className="h4 fw-bold text-dark mb-1" style={{ fontFamily: '"Oswald", sans-serif' }}>
                  Formulario de Solicitud de Cotización
                </h2>
                <p className="text-muted small mb-0">
                  Ingresa los detalles de los productos o maquinaria que requieres para tu faena.
                </p>
              </div>

              {mensajeEnviado && (
                <div className="alert alert-success d-flex align-items-center justify-content-between p-3 rounded-1 mb-4" role="alert">
                  <div>
                    <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                    <strong>¡Solicitud enviada con éxito!</strong> Tu número de cotización es <code>#{mensajeEnviado}</code>. Un asesor se pondrá en contacto a la brevedad.
                  </div>
                  <button type="button" className="btn-close" onClick={() => setMensajeEnviado(null)}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Nombre o Razón Social *
                    </label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm rounded-1"
                      placeholder="Ej: Constructora Andina SpA o Juan Pérez"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      RUT Persona o Empresa *
                    </label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm rounded-1"
                      placeholder="Ej: 76.123.456-7"
                      value={form.rut}
                      onChange={(e) => setForm({ ...form, rut: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Correo Electrónico de Contacto *
                    </label>
                    <input 
                      type="email" 
                      className="form-control form-control-sm rounded-1"
                      placeholder="adquisiciones@empresa.cl"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Teléfono Móvil o Faena *
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

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Tipo de Requerimiento *
                    </label>
                    <select 
                      className="form-select form-select-sm rounded-1"
                      value={form.tipoProyecto}
                      onChange={(e) => setForm({ ...form, tipoProyecto: e.target.value })}
                    >
                      <option value="Herramientas de Alto Rendimiento">Herramientas de Alto Rendimiento (DeWalt, Bosch, Makita)</option>
                      <option value="Materiales de Obra Gruesa">Materiales de Obra Gruesa (Cemento, Maderas)</option>
                      <option value="Fijaciones y Tornillería por Mayor">Fijaciones y Tornillería por Mayor</option>
                      <option value="Arriendo de Maquinaria y Demoledores">Arriendo de Maquinaria y Demoledores</option>
                      <option value="Equipamiento de Seguridad y Faena">Equipamiento de Seguridad y Faena</option>
                      <option value="Otro Requerimiento Especial">Otro Requerimiento Especial</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Región de Entrega / Faena *
                    </label>
                    <select 
                      className="form-select form-select-sm rounded-1"
                      value={form.region}
                      onChange={(e) => setForm({ ...form, region: e.target.value })}
                    >
                      <option value="Región Metropolitana">Región Metropolitana</option>
                      <option value="Región de Valparaíso">Región de Valparaíso</option>
                      <option value="Región del Biobío">Región del Biobío</option>
                      <option value="Otra Región de Chile">Otra Región de Chile</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Detalle de Productos, Cantidades o Especificaciones *
                    </label>
                    <textarea 
                      className="form-control form-control-sm rounded-1"
                      rows="4"
                      placeholder="Detalla qué artículos, cantidades aproximadas o fechas de faena necesitas cotizar..."
                      value={form.detalle}
                      onChange={(e) => setForm({ ...form, detalle: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="col-12">
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="despachoCheck"
                        checked={form.despachoObra}
                        onChange={(e) => setForm({ ...form, despachoObra: e.target.checked })}
                      />
                      <label className="form-check-label small text-secondary" htmlFor="despachoCheck">
                        Solicito incluir cotización de despacho directo en camión a obra / faena.
                      </label>
                    </div>
                  </div>

                  <div className="col-12 pt-2">
                    <button 
                      type="submit" 
                      className="btn btn-warning text-dark fw-bold px-4 py-2 rounded-1 shadow-sm"
                    >
                      Enviar Solicitud de Cotización
                    </button>
                  </div>

                </div>
              </form>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ContactoCotizacion;
