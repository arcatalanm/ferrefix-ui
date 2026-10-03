import { useState } from 'react';
import banner from '../assets/banner-web.webp';

function Navbar() {
  // Desplegable (Hamburguesa)
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  // Desplegable 'Mi Cuenta'
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const toggleAccount = () => setIsAccountOpen(!isAccountOpen);

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom border-light-subtle py-3">
      <div className="container">
        {/* Logo */}
        <a className="navbar-brand d-flex align-items-center gap-2 m-0 p-0" href="/">
          <div className="ferrefix-banner-web">
            <img 
              src={banner} 
              alt="banner ferrefix" 
              className="banner-ferrefix" 
            />
          </div>
        </a>

        {/* Botón hamburguesa */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          onClick={toggleMenu}
          aria-controls="navbarMenu"
          aria-expanded={isOpen}
          aria-label="Abrir menú"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarMenu">
          {/* Links */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-3 text-center my-3 my-lg-0">
            <li className="nav-item">
              <a className="nav-link clever-nav-link" href="#catalogo">
                Catálogo
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link clever-nav-link" href="#arriendos">
                Arriendos
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link clever-nav-link" href="#proveedores">
                Proveedores
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link clever-nav-link" href="#nosotro">
                Nosotros
              </a>
            </li>
          </ul>

          {/* Desplegable 'Mi Cuenta' */}
          <div className="d-flex align-items-center justify-content-center">
            <div className="dropdown position-relative">
              <i className='bi bi-person-fill'></i>
              <button
                className="clever-btn-signin dropdown-toggle bg-transparent border-0 px-2 py-1 shadow-none"
                type="button"
                onClick={toggleAccount}
                aria-expanded={isAccountOpen}
              >
                Mi Cuenta
              </button>

              <ul 
                className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3 ${isAccountOpen ? 'show' : ''}`}
              >
                <li>
                  <a 
                    className="dropdown-item py-2" 
                    href="#login"
                    onClick={() => setIsAccountOpen(false)}
                  >
                    Iniciar Sesión
                  </a>
                </li>
                <li>
                  <a 
                    className="dropdown-item py-2" 
                    href="#register"
                    onClick={() => setIsAccountOpen(false)}
                  >
                    Registrarse
                  </a>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;