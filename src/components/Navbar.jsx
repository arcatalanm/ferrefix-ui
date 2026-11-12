import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { obtenerTotalesCarrito, EVENTO_CARRITO_ACTUALIZADO } from '../data/carrito';
import { obtenerSesionActiva, cerrarSesion, EVENTO_SESION_ACTUALIZADA } from '../data/auth';

const obtenerSesionCliente = () => {
  const sesion = obtenerSesionActiva();
  return sesion?.rol === 'admin' ? null : sesion;
};

function Navbar() {
  const navRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const toggleAccount = () => setIsAccountOpen(!isAccountOpen);

  const [totalesCarrito, setTotalesCarrito] = useState(obtenerTotalesCarrito);
  const [sesion, setSesion] = useState(obtenerSesionCliente);

  useEffect(() => {
    const handleCarrito = () => setTotalesCarrito(obtenerTotalesCarrito());
    const handleSesion = () => { setSesion(obtenerSesionCliente()); setTotalesCarrito(obtenerTotalesCarrito()); };

    window.addEventListener(EVENTO_CARRITO_ACTUALIZADO, handleCarrito);
    window.addEventListener(EVENTO_SESION_ACTUALIZADA, handleSesion);

    return () => {
      window.removeEventListener(EVENTO_CARRITO_ACTUALIZADO, handleCarrito);
      window.removeEventListener(EVENTO_SESION_ACTUALIZADA, handleSesion);
    };
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
    setIsAccountOpen(false);
  };

  const handleLogout = () => {
    cerrarSesion();
    closeMenu();
  };
  useEffect(() => {
    if (!isOpen && !isAccountOpen) return;
    const click = e => { if (!navRef.current?.contains(e.target)) { setIsOpen(false); setIsAccountOpen(false); } };
    const key = e => { if (e.key === 'Escape') { setIsOpen(false); setIsAccountOpen(false); navRef.current?.querySelector(isAccountOpen ? '.clever-btn-signin' : '.navbar-toggler')?.focus(); } };
    document.addEventListener('pointerdown', click); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', click); document.removeEventListener('keydown', key); };
  }, [isOpen, isAccountOpen]);

  return (
    <nav ref={navRef} aria-label="Navegación principal" className="navbar navbar-expand-lg bg-platino border-bottom shadow-sm py-2">
      <div className="container">

        <Link className="navbar-brand d-flex align-items-center gap-2 m-0 p-0" to="/" onClick={closeMenu}>
          <div className="ferrefix-banner-web">
            <img
              src="/banner-web.webp"
              alt="banner ferrefix"
              className="banner-ferrefix"
            />
          </div>
        </Link>

        <div className="d-flex align-items-center gap-2 d-lg-none">
          <Link
            to="/carrito"
            className="navbar-cart-link d-flex align-items-center justify-content-center p-2 me-1"
            title="Ver mi carrito de compras"
          >
            <div className="position-relative d-inline-flex align-items-center">
              <i className="bi bi-cart3 navbar-cart-icon"></i>
              {totalesCarrito.totalArticulos > 0 && (
                <span className="navbar-cart-badge">
                  {totalesCarrito.totalArticulos}
                </span>
              )}
            </div>
          </Link>
          <button
            className="navbar-toggler border-0 shadow-none p-1"
            type="button"
            onClick={toggleMenu}
            aria-controls="navbarMenu"
            aria-expanded={isOpen}
            aria-label="Abrir menú"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarMenu">

          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-3 marca-centro my-3 my-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link clever-nav-link" to="/catalogo" onClick={closeMenu}>
                Catálogo
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link clever-nav-link" to="/arriendos" onClick={closeMenu}>
                Arriendos
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link clever-nav-link" to="/nosotros" onClick={closeMenu}>
                Nosotros
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link clever-nav-link" to="/contacto" onClick={closeMenu}>
                Cotizaciones
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center justify-content-center gap-3">

            <Link
              to="/carrito"
              className="navbar-cart-link d-none d-lg-flex align-items-center justify-content-center p-2 me-2"
              onClick={closeMenu}
              title="Ver mi carrito de compras"
            >
              <div className="position-relative d-inline-flex align-items-center">
                <i className="bi bi-cart3 navbar-cart-icon-lg"></i>
                {totalesCarrito.totalArticulos > 0 ? (
                  <span className="navbar-cart-badge">
                    {totalesCarrito.totalArticulos}
                  </span>
                ) : (
                  <span className="navbar-cart-badge navbar-cart-badge--empty">
                    0
                  </span>
                )}
              </div>
            </Link>

            <div className="dropdown position-relative">
                <div className="d-flex align-items-center">
                  <i className="bi bi-person-circle navbar-account-icon me-1" aria-hidden="true"></i>
                  <button
                    className="clever-btn-signin dropdown-toggle bg-transparent border-0 px-1 py-1 shadow-none"
                    type="button"
                    onClick={toggleAccount}
                    aria-expanded={isAccountOpen}
                    title={sesion ? `Conectado como ${sesion.nombre}` : undefined}
                  >
                    Mi Cuenta
                  </button>
                </div>

              <ul className={`dropdown-menu dropdown-menu-end navbar-dropdown-menu shadow border-0 mt-2 rounded-3 ${isAccountOpen ? 'show' : ''}`}>
                {sesion ? (
                  <>
                    <li>
                      <Link className="dropdown-item py-2" to="/cuenta" onClick={closeMenu}>
                        <i className="bi bi-person-gear me-2" aria-hidden="true"></i>
                        Mi Cuenta
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2" to="/carrito" onClick={closeMenu}>
                        <i className="bi bi-cart me-2" aria-hidden="true"></i>
                        Mi Carrito
                      </Link>
                    </li>
                    <li>
                      <button className="dropdown-item py-2 text-black d-flex align-items-center" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2" aria-hidden="true"></i>
                        Cerrar Sesión
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link className="dropdown-item py-2" to="/login" onClick={closeMenu}>
                        Iniciar Sesión
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2" to="/registro" onClick={closeMenu}>
                        Registrarse
                      </Link>
                    </li>
                  </>
                )}
              </ul>

            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
