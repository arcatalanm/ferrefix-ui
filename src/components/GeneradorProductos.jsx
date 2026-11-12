import { useEffect, useMemo, useRef, useState } from 'react';
import ImagenProductoUploader from './ImagenProductoUploader';
import { UNIDADES_VENTA } from '../utils/presentacionProducto';
import {
  convertirCanvasAWebp,
  formatearBytes,
} from '../utils/imagenWebp';
import {
  renderizarTarjetaProducto
} from '../utils/renderizadoresGeneradores';
import {
  ENLACE_POR_DEFECTO,
  EVENTO_GENERADORES_ACTUALIZADOS,
  TOTAL_SLOTS_OFERTA,
  eliminarOfertaGenerada,
  guardarOfertaGenerada,
  obtenerEnlacesOferta,
  obtenerOfertasGeneradas,
  cargarOfertas,
  useEstadoGeneradores
} from '../data/generadores';
import { clienteApi } from '../services/api';
import { obtenerMensajeApi } from '../services/crearClienteApi';

const FORM_INICIAL = {
  modo: 'descuento',
  precioVenta: '',
  descuento: '0',
  precioOferta: '',
  redondear: true,
  idProducto: '',
  nombre: '',
  marca: '',
  descripcionCorta: '',
  unidadVenta: 'unidad',
  tamanoTitulo: 28,
  tamanoDescripcion: 15,
  escalaImagen: 100,
  offsetY: 0,
  margenInferior: 16,
  margenLateral: 16,
  colorCaja: '#1C2226',
  colorDestacado: '#F2B705'
};

const redondearPrecioComercial = (valor) => {
  if (valor <= 0) return 0;
  if (valor < 1000) return Math.max(0, Math.floor(valor / 10) * 10);

  return Math.max(0, Math.floor((valor - 90) / 100) * 100 + 90);
};

const calcularPrecios = ({ modo, precioVenta, descuento, precioOferta, redondear }) => {
  const normal = Math.max(0, Number(precioVenta) || 0);
  const descuentoIngresado = Math.min(100, Math.max(0, Number(descuento) || 0));
  const ofertaIngresada = Math.max(0, Number(precioOferta) || 0);

  if (modo === 'descuento') {
    if (normal <= 0) {
      return { normal: 0, descuento: descuentoIngresado, oferta: 0 };
    }

    if (descuentoIngresado <= 0) {
      return { normal, descuento: 0, oferta: normal };
    }

    if (descuentoIngresado >= 100) {
      return { normal, descuento: 100, oferta: 0 };
    }

    let oferta = normal * (1 - descuentoIngresado / 100);
    if (redondear) {
      oferta = redondearPrecioComercial(oferta);
    }
    oferta = Math.max(0, Math.round(oferta));

    return {
      normal,
      descuento: descuentoIngresado,
      oferta
    };
  }

  if (normal <= 0) {
    return { normal, descuento: 0, oferta: ofertaIngresada };
  }

  if (ofertaIngresada >= normal) {
    return { normal, descuento: 0, oferta: normal };
  }

  let oferta = ofertaIngresada;
  if (redondear && oferta > 0) {
    oferta = redondearPrecioComercial(oferta);
  }
  oferta = Math.max(0, Math.round(oferta));

  const descuentoCalculado = Math.min(
    100,
    Math.max(0, Math.round(((normal - oferta) / normal) * 100))
  );

  return {
    normal,
    descuento: descuentoCalculado,
    oferta
  };
};

