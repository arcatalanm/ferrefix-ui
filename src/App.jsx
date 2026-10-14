import { Routes, Route } from 'react-router-dom';
import Topbar from './components/Topbar';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import DetalleProducto from './pages/DetalleProducto';
import Arriendos from './pages/Arriendos';
import Nosotros from './pages/Nosotros';
import Admin from './pages/Admin';
import Footer from './components/Footer';
import './index.css';

function App() {
  return (
    <>
      <Topbar />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route path="/arriendos" element={<Arriendos />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
