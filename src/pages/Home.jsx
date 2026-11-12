import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CarruselHome from '../components/CarruselHome';
import OfertaDestacada from '../components/OfertaDestacada';
import BannerPromocional from '../components/BannerPromocional';
import { obtenerProductos, EVENTO_PRODUCTOS_ACTUALIZADOS } from '../data/productos';
import { ENLACE_POR_DEFECTO, EVENTO_GENERADORES_ACTUALIZADOS, obtenerOfertasGeneradas } from '../data/generadores';
import bannerSeguridad from '../assets/banners/banner-seguridad.webp';
import bannerMaderas from '../assets/banners/banner-maderas-estructurales-para-tu-construccion.webp';
import construccion from '../assets/categories/construccion.webp';
import maderas from '../assets/categories/maderas.webp';
import herramientas from '../assets/categories/herramientas.webp';
import fijaciones from '../assets/categories/fijaciones.webp';
import gasfiteria from '../assets/categories/gasfiteria.webp';
import electricidad from '../assets/categories/electricidad.webp';
import pinturas from '../assets/categories/pinturas.webp';
import ceramicas from '../assets/categories/ceramicas.webp';
import seguridad from '../assets/categories/seguridad.webp';
import ofertaMelamina from '../assets/sales/oferta-1-cubierta-melamina-cafe-1.webp';
import ofertaOsb from '../assets/sales/oferta-2-osb-multiplac.webp';
import ofertaRanurado from '../assets/sales/oferta-3-terciado-ranurado.webp';
import ofertaEstructural from '../assets/sales/oferta-4-terciado-estructural.webp';
import ofertaGuantes from '../assets/sales/guantes-de-nitrilo-card.webp';
import ofertaLentes from '../assets/sales/lentes-de-protecci-n-card.webp';
import ofertaChaleco from '../assets/sales/chaleco-reflectante-card.webp';
import ofertaCasco from '../assets/sales/casco-de-construcci-n-est-ndar-card.webp';

const categorias = [['Construcción', construccion], ['Maderas', maderas], ['Herramientas', herramientas], ['Fijaciones', fijaciones], ['Gasfitería', gasfiteria], ['Electricidad', electricidad], ['Pinturas', pinturas], ['Cerámicas', ceramicas], ['Seguridad', seguridad]];
const tarjetasSeguridad = [['5422223228', ofertaGuantes], ['5422223229', ofertaLentes], ['5422223230', ofertaChaleco], ['5422223231', ofertaCasco]];
const tarjetasMaderas = [['5422223224', ofertaMelamina], ['5422223225', ofertaOsb], ['5422223226', ofertaRanurado], ['5422223227', ofertaEstructural]];

export default function Home() {
  const [productos, setProductos] = useState(obtenerProductos);
  const [ofertas, setOfertas] = useState(obtenerOfertasGeneradas);

  useEffect(() => {
    const actualizar = () => {
      setProductos(obtenerProductos());
      setOfertas(obtenerOfertasGeneradas());
    };
    window.addEventListener(EVENTO_PRODUCTOS_ACTUALIZADOS, actualizar);
    window.addEventListener(EVENTO_GENERADORES_ACTUALIZADOS, actualizar);
    return () => {
      window.removeEventListener(EVENTO_PRODUCTOS_ACTUALIZADOS, actualizar);
      window.removeEventListener(EVENTO_GENERADORES_ACTUALIZADOS, actualizar);
    };
  }, []);

  const crearOfertas = (tarjetas, personalizadas = []) => tarjetas.map(([id, imagen], indice) => {
    const producto = productos.find(p => String(p.idProducto) === id);
    const generada = personalizadas[indice];
    if (!producto && !generada) return null;
    return {
      img: generada?.imagen || imagen,
      imgRespaldo: imagen,
      linkRespaldo: producto ? '/producto/' + producto.idProducto : ENLACE_POR_DEFECTO,
      altRespaldo: producto?.nombre || 'Oferta destacada',
      link: generada?.enlace && generada.enlace !== ENLACE_POR_DEFECTO
        ? generada.enlace : producto ? '/producto/' + producto.idProducto : ENLACE_POR_DEFECTO,
      alt: generada?.alt || producto?.nombre || 'Oferta destacada',
    };
  }).filter(Boolean);

  return (
    <div className="home-content">
      <CarruselHome />
      <section id="catalogo" className="container py-2 mb-3" aria-labelledby="categorias-titulo">
        <div className="marca-centro mb-4">
          <h2 className="cat-title mb-1" id="categorias-titulo">Categorías destacadas</h2>
          <p className="marca-parrafo mb-0">Todo lo que necesitas para tus proyectos, obras y reparaciones.</p>
        </div>
        <div className="categorias-banner-capsula rounded-4 bg-platino p-3 p-md-4">
          <div className="category-grid">
            {categorias.map(([nombre, imagen]) => (
              <Link className="categoria-item-enlace text-center" key={nombre} to={'/catalogo?categoria=' + encodeURIComponent(nombre)}>
                <div className="categoria-circulo-wrapper rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src={imagen} alt="" width="120" height="120" loading="lazy" className="w-100 h-100 object-fit-cover" />
                </div>
                <span className="categoria-badge-pill d-block rounded-pill mt-2 p-2 shadow-sm">{nombre}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <BannerPromocional imagen={bannerSeguridad} alt="Protección para la construcción: equípate seguro" enlace="/catalogo?categoria=Seguridad" />
      <OfertaDestacada ofertas={crearOfertas(tarjetasSeguridad)} />
      <BannerPromocional imagen={bannerMaderas} alt="Maderas estructurales para tu construcción" enlace="/catalogo?categoria=Maderas" />
      <OfertaDestacada ofertas={crearOfertas(tarjetasMaderas, ofertas)} />
    </div>
  );
}
