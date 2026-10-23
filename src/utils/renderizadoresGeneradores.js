/**
 * Renderizadores en canvas de las piezas gráficas de los generadores.
 *
 * Se dibuja en coordenadas lógicas (440 × 520 para la tarjeta de producto y
 * 1300 × 150 para el banner) y se multiplica por `escala` para exportar con
 * buena resolución. De esta forma la vista previa y el archivo WebP final
 * mantienen exactamente el mismo diseño.
 */

export const TARJETA_ANCHO = 440;
export const TARJETA_ALTO = 520;
export const BANNER_ANCHO = 1300;
export const BANNER_ALTO = 150;

const FAMILIA_TITULO = 'Montserrat, "Segoe UI", sans-serif';
const FAMILIA_TEXTO = 'Montserrat, "Segoe UI", sans-serif';

export const FUENTES_BANNER = {
  gagalin: {
    etiqueta: 'Gagalin / Titan One',
    valor: 'Gagalin, "Titan One", "Bungee", sans-serif'
  },
  titan: {
    etiqueta: 'Titan One',
    valor: '"Titan One", "Bungee", sans-serif'
  },
  oswald: {
    etiqueta: 'Oswald',
    valor: 'Oswald, "Titan One", sans-serif'
  },
  montserrat: {
    etiqueta: 'Montserrat',
    valor: 'Montserrat, "Segoe UI", sans-serif'
  }
};

const numero = (valor, respaldo = 0) => {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : respaldo;
};

const limitar = (valor, minimo, maximo) => Math.min(maximo, Math.max(minimo, valor));

const formatearCLP = (valor) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(numero(valor));

const prepararCanvas = (canvas, ancho, alto, escala = 1) => {
  const factor = Math.max(1, numero(escala, 1));
  canvas.width = Math.round(ancho * factor);
  canvas.height = Math.round(alto * factor);

  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(factor, factor);
  return ctx;
};