function GeneradorProductos({ productos = [] }) {
  const estadoGeneradores = useEstadoGeneradores();
  const canvasRef = useRef(null);
  const lectorRef = useRef(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [imagenSrc, setImagenSrc] = useState('');
  const [imagenCargada, setImagenCargada] = useState(null);
  const [cargandoImagen, setCargandoImagen] = useState(false);

  const [slotActivo, setSlotActivo] = useState(0);
  const [ofertas, setOfertas] = useState(obtenerOfertasGeneradas);
  const [enlaces, setEnlaces] = useState(() => {
    const borradores = obtenerEnlacesOferta();
    const guardadas = obtenerOfertasGeneradas();
    return Array.from(
      { length: TOTAL_SLOTS_OFERTA },
      (_, indice) => borradores[indice] || guardadas[indice]?.enlace || ENLACE_POR_DEFECTO
    );
  });

  const [fuentesListas, setFuentesListas] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => () => lectorRef.current?.abort(), []);

  const precios = useMemo(() => calcularPrecios(form), [form]);

  const configuracion = useMemo(
    () => ({
      imagen: imagenCargada,
      nombre: form.nombre,
      marca: form.marca,
      descripcionCorta: form.descripcionCorta,
      unidadVenta: form.unidadVenta,
      precioNormal: precios.normal,
      precioOferta: precios.oferta,
      descuento: precios.descuento,
      escalaImagen: form.escalaImagen,
      offsetY: form.offsetY,
      tamanoTitulo: form.tamanoTitulo,
      tamanoDescripcion: form.tamanoDescripcion,
      margenInferior: form.margenInferior,
      margenLateral: form.margenLateral,
      colorCaja: form.colorCaja,
      colorDestacado: form.colorDestacado
    }),
    [form, imagenCargada, precios]
  );

  useEffect(() => {
    const sincronizar = () => {
      setOfertas(obtenerOfertasGeneradas());
      setEnlaces(obtenerEnlacesOferta().map(enlace => enlace || ENLACE_POR_DEFECTO));
    };

    window.addEventListener(EVENTO_GENERADORES_ACTUALIZADOS, sincronizar);

    return () => {
      window.removeEventListener(EVENTO_GENERADORES_ACTUALIZADOS, sincronizar);
    };
  }, []);

  useEffect(() => {
    let activo = true;

    const cargarFuentes = async () => {
      if (typeof document !== 'undefined' && document.fonts) {
        try {
          await Promise.all([
            document.fonts.load('700 28px Oswald'),
            document.fonts.load('500 15px Oswald'),
            document.fonts.load('900 38px Oswald')
          ]);
          await document.fonts.ready;
        } catch {
          if (activo) setFuentesListas(true);
          return;
        }
      }

      if (activo) setFuentesListas(true);
    };

    cargarFuentes();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!imagenSrc) return undefined;

    let activo = true;
    const imagen = new Image();
    imagen.crossOrigin = 'anonymous';
    imagen.onload = () => {
      if (!activo) return;
      setImagenCargada(imagen);
      setCargandoImagen(false);
    };
    imagen.onerror = () => {
      if (!activo) return;
      setImagenCargada(null);
      setCargandoImagen(false);
      setMensaje({
        tipo: 'error',
        texto: 'No se pudo cargar la imagen seleccionada. Intenta con otro archivo.'
      });
    };
    imagen.src = imagenSrc;

    return () => {
      activo = false;
    };
  }, [imagenSrc, form.idProducto]);

  useEffect(() => {
    if (!canvasRef.current) return;
    renderizarTarjetaProducto(canvasRef.current, configuracion, 2);
  }, [configuracion, fuentesListas]);

  const actualizarCampo = (campo, valor) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  };

  const seleccionarProducto = (id) => {
    lectorRef.current?.abort();
    const producto = productos.find((item) => String(item.idProducto) === id);
    setForm((actual) => ({
      ...actual,
      idProducto: producto?.idProducto || '',
      nombre: producto?.nombre || '',
      marca: producto?.marca || '',
      descripcionCorta: producto?.descripcionCorta || '',
      precioVenta: producto ? String(producto.precioVenta) : '',
      unidadVenta: producto?.unidadVenta || 'unidad',
      modo: 'descuento', descuento: '0', precioOferta: '',
    }));
    setImagenArchivo(null);
    setImagenCargada(null);
    setCargandoImagen(Boolean(producto?.imagen));
    setImagenSrc(producto?.imagen || '');
    setMensaje(null);
    actualizarEnlace(producto ? `/producto/${producto.idProducto}` : ENLACE_POR_DEFECTO);
  };

  const cambiarModo = (nuevoModo) => {
    if (nuevoModo === form.modo) return;

    if (nuevoModo === 'oferta') {
      setForm((actual) => ({
        ...actual,
        modo: 'oferta',
        precioOferta: String(precios.oferta)
      }));
    } else {
      setForm((actual) => ({
        ...actual,
        modo: 'descuento',
        descuento: String(precios.descuento)
      }));
    }
  };

  const seleccionarImagen = (archivo) => {
    lectorRef.current?.abort();
    setImagenArchivo(archivo);
    setImagenSrc('');
    setImagenCargada(null);
    setMensaje(null);

    if (!archivo) {
      setCargandoImagen(false);
      return;
    }

    setCargandoImagen(true);
    const lector = new FileReader();
    lectorRef.current = lector;
    lector.onload = () => setImagenSrc(String(lector.result || ''));
    lector.onerror = () => {
      setCargandoImagen(false);
      setMensaje({ tipo: 'error', texto: 'No se pudo leer la imagen seleccionada.' });
    };
    lector.readAsDataURL(archivo);
  };

  const seleccionarSlot = (indice) => {
    setSlotActivo(indice);
    setMensaje(null);
    if (form.idProducto) {
      setEnlaces((actual) => actual.map((enlace, posicion) => posicion === indice ? `/producto/${form.idProducto}` : enlace));
    }
  };

  const actualizarEnlace = (valor) => {
    setEnlaces((actual) => {
      const siguiente = [...actual];
      siguiente[slotActivo] = valor;
      return siguiente;
    });
  };

  const generarBlob = async () => {
    const lienzo = document.createElement('canvas');
    renderizarTarjetaProducto(lienzo, configuracion, 3);
    return convertirCanvasAWebp(lienzo, 0.92);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje(null);

    try {
      if (!productos.some((producto) => producto.idProducto === form.idProducto)) {
        throw new Error('Selecciona un producto disponible en el catálogo.');
      }
      if (!imagenCargada || cargandoImagen) {
        throw new Error('Espera a que la imagen termine de cargar antes de guardar.');
      }

      const blob = await generarBlob();
      const enlaceFinal = String(enlaces[slotActivo] ?? '').trim() || ENLACE_POR_DEFECTO;
      const archivo = new FormData();
      archivo.append('archivo', blob, 'oferta.webp');
      const { data: resultado } = await clienteApi.http.post('/catalogo/imagenes', archivo);

      const guardado = await guardarOfertaGenerada(slotActivo, {
        imagen: resultado.url,
        enlace: enlaceFinal,
        alt: form.nombre || `Oferta destacada ${slotActivo + 1}`
      });

      if (!guardado) {
        throw new Error('No se pudo guardar la referencia de la oferta generada.');
      }

      setEnlaces((actual) => {
        const siguiente = [...actual];
        siguiente[slotActivo] = enlaceFinal;
        return siguiente;
      });

      setMensaje({
        tipo: 'ok',
        texto: `Imagen WebP (${formatearBytes(blob.size)}) guardada en las ofertas de este navegador.`
      });
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto:
          (error.response ? obtenerMensajeApi(error) : error.message) ||
          'No se pudo guardar la oferta. Inténtalo nuevamente.'
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleQuitarOferta = async () => {
    try { if (await eliminarOfertaGenerada(slotActivo)) {
      setOfertas(obtenerOfertasGeneradas());
      setMensaje({
        tipo: 'ok',
        texto: `Se restauró la oferta base de la posición ${slotActivo + 1}.`
      });
    }
    } catch (error) { setMensaje({ tipo: 'error', texto: error.message }); }
  };

  return (
    <section className="admin-box generador-panel">
        {estadoGeneradores.error && <div className="alert alert-danger" role="alert">
          {estadoGeneradores.error}
          <button type="button" className="btn btn-outline-dark btn-sm ms-2" onClick={cargarOfertas}>Reintentar</button>
        </div>}
      <div className="generador-head">
        <div>
          <h2 className="admin-section-title mb-0">Generador de tarjetas de producto</h2>
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
            <div>
              <label className="form-label admin-label" htmlFor="generador-producto">Producto del catálogo</label>
              <select id="generador-producto" className="form-select form-select-sm" value={form.idProducto} required
                onChange={(event) => seleccionarProducto(event.target.value)}>
                <option value="" disabled>{productos.length ? 'Selecciona un producto' : 'No hay productos disponibles'}</option>
                {productos.map((producto) => <option key={producto.idProducto} value={producto.idProducto}>{producto.nombre}</option>)}
              </select>
              <p className="generador-hint mt-1 mb-0">Carga sus datos e imagen para preparar la tarjeta. Los ajustes de esta tarjeta no cambian el producto del catálogo.</p>
            </div>

            <div className="generador-group">
              <div className="generador-group-head">
                <span className="generador-num">1</span>
                Precios y descuento
              </div>
              <div className="generador-group-body">
                <div className="generador-seg" role="group" aria-label="Modo de cálculo">
                  <button
                    type="button"
                    className={form.modo === 'descuento' ? 'active' : ''}
                    aria-pressed={form.modo === 'descuento'}
                    onClick={() => cambiarModo('descuento')}
                  >
                    Precio de venta + %
                  </button>
                  <button
                    type="button"
                    className={form.modo === 'oferta' ? 'active' : ''}
                    aria-pressed={form.modo === 'oferta'}
                    onClick={() => cambiarModo('oferta')}
                  >
                    Precio de venta + oferta
                  </button>
                </div>

                <div className="row g-2">
                  <div className="col-12 col-sm-4">
                    <label className="form-label admin-label mb-1" htmlFor="generador-precio-normal">
                      Precio de venta
                    </label>
                    <input
                      id="generador-precio-normal"
                      type="number"
                      min="0"
                      step="1"
                      required
                      className="form-control form-control-sm rounded-1 admin-mono"
                      value={form.precioVenta}
                      onChange={(event) => actualizarCampo('precioVenta', event.target.value)}
                    />
                  </div>

                  <div className="col-6 col-sm-4">
                    <label className="form-label admin-label mb-1" htmlFor="generador-descuento">
                      Descuento (%)
                    </label>
                    <input
                      id="generador-descuento"
                      type="number"
                      min="0"
                      max="100"
                      className={`form-control form-control-sm rounded-1 admin-mono ${
                        form.modo !== 'descuento' ? 'bg-light' : ''
                      }`}
                      value={form.modo === 'descuento' ? form.descuento : precios.descuento}
                      readOnly={form.modo !== 'descuento'}
                      onChange={(event) => actualizarCampo('descuento', event.target.value)}
                    />
                  </div>

                  <div className="col-6 col-sm-4">
                    <label className="form-label admin-label mb-1" htmlFor="generador-precio-oferta">
                      Precio oferta
                    </label>
                    <input
                      id="generador-precio-oferta"
                      type="number"
                      min="0"
                      step="10"
                      className={`form-control form-control-sm rounded-1 admin-mono ${
                        form.modo === 'descuento' ? 'bg-light' : ''
                      }`}
                      value={form.modo === 'descuento' ? precios.oferta : form.precioOferta}
                      readOnly={form.modo === 'descuento'}
                      onChange={(event) => actualizarCampo('precioOferta', event.target.value)}
                      onBlur={() => {
                        if (form.modo === 'oferta' && form.redondear) {
                          actualizarCampo('precioOferta', String(precios.oferta));
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="form-check">
                  <input
                    id="generador-redondear"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.redondear}
                    onChange={(event) => actualizarCampo('redondear', event.target.checked)}
                  />
                  <label className="form-check-label admin-muted" htmlFor="generador-redondear">
                    Redondear el precio de oferta a un valor comercial terminado en 90 (ej. $19.990)
                  </label>
                </div>
                <div className="generador-hint">
                  Se usa el valor comercial terminado en 90 inmediatamente inferior. Así cada
                  porcentaje de descuento conserva un precio final distinto.
                </div>
              </div>
            </div>

            <div className="generador-group">
              <div className="generador-group-head">
                <span className="generador-num">2</span>
                Imagen del producto
              </div>
              <div className="generador-group-body">
                <ImagenProductoUploader
                  key={form.idProducto}
                  archivo={imagenArchivo}
                  onSeleccionar={seleccionarImagen}
                  onQuitar={() => seleccionarImagen(null)}
                  imagenActual={imagenSrc}
                />

                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="generador-escala">
                      Escala de imagen <span className="generador-valor">{form.escalaImagen}%</span>
                    </label>
                    <input
                      id="generador-escala"
                      type="range"
                      className="form-range"
                      min="100"
                      max="150"
                      value={form.escalaImagen}
                      onChange={(event) => actualizarCampo('escalaImagen', Number(event.target.value))}
                    />
                  </div>

                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="generador-offset-y">
                      Ajuste vertical <span className="generador-valor">{form.offsetY}px</span>
                    </label>
                    <input
                      id="generador-offset-y"
                      type="range"
                      className="form-range"
                      min="-60"
                      max="60"
                      value={form.offsetY}
                      onChange={(event) => actualizarCampo('offsetY', Number(event.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="generador-group">
              <div className="generador-group-head">
                <span className="generador-num">3</span>
                Textos e información
              </div>
              <div className="generador-group-body">
                <div>
                  <label className="form-label admin-label mb-1" htmlFor="generador-titulo">
                    Nombre del producto
                  </label>
                  <input
                    id="generador-titulo"
                    type="text"
                    className="form-control form-control-sm rounded-1"
                    placeholder="Ej: Taladro Percutor 20V Max XR"
                    maxLength={160}
                    required
                    value={form.nombre}
                    onChange={(event) => actualizarCampo('nombre', event.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label admin-label mb-1" htmlFor="generador-descripcion">
                    Descripción corta
                  </label>
                  <textarea
                    id="generador-descripcion"
                    rows="2"
                    className="form-control form-control-sm rounded-1"
                    placeholder="Ej: Motor brushless, 2 baterías y maletín incluido"
                    maxLength={300}
                    value={form.descripcionCorta}
                    onChange={(event) => actualizarCampo('descripcionCorta', event.target.value)}
                  />
                </div>

                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label admin-label" htmlFor="generador-marca">Marca</label>
                    <input id="generador-marca" className="form-control form-control-sm" maxLength={100} required
                      value={form.marca} onChange={(event) => actualizarCampo('marca', event.target.value)} />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label admin-label" htmlFor="generador-unidad">Unidad de venta</label>
                    <select id="generador-unidad" className="form-select form-select-sm" value={form.unidadVenta}
                      onChange={(event) => actualizarCampo('unidadVenta', event.target.value)}>
                      {UNIDADES_VENTA.map((unidad) => <option key={unidad} value={unidad}>{unidad}</option>)}
                    </select>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="generador-tamano-titulo">
                      Tamaño título <span className="generador-valor">{form.tamanoTitulo}px</span>
                    </label>
                    <input
                      id="generador-tamano-titulo"
                      type="range"
                      className="form-range"
                      min="18"
                      max="32"
                      value={form.tamanoTitulo}
                      onChange={(event) => actualizarCampo('tamanoTitulo', Number(event.target.value))}
                    />
                  </div>

                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="generador-tamano-desc">
                      Tamaño descripción{' '}
                      <span className="generador-valor">{form.tamanoDescripcion}px</span>
                    </label>
                    <input
                      id="generador-tamano-desc"
                      type="range"
                      className="form-range"
                      min="11"
                      max="20"
                      value={form.tamanoDescripcion}
                      onChange={(event) =>
                        actualizarCampo('tamanoDescripcion', Number(event.target.value))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="generador-group">
              <div className="generador-group-head">
                <span className="generador-num">4</span>
                Espaciado y colores
              </div>
              <div className="generador-group-body">
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="generador-margen-inferior">
                      Espaciado inferior{' '}
                      <span className="generador-valor">{form.margenInferior}px</span>
                    </label>
                    <input
                      id="generador-margen-inferior"
                      type="range"
                      className="form-range"
                      min="0"
                      max="36"
                      value={form.margenInferior}
                      onChange={(event) =>
                        actualizarCampo('margenInferior', Number(event.target.value))
                      }
                    />
                  </div>

                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="generador-margen-lateral">
                      Margen lateral <span className="generador-valor">{form.margenLateral}px</span>
                    </label>
                    <input
                      id="generador-margen-lateral"
                      type="range"
                      className="form-range"
                      min="8"
                      max="36"
                      value={form.margenLateral}
                      onChange={(event) =>
                        actualizarCampo('margenLateral', Number(event.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="generador-color-caja">
                      Color caja de precio
                    </label>
                    <div className="generador-color-row">
                      <input
                        id="generador-color-caja"
                        type="color"
                        className="form-control form-control-color"
                        value={form.colorCaja}
                        onChange={(event) => actualizarCampo('colorCaja', event.target.value)}
                      />
                      <span className="generador-valor">{form.colorCaja.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="col-6">
                    <label className="form-label admin-label mb-1" htmlFor="generador-color-destacado">
                      Color destacado
                    </label>
                    <div className="generador-color-row">
                      <input
                        id="generador-color-destacado"
                        type="color"
                        className="form-control form-control-color"
                        value={form.colorDestacado}
                        onChange={(event) => actualizarCampo('colorDestacado', event.target.value)}
                      />
                      <span className="generador-valor">{form.colorDestacado.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="generador-group">
              <div className="generador-group-head">
                <span className="generador-num">5</span>
                Destino en la tienda
              </div>
              <div className="generador-group-body">
                <div>
                  <label className="form-label admin-label mb-1" htmlFor="generador-enlace">
                    Enlace de la oferta
                  </label>
                  <input
                    id="generador-enlace"
                    type="text"
                    className="form-control form-control-sm rounded-1"
                    placeholder={ENLACE_POR_DEFECTO}
                    value={enlaces[slotActivo] ?? ENLACE_POR_DEFECTO}
                    onChange={(event) => actualizarEnlace(event.target.value)}
                  />
                  <div className="generador-hint mt-1">
                    El enlace se guarda con la oferta. Si se deja vacío se
                    utiliza <code>{ENLACE_POR_DEFECTO}</code>.
                  </div>
                </div>

                <div>
                  <span className="form-label admin-label mb-1 d-block">Posición de la oferta</span>
                  <div className="generador-slot-grid">
                    {Array.from({ length: TOTAL_SLOTS_OFERTA }, (_, indice) => {
                      const oferta = ofertas[indice];
                      return (
                        <button
                          key={indice}
                          type="button"
                          className={`generador-slot ${slotActivo === indice ? 'active' : ''}`}
                          onClick={() => seleccionarSlot(indice)}
                          aria-label={`Seleccionar oferta ${indice + 1}`}
                          aria-pressed={slotActivo === indice}
                        >
                          {oferta?.imagen ? (
                            <img src={oferta.imagen} alt={`Oferta ${indice + 1}`} />
                          ) : (
                            <span className="generador-slot-empty">Vacía</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {ofertas[slotActivo]?.imagen && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger rounded-1 align-self-start"
                    onClick={handleQuitarOferta}
                  >
                    Quitar imagen de esta oferta
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
                disabled={guardando || cargandoImagen || !imagenCargada || !fuentesListas || !form.idProducto}
              >
                <i className="bi bi-magic me-2"></i>
                {guardando ? 'Guardando…' : 'Guardar oferta'}
              </button>
            </div>
          </form>
        </div>

        <div className="col-12 col-xl-7">
          <div className="generador-preview-sticky">
            <div className="generador-preview-card">
              <div className="generador-preview-head">
                <div>
                  <h3 className="generador-preview-title">Vista previa de la tarjeta</h3>
                </div>
              </div>

              <div className="generador-preview-stage">
                <canvas
                  ref={canvasRef}
                  className="generador-card-canvas"
                  aria-label="Vista previa de la tarjeta de producto"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default GeneradorProductos;
