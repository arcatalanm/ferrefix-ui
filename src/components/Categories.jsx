import construccionImg from '../assets/categories/construccion.webp';
import maderasImg from '../assets/categories/maderas.webp';
import herramientasImg from '../assets/categories/herramientas.webp';
import fijacionesImg from '../assets/categories/fijaciones.webp';
import gasfiteriaImg from '../assets/categories/gasfiteria.webp';
import electricidadImg from '../assets/categories/electricidad.webp';
import pinturasImg from '../assets/categories/pinturas.webp';
import ceramicasImg from '../assets/categories/ceramicas.webp';
import seguridadImg from '../assets/categories/seguridad.webp';

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

function Categories() {
  return (
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
  );
}

export default Categories;