import { Link } from 'react-router-dom';

function Nosotros() {
  return (
    <div className="nosotros-page py-4 py-lg-5 bg-light min-vh-75">
      <div className="container">
        
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small mb-0">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Inicio</Link></li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">Quiénes Somos</li>
          </ol>
        </nav>

        {/* Hero Section Corporativo */}
        <div className="bg-white border rounded-1 p-4 p-md-5 mb-4 shadow-sm">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-7">
              <span className="badge bg-dark text-warning px-3 py-2 rounded-1 fw-semibold mb-2">
                Trayectoria y Solidez desde 2012
              </span>
              <h1 className="display-6 fw-bold text-dark mb-3" style={{ fontFamily: '"Oswald", sans-serif' }}>
                FERREFIX: Especialistas en Herramientas y Soluciones para la Construcción
              </h1>
              <p className="text-secondary lh-lg mb-4">
                Fundada en Santiago de Chile, <strong>Ferrefix SpA</strong> se ha consolidado como un socio estratégico para constructoras, contratistas independientes y maestros de obra. Nos especializamos en la comercialización y arriendo de herramientas de alta gama, maquinaria pesada para faena y fijaciones industriales de calidad certificada.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/catalogo" className="btn btn-warning text-dark fw-bold px-4 py-2 rounded-1 shadow-sm">
                  Ver Catálogo de Productos
                </Link>
                <Link to="/contacto" className="btn btn-outline-dark px-4 py-2 rounded-1">
                  Cotizaciones Mayoristas
                </Link>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="p-4 bg-light border rounded-1">
                <h4 className="fw-bold text-dark h5 mb-3" style={{ fontFamily: '"Oswald", sans-serif' }}>
                  Respaldo de Marcas Líderes
                </h4>
                <p className="small text-secondary mb-3">
                  Distribuimos de manera directa con garantía oficial de fábrica para el mercado chileno:
                </p>
                <ul className="list-unstyled mb-0 small text-dark d-flex flex-column gap-2">
                  <li className="d-flex align-items-center gap-2">
                    <span className="badge bg-dark rounded-1">✓</span>
                    <strong>Bosch Professional</strong> (Línea Heavy Duty y Demolición)
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <span className="badge bg-dark rounded-1">✓</span>
                    <strong>DeWalt</strong> (Herramientas 20V Max XR Brushless)
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <span className="badge bg-dark rounded-1">✓</span>
                    <strong>Makita</strong> (Corte, desbaste y perforación industrial)
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <span className="badge bg-dark rounded-1">✓</span>
                    <strong>Cemento Bío Bío & Pinturas Ceresita</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Indicadores de Rendimiento y Experiencia */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="bg-white border rounded-1 p-3 text-center shadow-sm">
              <div className="display-6 fw-bold text-dark font-monospace">+12</div>
              <div className="small fw-bold text-secondary text-uppercase mt-1" style={{ fontSize: '0.75rem' }}>
                Años de Trayectoria
              </div>
              <p className="text-muted small mb-0 mt-1" style={{ fontSize: '0.8rem' }}>
                Abasteciendo faenas en Chile
              </p>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="bg-white border rounded-1 p-3 text-center shadow-sm">
              <div className="display-6 fw-bold text-dark font-monospace">+15.000</div>
              <div className="small fw-bold text-secondary text-uppercase mt-1" style={{ fontSize: '0.75rem' }}>
                Despachos Entregados
              </div>
              <p className="text-muted small mb-0 mt-1" style={{ fontSize: '0.8rem' }}>
                En Santiago y regiones
              </p>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="bg-white border rounded-1 p-3 text-center shadow-sm">
              <div className="display-6 fw-bold text-dark font-monospace">99.4%</div>
              <div className="small fw-bold text-secondary text-uppercase mt-1" style={{ fontSize: '0.75rem' }}>
                Satisfacción de Clientes
              </div>
              <p className="text-muted small mb-0 mt-1" style={{ fontSize: '0.8rem' }}>
                Garantía y soporte técnico
              </p>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="bg-white border rounded-1 p-3 text-center shadow-sm">
              <div className="display-6 fw-bold text-dark font-monospace">100%</div>
              <div className="small fw-bold text-secondary text-uppercase mt-1" style={{ fontSize: '0.75rem' }}>
                Garantía Certificada
              </div>
              <p className="text-muted small mb-0 mt-1" style={{ fontSize: '0.8rem' }}>
                Equipos y repuestos originales
              </p>
            </div>
          </div>
        </div>

        {/* Ubicación Física con Mapa Nativo Embed */}
        <div className="bg-white border rounded-1 shadow-sm p-4 p-md-5 mb-4">
          <div className="row g-4 align-items-center">
            
            <div className="col-12 col-lg-5">
              <h2 className="h4 fw-bold text-dark mb-2" style={{ fontFamily: '"Oswald", sans-serif' }}>
                Visítanos en Nuestra Casa Matriz
              </h2>
              <p className="text-secondary small mb-4">
                Ubicados en un punto neurálgico de Providencia con estacionamiento para carga de materiales y mesón de asesoría técnica directa.
              </p>

              <div className="mb-3 small">
                <div className="fw-bold text-dark">Dirección Comercial:</div>
                <div className="text-secondary">Antonio Varas 666, Providencia, Región Metropolitana</div>
              </div>

              <div className="mb-3 small">
                <div className="fw-bold text-dark">Horario de Atención en Tienda:</div>
                <div className="text-secondary">Lunes a Sábado: 08:30 a 13:00 / 14:30 a 19:30 hrs</div>
                <div className="text-secondary">Domingo: 08:30 a 13:00 hrs</div>
              </div>

              <div className="mb-4 small">
                <div className="fw-bold text-dark">Servicios en Tienda:</div>
                <div className="text-secondary">Retiro en mesón, entrega de maquinaria en arriendo, servicio técnico y asesoría de cálculo de materiales.</div>
              </div>

              <a 
                href="https://maps.app.goo.gl/SScoFNhnuidG1PweA" 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-outline-dark btn-sm rounded-1"
              >
                Abrir en Google Maps App ↗
              </a>
            </div>

            {/* Mapa Embebido Nativo */}
            <div className="col-12 col-lg-7">
              <div className="border rounded-1 overflow-hidden shadow-sm" style={{ height: '360px' }}>
                <iframe 
                  title="Ubicación Ferrefix Providencia"
                  src="https://maps.google.com/maps?q=Antonio%20Varas%20666,%20Providencia,%20Santiago,%20Chile&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Nosotros;
