// Lógica pura de filtrado y orden, compartida por Catálogo (productos) y Arriendos (maquinaria).

export const normalizarTexto = (valor) =>
  String(valor ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// [{ valor, cantidad }] ordenado alfabéticamente
export function contarPor(items, campo) {
  const cuenta = new Map();
  items.forEach((item) => {
    const valor = String(item[campo] ?? '').trim();
    if (valor) cuenta.set(valor, (cuenta.get(valor) || 0) + 1);
  });
  return [...cuenta.entries()]
    .map(([valor, cantidad]) => ({ valor, cantidad }))
    .sort((a, b) => a.valor.localeCompare(b.valor, 'es'));
}

export function rangoPrecios(items, campoPrecio) {
  const precios = items.map((i) => Number(i[campoPrecio])).filter(Number.isFinite);
  if (!precios.length) return { min: 0, max: 0 };
  return { min: Math.min(...precios), max: Math.max(...precios) };
}

/**
 * filtros: { q, categoria, marcas: [], precioMin, precioMax, soloDisponibles }
 * config:  { campoPrecio, camposTexto, disponible: (item) => boolean }
 */
export function filtrarItems(items, filtros, config) {
  const { q = '', categoria = '', marcas = [], precioMin = null, precioMax = null, soloDisponibles = false } = filtros;
  const { campoPrecio, camposTexto = ['nombre', 'marca'], disponible = () => true } = config;
  const termino = normalizarTexto(q.trim());
  const marcasNorm = marcas.map(normalizarTexto);

  return items.filter((item) => {
    if (categoria && normalizarTexto(item.categoria) !== normalizarTexto(categoria)) return false;
    if (marcasNorm.length && !marcasNorm.includes(normalizarTexto(item.marca))) return false;
    const precio = Number(item[campoPrecio]);
    if (precioMin !== null && precio < precioMin) return false;
    if (precioMax !== null && precio > precioMax) return false;
    if (soloDisponibles && !disponible(item)) return false;
    if (termino && !camposTexto.some((c) => normalizarTexto(item[c]).includes(termino))) return false;
    return true;
  });
}

export function ordenarItems(items, orden, campoPrecio) {
  const copia = [...items];
  if (orden === 'precio-asc') copia.sort((a, b) => a[campoPrecio] - b[campoPrecio]);
  else if (orden === 'precio-desc') copia.sort((a, b) => b[campoPrecio] - a[campoPrecio]);
  else if (orden === 'nombre-asc') copia.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  else if (orden === 'ultimas-llegadas') copia.sort((a, b) => new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0));
  return copia;
}

// ---- Filtros en la URL (?q=&categoria=&marca=a,b&pmin=&pmax=&disp=1&orden=) ----
const aNumero = (v) => (v !== null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null);

export function leerFiltros(params) {
  return {
    q: params.get('q') || '',
    categoria: params.get('categoria') && params.get('categoria') !== 'Todas' ? params.get('categoria') : '',
    marcas: (params.get('marca') || '').split(',').map((m) => m.trim()).filter(Boolean),
    precioMin: aNumero(params.get('pmin')),
    precioMax: aNumero(params.get('pmax')),
    soloDisponibles: params.get('disp') === '1',
    orden: params.get('orden') || 'default',
  };
}

const CLAVES = { q: 'q', categoria: 'categoria', marcas: 'marca', precioMin: 'pmin', precioMax: 'pmax', soloDisponibles: 'disp', orden: 'orden' };

export function escribirFiltros(params, cambios) {
  const siguiente = new URLSearchParams(params);
  Object.entries(cambios).forEach(([campo, valor]) => {
    const clave = CLAVES[campo];
    let texto;
    if (Array.isArray(valor)) texto = valor.join(',');
    else if (valor === true) texto = '1';
    else if (valor === false || valor === null || valor === undefined || valor === 'default') texto = '';
    else texto = String(valor);
    if (texto) siguiente.set(clave, texto); else siguiente.delete(clave);
  });
  return siguiente;
}

export const hayFiltrosActivos = (f) =>
  Boolean(f.q || f.categoria || f.marcas.length || f.precioMin !== null || f.precioMax !== null || f.soloDisponibles);
