import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import dewalt from '../assets/banners/dewalt.webp';
import makita from '../assets/banners/makita.webp';
import bosch from '../assets/banners/bosch.webp';

const banners = [
  { marca: 'DeWalt', imagen: dewalt },
  { marca: 'Makita', imagen: makita },
  { marca: 'Bosch', imagen: bosch },
];

export default function CarruselHome() {
  const [activo, setActivo] = useState(0);
  const [movimientoReducido, setMovimientoReducido] = useState(() =>
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

  useEffect(() => {
    const preferencia = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const actualizar = event => setMovimientoReducido(event.matches);
    preferencia?.addEventListener('change', actualizar);
    return () => preferencia?.removeEventListener('change', actualizar);
  }, []);

  useEffect(() => {
    if (movimientoReducido) return;
    const intervalo = window.setInterval(() => setActivo(anterior => (anterior + 1) % banners.length), 5000);
    return () => window.clearInterval(intervalo);
  }, [movimientoReducido]);

  function seleccionar(indice) {
    setActivo((indice + banners.length) % banners.length);
  }

  return (
    <section className="carrousel-section py-3 py-md-4" aria-label="Marcas destacadas" aria-roledescription="carrusel">
      <div className="container">
        <h1 className="visually-hidden">Ferrefix: herramientas y materiales para tus proyectos</h1>
        <div className="carrousel-banner-card">
          <div className="carousel slide h-100">
          <div className="carousel-inner h-100" aria-live={movimientoReducido ? 'polite' : 'off'}>
            {banners.map((banner, indice) => (
              <div key={banner.marca} className={`carousel-item h-100 ${indice === activo ? 'active' : ''}`} hidden={indice !== activo} role="group" aria-roledescription="diapositiva" aria-label={`${indice + 1} de ${banners.length}: ${banner.marca}`}>
                <Link className="d-block h-100" to={'/catalogo?q=' + encodeURIComponent(banner.marca)} aria-label={`Ver productos ${banner.marca}`}>
                  <img src={banner.imagen} alt={`Publicidad de productos ${banner.marca}`} className="carrousel-slide-img" fetchPriority={indice === 0 ? 'high' : 'auto'} />
                </Link>
              </div>
            ))}
          </div>
          <button className="carousel-control-prev carrousel-control-pill shadow-lg rounded-4 start-0 ms-3" type="button" onClick={() => seleccionar(activo - 1)} aria-label="Anterior"><i className="bi bi-chevron-left" aria-hidden="true" /></button>
          <button className="carousel-control-next carrousel-control-pill shadow-lg rounded-4 end-0 me-3" type="button" onClick={() => seleccionar(activo + 1)} aria-label="Siguiente"><i className="bi bi-chevron-right" aria-hidden="true" /></button>
          <div className="carousel-indicators carrousel-dots-container mb-3" role="group" aria-label="Elegir marca">
            {banners.map((banner, indice) => <button key={banner.marca} type="button" className={`carrousel-dot-indicator bg-ambar ${indice === activo ? 'active' : ''}`} aria-label={`Mostrar ${banner.marca}`} aria-current={indice === activo ? 'true' : undefined} onClick={() => seleccionar(indice)} />)}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
