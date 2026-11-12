import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Topbar from './components/Topbar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastNotificacion from './components/ToastNotificacion';
import { obtenerProductoPorId, cargarProductos, useEstadoCatalogo } from './data/productos';
import EstadoCatalogo from './components/EstadoCatalogo';
import { cargarMaquinarias, cargarContratosArriendo } from './data/maquinarias';
import { useSesion } from './data/auth';
import { cargarOrdenes } from './data/ordenes';
import { cargarCarrito } from './data/carrito';
import { cargarOfertas } from './data/generadores';
import { useAccessibleDialogs } from './utils/accesibilidad';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import DetalleProducto from './pages/DetalleProducto';
import Arriendos from './pages/Arriendos';
import Nosotros from './pages/Nosotros';
import Contacto from './pages/ContactoCotizacion';
import Carrito from './pages/Carrito';
import Login from './pages/Login';
import Cuenta from './pages/CuentaCliente';
import Admin from './pages/Admin';
import Fletes from './pages/Fletes';
import Garantias from './pages/Garantias';
import Faq from './pages/PreguntasFrecuentes';
import Terminos from './pages/TerminosCondiciones';
import Privacidad from './pages/Privacidad';
const titulos = { '/': 'Ferretería, herramientas y arriendos', '/catalogo': 'Catálogo de productos', '/arriendos': 'Arriendo de maquinaria', '/nosotros': 'Nosotros', '/contacto': 'Cotizaciones y contacto', '/carrito': 'Tu pedido', '/login': 'Iniciar sesión', '/registro': 'Crear cuenta', '/cuenta': 'Mi cuenta', '/admin': 'Administración', '/fletes': 'Fletes y despacho', '/garantias': 'Garantías', '/faq': 'Preguntas frecuentes', '/terminos': 'Términos y condiciones', '/privacidad': 'Privacidad' };
function NoEncontrada() {
  return <div className="container py-5"><p className="marca-etiqueta">Error 404</p><h1>Página no encontrada</h1><p>El enlace cambió o la página ya no está disponible.</p><a className="btn btn-ambar" href="/catalogo">Ir al catálogo</a></div>;
}
export default function App() {
  const location = useLocation();
  const estadoCatalogo = useEstadoCatalogo();
  const sesion = useSesion();
  useEffect(() => { cargarProductos(); }, []);
  useEffect(() => { cargarOfertas(); }, []);
  useEffect(() => { cargarCarrito(); }, [sesion]);
  useEffect(() => {
    if (!['/arriendos', '/admin', '/cuenta', '/mi-cuenta', '/perfil'].includes(location.pathname)) return;
    const actualizar = () => {
      if (document.visibilityState === 'hidden') return;
      if (location.pathname === '/arriendos') cargarMaquinarias();
      cargarContratosArriendo();
      cargarOrdenes();
    };
    actualizar();
    const intervalo = window.setInterval(actualizar, 60000);
    window.addEventListener('focus', actualizar);
    return () => { window.clearInterval(intervalo); window.removeEventListener('focus', actualizar); };
  }, [sesion, location.pathname]);
  useAccessibleDialogs();
  useEffect(() => {
    const producto = location.pathname.startsWith('/producto/') ? obtenerProductoPorId(location.pathname.split('/')[2]) : null;
    const titulo = producto?.nombre || titulos[location.pathname] || 'Página no encontrada';
    document.title = `${titulo} | Ferrefix`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', `${titulo}. Herramientas, materiales de construcción y arriendos de Ferrefix en Providencia.`);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', window.location.origin + location.pathname);
    document.querySelector('meta[name="robots"]')?.setAttribute('content', /\/(admin|login|registro|cuenta|carrito)/.test(location.pathname) ? 'noindex, nofollow' : 'index, follow');
    if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
    else { window.scrollTo(0, 0); document.getElementById('contenido-principal')?.focus({ preventScroll: true }); }
  }, [location.pathname, location.hash, estadoCatalogo]);
  const admin = location.pathname === '/admin';
  return <>
    <a className="skip-link" href="#contenido-principal">Saltar al contenido</a>
    <ToastNotificacion />
    {!admin && <><Topbar /><Navbar /></>}
    <main id="contenido-principal" tabIndex={-1}>
        <EstadoCatalogo />
        <Routes>
          <Route path="/" element={<Home />} /><Route path="/catalogo" element={<Catalogo />} />
          <Route path="/producto/:id" element={<DetalleProducto key={location.pathname} />} />
          <Route path="/arriendos" element={<Arriendos />} /><Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} /><Route path="/cotizaciones" element={<Navigate to="/contacto" replace />} />
          <Route path="/carrito" element={<Carrito />} /><Route path="/login" element={<Login />} /><Route path="/registro" element={<Login />} />
          <Route path="/cuenta" element={<Cuenta />} /><Route path="/mi-cuenta" element={<Navigate to="/cuenta" replace />} /><Route path="/perfil" element={<Navigate to="/cuenta" replace />} />
          <Route path="/admin" element={<Admin />} /><Route path="/fletes" element={<Fletes />} /><Route path="/garantias" element={<Garantias />} />
          <Route path="/faq" element={<Faq />} /><Route path="/terminos" element={<Terminos />} /><Route path="/privacidad" element={<Privacidad />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
    </main>
    {!admin && <Footer />}
  </>;
}
