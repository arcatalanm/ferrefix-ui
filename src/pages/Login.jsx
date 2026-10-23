import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { iniciarSesion, registrarUsuario } from '../data/auth';
import { validadores, validarFormulario } from '../data/validaciones';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // 'login' | 'registro' - derivado siempre de la ruta (/registro o /login)
  const modo = location.pathname === '/registro' ? 'registro' : 'login';

  // Estados de formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [exitoMsg, setExitoMsg] = useState('');
  const [errores, setErrores] = useState({});
  const [touched, setTouched] = useState({});

  const reglasActuales = () =>
    modo === 'registro'
      ? { nombre: validadores.nombre, email: validadores.email, password: validadores.password }
      : { email: validadores.email, password: validadores.requerido('La contraseña') };

  const valores = { nombre, email, password };

  const handleChange = (campo, valor, setter) => {
    setter(valor);
    if (touched[campo]) {
      const validador = reglasActuales()[campo];
      if (validador) setErrores((prev) => ({ ...prev, [campo]: validador(valor) }));
    }
  };

  const handleBlur = (campo) => {
    setTouched((prev) => ({ ...prev, [campo]: true }));
    const validador = reglasActuales()[campo];
    if (validador) setErrores((prev) => ({ ...prev, [campo]: validador(valores[campo]) }));
  };

  const claseCampo = (campo) =>
    `form-control form-control-sm rounded-1${errores[campo] ? ' is-invalid' : ''}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setExitoMsg('');

    const reglas = reglasActuales();
    const nuevosErrores = validarFormulario(reglas, valores);
    setErrores(nuevosErrores);
    setTouched(Object.keys(reglas).reduce((acc, campo) => ({ ...acc, [campo]: true }), {}));
    if (Object.keys(nuevosErrores).length > 0) return;

    if (modo === 'login') {
      const res = iniciarSesion(email, password);
      if (!res.ok) {
        setErrorMsg(res.mensaje);
        return;
      }

      // El administrador entra directo al panel: su sesión no debe quedar
      // visible en las páginas de la tienda.
      if (res.usuario.rol === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }

      setExitoMsg(`¡Bienvenido/a de vuelta, ${res.usuario.nombre}!`);
      setTimeout(() => {
        navigate('/catalogo');
      }, 1200);
    } else {
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

  return (
    <div className="login-page py-5 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5">

            <div className="auth-card shadow-sm p-4 p-md-5">

              {/* Encabezado */}
              <div className="auth-head mb-4">
                <h1 className="auth-title mb-1">
                  {modo === 'login' ? 'Iniciar Sesión en Ferrefix' : 'Crear Cuenta de Cliente'}
                </h1>
                <p className="auth-sub mb-0">
                  {modo === 'login' 
                    ? 'Accede a tu cuenta para autocompletar tus compras y ver tus pedidos.' 
                    : 'Regístrate para comprar herramientas con despacho prioritario.'}
                </p>
              </div>

              {/* Selector de modo */}
              <div className="btn-group login-mode-group w-100 mb-4 rounded-1" role="group">
                <button 
                  type="button" 
                  className={`btn login-mode-btn ${modo === 'login' ? 'active' : ''}`}
                  onClick={() => { setErrorMsg(''); setExitoMsg(''); setErrores({}); setTouched({}); navigate('/login', { replace: true }); }}
                >
                  Ya tengo cuenta
                </button>
                <button 
                  type="button" 
                  className={`btn login-mode-btn ${modo === 'registro' ? 'active' : ''}`}
                  onClick={() => { setErrorMsg(''); setExitoMsg(''); setErrores({}); setTouched({}); navigate('/registro', { replace: true }); }}
                >
                  Soy nuevo cliente
                </button>
              </div>

              {/* Mensajes de feedback */}
              {errorMsg && (
                <div className="alert alert-danger auth-alert py-2 px-3 rounded-1 mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i>
                  {errorMsg}
                </div>
              )}

              {exitoMsg && (
                <div className="alert alert-success auth-alert py-2 px-3 rounded-1 mb-3" role="alert">
                  <i className="bi bi-check-circle-fill me-1"></i>
                  {exitoMsg}
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit} noValidate>
                {modo === 'registro' && (
                  <div className="mb-3">
                    <label className="form-label auth-label mb-1">Nombre Completo *</label>
                    <input 
                      type="text" 
                      className={claseCampo('nombre')}
                      placeholder="Ej: Juan Pérez"
                      value={nombre}
                      onChange={(e) => handleChange('nombre', e.target.value, setNombre)}
                      onBlur={() => handleBlur('nombre')}
                      required
                    />
                    {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label auth-label mb-1">Correo Electrónico *</label>
                  <input 
                    type="email" 
                    className={claseCampo('email')}
                    placeholder="nombre@ejemplo.cl"
                    value={email}
                    onChange={(e) => handleChange('email', e.target.value, setEmail)}
                    onBlur={() => handleBlur('email')}
                    required
                  />
                  {errores.email && <div className="invalid-feedback">{errores.email}</div>}
                </div>

                <div className="mb-4">
                  <label className="form-label auth-label mb-1">Contraseña *</label>
                  <input 
                    type="password" 
                    className={claseCampo('password')}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handleChange('password', e.target.value, setPassword)}
                    onBlur={() => handleBlur('password')}
                    required
                  />
                  {errores.password && <div className="invalid-feedback">{errores.password}</div>}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-ambar auth-submit w-100 py-2 rounded-1 shadow-sm mb-3"
                >
                  {modo === 'login' ? 'Entrar a mi Cuenta' : 'Registrarme e Iniciar Sesión'}
                </button>
              </form>

              <div className="auth-foot pt-3 mt-3 border-top">
                <Link to="/" className="auth-back-link">
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
