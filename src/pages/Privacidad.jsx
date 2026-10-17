import { Link } from 'react-router-dom';

const SECCIONES = [
  {
    id: 'responsable',
    titulo: '1. Responsable del Tratamiento',
    parrafos: [
      'Ferrefix, con domicilio en Antonio Varas 666, Providencia, Región Metropolitana, es responsable del tratamiento de los datos personales que recopila a través de este sitio web.',
      'Para consultas sobre privacidad puedes escribir a contacto@ferrefix.cl.'
    ]
  },
  {
    id: 'datos',
    titulo: '2. Datos que Recopilamos',
    lista: [
      'Datos de identificación: nombre, RUT y razón social.',
      'Datos de contacto: correo electrónico, teléfono y dirección de despacho.',
      'Datos de la compra o arriendo: productos, montos, fechas y método de pago.',
      'Datos de navegación: páginas visitadas y preferencias guardadas en tu navegador.'
    ]
  },
  {
    id: 'finalidad',
    titulo: '3. Finalidad del Tratamiento',
    parrafos: [
      'Utilizamos tus datos para procesar compras, gestionar cotizaciones y arriendos, coordinar despachos, emitir documentos tributarios y entregar soporte postventa.',
      'También podemos usar tu información para enviarte comunicaciones comerciales o novedades, siempre que hayas autorizado su envío.'
    ]
  },
  {
    id: 'base',
    titulo: '4. Base de Licitud',
    parrafos: [
      'El tratamiento se sustenta en la ejecución del contrato de compraventa o arriendo, en el cumplimiento de obligaciones legales y, cuando corresponda, en tu consentimiento expreso.',
      'Nuestro tratamiento se ajusta a la Ley 19.628 sobre Protección de la Vida Privada y a la normativa vigente en materia de datos personales.'
    ]
  },
  {
    id: 'conservacion',
    titulo: '5. Conservación de los Datos',
    parrafos: [
      'Los datos se conservan mientras exista una relación comercial o mientras lo exija la normativa tributaria y legal aplicable.',
      'Cumplidos esos plazos, los datos son eliminados o anonimizados de forma segura.'
    ]
  },
  {
    id: 'terceros',
    titulo: '6. Comunicación a Terceros',
    parrafos: [
      'No vendemos ni arrendamos tus datos personales. Podemos compartirlos únicamente con transportistas y proveedores de pago, en la medida necesaria para completar tu compra o despacho.',
      'Estos terceros están obligados a tratar la información bajo estándares de confidencialidad y seguridad equivalentes.'
    ]
  },
  {
    id: 'cookies',
    titulo: '7. Cookies y Tecnologías Similares',
    parrafos: [
      'El sitio utiliza almacenamiento local del navegador y cookies técnicas para recordar tu carrito, tu sesión y tus preferencias.',
      'Puedes eliminar o bloquear estas cookies desde la configuración de tu navegador; algunas funciones podrían dejar de estar disponibles.'
    ]
  },
  {
    id: 'derechos',
    titulo: '8. Derechos del Titular',
    parrafos: [
      'Puedes solicitar el acceso, rectificación, cancelación u oposición al tratamiento de tus datos personales, así como su portabilidad cuando sea aplicable.'
    ],
    lista: [
      'Escríbenos a contacto@ferrefix.cl indicando tu nombre, RUT y la solicitud concreta.',
      'Responderemos tu requerimiento dentro de los plazos que establece la normativa vigente.'
    ]
  },
  {
    id: 'seguridad',
    titulo: '9. Seguridad de la Información',
    parrafos: [
      'Adoptamos medidas técnicas y organizativas razonables para proteger tus datos frente a accesos no autorizados, pérdida o alteración.',
      'La información vinculada a tu carrito y sesión se almacena en tu propio navegador y no es compartida con terceros ajenos a la operación.'
    ]
  },
  {
    id: 'cambios',
    titulo: '10. Cambios y Contacto',
    parrafos: [
      'Podemos actualizar esta Política de Privacidad para reflejar mejoras en nuestros servicios o cambios normativos. La versión vigente estará siempre publicada en esta página.',
      'Ante cualquier duda sobre el tratamiento de tus datos, contáctanos a contacto@ferrefix.cl o al +56 9 9345 6575.'
    ]
  }
];

function Privacidad() {
  return (
    <div className="info-page py-4 py-lg-5">
      <div className="container">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb info-breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Privacidad</li>
          </ol>
        </nav>

        {/* Hero */}
        <div className="brand-hero rounded-1 p-4 p-md-5 mb-4">
          <h1 className="brand-hero-title mb-3">
            Política de Privacidad
          </h1>
          <p className="brand-hero-text mb-0">
            Tu privacidad es importante para nosotros. En esta sección explicamos qué datos recopilamos,
            para qué los usamos y cómo puedes ejercer tus derechos sobre ellos.
          </p>
        </div>

        <div className="row g-4">

          {/* Contenido */}
          <div className="col-12 col-lg-8">
            <div className="info-card shadow-sm p-4 p-md-5">
              <span className="marca-chip marca-chip--gris mb-3 d-inline-block">
                Última actualización: enero de 2026
              </span>

              <div className="info-highlight rounded-1 p-3 mb-4">
                <i className="bi bi-info-circle me-2"></i>
                Al usar el sitio y completar nuestros formularios, aceptas las prácticas descritas en esta
                Política de Privacidad.
              </div>

              {SECCIONES.map((s) => (
                <section id={s.id} className="info-legal-section" key={s.id}>
                  <h2 className="info-subtitle mb-2">{s.titulo}</h2>
                  {s.parrafos && s.parrafos.map((p) => (
                    <p className="info-text" key={p}>{p}</p>
                  ))}
                  {s.lista && (
                    <ul className="info-list">
                      {s.lista.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </div>

          {/* Barra lateral */}
          <div className="col-12 col-lg-4">
            <div className="info-sidebar">
              <div className="info-card shadow-sm p-4">
                <h2 className="info-subtitle mb-3">Contenido</h2>
                <nav className="d-flex flex-column">
                  {SECCIONES.map((s) => (
                    <a href={`#${s.id}`} className="info-index-link" key={s.id}>
                      {s.titulo}
                    </a>
                  ))}
                </nav>

                <div className="info-sidebar-foot mt-3 pt-3">
                  <p className="info-mini-text mb-2">Ejerce tus derechos</p>
                  <a href="mailto:contacto@ferrefix.cl" className="btn btn-ambar marca-strong rounded-1 py-2 w-100">
                    <i className="bi bi-envelope me-1"></i> contacto@ferrefix.cl
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Privacidad;
