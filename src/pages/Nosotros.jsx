import { Link } from 'react-router-dom';

function Nosotros() {
  return (
    <div className="nosotros-page py-4 py-lg-5">
      <div className="container">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb nosotros-breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Quiénes Somos</li>
          </ol>
        </nav>

        {/* Hero Section Corporativo */}
        <div className="brand-hero rounded-1 p-4 p-md-5 mb-4">
          <h1 className="brand-hero-title mb-3">
            Especialistas en Herramientas y Soluciones para la Construcción
          </h1>
          <p className="brand-hero-text mb-0">
            Fundada en Santiago de Chile, <strong>Ferrefix</strong> se ha consolidado como un socio estratégico para constructoras, contratistas independientes y maestros de obra. Nos especializamos en la comercialización y arriendo de herramientas de alta gama, maquinaria pesada para faena y fijaciones industriales de calidad certificada.
          </p>
        </div>

        {/* Indicadores de Rendimiento y Experiencia */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="nosotros-stat-card bg-white rounded-1 p-4 shadow-sm h-100">
              <div className="nosotros-stat-value">+12</div>
              <div className="nosotros-stat-label mt-2">
                Años de Trayectoria
              </div>
              <p className="nosotros-stat-desc mb-0 mt-1">
                Abasteciendo faenas en Chile
              </p>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="nosotros-stat-card bg-white rounded-1 p-4 shadow-sm h-100">
              <div className="nosotros-stat-value">+15.000</div>
              <div className="nosotros-stat-label mt-2">
                Despachos Entregados
              </div>
              <p className="nosotros-stat-desc mb-0 mt-1">
                En Santiago y regiones
              </p>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="nosotros-stat-card bg-white rounded-1 p-4 shadow-sm h-100">
              <div className="nosotros-stat-value">99.4%</div>
              <div className="nosotros-stat-label mt-2">
                Satisfacción de Clientes
              </div>
              <p className="nosotros-stat-desc mb-0 mt-1">
                Garantía y soporte técnico
              </p>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="nosotros-stat-card bg-white rounded-1 p-4 shadow-sm h-100">
              <div className="nosotros-stat-value">100%</div>
              <div className="nosotros-stat-label mt-2">
                Garantía Certificada
              </div>
              <p className="nosotros-stat-desc mb-0 mt-1">
                Equipos y repuestos originales
              </p>
            </div>
          </div>
        </div>

        {/* Ubicación Física con Mapa Nativo Embed */}
        <div className="bg-white border rounded-1 shadow-sm p-4 p-md-5 mb-4">
          <div className="row g-4 align-items-center">

            <div className="col-12 col-lg-5">
              <h2 className="nosotros-section-title mb-2">
                Visítanos en Nuestra Casa Matriz
              </h2>
              <p className="nosotros-text mb-4">
                Ubicados en un punto neurálgico de Providencia con estacionamiento para carga de materiales y mesón de asesoría técnica directa.
              </p>

              <div className="mb-3">
                <div className="nosotros-info-label">Dirección Comercial:</div>
                <div className="nosotros-info-value">Antonio Varas 666, Providencia, Región Metropolitana</div>
              </div>

              <div className="mb-3">
                <div className="nosotros-info-label">Horario de Atención en Tienda:</div>
                <div className="nosotros-info-value">Lunes a Sábado: 08:30 a 13:00 / 14:30 a 19:30 hrs</div>
                <div className="nosotros-info-value">Domingo: 08:30 a 13:00 hrs</div>
              </div>

              <div className="mb-4">
                <div className="nosotros-info-label">Servicios en Tienda:</div>
                <div className="nosotros-info-value">Retiro en mesón, entrega de maquinaria en arriendo, servicio técnico y asesoría de cálculo de materiales.</div>
              </div>
            </div>

            {/* Mapa Embebido Nativo */}
            <div className="col-12 col-lg-7">
              <div className="nosotros-map-container border rounded-1 overflow-hidden shadow-sm">
                <iframe
                  title="Ubicación Ferrefix Providencia"
                  src="https://maps.google.com/maps?q=Antonio%20Varas%20666,%20Providencia,%20Santiago,%20Chile&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  className="nosotros-map-iframe"
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
