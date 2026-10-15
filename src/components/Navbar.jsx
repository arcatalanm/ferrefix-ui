import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerTotalesCarrito, EVENTO_CARRITO_ACTUALIZADO } from '../data/carrito';
import { obtenerSesionActiva, cerrarSesion, EVENTO_SESION_ACTUALIZADA } from '../data/auth';

function Navbar() {
  // Desplegable móvil (Hamburguesa)
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  // Desplegable 'Mi Cuenta'
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const toggleAccount = () => setIsAccountOpen(!isAccountOpen);

  // Estados reactivos: Carrito y Sesión de Usuario
  const [totalesCarrito, setTotalesCarrito] = useState(obtenerTotalesCarrito);
  const [sesion, setSesion] = useState(obtenerSesionActiva);

  useEffect(() => {
    const handleCarrito = () => setTotalesCarrito(obtenerTotalesCarrito());
    const handleSesion = () => setSesion(obtenerSesionActiva());

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

  // Obtener inicial para el avatar circular
  const inicialUsuario = sesion && sesion.nombre ? sesion.nombre.charAt(0).toUpperCase() : 'U';

  return (
    <nav className="navbar navbar-expand-lg bg-platino border-bottom border-light-subtle shadow-sm py-2">
      <div className="container">
        
        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2 m-0 p-0" to="/" onClick={closeMenu}>
          <div className="ferrefix-banner-web">
            <img 
              src="/banner-web.webp" 
              alt="banner ferrefix" 
              className="banner-ferrefix" 
            />
          </div>
        </Link>

        {/* Acciones en móvil: Carrito visible + Botón hamburguesa */}
        <div className="d-flex align-items-center gap-2 d-lg-none">
          <Link to="/carrito" className="btn btn-warning btn-sm fw-bold d-flex align-items-center gap-1 rounded-2 shadow-sm text-dark">
            <i className="bi bi-cart3 fs-6"></i>
            {totalesCarrito.totalArticulos > 0 && (
              <span className="badge bg-dark text-warning rounded-pill px-1">
                {totalesCarrito.totalArticulos}
              </span>
            )}
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
          {/* Enlaces de Navegación */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-3 text-center my-3 my-lg-0">
            <li className="nav-item">
              <Link className="nav-link clever-nav-link" to="/catalogo" onClick={closeMenu}>
                Catálogo
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link clever-nav-link" to="/arriendos" onClick={closeMenu}>
                Arriendos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link clever-nav-link" to="/nosotros" onClick={closeMenu}>
                Nosotros
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link clever-nav-link" to="/contacto" onClick={closeMenu}>
                Cotizaciones
              </Link>
            </li>
          </ul>

          {/* Bloque de Acciones: Carrito de Compras + Usuario */}
          <div className="d-flex align-items-center justify-content-center gap-3">
            
            {/* Botón Carrito en Desktop */}
            <Link 
              to="/carrito" 
              className="btn btn-warning text-dark fw-semibold d-none d-lg-flex align-items-center gap-2 rounded-2 px-3 shadow-sm py-2"
              onClick={closeMenu}
              title="Ver mi carrito de compras"
            >
              <i className="bi bi-cart3 fs-5"></i>
              <span>Carrito</span>
              {totalesCarrito.totalArticulos > 0 ? (
                <span className="badge bg-dark text-warning rounded-pill px-2">
                  {totalesCarrito.totalArticulos}
                </span>
              ) : (
                <span className="badge bg-dark text-white-50 rounded-pill px-2">0</span>
              )}
            </Link>

            {/* Panel de Usuario / Sesión con Avatar Circular */}
            <div className="dropdown position-relative">
              {sesion ? (
                // Usuario CON sesión iniciada: Avatar circular destacado
                <button
                  className="btn d-flex align-items-center gap-2 bg-white border border-light-subtle rounded-pill py-1 px-2 shadow-sm"
                  type="button"
                  onClick={toggleAccount}
                  aria-expanded={isAccountOpen}
                  title={`Conectado como ${sesion.nombre}`}
                >
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-dark shadow-sm"
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      backgroundColor: 'var(--color-dorado)',
                      border: '2px solid var(--color-oscuro)'
                    }}
                  >
                    {inicialUsuario}
                  </div>
                  <span className="small fw-bold text-dark d-none d-sm-inline text-truncate" style={{ maxWidth: '120px' }}>
                    {sesion.nombre.split(' ')[0]}
                  </span>
                  <i className="bi bi-chevron-down small text-muted"></i>
                </button>
              ) : (
                // Usuario SIN sesión: Botón tradicional "Mi Cuenta"
                <div className="d-flex align-items-center">
                  <i className="bi bi-person-circle fs-5 text-dark me-1"></i>
                  <button
                    className="clever-btn-signin dropdown-toggle bg-transparent border-0 px-1 py-1 shadow-none text-dark fw-semibold"
                    type="button"
                    onClick={toggleAccount}
                    aria-expanded={isAccountOpen}
                  >
                    Mi Cuenta
                  </button>
                </div>
              )}

              {/* Menú Desplegable */}
              <ul className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3 ${isAccountOpen ? 'show' : ''}`} style={{ minWidth: '220px' }}>
                {sesion ? (
                  <>
                    <li className="px-3 py-2 border-bottom bg-light rounded-top-3">
                      <div className="small fw-bold text-dark text-truncate">{sesion.nombre}</div>
                      <div className="text-muted small text-truncate" style={{ fontSize: '0.78rem' }}>{sesion.email}</div>
                      <span className={`badge mt-1 rounded-1 ${sesion.rol === 'admin' ? 'bg-dark text-warning' : 'bg-secondary text-white'}`} style={{ fontSize: '0.7rem' }}>
                        {sesion.rol === 'admin' ? 'Administrador' : 'Cliente Registrado'}
                      </span>
                    </li>
                    {sesion.rol === 'admin' && (
                      <li>
                        <Link className="dropdown-item py-2 fw-semibold text-dark" to="/admin" onClick={closeMenu}>
                          <i className="bi bi-shield-lock me-2 text-warning"></i>
                          Panel Administrativo
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link className="dropdown-item py-2" to="/carrito" onClick={closeMenu}>
                        <i className="bi bi-cart me-2"></i>
                        Mi Carrito ({totalesCarrito.totalArticulos})
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider my-1" /></li>
                    <li>
                      <button className="dropdown-item py-2 text-danger fw-semibold d-flex align-items-center" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Cerrar Sesión
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link className="dropdown-item py-2" to="/login" onClick={closeMenu}>
                        <i className="bi bi-box-arrow-in-right me-2 text-warning"></i>
                        Iniciar Sesión
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2" to="/registro" onClick={closeMenu}>
                        <i className="bi bi-person-plus me-2 text-primary"></i>
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
