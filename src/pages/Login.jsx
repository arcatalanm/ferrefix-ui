import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { iniciarSesion, registrarUsuario } from '../data/auth';
import { validadores, validarFormulario, formatearRut } from '../data/validaciones';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const modo = location.pathname === '/registro' ? 'registro' : 'login';
  const destino = new URLSearchParams(location.search).get('volver');
  const volver = destino && /^\/(?:carrito|arriendos|cuenta)(?:\?[^#]*)?$/.test(destino) ? destino : '/catalogo';

  const [nombre, setNombre] = useState('');
  const [segNombre, setSegNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [exitoMsg, setExitoMsg] = useState('');
  const [errores, setErrores] = useState({});
  const [touched, setTouched] = useState({});
  const [enviando, setEnviando] = useState(false);

  const reglasActuales = () =>
    modo === 'registro'
      ? { nombre: validadores.nombrePersona('El primer nombre'), segNombre: validadores.nombrePersona('El segundo nombre', false),
          apellidoPaterno: validadores.nombrePersona('El apellido paterno'), apellidoMaterno: validadores.nombrePersona('El apellido materno', false),
          rut: validadores.rut, email: validadores.email, password: validadores.password }
      : { identificador: validadores.identificador, password: validadores.requerido('La contraseña') };

  const valores = { nombre, segNombre, apellidoPaterno, apellidoMaterno, rut, email, identificador, password };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setErrorMsg('');
    setExitoMsg('');

    const reglas = reglasActuales();
    const nuevosErrores = validarFormulario(reglas, valores);
    setErrores(nuevosErrores);
    setTouched(Object.keys(reglas).reduce((acc, campo) => ({ ...acc, [campo]: true }), {}));
    if (Object.keys(nuevosErrores).length > 0) return;

    setEnviando(true);
    try {
      const res = modo === 'login'
        ? await iniciarSesion(identificador, password)
        : await registrarUsuario(valores);
      if (!res.ok) {
        setErrorMsg(res.mensaje);
        setErrores(res.errores || {});
        return;
      }
      navigate(res.usuario.rol === 'admin' ? '/admin' : volver, { replace: true });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login-page py-5 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5">

            <div className="auth-card shadow-sm p-4 p-md-5">

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

              <div className="btn-group login-mode-group w-100 mb-4 rounded-1" role="group">
                <button
                  type="button"
                  className={`btn login-mode-btn ${modo === 'login' ? 'active' : ''}`}
                  aria-pressed={modo === 'login'}
                  disabled={enviando}
                  onClick={() => { setErrorMsg(''); setExitoMsg(''); setErrores({}); setTouched({}); navigate('/login' + location.search, { replace: true }); }}
                >
                  Ya tengo cuenta
                </button>
                <button
                  type="button"
                  className={`btn login-mode-btn ${modo === 'registro' ? 'active' : ''}`}
                  aria-pressed={modo === 'registro'}
                  disabled={enviando}
                  onClick={() => { setErrorMsg(''); setExitoMsg(''); setErrores({}); setTouched({}); navigate('/registro' + location.search, { replace: true }); }}
                >
                  Soy nuevo cliente
                </button>
              </div>

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

              <form onSubmit={handleSubmit} noValidate>
                {modo === 'registro' && (
                  <>
                    <div className="row g-3 mb-3">
                      {[
                        ['nombre', 'Primer nombre', setNombre, true, 'given-name'],
                        ['segNombre', 'Segundo nombre', setSegNombre, false, 'additional-name'],
                        ['apellidoPaterno', 'Apellido paterno', setApellidoPaterno, true, 'family-name'],
                        ['apellidoMaterno', 'Apellido materno', setApellidoMaterno, false, 'off'],
                      ].map(([campo, etiqueta, setter, obligatorio, autocompletar]) => (
                        <div className="col-12 col-sm-6" key={campo}>
                          <label htmlFor={`acceso-${campo}`} className="form-label auth-label mb-1">{etiqueta}{obligatorio ? ' *' : ' (opcional)'}</label>
                          <input id={`acceso-${campo}`} className={claseCampo(campo)} value={valores[campo]}
                            autoComplete={autocompletar} maxLength={120} required={obligatorio}
                            onChange={(e) => handleChange(campo, e.target.value, setter)} onBlur={() => handleBlur(campo)} />
                          {errores[campo] && <div className="invalid-feedback">{errores[campo]}</div>}
                        </div>
                      ))}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="acceso-rut" className="form-label auth-label mb-1">RUN / RUT *</label>
                      <input id="acceso-rut" className={claseCampo('rut')} value={rut} maxLength={12} required
                        onChange={(e) => handleChange('rut', formatearRut(e.target.value), setRut)} onBlur={() => handleBlur('rut')} />
                      {errores.rut && <div className="invalid-feedback">{errores.rut}</div>}
                    </div>
                  </>
                )}

                <div className="mb-3">
                  <label htmlFor="acceso-email" className="form-label auth-label mb-1">{modo === 'registro' ? 'Correo electrónico *' : 'Correo electrónico o RUT'}</label>
                  <input
                    id="acceso-email" type={modo === 'registro' ? 'email' : 'text'} autoComplete="username"
                    className={claseCampo(modo === 'registro' ? 'email' : 'identificador')}
                    placeholder={modo === 'registro' ? 'nombre@ejemplo.cl' : 'tucorreo@hotmail.cl / 11.111.111-1'}
                    maxLength={254}
                    value={modo === 'registro' ? email : identificador}
                    onChange={(e) => modo === 'registro' ? handleChange('email', e.target.value, setEmail) : handleChange('identificador', e.target.value, setIdentificador)}
                    onBlur={() => handleBlur(modo === 'registro' ? 'email' : 'identificador')}
                    required
                  />
                  {errores[modo === 'registro' ? 'email' : 'identificador'] && <div className="invalid-feedback">{errores[modo === 'registro' ? 'email' : 'identificador']}</div>}
                </div>

                <div className="mb-4">
                  <label htmlFor="acceso-password" className="form-label auth-label mb-1">Contraseña *</label>
                  <input
                    id="acceso-password" type="password" autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
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
                  disabled={enviando || !!exitoMsg}
                  className="btn btn-ambar auth-submit w-100 py-2 rounded-1 shadow-sm mb-3"
                >
                  {enviando ? 'Conectando…' : modo === 'login' ? 'Entrar a mi Cuenta' : 'Registrarme e Iniciar Sesión'}
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
