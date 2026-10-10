import { useState, useEffect } from 'react';
import dewaltImg from '../assets/dewalt.webp';
import makitaImg from '../assets/makita.webp';
import boschImg from '../assets/bosch.webp';

import construccionImg from '../assets/categories/construccion.webp';
import maderasImg from '../assets/categories/maderas.webp';
import herramientasImg from '../assets/categories/herramientas.webp';
import fijacionesImg from '../assets/categories/fijaciones.webp';
import gasfiteriaImg from '../assets/categories/gasfiteria.webp';
import electricidadImg from '../assets/categories/electricidad.webp';
import pinturasImg from '../assets/categories/pinturas.webp';
import ceramicasImg from '../assets/categories/ceramicas.webp';
import seguridadImg from '../assets/categories/seguridad.webp';

const IMAGENES_BANNER = [
  {
    id: 1,
    url: dewaltImg,
    alt: 'Publicidad de producto DeWalt'
  },
  {
    id: 2,
    url: makitaImg,
    alt: 'Publicidad de producto Makita'
  },
  {
    id: 3,
    url: boschImg,
    alt: 'Publicidad de producto Bosch'
  }
];

const CATEGORIAS = [
  { id: 'construccion', nombre: 'Construcción', img: construccionImg },
  { id: 'maderas', nombre: 'Maderas', img: maderasImg },
  { id: 'herramientas', nombre: 'Herramientas', img: herramientasImg },
  { id: 'fijaciones', nombre: 'Fijaciones', img: fijacionesImg },
  { id: 'gasfiteria', nombre: 'Gasfitería', img: gasfiteriaImg },
  { id: 'electricidad', nombre: 'Electricidad', img: electricidadImg },
  { id: 'pinturas', nombre: 'Pinturas', img: pinturasImg },
  { id: 'ceramicas', nombre: 'Cerámicas', img: ceramicasImg },
  { id: 'seguridad', nombre: 'Seguridad', img: seguridadImg }
];

function Home() {
  const [slideActivo, setSlideActivo] = useState(0);

  // Intervalo automático del carrusel
  useEffect(() => {
    const intervalo = setInterval(() => {
      setSlideActivo((prev) => (prev + 1) % IMAGENES_BANNER.length);
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  const retrocederSlide = () => {
    setSlideActivo((prev) => (prev - 1 + IMAGENES_BANNER.length) % IMAGENES_BANNER.length);
  };

  const avanzarSlide = () => {
    setSlideActivo((prev) => (prev + 1) % IMAGENES_BANNER.length);
  };

  return (
    <div className="home-content">
      {/* Carrusel de marcas / Hero */}
      <section className="carrousel-section py-3 py-md-4">
        <div className="container">
          <div className="carrousel-banner-card">
            <div className="carousel slide h-100">

              {/* Slides */}
              <div className="carousel-inner h-100">
                {IMAGENES_BANNER.map((img, index) => (
                  <div
                    key={img.id}
                    className={`carousel-item h-100 ${index === slideActivo ? 'active' : ''}`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="d-block w-100 carrousel-slide-img"
                    />
                  </div>
                ))}
              </div>

              {/* Flecha Izquierda */}
              <button
                className="carousel-control-prev carrousel-control-pill shadow-lg rounded-4 start-0 ms-3"
                type="button"
                onClick={retrocederSlide}
                aria-label="Anterior"
              >
                <i className="bi bi-chevron-left"></i>
              </button>

              {/* Flecha Derecha */}
              <button
                className="carousel-control-next carrousel-control-pill shadow-lg rounded-4 end-0 me-3"
                type="button"
                onClick={avanzarSlide}
                aria-label="Siguiente"
              >
                <i className="bi bi-chevron-right"></i>
              </button>

              {/* Indicadores */}
              <div className="carousel-indicators carrousel-dots-container mb-3">
                {IMAGENES_BANNER.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`carrousel-dot-indicator bg-ambar ${index === slideActivo ? 'active' : ''}`}
                    aria-current={index === slideActivo ? 'true' : 'false'}
                    aria-label={`Slide ${index + 1}`}
                    onClick={() => setSlideActivo(index)}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías destacadas */}
      <section id="catalogo" className="py-1">
        <div className="container">

          {/* Encabezado */}
          <div className="text-center mb-4">
            <h2 className="cat-title fw-bold mb-1">
              Categorías destacadas
            </h2>
            <p className="mb-0">
              Todo lo que necesitas para tus proyectos, obras y reparaciones.
            </p>
          </div>

          {/* Contenedor Categorías */}
          <div className="categorias-banner-capsula rounded-5 bg-platino py-4 px-3 px-lg-4">
            <div className="row row-cols-3 row-cols-md-5 row-cols-xl-auto justify-content-center justify-content-xl-between flex-xl-nowrap g-3 g-xl-2 align-items-start">
              {CATEGORIAS.map((cat) => (
                <div key={cat.id} className="col">
                  <a href={`#${cat.id}`} className="categoria-item-enlace text-decoration-none text-center d-block">
                    <div className="categoria-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                      <img 
                        src={cat.img} 
                        alt={cat.nombre} 
                        className="w-100 h-100 object-fit-cover" 
                        loading="lazy"
                      />
                    </div>
                    <div className="categoria-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                      <span className="categoria-texto-label fw-medium d-block text-truncate">
                        {cat.nombre}
                      </span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

export default Home;