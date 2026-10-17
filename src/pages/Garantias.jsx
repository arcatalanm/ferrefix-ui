import { Link } from 'react-router-dom';
import EspacioImagen from '../components/EspacioImagen';

const TIPOS = [
  {
    icono: 'bi-shield-check',
    titulo: 'Garantía Legal',
    texto: 'Todos los productos cuentan con la garantía legal de la Ley del Consumidor (Ley 19.496) por 6 meses desde la entrega.'
  },
  {
    icono: 'bi-award',
    titulo: 'Garantía de Fábrica',
    texto: 'Las herramientas y maquinarias mantienen la garantía oficial del fabricante, con repuestos y soporte técnico autorizado.'
  },
  {
    icono: 'bi-arrow-repeat',
    titulo: 'Cambios y Devoluciones',
    texto: 'Puedes solicitar cambio o devolución dentro de los 10 días corridos, siempre que el producto esté sin uso y con su embalaje.'
  },
  {
    icono: 'bi-tools',
    titulo: 'Servicio Técnico',
    texto: 'Contamos con taller de servicio para mantenciones, reparaciones y calibración de equipos eléctricos y a combustión.'
  }
];

const PASOS = [
  { titulo: 'Reúne los antecedentes', texto: 'Boleta o factura, producto y una breve descripción de la falla.' },
  { titulo: 'Contáctanos', texto: 'Escríbenos a contacto@ferrefix.cl o acércate al mesón de servicio técnico.' },
  { titulo: 'Evaluación técnica', texto: 'Revisamos el producto para determinar si corresponde a falla de fábrica o mal uso.' },
  { titulo: 'Solución', texto: 'Reparación, cambio por uno nuevo o devolución, según lo que establezca la evaluación.' }
];

const CUBRE = [
  'Fallas de fabricación o defectos de materiales.',
  'Productos que llegan dañados por el transporte.',
  'Equipos que no cumplen con las especificaciones informadas.',
  'Repuestos defectuosos instalados por nuestro servicio técnico.'
];

const NO_CUBRE = [
  'Desgaste normal por uso intensivo o consumo de insumos.',
  'Daños por golpes, caídas, humedad o conexiones eléctricas deficientes.',
  'Equipos abiertos o intervenidos por terceros no autorizados.',
  'Uso distinto al indicado en el manual del fabricante.'
];

function Garantias() {
  return (
    <div className="info-page py-4 py-lg-5">
      <div className="container">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb info-breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Garantías</li>
          </ol>
        </nav>

        {/* Hero */}
        <div className="brand-hero rounded-1 p-4 p-md-5 mb-4">
          <h1 className="brand-hero-title mb-3">
            Garantías y Servicio Técnico
          </h1>
          <p className="brand-hero-text mb-0">
            Trabajamos únicamente con herramientas y materiales originales, respaldados por la garantía legal
            chilena y por el fabricante. Si algo no funciona como debería, te acompañamos en todo el proceso
            de cambio, reparación o devolución.
          </p>
        </div>

        {/* Tipos de garantía */}
        <div className="mb-4">
          <h2 className="info-section-title mb-1">Qué Garantías Te Ofrecemos</h2>
          <p className="info-text mb-4">
            Dependiendo del producto y del motivo, tu compra puede quedar cubierta por una o más de estas
            garantías.
          </p>

          <div className="row g-3">
            {TIPOS.map((t) => (
              <div className="col-12 col-sm-6 col-lg-3" key={t.titulo}>
                <div className="info-mini-card h-100 p-4 shadow-sm">
                  <i className={`bi ${t.icono} info-mini-icon mb-3 d-block`}></i>
                  <h3 className="info-mini-title mb-2">{t.titulo}</h3>
                  <p className="info-mini-text mb-0">{t.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pasos */}
        <div className="info-card shadow-sm p-4 p-md-5 mb-4">
          <h2 className="info-section-title mb-4">Cómo Solicitar una Garantía</h2>
          <div className="row g-4">
            {PASOS.map((p, i) => (
              <div className="col-12 col-md-6 col-lg-3" key={p.titulo}>
                <div className="d-flex align-items-start gap-3">
                  <span className="info-step-num flex-shrink-0">{i + 1}</span>
                  <div>
                    <h3 className="info-subtitle mb-1">{p.titulo}</h3>
                    <p className="info-mini-text mb-0">{p.texto}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cubre / No cubre + imagen */}
        <div className="info-card shadow-sm p-4 p-md-5 mb-4">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-lg-6">
              <h2 className="info-section-title mb-3">
                <i className="bi bi-check-circle-fill marca-exito me-2"></i>
                Qué Cubre la Garantía
              </h2>
              <ul className="info-list info-list--check mb-0">
                {CUBRE.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div className="col-12 col-lg-6">
              <h2 className="info-section-title mb-3">
                <i className="bi bi-x-circle-fill text-danger me-2"></i>
                Qué No Cubre
              </h2>
              <ul className="info-list info-list--cross mb-0">
                {NO_CUBRE.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bloque con imagen: servicio técnico */}
        <div className="info-card shadow-sm p-4 p-md-5">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-lg-5">
              <EspacioImagen
                proporcion="4x3"
                icono="bi-tools"
                etiqueta="Imagen: taller de servicio técnico"
              />
            </div>
            <div className="col-12 col-lg-7">
              <h2 className="info-section-title mb-2">Taller de Servicio Técnico Autorizado</h2>
              <p className="info-text mb-3">
                Nuestro taller realiza mantenciones preventivas, reparaciones y calibración de equipos
                eléctricos y a combustión, con repuestos originales y garantía sobre la mano de obra.
              </p>
              <div className="row g-3">
                <div className="col-6">
                  <div className="info-info-pill">
                    <i className="bi bi-clock-history me-2"></i>
                    Plazo de evaluación: 3 a 5 días hábiles
                  </div>
                </div>
                <div className="col-6">
                  <div className="info-info-pill">
                    <i className="bi bi-tools me-2"></i>
                    Presupuesto previo sin costo
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/contacto" className="btn btn-ambar marca-strong rounded-1 px-4 py-2 shadow-sm">
                  <i className="bi bi-envelope me-2"></i>
                  Solicitar revisión técnica
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Garantias;
