import { Link } from 'react-router-dom';
import EspacioImagen from '../components/EspacioImagen';
import fleteImg from '../assets/info/flete-despacho.webp';
import fleteFaenaImg from '../assets/info/flete-faena.webp';

const MODALIDADES = [
  {
    icono: 'bi-shop',
    titulo: 'Retiro en Tienda',
    texto: 'Retira sin costo en nuestra casa matriz de Providencia, con mesón de carga y apoyo para el traslado de materiales.',
    detalle: 'Listo en 2 horas hábiles'
  },
  {
    icono: 'bi-truck',
    titulo: 'Despacho en Santiago',
    texto: 'Reparto propio en toda la Región Metropolitana, coordinado por teléfono el mismo día del envío.',
    detalle: '24 a 48 horas hábiles'
  },
  {
    icono: 'bi-geo-alt',
    titulo: 'Despacho a Regiones',
    texto: 'Envíos a todo Chile mediante transportistas certificados, con seguimiento del número de guía.',
    detalle: '3 a 7 días hábiles'
  }
];

const ZONAS = [
  { zona: 'Retiro en tienda (Providencia)', plazo: '2 horas hábiles', costo: 'Sin costo' },
  { zona: 'Región Metropolitana', plazo: '24 a 48 horas hábiles', costo: 'Gratis sobre $50.000' },
  { zona: 'Regiones (capitales provinciales)', plazo: '3 a 5 días hábiles', costo: 'Desde $4.990' },
  { zona: 'Regiones (zonas extremas)', plazo: '5 a 7 días hábiles', costo: 'Desde $7.990' },
  { zona: 'Despacho directo a obra / faena', plazo: 'Según programación', costo: 'Cotización personalizada' }
];

const REQUISITOS = [
  'Contar con acceso vehicular o espacio de descarga en el domicilio u obra.',
  'Que la persona que recibe sea mayor de 18 años y esté autorizada.',
  'Revisar el estado del embalaje antes de firmar la guía de despacho.',
  'Informar indicaciones adicionales (conserjería, horarios, número de depto).'
];

