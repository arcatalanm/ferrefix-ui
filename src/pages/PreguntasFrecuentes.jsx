import { useState } from 'react';
import { Link } from 'react-router-dom';
import EspacioImagen from '../components/EspacioImagen';
import atencionClienteImg from '../assets/info/atencion-cliente.webp';

const PREGUNTAS = [
  {
    categoria: 'Compras y Pagos',
    pregunta: '¿Qué medios de pago aceptan?',
    respuesta: 'Aceptamos WebPay Plus (débito y crédito), RedCompra y transferencia bancaria electrónica. Para compras por volumen o licitaciones trabajamos con orden de compra y facturación a 30 días.'
  },
  {
    categoria: 'Compras y Pagos',
    pregunta: '¿Emiten factura para empresas?',
    respuesta: 'Sí. Emitimos boleta y factura electrónica. Al momento del pago o del registro puedes indicar tu RUT y razón social para que la factura se genere correctamente.'
  },
  {
    categoria: 'Despachos',
    pregunta: '¿Cuánto tarda mi despacho?',
    respuesta: 'En la Región Metropolitana entre 24 y 48 horas hábiles. A regiones, entre 3 y 7 días hábiles según la zona. El retiro en tienda está disponible en 2 horas hábiles.'
  },
  {
    categoria: 'Despachos',
    pregunta: '¿El despacho tiene algún costo?',
    respuesta: 'El retiro en tienda es sin costo y el despacho en la Región Metropolitana es gratuito en compras superiores a $50.000. Para regiones y faenas, el valor se informa antes de confirmar el envío.'
  },
  {
    categoria: 'Arriendos',
    pregunta: '¿Qué necesito para arrendar maquinaria?',
    respuesta: 'Debes completar el formulario de arriendo con tu RUT, nombre, contacto y dirección de la faena. La validación de RUT es obligatoria para emitir el contrato y puede requerirse documentación de respaldo.'
  },
  {
    categoria: 'Arriendos',
    pregunta: '¿Cómo se calcula el valor del arriendo?',
    respuesta: 'El valor corresponde a la tarifa diaria del equipo multiplicada por la cantidad de días de arriendo. El total se muestra en el resumen antes de confirmar el contrato.'
  },
  {
    categoria: 'Garantías y Devoluciones',
    pregunta: '¿Puedo cambiar o devolver un producto?',
    respuesta: 'Sí, dentro de los 10 días corridos posteriores a la compra, siempre que el producto esté sin uso, completo y con su embalaje original. En fallas de fábrica aplica la garantía legal de 6 meses.'
  },
  {
    categoria: 'Garantías y Devoluciones',
    pregunta: '¿Qué hago si mi producto llegó dañado?',
    respuesta: 'Contáctanos dentro de las 24 horas siguientes a la recepción, adjuntando fotografías del producto y de la guía de despacho. Coordinaremos el cambio sin costo para ti.'
  },
  {
    categoria: 'Cuenta y Cotizaciones',
    pregunta: '¿Necesito crear una cuenta para comprar?',
    respuesta: 'No es obligatorio, pero al registrarte autocompletamos tus datos de despacho y puedes revisar tus pedidos. Las cotizaciones por volumen también están disponibles sin cuenta.'
  },
  {
    categoria: 'Cuenta y Cotizaciones',
    pregunta: '¿Cómo solicito una cotización?',
    respuesta: 'Ingresa a la sección Cotizaciones y completa el formulario con el detalle de productos, cantidades y región de entrega. Un asesor te enviará la propuesta en menos de 2 horas hábiles.'
  }
];

function PreguntasFrecuentes() {
  const [abierta, setAbierta] = useState(0);

  const alternar = (indice) => {
    setAbierta((actual) => (actual === indice ? -1 : indice));
  };

  return (
    <div className="info-page py-4 py-lg-5">
      <div className="container">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb info-breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Preguntas Frecuentes</li>
          </ol>
        </nav>

        {/* Hero */}
        <div className="brand-hero rounded-1 p-4 p-md-5 mb-4">
          <h1 className="brand-hero-title mb-3">
            Preguntas Frecuentes
          </h1>
          <p className="brand-hero-text mb-0">
            Reunimos las dudas más comunes sobre compras, despachos, arriendos, garantías y cotizaciones.
            Si tu pregunta no está en la lista, nuestro equipo está disponible para ayudarte.
          </p>
        </div>

        <div className="row g-4">

          {/* Acordeón de preguntas */}
          <div className="col-12 col-lg-8">
            <div className="info-card shadow-sm p-4 p-md-5">
              <h2 className="info-section-title mb-4">Respuestas Rápidas</h2>

              {PREGUNTAS.map((p, i) => {
                const estaAbierta = abierta === i;
                return (
                  <div className="faq-item" key={p.pregunta}>
                    <button
                      type="button"
                      className="faq-button"
                      onClick={() => alternar(i)}
                      aria-expanded={estaAbierta}
                    >
                      <span className="d-flex flex-column">
                        <span className="faq-categoria">{p.categoria}</span>
                        <span className="faq-pregunta">{p.pregunta}</span>
                      </span>
                      <i className={`bi bi-chevron-down faq-chevron ${estaAbierta ? 'faq-chevron--abierta' : ''}`}></i>
                    </button>
                    <div className={`faq-body ${estaAbierta ? 'faq-body--abierta' : ''}`}>
                      <p className="mb-0">{p.respuesta}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Barra lateral */}
          <div className="col-12 col-lg-4">
            <div className="info-card shadow-sm p-4 mb-4">
              <EspacioImagen
                src={atencionClienteImg}
                alt="Mesa de ayuda y atención al cliente Ferrefix"
                proporcion="4x3"
                icono="bi-question-circle"
                etiqueta="Imagen: atención al cliente"
                className="mb-3"
              />
              <h2 className="info-subtitle mb-2">¿No encuentras tu respuesta?</h2>
              <p className="info-mini-text mb-3">
                Escríbenos y un asesor te responderá en menos de 2 horas hábiles.
              </p>
              <div className="d-grid gap-2">
                <Link to="/contacto" className="btn btn-ambar marca-strong rounded-1 py-2">
                  <i className="bi bi-chat-dots me-1"></i> Contactar a un asesor
                </Link>
                <a href="tel:+56993456575" className="btn btn-outline-dark rounded-1 py-2">
                  <i className="bi bi-telephone me-1"></i> +56 9 9345 6575
                </a>
              </div>
            </div>

            <div className="info-card info-card--ambar shadow-sm p-4">
              <h3 className="info-subtitle mb-3">Enlaces Útiles</h3>
              <Link to="/fletes" className="info-index-link">
                <i className="bi bi-truck me-2"></i> Fletes y Despacho
              </Link>
              <Link to="/garantias" className="info-index-link">
                <i className="bi bi-shield-check me-2"></i> Garantías
              </Link>
              <Link to="/terminos" className="info-index-link">
                <i className="bi bi-file-text me-2"></i> Términos y Condiciones
              </Link>
              <Link to="/privacidad" className="info-index-link">
                <i className="bi bi-lock me-2"></i> Política de Privacidad
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default PreguntasFrecuentes;