const rectanguloRedondeado = (ctx, x, y, ancho, alto, radio) => {
  const r = Math.min(radio, ancho / 2, alto / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + ancho - r, y);
  ctx.quadraticCurveTo(x + ancho, y, x + ancho, y + r);
  ctx.lineTo(x + ancho, y + alto - r);
  ctx.quadraticCurveTo(x + ancho, y + alto, x + ancho - r, y + alto);
  ctx.lineTo(x + r, y + alto);
  ctx.quadraticCurveTo(x, y + alto, x, y + alto - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const envolverTexto = (ctx, texto, anchoMaximo) => {
  const parrafos = String(texto ?? '').split('\n');
  const lineas = [];

  parrafos.forEach((parrafo) => {
    const palabras = parrafo.trim().split(/\s+/).filter(Boolean);
    if (!palabras.length) {
      lineas.push('');
      return;
    }

    let lineaActual = palabras[0];
    for (let i = 1; i < palabras.length; i += 1) {
      const prueba = `${lineaActual} ${palabras[i]}`;
      if (ctx.measureText(prueba).width <= anchoMaximo) {
        lineaActual = prueba;
      } else {
        lineas.push(lineaActual);
        lineaActual = palabras[i];
      }
    }
    lineas.push(lineaActual);
  });

  return lineas.length ? lineas : [''];
};

const ajustarTamanoFuente = ({
  ctx,
  texto,
  anchoMaximo,
  familia,
  peso,
  tamano,
  tamanoMinimo = 10
}) => {
  let actual = tamano;
  while (actual > tamanoMinimo) {
    ctx.font = `${peso} ${actual}px ${familia}`;
    if (ctx.measureText(texto).width <= anchoMaximo) break;
    actual -= 1;
  }
  return actual;
};

const dibujarPlaceholderProducto = (ctx) => {
  const centroX = TARJETA_ANCHO / 2;
  const centroY = 270 / 2;

  ctx.save();
  ctx.strokeStyle = '#cbd5e1';
  ctx.fillStyle = '#f1f5f9';
  ctx.lineWidth = 2;
  rectanguloRedondeado(ctx, centroX - 34, centroY - 34, 68, 56, 7);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centroX + 13, centroY - 16, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#cbd5e1';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centroX - 24, centroY + 12);
  ctx.lineTo(centroX - 7, centroY - 6);
  ctx.lineTo(centroX + 5, centroY + 6);
  ctx.lineTo(centroX + 15, centroY - 3);
  ctx.lineTo(centroX + 28, centroY + 12);
  ctx.closePath();
  ctx.fillStyle = '#cbd5e1';
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.font = `600 11px ${FAMILIA_TEXTO}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Sube la imagen del producto', centroX, centroY + 36);
  ctx.restore();
};

/**
 * Dibuja una tarjeta de producto.
 * @param {HTMLCanvasElement} canvas
 * @param {object} config
 * @param {number} escala Factor de resolución (2 = 880 × 1040).
 */
export const renderizarTarjetaProducto = (canvas, config = {}, escala = 2) => {
  if (!canvas) return;

  const ctx = prepararCanvas(canvas, TARJETA_ANCHO, TARJETA_ALTO, escala);

  // Marco gris + tarjeta blanca interior (mismo tratamiento que las tarjetas
  // de seguridad). El contenido se dibuja escalado dentro de la tarjeta blanca
  // para conservar las proporciones del diseño base.
  const marco = Math.max(8, Math.round(TARJETA_ANCHO * 0.027));
  const anchoInterior = TARJETA_ANCHO - marco * 2;
  const altoInterior = TARJETA_ALTO - marco * 2;
  const radioMarco = 11;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, TARJETA_ANCHO, TARJETA_ALTO);

  rectanguloRedondeado(ctx, 0, 0, TARJETA_ANCHO, TARJETA_ALTO, radioMarco);
  ctx.fillStyle = '#efefef';
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(marco, marco, anchoInterior, altoInterior);

  ctx.save();
  ctx.beginPath();
  ctx.rect(marco, marco, anchoInterior, altoInterior);
  ctx.clip();
  ctx.translate(marco, marco);
  ctx.scale(anchoInterior / TARJETA_ANCHO, altoInterior / TARJETA_ALTO);

  const titulo = String(config.titulo ?? '').trim();
  const descripcion = String(config.descripcion ?? '').trim();
  const precioNormal = numero(config.precioNormal);
  const precioOferta = numero(config.precioOferta);
  const descuento = limitar(Math.round(numero(config.descuento)), 0, 100);

  const margenInferior = limitar(numero(config.margenInferior, 16), 0, 40);
  const margenLateral = limitar(numero(config.margenLateral, 16), 8, 40);
  const tamanoTitulo = limitar(numero(config.tamanoTitulo, 28), 12, 52);
  const tamanoDescripcion = limitar(numero(config.tamanoDescripcion, 15), 8, 28);
  const escalaImagen = limitar(numero(config.escalaImagen, 85), 20, 180) / 100;
  const offsetY = limitar(numero(config.offsetY, 0), -80, 80);
  const colorCaja = config.colorCaja || '#1C2226';
  const colorDestacado = config.colorDestacado || '#F2B705';

  // Fondo blanco de la tarjeta.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, TARJETA_ANCHO, TARJETA_ALTO);

  // ------------------------------------------------------------------
  // 1. Imagen del producto (área superior de 270 px)
  // ------------------------------------------------------------------
  const paddingImagen = 16;
  const areaAncho = TARJETA_ANCHO - paddingImagen * 2;
  const areaAlto = 270 - paddingImagen * 2;

  if (config.imagen) {
    const imagen = config.imagen;
    const proporcion = Math.min(areaAncho / imagen.naturalWidth, areaAlto / imagen.naturalHeight);
    const dibujoAncho = imagen.naturalWidth * proporcion * escalaImagen;
    const dibujoAlto = imagen.naturalHeight * proporcion * escalaImagen;
    const x = (TARJETA_ANCHO - dibujoAncho) / 2;
    const y = 270 / 2 - dibujoAlto / 2 + offsetY;

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imagen, x, y, dibujoAncho, dibujoAlto);
    ctx.restore();
  } else {
    dibujarPlaceholderProducto(ctx);
  }

  // ------------------------------------------------------------------
  // 2. Barra de precios y descuento (parte inferior)
  // ------------------------------------------------------------------
  const altoBarra = 86;
  const barraAncho = TARJETA_ANCHO - margenLateral * 2;
  const barraX = margenLateral;
  const barraY = TARJETA_ALTO - margenInferior - altoBarra;

  rectanguloRedondeado(ctx, barraX, barraY, barraAncho, altoBarra, 16);
  ctx.fillStyle = colorCaja;
  ctx.fill();

  ctx.save();
  rectanguloRedondeado(ctx, barraX, barraY, barraAncho, altoBarra, 16);
  ctx.clip();

  const anchoBadge = Math.min(170, barraAncho * 0.46);
  const badgeX = barraX + barraAncho - anchoBadge;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(badgeX + anchoBadge * 0.3, barraY);
  ctx.lineTo(barraX + barraAncho, barraY);
  ctx.lineTo(barraX + barraAncho, barraY + altoBarra);
  ctx.lineTo(badgeX, barraY + altoBarra);
  ctx.closePath();
  ctx.fillStyle = colorDestacado;
  ctx.fill();

  // Formas diagonales decorativas del badge (mismo concepto del HTML original).
  ctx.clip();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(badgeX + anchoBadge * 0.4, barraY);
  ctx.lineTo(badgeX + anchoBadge, barraY);
  ctx.lineTo(badgeX + anchoBadge * 0.6, barraY + altoBarra);
  ctx.lineTo(badgeX, barraY + altoBarra);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#A66D05';
  ctx.beginPath();
  ctx.moveTo(badgeX + anchoBadge * 0.65, barraY);
  ctx.lineTo(badgeX + anchoBadge, barraY);
  ctx.lineTo(badgeX + anchoBadge * 0.8, barraY + altoBarra);
  ctx.lineTo(badgeX + anchoBadge * 0.45, barraY + altoBarra);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Precio de oferta y precio anterior.
  const anchoPrecios = Math.max(80, badgeX - barraX - 40);
  const precioOfertaTexto = formatearCLP(precioOferta);
  const tamanoOferta = ajustarTamanoFuente({
    ctx,
    texto: precioOfertaTexto,
    anchoMaximo: anchoPrecios,
    familia: FAMILIA_TITULO,
    peso: 900,
    tamano: 38,
    tamanoMinimo: 20
  });

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${tamanoOferta}px ${FAMILIA_TITULO}`;
  const ofertaY = barraY + 13;
  ctx.fillText(precioOfertaTexto, barraX + 20, ofertaY);

  const precioNormalTexto = formatearCLP(precioNormal);
  const tamanoAnterior = ajustarTamanoFuente({
    ctx,
    texto: precioNormalTexto,
    anchoMaximo: anchoPrecios,
    familia: FAMILIA_TEXTO,
    peso: 500,
    tamano: 15,
    tamanoMinimo: 9
  });

  ctx.fillStyle = '#94a3b8';
  ctx.font = `500 ${tamanoAnterior}px ${FAMILIA_TEXTO}`;
  const anteriorY = ofertaY + tamanoOferta + 3;
  ctx.fillText(precioNormalTexto, barraX + 20, anteriorY);

  const anchoAnterior = ctx.measureText(precioNormalTexto).width;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(barraX + 20, anteriorY + tamanoAnterior * 0.58);
  ctx.lineTo(barraX + 20 + anchoAnterior, anteriorY + tamanoAnterior * 0.58);
  ctx.stroke();

  // Texto del badge de descuento.
  const badgeTexto = `-${descuento}%`;
  const tamanoBadge = ajustarTamanoFuente({
    ctx,
    texto: badgeTexto,
    anchoMaximo: anchoBadge - 30,
    familia: FAMILIA_TITULO,
    peso: 900,
    tamano: 40,
    tamanoMinimo: 18
  });

  ctx.fillStyle = '#020617';
  ctx.font = `900 ${tamanoBadge}px ${FAMILIA_TITULO}`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeTexto, barraX + barraAncho - 20, barraY + altoBarra / 2 + 1);
  ctx.restore();

  // ------------------------------------------------------------------
  // 3. Título y descripción, alineados justo sobre la barra de precios.
  // ------------------------------------------------------------------
  const textoIzquierda = 20;
  const textoAncho = TARJETA_ANCHO - textoIzquierda * 2;
  const limiteInferiorTexto = barraY - 12;
  const altoDisponibleTexto = Math.max(40, limiteInferiorTexto - 280);

  const tituloVisible = titulo || 'Nombre del producto';
  const descripcionVisible = descripcion || 'Descripción breve del producto';

  let tamanoTituloFinal = tamanoTitulo;
  let tamanoDescripcionFinal = tamanoDescripcion;
  let lineasDescripcion = [];
  let lineasTitulo = [];
  let altoLineaDescripcion = 0;
  let altoLineaTitulo = 0;
  let altoDescripcion = 0;
  let altoTitulo = 0;

  const medirBloqueTexto = () => {
    ctx.font = `500 ${tamanoDescripcionFinal}px ${FAMILIA_TEXTO}`;
    lineasDescripcion = envolverTexto(ctx, descripcionVisible, textoAncho);
    altoLineaDescripcion = tamanoDescripcionFinal * 1.375;
    altoDescripcion = lineasDescripcion.length * altoLineaDescripcion;

    ctx.font = `700 ${tamanoTituloFinal}px ${FAMILIA_TITULO}`;
    lineasTitulo = envolverTexto(ctx, tituloVisible, textoAncho);
    altoLineaTitulo = tamanoTituloFinal * 1.25;
    altoTitulo = lineasTitulo.length * altoLineaTitulo + 4;
  };

  medirBloqueTexto();

  // Si el texto es muy largo se reduce gradualmente para no invadir la barra.
  while (
    altoTitulo + altoDescripcion > altoDisponibleTexto &&
    (tamanoTituloFinal > 16 || tamanoDescripcionFinal > 9)
  ) {
    if (tamanoTituloFinal > 16) tamanoTituloFinal -= 1;
    if (tamanoDescripcionFinal > 9) tamanoDescripcionFinal -= 1;
    medirBloqueTexto();
  }

  let tituloY = limiteInferiorTexto - altoDescripcion - altoTitulo;
  tituloY = Math.max(280, tituloY);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.fillStyle = titulo ? '#0f172a' : '#A9B1BC';
  ctx.font = `700 ${tamanoTituloFinal}px ${FAMILIA_TITULO}`;
  lineasTitulo.forEach((linea, indice) => {
    ctx.fillText(linea, textoIzquierda, tituloY + indice * altoLineaTitulo);
  });

  const descripcionY = tituloY + altoTitulo;
  ctx.fillStyle = descripcion ? '#475569' : '#A9B1BC';
  ctx.font = `500 ${tamanoDescripcionFinal}px ${FAMILIA_TEXTO}`;
  lineasDescripcion.forEach((linea, indice) => {
    ctx.fillText(linea, textoIzquierda, descripcionY + indice * altoLineaDescripcion);
  });

  ctx.restore();

  return canvas;
};

const dibujarFondoBanner = (ctx, imagen) => {
  if (imagen) {
    const factor = Math.max(
      BANNER_ANCHO / imagen.naturalWidth,
      BANNER_ALTO / imagen.naturalHeight
    );
    const ancho = imagen.naturalWidth * factor;
    const alto = imagen.naturalHeight * factor;
    ctx.drawImage(
      imagen,
      (BANNER_ANCHO - ancho) / 2,
      (BANNER_ALTO - alto) / 2,
      ancho,
      alto
    );
    return;
  }

  const degradado = ctx.createLinearGradient(0, 0, BANNER_ANCHO, 0);
  degradado.addColorStop(0, '#15181b');
  degradado.addColorStop(0.5, '#3a3d40');
  degradado.addColorStop(1, '#15181b');
  ctx.fillStyle = degradado;
  ctx.fillRect(0, 0, BANNER_ANCHO, BANNER_ALTO);
};

/**
 * Dibuja un banner promocional sobre la imagen base `banner-generacion.png`.
 * @param {HTMLCanvasElement} canvas
 * @param {object} config
 * @param {number} escala
 */
export const renderizarBanner = (canvas, config = {}, escala = 2) => {
  if (!canvas) return;

  const ctx = prepararCanvas(canvas, BANNER_ANCHO, BANNER_ALTO, escala);
  dibujarFondoBanner(ctx, config.imagenFondo);

  const texto = String(config.texto ?? '');
  const subtexto = String(config.subtexto ?? '').trim();
  const familia = FUENTES_BANNER[config.familia]?.valor || FUENTES_BANNER.gagalin.valor;
  const tamano = limitar(numero(config.tamano, 52), 12, 110);
  const tamanoSub = limitar(numero(config.tamanoSub, 20), 8, 48);
  const color = config.color || '#ffffff';
  const colorSub = config.colorSub || '#F2B705';
  const x = limitar(numero(config.x, BANNER_ANCHO / 2), 0, BANNER_ANCHO);
  const y = limitar(numero(config.y, BANNER_ALTO / 2), 0, BANNER_ALTO);
  const anchoMaximo = limitar(numero(config.anchoMaximo, 1080), 120, BANNER_ANCHO);
  const alineacion = ['left', 'center', 'right'].includes(config.alineacion)
    ? config.alineacion
    : 'center';
  const interlineado = limitar(numero(config.interlineado, 1.05), 0.8, 2);
  const espaciado = limitar(numero(config.espaciado, 1), 0, 14);
  const mayusculas = Boolean(config.mayusculas);
  const sombra = Boolean(config.sombra);
  const contorno = Boolean(config.contorno);
  const grosorContorno = limitar(numero(config.grosorContorno, 3), 1, 10);

  const textoFinal = mayusculas ? texto.toUpperCase() : texto;

  ctx.save();
  if ('letterSpacing' in ctx) {
    ctx.letterSpacing = `${espaciado}px`;
  }

  if (sombra) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
  }

  ctx.textAlign = alineacion;
  ctx.textBaseline = 'middle';

  ctx.font = `400 ${tamano}px ${familia}`;
  const lineasPrincipales = textoFinal.trim()
    ? envolverTexto(ctx, textoFinal, anchoMaximo)
    : [];
  const altoLineaPrincipal = tamano * interlineado;

  ctx.font = `500 ${tamanoSub}px Oswald, ${FAMILIA_TEXTO}`;
  const lineasSub = subtexto ? envolverTexto(ctx, subtexto, anchoMaximo) : [];
  const altoLineaSub = tamanoSub * 1.3;

  const separacion = lineasPrincipales.length && lineasSub.length ? 6 : 0;
  const altoTotal =
    lineasPrincipales.length * altoLineaPrincipal +
    lineasSub.length * altoLineaSub +
    separacion;

  let cursorY = y - altoTotal / 2;

  const dibujarLinea = (linea, fuente, colorLinea) => {
    ctx.font = fuente;
    if (contorno) {
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(10, 14, 18, 0.9)';
      ctx.lineWidth = grosorContorno;
      ctx.strokeText(linea, x, cursorY, anchoMaximo);
    }
    ctx.fillStyle = colorLinea;
    ctx.fillText(linea, x, cursorY, anchoMaximo);
  };

  if (lineasPrincipales.length) {
    cursorY += altoLineaPrincipal / 2;
    lineasPrincipales.forEach((linea) => {
      dibujarLinea(linea, `400 ${tamano}px ${familia}`, color);
      cursorY += altoLineaPrincipal;
    });
  }

  if (lineasSub.length) {
    cursorY += separacion;
    cursorY += altoLineaSub / 2;
    lineasSub.forEach((linea) => {
      dibujarLinea(linea, `500 ${tamanoSub}px Oswald, ${FAMILIA_TEXTO}`, colorSub);
      cursorY += altoLineaSub;
    });
  }

  if ('letterSpacing' in ctx) {
    ctx.letterSpacing = '0px';
  }
  ctx.restore();

  return canvas;
};