function Fletes() {
  return (
    <div className="info-page py-4 py-lg-5">
      <div className="container">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb info-breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
            <li className="breadcrumb-item"><Link to="/catalogo">Catálogo</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Fletes y Despacho</li>
          </ol>
        </nav>

        {/* Hero */}
        <div className="brand-hero rounded-1 p-4 p-md-5 mb-4">
          <h1 className="brand-hero-title mb-3">
            Fletes y Despacho a Todo Chile
          </h1>
          <p className="brand-hero-text mb-0">
            Coordinamos la entrega de tus materiales, herramientas y maquinaria con reparto propio en
            Santiago y transportistas certificados a regiones. Desde un taladro hasta el traslado completo
            de equipos a faena, nos encargamos de que llegue en buen estado y a tiempo.
          </p>
        </div>

        {/* Modalidades de entrega */}
        <div className="mb-4">
          <h2 className="info-section-title mb-1">Modalidades de Entrega</h2>
          <p className="info-text mb-4">
            Elige la alternativa que mejor se ajuste a tu obra o proyecto. Todas las opciones contemplan
            verificación de stock antes del despacho.
          </p>

          <div className="row g-3">
            {MODALIDADES.map((m) => (
              <div className="col-12 col-md-4" key={m.titulo}>
                <div className="info-mini-card h-100 p-4 shadow-sm d-flex flex-column">
                  <i className={`bi ${m.icono} info-mini-icon mb-3`}></i>
                  <h3 className="info-mini-title mb-2">{m.titulo}</h3>
                  <p className="info-mini-text mb-3 flex-grow-1">{m.texto}</p>
                  <span className="marca-chip marca-chip--ambar align-self-start">{m.detalle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bloque con imagen: flota de despacho */}
        <div className="info-card shadow-sm p-4 p-md-5 mb-4">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-lg-6">
              <h2 className="info-section-title mb-2">Reparto Propio en Santiago</h2>
              <p className="info-text mb-3">
                Nuestra flota recorre las 52 comunas de la Región Metropolitana con personal capacitado
                para el manejo de materiales pesados. Coordinamos la entrega por teléfono y confirmamos
                la ventana horaria antes de salir a ruta.
              </p>
              <ul className="info-list mb-0">
                <li>Despacho gratuito en compras superiores a $50.000 dentro de la RM.</li>
                <li>Confirmación telefónica previa a la entrega.</li>
                <li>Ayuda de descarga en planta baja incluida.</li>
              </ul>
            </div>
            <div className="col-12 col-lg-6">
              <EspacioImagen
                src={fleteImg}
                alt="Flota de reparto y despacho Ferrefix"
                proporcion="4x3"
                icono="bi-truck"
                etiqueta="Imagen: flota de despacho"
              />
            </div>
          </div>
        </div>

        {/* Tabla de cobertura */}
        <div className="info-card shadow-sm p-4 p-md-5 mb-4">
          <h2 className="info-section-title mb-1">Cobertura, Plazos y Costos</h2>
          <p className="info-text mb-3">
            Los plazos se cuentan a partir de la confirmación del pago y están sujetos a la disponibilidad
            de stock. Los valores referenciales pueden ajustarse según volumen y distancia.
          </p>
          <div className="table-responsive">
            <table className="table table-sm align-middle info-table mb-0">
              <thead>
                <tr>
                  <th>Destino</th>
                  <th>Plazo estimado</th>
                  <th>Costo</th>
                </tr>
              </thead>
              <tbody>
                {ZONAS.map((z) => (
                  <tr key={z.zona}>
                    <td className="marca-strong">{z.zona}</td>
                    <td>{z.plazo}</td>
                    <td className="marca-mono">{z.costo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bloque con imagen: flete a faena */}
        <div className="info-card shadow-sm p-4 p-md-5 mb-4">
          <div className="row g-4 align-items-center flex-lg-row-reverse">
            <div className="col-12 col-lg-6">
              <h2 className="info-section-title mb-2">Fletes a Obra y Faena</h2>
              <p className="info-text mb-3">
                Para proyectos de construcción, minería o instalaciones industriales realizamos traslados
                especiales de maquinaria, andamios y materiales de gran volumen. Evaluamos el acceso,
                programamos el retiro y entregamos en el punto exacto de la faena.
              </p>
              <ul className="info-list mb-4">
                <li>Camiones con hidrogrúa para carga y descarga pesada.</li>
                <li>Programación de entregas por etapas según avance de obra.</li>
                <li>Documentación y guías de despacho para tus registros.</li>
              </ul>
              <Link to="/cotizaciones" className="btn btn-ambar marca-strong rounded-1 px-4 py-2 shadow-sm">
                <i className="bi bi-file-earmark-text me-2"></i>
                Cotizar un flete a faena
              </Link>
            </div>
            <div className="col-12 col-lg-6">
              <EspacioImagen
                src={fleteFaenaImg}
                alt="Flete y traslado de carga pesada a obra y faena"
                proporcion="4x3"
                icono="bi-box-seam"
                etiqueta="Imagen: flete a obra / faena"
              />
            </div>
          </div>
        </div>

        {/* Requisitos */}
        <div className="row g-4">
          <div className="col-12 col-lg-7">
            <div className="info-card shadow-sm p-4 p-md-5 h-100">
              <h2 className="info-section-title mb-3">Requisitos para Recibir tu Despacho</h2>
              <ul className="info-list info-list--check mb-0">
                {REQUISITOS.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="info-card info-card--ambar shadow-sm p-4 p-md-5 h-100 d-flex flex-column">
              <h2 className="info-subtitle mb-2">¿Dudas con tu entrega?</h2>
              <p className="info-text mb-4">
                Escríbenos o llámanos y te confirmamos cobertura, plazos y costo del flete para tu comuna.
              </p>
              <div className="mt-auto d-flex flex-wrap gap-2">
                <Link to="/contacto" className="btn btn-ambar marca-strong rounded-1 px-3 py-2">
                  <i className="bi bi-chat-dots me-1"></i> Contactar
                </Link>
                <a href="tel:+56993456575" className="btn btn-outline-dark rounded-1 px-3 py-2">
                  <i className="bi bi-telephone me-1"></i> Llamar
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Fletes;
