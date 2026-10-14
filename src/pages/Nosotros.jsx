import { Link } from 'react-router-dom';

function Nosotros() {
  return (
    <div className="nosotros-page py-4 py-md-5">
      <div className="container">
        
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Inicio</Link></li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">Quiénes Somos</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="bg-platino rounded-4 p-4 p-md-5 mb-5 shadow-sm border border-light-subtle">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-7">
              <span className="badge bg-ambar text-white px-3 py-2 rounded-pill fw-semibold mb-3">
                Desde 2012 construyendo confianza
              </span>
              <h1 className="display-5 fw-bold text-dark mb-3" style={{ fontFamily: '"Oswald", sans-serif' }}>
                Tu socio experto en ferretería y construcción
              </h1>
              <p className="lead text-secondary mb-4">
                En <strong>Ferrefix</strong> nos dedicamos a entregar soluciones integrales en herramientas de alto rendimiento, materiales de construcción, fijaciones y maquinaria, acompañando tanto a contratistas y maestros de obra como a particulares en cada etapa de sus proyectos.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/catalogo" className="btn btn-warning fw-semibold px-4 py-2 rounded-3 shadow-sm text-dark">
                  <i className="bi bi-box-seam me-2"></i>Ver Catálogo
                </Link>
                <a href="https://maps.app.goo.gl/SScoFNhnuidG1PweA" target="_blank" rel="noreferrer" className="btn btn-outline-dark px-4 py-2 rounded-3">
                  <i className="bi bi-geo-alt me-2"></i>Nuestra Sucursal
                </a>
              </div>
            </div>

            <div className="col-12 col-lg-5 text-center">
              <div className="bg-white p-4 rounded-4 shadow-sm border">
                <i className="bi bi-tools display-1 text-warning mb-3 d-block"></i>
                <h4 className="fw-bold text-dark">Compromiso y Calidad</h4>
                <p className="text-muted small mb-0">
                  Distribuidores autorizados de las marcas líderes mundiales: <strong>DeWalt, Bosch, Makita, Ceresita y Bío Bío</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pilares / Valores */}
        <div className="row g-4 mb-5">
          <div className="col-12 col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-white">
              <div className="rounded-circle bg-warning-subtle text-warning-emphasis d-inline-flex p-3 mx-auto mb-3">
                <i className="bi bi-lightning-charge-fill fs-2"></i>
              </div>
              <h4 className="fw-bold mb-2 text-dark">Rapidez y Disponibilidad</h4>
              <p className="text-muted small mb-0">
                Inventario permanente con más de 10 categorías activas y despacho expedito a faenas y domicilios.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-white">
              <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex p-3 mx-auto mb-3">
                <i className="bi bi-award-fill fs-2"></i>
              </div>
              <h4 className="fw-bold mb-2 text-dark">Garantía Certificada</h4>
              <p className="text-muted small mb-0">
                Todos nuestros equipos cuentan con respaldo directo de fábrica, servicio técnico y repuestos originales.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-white">
              <div className="rounded-circle bg-success-subtle text-success d-inline-flex p-3 mx-auto mb-3">
                <i className="bi bi-people-fill fs-2"></i>
              </div>
              <h4 className="fw-bold mb-2 text-dark">Asesoría Técnica Experta</h4>
              <p className="text-muted small mb-0">
                Nuestro equipo en tienda te asesora para elegir la herramienta precisa para cada trabajo de hormigón, metal o madera.
              </p>
            </div>
          </div>
        </div>

        {/* Datos de contacto y ubicación */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-oscuro text-white">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-8">
              <h3 className="fw-bold text-warning mb-2" style={{ fontFamily: '"Oswald", sans-serif' }}>
                ¿Tienes un proyecto especial o necesitas cotización mayorista?
              </h3>
              <p className="text-white-50 mb-0">
                Visítanos en nuestra casa matriz en Providencia o comunícate directamente con nuestro mesón de atención telefónica y WhatsApp.
              </p>
            </div>
            <div className="col-12 col-lg-4 text-lg-end">
              <a 
                href="https://web.whatsapp.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-warning fw-semibold px-4 py-3 rounded-3 text-dark shadow"
              >
                <i className="bi bi-whatsapp me-2"></i>Contactar Asesor
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Nosotros;
