import { Routes, Route, useLocation } from 'react-router-dom';
import Topbar from './components/Topbar';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import DetalleProducto from './pages/DetalleProducto';
import Arriendos from './pages/Arriendos';
import Nosotros from './pages/Nosotros';
import Carrito from './pages/Carrito';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Footer from './components/Footer';
import './index.css';

function App() {
  const location = useLocation();
  const esRutaAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!esRutaAdmin && <Topbar />}
      {!esRutaAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route path="/arriendos" element={<Arriendos />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      {!esRutaAdmin && <Footer />}
    </>
  );
}

export default App;
