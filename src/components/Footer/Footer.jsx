import { Link } from 'react-router-dom';
import banner from '../../assets/banner-web.webp';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer-seccion bg-ambar pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4 justify-content-between">
          
          {/* Banner, Descripción y Redes Sociales */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="footer-logo-container mb-3">
              <Link to="/">
                <img 
                  src={banner} 
                  alt="Banner ferrefix" 
                  className="footer-logo-img d-block" 
                />
              </Link>
            </div>

            {/* Descripción */}
            <p className="text-footer-descr pe-lg-3 mb-4 lh-base">
              Especialistas en materiales de construcción, herramientas de alta gama, 
              fijaciones y maquinaria. Comprometidos con brindar soluciones rápidas y 
              confiables tanto a maestros de la construcción como a particulares.
            </p>

            {/* Redes Sociales */}
            <div className="d-flex align-items-center gap-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-btn" 
                aria-label="Facebook"
              >
                <i className="bi bi-facebook"></i>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-btn" 
                aria-label="Instagram"
              >
                <i className="bi bi-instagram"></i>
              </a>
              <a 
                href="https://wa.me/56912345678" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-btn" 
                aria-label="WhatsApp"
              >
                <i className="bi bi-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* Navegación Principal */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="text-uppercase fw-bold text-footer-title tracking-wider mb-3">
              Navegación
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/catalogo" className="footer-link">Catálogo</Link>
              </li>
              <li>
                <Link to="/arriendos" className="footer-link">Arriendos</Link>
              </li>
              <li>
                <Link to="/proveedores" className="footer-link">Proveedores</Link>
              </li>
              <li>
                <Link to="/nosotros" className="footer-link">Nosotros</Link>
              </li>
            </ul>
          </div>

          {/* Servicios y Soporte */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="text-uppercase fw-bold text-footer-title tracking-wider mb-3">
              Servicios
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/cotizaciones" className="footer-link">Cotizaciones</Link>
              </li>
              <li>
                <Link to="/fletes" className="footer-link">Fletes y Despacho</Link>
              </li>
              <li>
                <Link to="/garantias" className="footer-link">Garantías</Link>
              </li>
              <li>
                <Link to="/faq" className="footer-link">Preguntas Frecuentes</Link>
              </li>
            </ul>
          </div>

          {/* Contacto Directo */}
          <div className="col-12 col-md-6 col-lg-3">
            <h6 className="text-uppercase fw-bold text-footer-title tracking-wider mb-3">
              Contacto Directo
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-telephone fs-5 footer-contact-icon"></i>
                <a href="tel:+56912345678" className="footer-link">
                  +56 9 1234 5678
                </a>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-envelope fs-5 footer-contact-icon"></i>
                <a href="mailto:contacto@ferrefix.cl" className="footer-link">
                  contacto@ferrefix.cl
                </a>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-geo-alt fs-5 footer-contact-icon"></i>
                <span className="text-footer-descr">
                  Antonio Varas 666, Providencia
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Línea Divisoria */}
        <hr className="border-dark my-4 opacity-25" />

        {/* Términos y privacidad */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
          <p className="mb-0 text-footer-descr">
            &copy; {new Date().getFullYear()} Ferrefix. Todos los derechos reservados.
          </p>
          <div className="d-flex gap-3">
            <Link to="/terminos" className="footer-link">Términos y Condiciones</Link>
            <Link to="/privacidad" className="footer-link">Privacidad</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
