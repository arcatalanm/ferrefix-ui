import { useEffect, useMemo, useRef, useState } from 'react';
import BannerPromocional from './BannerPromocional';
import bannerBase from '../assets/banners/banner-generacion.png';
import {
  DESTINO_BANNERS,
  cargarImagen,
  convertirCanvasAWebp,
  formatearBytes,
  guardarWebpEnAssets,
  nombreArchivoSeguro
} from '../utils/imagenWebp';
import {
  BANNER_ALTO,
  BANNER_ANCHO,
  FUENTES_BANNER,
  renderizarBanner
} from '../utils/renderizadoresGeneradores';
import {
  ENLACE_POR_DEFECTO,
  EVENTO_GENERADORES_ACTUALIZADOS,
  eliminarBannerGenerado,
  guardarBannerGenerado,
  obtenerBannerGenerado
} from '../data/generadores';

const FORM_INICIAL = {
  texto: 'OFERTAS EN HERRAMIENTAS',
  subtexto: 'Hasta 40% de descuento',
  familia: 'gagalin',
  tamano: 54,
  tamanoSub: 20,
  color: '#FFFFFF',
  colorSub: '#F2B705',
  x: 650,
  y: 75,
  anchoMaximo: 1080,
  alineacion: 'center',
  interlineado: 1.05,
  espaciado: 1,
  mayusculas: true,
  sombra: true,
  contorno: false,
  grosorContorno: 3
};

