import Carrousel from '../components/Carrousel/Carrousel';
import Categories from '../components/Categories/Categories';

function Home() {
  return (
    <div className="home-content">
      {/* Carrusel de marcas / Hero */}
      <Carrousel />
      {/* Categorías destacadas */}
      <Categories />
    </div>
  );
}

export default Home;