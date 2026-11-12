
export const TARJETA_ANCHO = 440;
export const TARJETA_ALTO = 520;

const FAMILIA_TITULO = 'Oswald, "Segoe UI", sans-serif';
const FAMILIA_TEXTO = 'Oswald, "Segoe UI", sans-serif';

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

const recortarTexto = (ctx, texto, ancho) => {
  const original = String(texto ?? '');
  if (ctx.measureText(original).width <= ancho) return original;
  let visible = original;
  while (visible && ctx.measureText(visible + '…').width > ancho) visible = visible.slice(0, -1);
  return visible + '…';
};

const dibujarLineas = (ctx, texto, x, y, ancho, altoLinea, maximo) => {
  const lineas = envolverTexto(ctx, texto, ancho);
  lineas.slice(0, maximo).forEach((linea, indice) => {
    const contenido = indice === maximo - 1 && lineas.length > maximo ? linea + '…' : linea;
    ctx.fillText(recortarTexto(ctx, contenido, ancho), x, y + indice * altoLinea);
  });
};

export const renderizarTarjetaProducto = (canvas, config = {}, escala = 2) => {
  if (!canvas) return;
  const ctx = prepararCanvas(canvas, TARJETA_ANCHO, TARJETA_ALTO, escala);
  const margen = limitar(numero(config.margenLateral, 16), 8, 40);
  const anchoTexto = TARJETA_ANCHO - margen * 2;
  const colorCaja = config.colorCaja || '#1C2226';
  const colorDestacado = config.colorDestacado || '#F2B705';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, TARJETA_ANCHO, TARJETA_ALTO);
  ctx.save();
  rectanguloRedondeado(ctx, 0, 0, TARJETA_ANCHO, TARJETA_ALTO, 11);
  ctx.clip();

  const altoImagen = 270;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, TARJETA_ANCHO, altoImagen);
  ctx.clip();
  if (config.imagen) {
    const imagen = config.imagen;

    const proporcion = Math.max(TARJETA_ANCHO / imagen.naturalWidth, altoImagen / imagen.naturalHeight);
    const zoom = limitar(numero(config.escalaImagen, 100), 100, 150) / 100;
    const ancho = imagen.naturalWidth * proporcion * zoom;
    const alto = imagen.naturalHeight * proporcion * zoom;
    const recorridoY = Math.max(0, (alto - altoImagen) / 2);
    const desplazamientoY = limitar(limitar(numero(config.offsetY), -60, 60), -recorridoY, recorridoY);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imagen, (TARJETA_ANCHO - ancho) / 2,
      (altoImagen - alto) / 2 + desplazamientoY, ancho, alto);
  } else {
    ctx.fillStyle = '#526071';
    ctx.font = '500 18px ' + FAMILIA_TEXTO;
    ctx.textAlign = 'center';
    ctx.fillText('Selecciona la imagen del producto', TARJETA_ANCHO / 2, altoImagen / 2);
  }
  ctx.restore();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.fillStyle = '#526071';
  ctx.font = '600 15px ' + FAMILIA_TEXTO;
  const marca = String(config.marca || 'Marca').toUpperCase();
  const unidad = 'Por ' + (config.unidadVenta || 'unidad');
  ctx.fillText(recortarTexto(ctx, marca, anchoTexto - ctx.measureText(unidad).width - 16), margen, 280);
  ctx.textAlign = 'right';
  ctx.fillText(unidad, TARJETA_ANCHO - margen, 280);
  ctx.textAlign = 'left';

  const altoBarra = 86;
  const barraY = TARJETA_ALTO - limitar(numero(config.margenInferior, 16), 0, 40) - altoBarra;
  const nombre = config.nombre || 'Nombre del producto';
  const descripcion = String(config.descripcionCorta || '').trim();
  let tamanoTitulo = limitar(numero(config.tamanoTitulo, 28), 18, 32);
  let tamanoDescripcion = limitar(numero(config.tamanoDescripcion, 15), 11, 20);
  const medirTexto = () => {
    ctx.font = '700 ' + tamanoTitulo + 'px ' + FAMILIA_TITULO;
    const altoTitulo = Math.min(2, envolverTexto(ctx, nombre, anchoTexto).length) * tamanoTitulo * 1.15;
    ctx.font = '500 ' + tamanoDescripcion + 'px ' + FAMILIA_TEXTO;
    const altoDescripcion = descripcion ? Math.min(2, envolverTexto(ctx, descripcion, anchoTexto).length) * tamanoDescripcion * 1.2 : 0;
    return { altoTitulo, altoTotal: altoTitulo + (descripcion ? 6 : 0) + altoDescripcion };
  };
  let medidas = medirTexto();
  while (medidas.altoTotal > barraY - 12 - 304 && (tamanoTitulo > 18 || tamanoDescripcion > 11)) {
    tamanoTitulo = Math.max(18, tamanoTitulo - 1);
    tamanoDescripcion = Math.max(11, tamanoDescripcion - 1);
    medidas = medirTexto();
  }
  ctx.fillStyle = '#1C2226';
  ctx.font = '700 ' + tamanoTitulo + 'px ' + FAMILIA_TITULO;
  dibujarLineas(ctx, nombre, margen, 304, anchoTexto, tamanoTitulo * 1.15, 2);
  ctx.fillStyle = '#526071';
  ctx.font = '500 ' + tamanoDescripcion + 'px ' + FAMILIA_TEXTO;
  dibujarLineas(ctx, descripcion, margen, 304 + medidas.altoTitulo + 6, anchoTexto, tamanoDescripcion * 1.2, 2);

  rectanguloRedondeado(ctx, margen, barraY, anchoTexto, altoBarra, 16);
  ctx.fillStyle = colorCaja;
  ctx.fill();
  ctx.save();
  ctx.clip();
  const anchoBadge = Math.min(170, anchoTexto * 0.46);
  const derecha = TARJETA_ANCHO - margen;
  const badgeX = derecha - anchoBadge;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(badgeX + anchoBadge * 0.3, barraY);
  ctx.lineTo(derecha, barraY);
  ctx.lineTo(derecha, barraY + altoBarra);
  ctx.lineTo(badgeX, barraY + altoBarra);
  ctx.closePath();
  ctx.fillStyle = colorDestacado;
  ctx.fill();
  ctx.clip();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(badgeX + anchoBadge * 0.4, barraY);
  ctx.lineTo(derecha, barraY);
  ctx.lineTo(badgeX + anchoBadge * 0.6, barraY + altoBarra);
  ctx.lineTo(badgeX, barraY + altoBarra);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#A66D05';
  ctx.beginPath();
  ctx.moveTo(badgeX + anchoBadge * 0.65, barraY);
  ctx.lineTo(derecha, barraY);
  ctx.lineTo(badgeX + anchoBadge * 0.8, barraY + altoBarra);
  ctx.lineTo(badgeX + anchoBadge * 0.45, barraY + altoBarra);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const precioNormal = Math.max(0, numero(config.precioNormal));
  const precioOferta = Math.max(0, numero(config.precioOferta, precioNormal));
  const tieneDescuento = precioNormal > precioOferta;
  const anchoPrecio = Math.max(80, badgeX - margen - 40);
  const precio = formatearCLP(precioOferta);
  const tamanoPrecio = ajustarTamanoFuente({ ctx, texto: precio, anchoMaximo: anchoPrecio,
    familia: FAMILIA_TITULO, peso: 900, tamano: 38, tamanoMinimo: 16 });
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 ' + tamanoPrecio + 'px ' + FAMILIA_TITULO;
  ctx.fillText(precio, margen + 20, barraY + (tieneDescuento ? 13 : 24), anchoPrecio);
  if (tieneDescuento) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 15px ' + FAMILIA_TEXTO;
    const anterior = formatearCLP(precioNormal);
    ctx.fillText(anterior, margen + 20, barraY + 59, anchoPrecio);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margen + 20, barraY + 67);
    ctx.lineTo(margen + 20 + Math.min(ctx.measureText(anterior).width, anchoPrecio), barraY + 67);
    ctx.stroke();
  }
  const badgeTexto = tieneDescuento ? '-' + limitar(Math.round(numero(config.descuento)), 0, 100) + '%' : 'PRECIO';
  const tamanoBadge = ajustarTamanoFuente({ ctx, texto: badgeTexto, anchoMaximo: anchoBadge - 40,
    familia: FAMILIA_TITULO, peso: 900, tamano: tieneDescuento ? 40 : 28, tamanoMinimo: 18 });
  ctx.fillStyle = '#020617';
  ctx.font = '900 ' + tamanoBadge + 'px ' + FAMILIA_TITULO;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeTexto, derecha - 20, barraY + altoBarra / 2 + 1, anchoBadge - 40);
  ctx.restore();
  ctx.restore();
  return canvas;
};
