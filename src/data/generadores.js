/**
 * Persistencia local de las imágenes generadas en el panel administrativo.
 *
 * Guarda la referencia de cada una de las 4 tarjetas de OfertaDestacada y del
 * banner que utiliza BannerPromocional. Las imágenes se almacenan físicamente
 * en `src/assets` mediante el plugin de Vite; aquí solo se conserva la URL
 * pública y el enlace de destino.
 */

const STORAGE_OFERTAS = 'ferrefix_generador_ofertas_v1';
const STORAGE_BANNER = 'ferrefix_generador_banner_v1';
const STORAGE_ENLACES = 'ferrefix_generador_enlaces_v1';

export const TOTAL_SLOTS_OFERTA = 4;
export const ENLACE_POR_DEFECTO = '/categoria';
export const EVENTO_GENERADORES_ACTUALIZADOS = 'ferrefix:generadores_actualizados';

const notificarCambio = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENTO_GENERADORES_ACTUALIZADOS));
  }
};

const leerJson = (clave, respaldo) => {
  if (typeof window === 'undefined') {
    return respaldo;
  }

  try {
    const valor = window.localStorage.getItem(clave);
    if (!valor) return respaldo;
    return JSON.parse(valor);
  } catch (error) {
    console.error(`No se pudo leer ${clave} desde localStorage:`, error);
    return respaldo;
  }
};

const guardarJson = (clave, valor, notificar = true) => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
    if (notificar) notificarCambio();
    return true;
  } catch (error) {
    console.error(`No se pudo guardar ${clave} en localStorage:`, error);
    return false;
  }
};

const normalizarEnlace = (enlace) => {
  const limpio = String(enlace ?? '').trim();
  return limpio || ENLACE_POR_DEFECTO;
};

const normalizarOferta = (oferta, indice) => {
  if (!oferta || !oferta.imagen) return null;

  return {
    indice,
    imagen: oferta.imagen,
    enlace: normalizarEnlace(oferta.enlace),
    alt: String(oferta.alt || `Oferta destacada ${indice + 1}`),
    fecha: oferta.fecha || null
  };
};

/** Devuelve las 4 posiciones de OfertaDestacada, usando null en las vacías. */
export const obtenerOfertasGeneradas = () => {
  const guardadas = leerJson(STORAGE_OFERTAS, []);
  const lista = Array.isArray(guardadas) ? guardadas : [];

  return Array.from({ length: TOTAL_SLOTS_OFERTA }, (_, indice) =>
    normalizarOferta(lista[indice], indice)
  );
};

/** Devuelve los enlaces guardados por cada posición (aunque aún no tengan imagen). */
export const obtenerEnlacesOferta = () => {
  const guardados = leerJson(STORAGE_ENLACES, []);
  const lista = Array.isArray(guardados) ? guardados : [];

  return Array.from({ length: TOTAL_SLOTS_OFERTA }, (_, indice) => {
    const valor = lista[indice];
    return typeof valor === 'string' && valor.trim() ? valor.trim() : null;
  });
};

/**
 * Guarda automáticamente el enlace de una posición. Si la oferta ya tiene una
 * imagen generada, también actualiza el enlace que consume la tienda.
 */
export const guardarEnlaceOferta = (indice, enlace) => {
  if (indice < 0 || indice >= TOTAL_SLOTS_OFERTA) {
    return false;
  }

  const enlaces = obtenerEnlacesOferta();
  const limpio = String(enlace ?? '').trim();
  enlaces[indice] = limpio || null;
  const guardadoBorrador = guardarJson(STORAGE_ENLACES, enlaces, false);

  const ofertas = obtenerOfertasGeneradas();
  if (ofertas[indice]?.imagen) {
    ofertas[indice] = {
      ...ofertas[indice],
      enlace: limpio || ENLACE_POR_DEFECTO
    };
    return guardarJson(STORAGE_OFERTAS, ofertas);
  }

  return guardadoBorrador;
};

/** Guarda la imagen generada en una posición específica (0 a 3). */
export const guardarOfertaGenerada = (indice, datos) => {
  if (indice < 0 || indice >= TOTAL_SLOTS_OFERTA) {
    return false;
  }

  const ofertas = obtenerOfertasGeneradas();
  ofertas[indice] = normalizarOferta(
    {
      ...datos,
      fecha: new Date().toISOString()
    },
    indice
  );

  // Mantiene sincronizado el borrador del enlace con la oferta guardada.
  const enlaces = obtenerEnlacesOferta();
  enlaces[indice] = ofertas[indice]?.enlace || null;
  guardarJson(STORAGE_ENLACES, enlaces, false);

  return guardarJson(STORAGE_OFERTAS, ofertas);
};

/** Elimina la imagen generada de una posición, volviendo a la oferta base. */
export const eliminarOfertaGenerada = (indice) => {
  const ofertas = obtenerOfertasGeneradas();
  if (indice < 0 || indice >= TOTAL_SLOTS_OFERTA) return false;
  ofertas[indice] = null;
  return guardarJson(STORAGE_OFERTAS, ofertas);
};

/** Devuelve el banner generado o null si aún no existe. */
export const obtenerBannerGenerado = () => {
  const banner = leerJson(STORAGE_BANNER, null);
  if (!banner || !banner.imagen) return null;

  return {
    imagen: banner.imagen,
    enlace: normalizarEnlace(banner.enlace),
    alt: String(banner.alt || 'Banner promocional generado'),
    fecha: banner.fecha || null
  };
};

/** Guarda el banner generado que utilizará BannerPromocional. */
export const guardarBannerGenerado = (datos) => {
  if (!datos || !datos.imagen) return false;

  return guardarJson(STORAGE_BANNER, {
    imagen: datos.imagen,
    enlace: normalizarEnlace(datos.enlace),
    alt: String(datos.alt || 'Banner promocional generado'),
    fecha: new Date().toISOString()
  });
};

/** Elimina el banner generado y restaura el banner institucional. */
export const eliminarBannerGenerado = () => {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.removeItem(STORAGE_BANNER);
    notificarCambio();
    return true;
  } catch (error) {
    console.error('No se pudo eliminar el banner generado:', error);
    return false;
  }
};
