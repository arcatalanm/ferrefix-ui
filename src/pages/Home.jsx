import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { obtenerProductos, EVENTO_PRODUCTOS_ACTUALIZADOS } from '../data/productos';

import dewaltImg from '../assets/banners/dewalt.webp';
import makitaImg from '../assets/banners/makita.webp';
import boschImg from '../assets/banners/bosch.webp';

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

  // Estado dinámico de productos desde localStorage
  const [productos, setProductos] = useState(() => obtenerProductos());
  
  // Criterio de ordenamiento en Home: 'ultimas-llegadas' | 'alfabetico' | 'todos'
  const [criterioOrden, setCriterioOrden] = useState('ultimas-llegadas');

  // Intervalo automático del carrusel de banners
  useEffect(() => {
    const intervalo = setInterval(() => {
      setSlideActivo((prev) => (prev + 1) % IMAGENES_BANNER.length);
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  // Escuchar en tiempo real cambios en localStorage (cuando el admin añade o se realiza una venta)
  useEffect(() => {
    const sincronizarProductos = () => {
      setProductos(obtenerProductos());
    };

    window.addEventListener(EVENTO_PRODUCTOS_ACTUALIZADOS, sincronizarProductos);
    return () => {
      window.removeEventListener(EVENTO_PRODUCTOS_ACTUALIZADOS, sincronizarProductos);
    };
  }, []);

  const retrocederSlide = () => {
    setSlideActivo((prev) => (prev - 1 + IMAGENES_BANNER.length) % IMAGENES_BANNER.length);
  };

  const avanzarSlide = () => {
    setSlideActivo((prev) => (prev + 1) % IMAGENES_BANNER.length);
  };

  // Procesar y ordenar productos según el criterio seleccionado por el usuario
  const productosProcesados = useMemo(() => {
    const lista = [...productos];
    if (criterioOrden === 'ultimas-llegadas') {
      // Como los nuevos productos se agregan al final de la lista en localStorage,
      // al invertir la lista las últimas llegadas aparecen en primera posición.
      return lista.reverse();
    }
    if (criterioOrden === 'alfabetico') {
      return lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
    }
    // Orden natural de guardado
    return lista;
  }, [productos, criterioOrden]);

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
      <section id="catalogo" className="py-2 mb-3">
        <div className="container">

          {/* Encabezado */}
          <div className="text-center mb-4">
            <h2 className="cat-title fw-bold mb-1">
              Categorías destacadas
            </h2>
            <p className="mb-0 text-secondary">
              Todo lo que necesitas para tus proyectos, obras y reparaciones.
            </p>
          </div>

          {/* Contenedor Categorías */}
          <div className="categorias-banner-capsula rounded-4 bg-platino py-4 px-3 px-lg-4">
            <div className="row row-cols-3 row-cols-md-5 row-cols-xl-auto justify-content-center justify-content-xl-between flex-xl-nowrap g-3 g-xl-2 align-items-start">
              {CATEGORIAS.map((cat) => (
                <div key={cat.id} className="col">
                  <Link 
                    to={`/catalogo?categoria=${encodeURIComponent(cat.nombre)}`} 
                    className="categoria-item-enlace text-decoration-none text-center d-block"
                  >
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
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Sección Dinámica de Productos en Home: Últimas Llegadas / Alfabético */}
      <section className="py-4 py-md-5 bg-white border-top border-bottom">
        <div className="container">

          {/* Encabezado y Filtros de Orden */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-dark text-warning rounded-1 px-2 py-1 small fw-semibold">
                  CATÁLOGO EN VIVO
                </span>
                <span className="text-muted small font-monospace">
                  {productos.length} productos disponibles
                </span>
              </div>
              <h2 className="h3 fw-bold text-dark mb-1" style={{ fontFamily: '"Oswald", sans-serif' }}>
                Productos en Tienda
              </h2>
              <p className="text-secondary small mb-0">
                Inventario conectado en tiempo real. Añade productos desde administración o realiza compras con boleta.
              </p>
            </div>

            {/* Selector de modo de visualización: Últimas Llegadas vs Alfabético */}
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="small text-secondary fw-semibold d-none d-sm-inline">
                Ordenar por:
              </span>
              <div className="btn-group rounded-1 shadow-sm" role="group">
                <button
                  type="button"
                  className={`btn btn-sm ${criterioOrden === 'ultimas-llegadas' ? 'btn-dark text-warning fw-bold' : 'btn-outline-secondary'}`}
                  onClick={() => setCriterioOrden('ultimas-llegadas')}
                  title="Muestra los productos más recientes o recién añadidos al inicio"
                >
                  <i className="bi bi-clock-history me-1"></i>
                  Últimas Llegadas
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${criterioOrden === 'alfabetico' ? 'btn-dark text-warning fw-bold' : 'btn-outline-secondary'}`}
                  onClick={() => setCriterioOrden('alfabetico')}
                  title="Ordena alfabéticamente de la A a la Z"
                >
                  <i className="bi bi-sort-alpha-down me-1"></i>
                  Alfabético (A - Z)
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${criterioOrden === 'todos' ? 'btn-dark text-warning fw-bold' : 'btn-outline-secondary'}`}
                  onClick={() => setCriterioOrden('todos')}
                  title="Orden de registro base"
                >
                  <i className="bi bi-grid-3x3-gap me-1"></i>
                  Todos
                </button>
              </div>

              <Link to="/catalogo" className="btn btn-sm btn-warning text-dark fw-semibold rounded-1 ms-md-2">
                Ver Catálogo Completo →
              </Link>
            </div>
          </div>

          {/* Grilla de Productos */}
          <div className="row g-2 g-md-3 row-cols-2 row-cols-md-3 row-cols-lg-4">
            {productosProcesados.slice(0, 8).map((producto) => (
              <div key={producto.idProducto} className="col d-flex">
                <ProductCard producto={producto} />
              </div>
            ))}
          </div>

          {/* Botón para ver más en el catálogo */}
          <div className="text-center mt-4 pt-2">
            <Link 
              to="/catalogo" 
              className="btn btn-outline-dark rounded-1 px-4 py-2 small fw-semibold"
            >
              Explorar los {productos.length} productos en el Catálogo Completo
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}

export default Home;