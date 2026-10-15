import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { iniciarSesion, registrarUsuario } from '../data/auth';

function Login() {
  const navigate = useNavigate();

  // 'login' | 'registro'
  const [modo, setModo] = useState('login');

  // Estados de formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [exitoMsg, setExitoMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setExitoMsg('');

    if (modo === 'login') {
      const res = iniciarSesion(email, password);
      if (!res.ok) {
        setErrorMsg(res.mensaje);
        return;
      }
      setExitoMsg(`¡Bienvenido/a de vuelta, ${res.usuario.nombre}!`);
      setTimeout(() => {
        if (res.usuario.rol === 'admin') {
          navigate('/admin');
        } else {
          navigate('/catalogo');
        }
      }, 1200);
    } else {
      if (!nombre.trim()) {
        setErrorMsg('El nombre es requerido.');
        return;
      }
      const res = registrarUsuario({ nombre, email, password });
      if (!res.ok) {
        setErrorMsg(res.mensaje);
        return;
      }
      setExitoMsg(`¡Cuenta creada con éxito! Bienvenido/a a Ferrefix, ${res.usuario.nombre}.`);
      setTimeout(() => {
        navigate('/catalogo');
      }, 1400);
    }
  };

  const handleAutocompletar = (correo, clave) => {
    setModo('login');
    setEmail(correo);
    setPassword(clave);
    setErrorMsg('');
  };

  return (
    <div className="login-page py-5 bg-light min-vh-75 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5">
            
            <div className="bg-white border rounded-1 shadow-sm p-4 p-md-5">
              
              {/* Encabezado */}
              <div className="text-center mb-4">
                <h1 className="h4 fw-bold text-dark mb-1" style={{ fontFamily: '"Oswald", sans-serif' }}>
                  {modo === 'login' ? 'Iniciar Sesión en Ferrefix' : 'Crear Cuenta de Cliente'}
                </h1>
                <p className="text-muted small mb-0">
                  {modo === 'login' 
                    ? 'Accede a tu cuenta para autocompletar tus compras y ver tus pedidos.' 
                    : 'Regístrate para comprar herramientas con despacho prioritario.'}
                </p>
              </div>

              {/* Selector de modo */}
              <div className="btn-group w-100 mb-4 rounded-1" role="group">
                <button 
                  type="button" 
                  className={`btn btn-sm ${modo === 'login' ? 'btn-dark' : 'btn-outline-dark'}`}
                  onClick={() => { setModo('login'); setErrorMsg(''); }}
                >
                  Ya tengo cuenta
                </button>
                <button 
                  type="button" 
                  className={`btn btn-sm ${modo === 'registro' ? 'btn-dark' : 'btn-outline-dark'}`}
                  onClick={() => { setModo('registro'); setErrorMsg(''); }}
                >
                  Soy nuevo cliente
                </button>
              </div>

              {/* Mensajes de feedback */}
              {errorMsg && (
                <div className="alert alert-danger py-2 px-3 small rounded-1 mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i>
                  {errorMsg}
                </div>
              )}

              {exitoMsg && (
                <div className="alert alert-success py-2 px-3 small rounded-1 mb-3" role="alert">
                  <i className="bi bi-check-circle-fill me-1"></i>
                  {exitoMsg}
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit}>
                {modo === 'registro' && (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">Nombre Completo *</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm rounded-1"
                      placeholder="Ej: Juan Pérez"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary mb-1">Correo Electrónico *</label>
                  <input 
                    type="email" 
                    className="form-control form-control-sm rounded-1"
                    placeholder="nombre@ejemplo.cl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary mb-1">Contraseña *</label>
                  <input 
                    type="password" 
                    className="form-control form-control-sm rounded-1"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-warning w-100 fw-bold text-dark py-2 rounded-1 shadow-sm mb-3"
                >
                  {modo === 'login' ? 'Entrar a mi Cuenta' : 'Registrarme e Iniciar Sesión'}
                </button>
              </form>

              {/* Cuentas de prueba */}
              <div className="p-3 bg-light border rounded-1 small text-secondary mt-3">
                <strong className="text-dark d-block mb-1">
                  <i className="bi bi-lightning-charge me-1 text-warning"></i>
                  Cuentas de Prueba Rápidas (localStorage):
                </strong>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  <button 
                    type="button" 
                    className="btn btn-outline-dark btn-sm py-1 px-2 rounded-1"
                    onClick={() => handleAutocompletar('cliente@ferrefix.cl', 'cliente123')}
                  >
                    Cliente: Juan Maestro
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm py-1 px-2 rounded-1"
                    onClick={() => handleAutocompletar('admin@ferrefix.cl', 'admin123')}
                  >
                    Admin: Ferrefix
                  </button>
                </div>
              </div>

              <div className="text-center pt-3 mt-3 border-top">
                <Link to="/" className="text-decoration-none text-muted small">
                  ← Volver a la Tienda
                </Link>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
