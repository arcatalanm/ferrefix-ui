import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { SIN_REDUCIR, entradaInicial, revelarAlScroll, rebotarAlScroll, contarAlScroll, formatearConteo } from '../utils/animaciones';

gsap.registerPlugin(useGSAP);

const CIFRAS = [
  { valor: 12, formato: { prefijo: '+' }, etiqueta: 'Años de Trayectoria', desc: 'Abasteciendo faenas en Chile' },
  { valor: 15000, formato: { prefijo: '+' }, etiqueta: 'Despachos Entregados', desc: 'En Santiago y regiones' },
  { valor: 99.4, formato: { decimales: 1, sufijo: '%' }, etiqueta: 'Satisfacción de Clientes', desc: 'Garantía y soporte técnico' },
  { valor: 100, formato: { sufijo: '%' }, etiqueta: 'Garantía Certificada', desc: 'Equipos y repuestos originales' },
];

function Nosotros() {
  const pagina = useRef(null);

  useGSAP(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const mm = gsap.matchMedia();
    mm.add(SIN_REDUCIR, () => {
      // Al abrir: breadcrumb, título y texto del encabezado
      entradaInicial('.nosotros-breadcrumb, .brand-hero-title, .brand-hero-text', { escalon: 0.15 });
      // Cifras: rebote suave y conteo
      rebotarAlScroll('.nosotros-stat-card', '.nos-cifras');
      const restaurar = gsap.utils.toArray('.nosotros-stat-value').map((el, i) => contarAlScroll(el, CIFRAS[i].valor, CIFRAS[i].formato));
      // Casa matriz: el texto aparece de a uno y el mapa entra desde el lado
      revelarAlScroll('.nos-casa-texto > *', '.nos-casa', { escalon: 0.12 });
      revelarAlScroll('.nos-casa-mapa', '.nos-casa', { y: 0, x: 40, duracion: 0.8 });
      return () => restaurar.forEach((fn) => fn());
    });
    return () => mm.revert();
  }, { scope: pagina });

  return (
    <div className="nosotros-page py-4 py-lg-5" ref={pagina}>
      <div className="container">

        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb nosotros-breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Quiénes Somos</li>
          </ol>
        </nav>

        <div className="brand-hero rounded-1 p-4 p-md-5 mb-4">
          <h1 className="brand-hero-title mb-3">
            Especialistas en Herramientas y Soluciones para la Construcción
          </h1>
          <p className="brand-hero-text mb-0">
            Fundada en Santiago de Chile, <strong>Ferrefix</strong> se ha consolidado como un socio estratégico para constructoras, contratistas independientes y maestros de obra. Nos especializamos en la comercialización y arriendo de herramientas de alta gama, maquinaria pesada para faena y fijaciones industriales de calidad certificada.
          </p>
        </div>

        <div className="row g-3 mb-4 nos-cifras">
          {CIFRAS.map((c) => (
            <div className="col-12 col-sm-6 col-lg-3" key={c.etiqueta}>
              <div className="nosotros-stat-card bg-white rounded-1 p-4 shadow-sm h-100">
                <div className="nosotros-stat-value">{formatearConteo(c.valor, c.formato)}</div>
                <div className="nosotros-stat-label mt-2">{c.etiqueta}</div>
                <p className="nosotros-stat-desc mb-0 mt-1">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border rounded-1 shadow-sm p-4 p-md-5 mb-4 nos-casa">
          <div className="row g-4 align-items-center">

            <div className="col-12 col-lg-5 nos-casa-texto">
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

            <div className="col-12 col-lg-7 nos-casa-mapa">
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
