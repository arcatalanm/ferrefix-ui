import banner from '../assets/banner-web.webp';

function Footer() {
  return (
    <footer className="footer-seccion bg-ambar pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4 justify-content-between">
          
          {/* Banner, Descripción y Redes Sociales */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="footer-logo-container mb-3">
              <img 
                src={banner} 
                alt="Banner ferrefix" 
                className="footer-logo-img d-block" 
              />
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
                <a href="#catalogo" className="footer-link">Catálogo</a>
              </li>
              <li>
                <a href="#arriendos" className="footer-link">Arriendos</a>
              </li>
              <li>
                <a href="#proveedores" className="footer-link">Proveedores</a>
              </li>
              <li>
                <a href="#nosotros" className="footer-link">Nosotros</a>
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
                <a href="#cotizaciones" className="footer-link">Cotizaciones</a>
              </li>
              <li>
                <a href="#fletes" className="footer-link">Fletes y Despacho</a>
              </li>
              <li>
                <a href="#postventa" className="footer-link">Garantías</a>
              </li>
              <li>
                <a href="#preguntas-frecuentes" className="footer-link">Preguntas Frecuentes</a>
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
            <a href="#terminos" className="footer-link">Términos y Condiciones</a>
            <a href="#privacidad" className="footer-link">Privacidad</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;