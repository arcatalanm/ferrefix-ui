import { Link } from 'react-router-dom';

const SECCIONES = [
  {
    id: 'aceptacion',
    titulo: '1. Aceptación de los Términos',
    parrafos: [
      'El acceso y uso del sitio web de Ferrefix, así como la compra de productos y la contratación del servicio de arriendo de maquinaria, implican la aceptación plena de los presentes Términos y Condiciones.',
      'Si no estás de acuerdo con alguna de las condiciones aquí descritas, te solicitamos abstenerte de utilizar el sitio y sus servicios.'
    ]
  },
  {
    id: 'uso-sitio',
    titulo: '2. Uso del Sitio',
    parrafos: [
      'El sitio tiene por finalidad la exhibición y comercialización de herramientas, materiales de construcción, fijaciones y maquinaria, además de la gestión de cotizaciones y arriendos.',
      'El usuario se compromete a entregar información veraz, exacta y actualizada al momento de completar formularios de compra, cotización o arriendo.'
    ]
  },
  {
    id: 'precios-pagos',
    titulo: '3. Precios y Pagos',
    parrafos: [
      'Todos los precios publicados se expresan en pesos chilenos (CLP) e incluyen el Impuesto al Valor Agregado (IVA).',
      'Los medios de pago habilitados son WebPay Plus (débito y crédito), RedCompra y transferencia bancaria electrónica. La compra se entiende perfeccionada una vez confirmado el pago.'
    ],
    lista: [
      'Los precios pueden ser modificados sin aviso previo; se respeta el valor confirmado al momento de la compra.',
      'Para compras por volumen, licitaciones u órdenes de compra se emitirá factura electrónica.'
    ]
  },
  {
    id: 'despachos',
    titulo: '4. Despachos y Entregas',
    parrafos: [
      'Los plazos de despacho se informan de forma referencial y se cuentan a partir de la confirmación del pago. La cobertura, plazos y costos se detallan en la sección Fletes y Despacho.',
      'El usuario es responsable de proporcionar una dirección correcta y accesible. Los despachos a obra o faena quedan sujetos a evaluación y cotización previa.'
    ]
  },
  {
    id: 'arriendos',
    titulo: '5. Arriendo de Maquinaria',
    parrafos: [
      'El arriendo de equipos requiere la validación del RUN del arrendatario y la aceptación del contrato generado al confirmar la solicitud.',
      'El maquinaria se entrega en condiciones operativas y debe devolverse en el plazo pactado y en iguales condiciones, salvo el desgaste normal por uso.'
    ],
    lista: [
      'El total del arriendo corresponde a la tarifa diaria del equipo por la cantidad de días contratados.',
      'El uso indebido o los daños atribuibles al usuario podrán ser cobrados según la evaluación del servicio técnico.'
    ]
  },
  {
    id: 'garantias',
    titulo: '6. Garantías y Devoluciones',
    parrafos: [
      'Los productos cuentan con la garantía legal establecida en la Ley 19.496 y con la garantía del fabricante cuando corresponda.',
      'Los cambios o devoluciones se solicitan dentro de los 10 días corridos posteriores a la compra, con el producto sin uso y su embalaje original. El detalle se describe en la sección Garantías.'
    ]
  },
  {
    id: 'propiedad',
    titulo: '7. Propiedad Intelectual',
    parrafos: [
      'Todos los contenidos del sitio —textos, imágenes, logotipos, marcas y elementos gráficos— son de propiedad de Ferrefix o de sus respectivos titulares y se encuentran protegidos por la normativa de propiedad intelectual.',
      'Queda prohibida su reproducción, distribución o uso sin autorización previa y por escrito.'
    ]
  },
  {
    id: 'responsabilidad',
    titulo: '8. Limitación de Responsabilidad',
    parrafos: [
      'Ferrefix no será responsable por interrupciones del sitio, errores en la información publicada por terceros ni por el uso indebido de los productos adquiridos.',
      'La información técnica de los productos es referencial y no reemplaza las instrucciones del fabricante ni la asesoría profesional para faenas específicas.'
    ]
  },
  {
    id: 'modificaciones',
    titulo: '9. Modificaciones',
    parrafos: [
      'Ferrefix se reserva el derecho de actualizar estos Términos y Condiciones en cualquier momento. Las modificaciones regirán desde su publicación en el sitio.',
      'Recomendamos revisar esta sección periódicamente para mantenerse informado de los cambios.'
    ]
  },
  {
    id: 'ley',
    titulo: '10. Ley Aplicable y Jurisdicción',
    parrafos: [
      'Estos Términos y Condiciones se rigen por la legislación de la República de Chile.',
      'Cualquier controversia derivada del uso del sitio o de la compraventa de productos será sometida a los tribunales competentes de la ciudad de Santiago.'
    ]
  }
];

function TerminosCondiciones() {
  return (
    <div className="info-page py-4 py-lg-5">
      <div className="container">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb info-breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Términos y Condiciones</li>
          </ol>
        </nav>

        {/* Hero */}
        <div className="brand-hero rounded-1 p-4 p-md-5 mb-4">
          <h1 className="brand-hero-title mb-3">
            Términos y Condiciones
          </h1>
          <p className="brand-hero-text mb-0">
            Estas condiciones regulan el uso de nuestro sitio y la compra de productos, cotizaciones y
            arriendos de maquinaria. Te recomendamos leerlas antes de contratar cualquiera de nuestros
            servicios.
          </p>
        </div>

        <div className="row g-4">

          {/* Contenido legal */}
          <div className="col-12 col-lg-8">
            <div className="info-card shadow-sm p-4 p-md-5">
              <span className="marca-chip marca-chip--gris mb-3 d-inline-block">
                Última actualización: enero de 2026
              </span>

              {SECCIONES.map((s) => (
                <section id={s.id} className="info-legal-section" key={s.id}>
                  <h2 className="info-subtitle mb-2">{s.titulo}</h2>
                  {s.parrafos.map((p) => (
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
                  <p className="info-mini-text mb-2">¿Consultas legales?</p>
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

export default TerminosCondiciones;
