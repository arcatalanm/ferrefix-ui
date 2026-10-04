import { useState, useEffect } from 'react';

const IMAGENES = [
  {
    id: 1,
    url: '../src/assets/dewalt.webp',
    alt: 'Publicidad de producto DeWalt'
  },
  {
    id: 2,
    url: '../src/assets/makita.webp',
    alt: 'Publicidad de producto Makita'
  },
  {
    id: 3,
    url: '../src/assets/bosch.webp',
    alt: 'Publicidad de producto Bosch'
  }
];

function Carrousel() {
  const [activo, setActivo] = useState(0);

  // Delay
  useEffect(() => {
    const intervalo = setInterval(() => {
      setActivo((prev) => (prev + 1) % IMAGENES.length);
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  const retroceder = () => {
    setActivo((prev) => (prev - 1 + IMAGENES.length) % IMAGENES.length);
  };

  const avanzar = () => {
    setActivo((prev) => (prev + 1) % IMAGENES.length);
  };

  return (
    <section className="carrousel-section py-3 py-md-4">
      <div className="container-fluid px-3 px-md-4 px-xl-5">
        <div className="carrousel-banner-card position-relative rounded-4">
          <div className="carousel slide h-100">

            {/* Slides */}
            <div className="carousel-inner h-100">
              {IMAGENES.map((img, index) => (
                <div
                  key={img.id}
                  className={`carousel-item h-100 ${index === activo ? 'active' : ''}`}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="d-block w-100 rounded-4 carrousel-slide-img"
                  />
                </div>
              ))}
            </div>

            {/* Left Arrow */}
            <button
              className="carousel-control-prev carrousel-control-pill shadow-lg rounded-4 start-0 ms-3"
              type="button"
              onClick={retroceder}
              aria-label="Anterior"
            >
              <i className="bi bi-chevron-left"></i>
            </button>

            {/* Right Arrow */}
            <button
              className="carousel-control-next carrousel-control-pill shadow-lg rounded-4 end-0 me-3"
              type="button"
              onClick={avanzar}
              aria-label="Siguiente"
            >
              <i className="bi bi-chevron-right"></i>
            </button>

            {/* Indicadores */}
            <div className="carousel-indicators carrousel-dots-container mb-3">
              {IMAGENES.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`carrousel-dot-indicator bg-ambar ${index === activo ? 'active' : ''}`}
                  aria-current={index === activo ? 'true' : 'false'}
                  aria-label={`Slide ${index + 1}`}
                  onClick={() => setActivo(index)}
                ></button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Carrousel;