function GeneradorBanners() {
  const canvasRef = useRef(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [fondo, setFondo] = useState(null);
  const [cargandoFondo, setCargandoFondo] = useState(true);
  const [fuentesListas, setFuentesListas] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState('');
  const [enlace, setEnlace] = useState(ENLACE_POR_DEFECTO);
  const [bannerGuardado, setBannerGuardado] = useState(obtenerBannerGenerado);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const configuracion = useMemo(
    () => ({
      imagenFondo: fondo,
      texto: form.texto,
      subtexto: form.subtexto,
      familia: form.familia,
      tamano: form.tamano,
      tamanoSub: form.tamanoSub,
      color: form.color,
      colorSub: form.colorSub,
      x: form.x,
      y: form.y,
      anchoMaximo: form.anchoMaximo,
      alineacion: form.alineacion,
      interlineado: form.interlineado,
      espaciado: form.espaciado,
      mayusculas: form.mayusculas,
      sombra: form.sombra,
      contorno: form.contorno,
      grosorContorno: form.grosorContorno
    }),
    [fondo, form]
  );

  // Sincroniza el banner guardado con la tienda y con otros componentes.
  useEffect(() => {
    const sincronizar = () => setBannerGuardado(obtenerBannerGenerado());
    window.addEventListener(EVENTO_GENERADORES_ACTUALIZADOS, sincronizar);
    window.addEventListener('storage', sincronizar);

    return () => {
      window.removeEventListener(EVENTO_GENERADORES_ACTUALIZADOS, sincronizar);
      window.removeEventListener('storage', sincronizar);
    };
  }, []);

  // Carga la imagen base del banner desde src/assets/banners.
  useEffect(() => {
    let activo = true;

    cargarImagen(bannerBase)
      .then((imagen) => {
        if (activo) {
          setFondo(imagen);
          setCargandoFondo(false);
        }
      })
      .catch(() => {
        if (activo) {
          setCargandoFondo(false);
          setMensaje({
            tipo: 'error',
            texto: 'No se pudo cargar banner-generacion.png. Se usará un fondo de respaldo.'
          });
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  // Precarga las familias tipográficas del banner.
  useEffect(() => {
    let activo = true;

    const cargarFuentes = async () => {
      if (typeof document !== 'undefined' && document.fonts) {
        try {
          await Promise.all([
            document.fonts.load('54px "Titan One"'),
            document.fonts.load('20px Oswald'),
            document.fonts.load('54px Montserrat')
          ]);
          await document.fonts.ready;
        } catch {
          // Se conserva la tipografía de respaldo si alguna fuente falla.
        }
      }

      if (activo) setFuentesListas(true);
    };

    cargarFuentes();

    return () => {
      activo = false;
    };
  }, []);

  // Redibuja el canvas y renueva la imagen que muestra BannerPromocional.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderizarBanner(canvas, configuracion, 1.5);

    let url;
    try {
      url = canvas.toDataURL('image/webp', 0.86);
    } catch {
      url = canvas.toDataURL('image/png');
    }
    setVistaPrevia(url);
  }, [configuracion, fuentesListas]);

  const actualizarCampo = (campo, valor) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  };

  const generarBlob = async () => {
    const lienzo = document.createElement('canvas');
    renderizarBanner(lienzo, configuracion, 2);
    return convertirCanvasAWebp(lienzo, 0.92);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje(null);

    try {
      if (cargandoFondo) {
        throw new Error('La imagen base del banner aún se está cargando.');
      }

      const blob = await generarBlob();
      const nombre = `banner-${nombreArchivoSeguro(form.texto || 'promocional')}`;
      const resultado = await guardarWebpEnAssets(blob, nombre, DESTINO_BANNERS);

      const guardado = guardarBannerGenerado({
        imagen: resultado.url,
        enlace: enlace.trim() || ENLACE_POR_DEFECTO,
        alt: form.texto || 'Banner promocional generado'
      });

      if (!guardado) {
        throw new Error('No se pudo guardar la referencia del banner generado.');
      }

      setBannerGuardado(obtenerBannerGenerado());
      setMensaje({
        tipo: 'ok',
        texto: `Banner WebP (${formatearBytes(blob.size)}) guardado en src/assets/banners e inyectado en BannerPromocional.`
      });
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto:
          error.message ||
          'No se pudo guardar en assets. Verifica que el servidor de desarrollo esté activo.'
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleRestaurarBanner = () => {
    if (eliminarBannerGenerado()) {
      setBannerGuardado(null);
      setMensaje({
        tipo: 'ok',
        texto: 'Se restauró el banner institucional de la tienda.'
      });
    }
  };

  return (
    <section className="admin-box generador-panel">
      <div className="generador-head">
        <div>
          <h2 className="admin-section-title mb-0">Generador de banners promocionales</h2>
        </div>
      </div>

      <div className="generador-body row g-4">
        <div className="col-12 col-xl-5">
          <form
            className="generador-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleGuardar();
            }}
          >
            {/* 1. Texto */}
            <div className="generador-group">
              <div className="generador-group-head">
                <span className="generador-num">1</span>
                Texto del banner
              </div>
              <div className="generador-group-body">
                <div>
                  <label className="form-label admin-label mb-1" htmlFor="banner-texto">
                    Título principal
                  </label>
                  <textarea
                    id="banner-texto"
                    rows="2"
                    className="form-control form-control-sm rounded-1"
                    placeholder="Ej: OFERTAS EN HERRAMIENTAS"
                    value={form.texto}
                    onChange={(event) => actualizarCampo('texto', event.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label admin-label mb-1" htmlFor="banner-subtexto">
                    Subtítulo (opcional)
                  </label>
                  <input
                    id="banner-subtexto"
                    type="text"
                    className="form-control form-control-sm rounded-1"
                    placeholder="Ej: Hasta 40% de descuento"
                    value={form.subtexto}
                    onChange={(event) => actualizarCampo('subtexto', event.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label admin-label mb-1" htmlFor="banner-familia">
                    Tipografía
                  </label>
                  <select
                    id="banner-familia"
                    className="form-select form-select-sm rounded-1"
                    value={form.familia}
                    onChange={(event) => actualizarCampo('familia', event.target.value)}
                  >
                    {Object.entries(FUENTES_BANNER).map(([clave, fuente]) => (
                      <option key={clave} value={clave}>
                        {fuente.etiqueta}
                      </option>
                    ))}
                  </select>
                  <div className="generador-hint mt-1">
                    Se intenta usar Gagalin si está instalada; si no, se aplica Titan One,
                    una tipografía de exhibición muy similar.
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="banner-tamano">
                      Tamaño título <span className="generador-valor">{form.tamano}px</span>
                    </label>
                    <input
                      id="banner-tamano"
                      type="range"
                      className="form-range"
                      min="20"
                      max="96"
                      value={form.tamano}
                      onChange={(event) => actualizarCampo('tamano', Number(event.target.value))}
                    />
                  </div>

                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="banner-tamano-sub">
                      Tamaño subtítulo{' '}
                      <span className="generador-valor">{form.tamanoSub}px</span>
                    </label>
                    <input
                      id="banner-tamano-sub"
                      type="range"
                      className="form-range"
                      min="10"
                      max="42"
                      value={form.tamanoSub}
                      onChange={(event) => actualizarCampo('tamanoSub', Number(event.target.value))}
                    />
                  </div>
                </div>

                <div className="form-check">
                  <input
                    id="banner-mayusculas"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.mayusculas}
                    onChange={(event) => actualizarCampo('mayusculas', event.target.checked)}
                  />
                  <label className="form-check-label admin-muted" htmlFor="banner-mayusculas">
                    Convertir el título a mayúsculas
                  </label>
                </div>
              </div>
            </div>

            {/* 2. Posición */}
            <div className="generador-group">
              <div className="generador-group-head">
                <span className="generador-num">2</span>
                Posición y alineación
              </div>
              <div className="generador-group-body">
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="banner-x">
                      Posición X <span className="generador-valor">{form.x}px</span>
                    </label>
                    <input
                      id="banner-x"
                      type="range"
                      className="form-range"
                      min="0"
                      max={BANNER_ANCHO}
                      step="5"
                      value={form.x}
                      onChange={(event) => actualizarCampo('x', Number(event.target.value))}
                    />
                  </div>

                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="banner-y">
                      Posición Y <span className="generador-valor">{form.y}px</span>
                    </label>
                    <input
                      id="banner-y"
                      type="range"
                      className="form-range"
                      min="0"
                      max={BANNER_ALTO}
                      step="1"
                      value={form.y}
                      onChange={(event) => actualizarCampo('y', Number(event.target.value))}
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="banner-ancho">
                      Ancho máximo <span className="generador-valor">{form.anchoMaximo}px</span>
                    </label>
                    <input
                      id="banner-ancho"
                      type="range"
                      className="form-range"
                      min="240"
                      max={BANNER_ANCHO}
                      step="10"
                      value={form.anchoMaximo}
                      onChange={(event) =>
                        actualizarCampo('anchoMaximo', Number(event.target.value))
                      }
                    />
                  </div>

                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="banner-alineacion">
                      Alineación
                    </label>
                    <select
                      id="banner-alineacion"
                      className="form-select form-select-sm rounded-1"
                      value={form.alineacion}
                      onChange={(event) => actualizarCampo('alineacion', event.target.value)}
                    >
                      <option value="left">Izquierda</option>
                      <option value="center">Centro</option>
                      <option value="right">Derecha</option>
                    </select>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="banner-interlineado">
                      Interlineado <span className="generador-valor">{form.interlineado}</span>
                    </label>
                    <input
                      id="banner-interlineado"
                      type="range"
                      className="form-range"
                      min="0.8"
                      max="1.6"
                      step="0.05"
                      value={form.interlineado}
                      onChange={(event) =>
                        actualizarCampo('interlineado', Number(event.target.value))
                      }
                    />
                  </div>

                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="banner-espaciado">
                      Espaciado letras{' '}
                      <span className="generador-valor">{form.espaciado}px</span>
                    </label>
                    <input
                      id="banner-espaciado"
                      type="range"
                      className="form-range"
                      min="0"
                      max="12"
                      step="0.5"
                      value={form.espaciado}
                      onChange={(event) => actualizarCampo('espaciado', Number(event.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Estilo */}
            <div className="generador-group">
              <div className="generador-group-head">
                <span className="generador-num">3</span>
                Colores y efectos
              </div>
              <div className="generador-group-body">
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="banner-color">
                      Color del título
                    </label>
                    <div className="generador-color-row">
                      <input
                        id="banner-color"
                        type="color"
                        className="form-control form-control-color"
                        value={form.color}
                        onChange={(event) => actualizarCampo('color', event.target.value)}
                      />
                      <span className="generador-valor">{form.color.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="banner-color-sub">
                      Color del subtítulo
                    </label>
                    <div className="generador-color-row">
                      <input
                        id="banner-color-sub"
                        type="color"
                        className="form-control form-control-color"
                        value={form.colorSub}
                        onChange={(event) => actualizarCampo('colorSub', event.target.value)}
                      />
                      <span className="generador-valor">{form.colorSub.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="form-check">
                  <input
                    id="banner-sombra"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.sombra}
                    onChange={(event) => actualizarCampo('sombra', event.target.checked)}
                  />
                  <label className="form-check-label admin-muted" htmlFor="banner-sombra">
                    Aplicar sombra al texto para mejorar la legibilidad
                  </label>
                </div>

                <div className="form-check">
                  <input
                    id="banner-contorno"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.contorno}
                    onChange={(event) => actualizarCampo('contorno', event.target.checked)}
                  />
                  <label className="form-check-label admin-muted" htmlFor="banner-contorno">
                    Agregar contorno oscuro al texto
                  </label>
                </div>

                <div>
                  <label className="form-label admin-label mb-1" htmlFor="banner-grosor">
                    Grosor del contorno{' '}
                    <span className="generador-valor">{form.grosorContorno}px</span>
                  </label>
                  <input
                    id="banner-grosor"
                    type="range"
                    className="form-range"
                    min="1"
                    max="8"
                    value={form.grosorContorno}
                    disabled={!form.contorno}
                    onChange={(event) =>
                      actualizarCampo('grosorContorno', Number(event.target.value))
                    }
                  />
                </div>
              </div>
            </div>

            {/* 4. Destino */}
            <div className="generador-group">
              <div className="generador-group-head">
                <span className="generador-num">4</span>
                Destino en la tienda
              </div>
              <div className="generador-group-body">
                <div>
                  <label className="form-label admin-label mb-1" htmlFor="banner-enlace">
                    Enlace del banner
                  </label>
                  <input
                    id="banner-enlace"
                    type="text"
                    className="form-control form-control-sm rounded-1"
                    placeholder={ENLACE_POR_DEFECTO}
                    value={enlace}
                    onChange={(event) => setEnlace(event.target.value)}
                  />
                  <div className="generador-hint mt-1">
                    Si se deja vacío se utiliza <code>{ENLACE_POR_DEFECTO}</code>.
                  </div>
                </div>

                {bannerGuardado && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger rounded-1 align-self-start"
                    onClick={handleRestaurarBanner}
                  >
                    Restaurar banner institucional
                  </button>
                )}
              </div>
            </div>

            {mensaje && (
              <div className={`generador-alert generador-alert--${mensaje.tipo}`} role="status">
                {mensaje.texto}
              </div>
            )}

            <div className="generador-actions">
              <button
                type="submit"
                className="btn btn-ambar admin-btn-strong rounded-1"
                disabled={guardando || cargandoFondo}
              >
                <i className="bi bi-magic me-2"></i>
                {guardando ? 'Generando y guardando...' : 'Generar y guardar en assets'}
              </button>
            </div>
          </form>
        </div>

        <div className="col-12 col-xl-7">
          <div className="generador-preview-sticky">
            <div className="generador-preview-card">
              <div className="generador-preview-head">
                <div>
                  <h3 className="generador-preview-title">Vista previa del banner</h3>
                  <span className="admin-muted">
                    {BANNER_ANCHO} × {BANNER_ALTO} px · salida WebP · enlace{' '}
                    <code>{enlace.trim() || ENLACE_POR_DEFECTO}</code>
                  </span>
                </div>
              </div>

              <div className="generador-preview-stage generador-preview-stage--banner">
                <BannerPromocional
                  imagen={vistaPrevia || bannerBase}
                  alt="Vista previa del banner promocional generado"
                  enlace=""
                />
              </div>
            </div>

            <canvas ref={canvasRef} className="d-none" aria-hidden="true" />

            {bannerGuardado && (
              <div className="generador-preview-card mt-3">
                <div className="generador-preview-head">
                  <div>
                    <h3 className="generador-preview-title">Banner activo en la tienda</h3>
                    <span className="admin-muted">
                      Esta es la imagen que está usando BannerPromocional en la página de inicio.
                    </span>
                  </div>
                  <span className="admin-badge-soft">Activo</span>
                </div>

                <div className="generador-preview-stage generador-preview-stage--banner">
                  <BannerPromocional
                    imagen={bannerGuardado.imagen}
                    alt={bannerGuardado.alt}
                    enlace=""
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default GeneradorBanners;
