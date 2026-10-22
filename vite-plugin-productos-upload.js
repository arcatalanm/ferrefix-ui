import fs from 'node:fs';
import path from 'node:path';

/**
 * Plugin de Vite que habilita la subida y publicación de imágenes.
 *
 * - `POST /api/productos/imagen` guarda la imagen de un producto dentro de
 *   `src/assets/products` (comportamiento original del proyecto).
 * - `POST /api/imagenes/webp` guarda las imágenes generadas por los generadores
 *   del panel administrativo. El destino se indica con la cabecera
 *   `X-Destino`: `sales` (OfertaDestacada) o `banners` (BannerPromocional).
 * - Sirve las imágenes en desarrollo bajo `/assets/<destino>/<archivo>`.
 * - Al compilar (`vite build`) copia las carpetas indicadas al directorio de
 *   salida (`dist/assets/<destino>`) para que las imágenes generadas también
 *   queden publicadas.
 */

const DESTINOS = {
  products: {
    carpeta: ['src', 'assets', 'products'],
    publica: '/assets/products'
  },
  sales: {
    carpeta: ['src', 'assets', 'sales'],
    publica: '/assets/sales'
  },
  banners: {
    carpeta: ['src', 'assets', 'banners'],
    publica: '/assets/banners'
  }
};

const DESTINO_POR_DEFECTO = 'products';
const RUTA_API_PRODUCTOS = '/api/productos/imagen';
const RUTA_API_GENERADOS = '/api/imagenes/webp';
const TAMANO_MAXIMO_BYTES = 12 * 1024 * 1024; // 12 MB

const EXTENSIONES_PERMITIDAS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp'];

const TIPOS_MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp'
};

/** Lee el cuerpo de la petición como Buffer. */
const leerCuerpo = (req, limite) =>
  new Promise((resolve, reject) => {
    const partes = [];
    let total = 0;

    req.on('data', (fragmento) => {
      total += fragmento.length;
      if (total > limite) {
        reject(new Error('La imagen supera el tamaño máximo permitido (12 MB).'));
        req.destroy();
        return;
      }
      partes.push(fragmento);
    });
    req.on('end', () => resolve(Buffer.concat(partes)));
    req.on('error', reject);
  });

/** Normaliza el nombre del archivo recibido a un nombre seguro y único. */
const construirNombreArchivo = (nombreOriginal, carpetaDestino, extensionPorDefecto = '.webp') => {
  const base =
    path
      .basename(nombreOriginal || 'imagen')
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'imagen';

  let extension = path.extname(nombreOriginal || '').toLowerCase();
  if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
    extension = extensionPorDefecto;
  }

  let nombre = `${base}${extension}`;
  let contador = 1;
  while (fs.existsSync(path.join(carpetaDestino, nombre))) {
    nombre = `${base}-${contador}${extension}`;
    contador += 1;
  }

  return nombre;
};

const responderJson = (res, codigo, cuerpo) => {
  res.statusCode = codigo;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(cuerpo));
};

const normalizarDestino = (destino) => {
  const clave = String(destino || '').toLowerCase();
  return DESTINOS[clave] ? clave : DESTINO_POR_DEFECTO;
};

const decodificarNombre = (cabecera) => {
  try {
    return decodeURIComponent(String(cabecera || 'imagen'));
  } catch {
    return String(cabecera || 'imagen');
  }
};

export default function productosUpload() {
  let raizProyecto = process.cwd();
  let directorioSalida = 'dist';
  let esCompilacion = false;
  let rutas = {};

  const calcularRutas = () =>
    Object.fromEntries(
      Object.entries(DESTINOS).map(([clave, configuracion]) => [
        clave,
        {
          carpeta: path.resolve(raizProyecto, ...configuracion.carpeta),
          publica: configuracion.publica
        }
      ])
    );

  const guardarImagen = async (req, res, destino) => {
    if (req.method !== 'POST') {
      return responderJson(res, 405, { ok: false, error: 'Método no permitido.' });
    }

    const tipo = String(req.headers['content-type'] || '');
    if (!tipo.startsWith('image/')) {
      return responderJson(res, 415, { ok: false, error: 'El archivo debe ser una imagen.' });
    }

    const nombreOriginal = decodificarNombre(req.headers['x-file-name']);
    const ruta = rutas[destino] || rutas[DESTINO_POR_DEFECTO];

    try {
      const buffer = await leerCuerpo(req, TAMANO_MAXIMO_BYTES);
      if (!buffer.length) {
        return responderJson(res, 400, { ok: false, error: 'No se recibió ningún archivo.' });
      }

      fs.mkdirSync(ruta.carpeta, { recursive: true });
      const nombreArchivo = construirNombreArchivo(nombreOriginal, ruta.carpeta);
      fs.writeFileSync(path.join(ruta.carpeta, nombreArchivo), buffer);

      return responderJson(res, 200, {
        ok: true,
        archivo: nombreArchivo,
        destino,
        url: `${ruta.publica}/${nombreArchivo}`
      });
    } catch (error) {
      return responderJson(res, 400, { ok: false, error: error.message });
    }
  };

  const servirImagen = (url, res) => {
    for (const [clave, ruta] of Object.entries(rutas)) {
      if (!url.pathname.startsWith(`${ruta.publica}/`)) continue;

      const nombreArchivo = path.basename(url.pathname);
      const rutaArchivo = path.join(ruta.carpeta, nombreArchivo);

      if (
        rutaArchivo.startsWith(ruta.carpeta) &&
        fs.existsSync(rutaArchivo) &&
        fs.statSync(rutaArchivo).isFile()
      ) {
        res.statusCode = 200;
        res.setHeader(
          'Content-Type',
          TIPOS_MIME[path.extname(nombreArchivo).toLowerCase()] || 'application/octet-stream'
        );
        res.setHeader('Cache-Control', 'no-cache');
        fs.createReadStream(rutaArchivo).pipe(res);
        return { servida: true, destino: clave };
      }
    }

    return { servida: false };
  };

  return {
    name: 'ferrefix-productos-upload',

    configResolved(config) {
      raizProyecto = config.root;
      directorioSalida = config.build.outDir;
      esCompilacion = config.command === 'build';
      rutas = calcularRutas();
    },

    configureServer(server) {
      Object.values(rutas).forEach((ruta) => {
        if (!fs.existsSync(ruta.carpeta)) {
          fs.mkdirSync(ruta.carpeta, { recursive: true });
        }
      });

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');

        // Subida de imagen de producto (endpoint original).
        if (url.pathname === RUTA_API_PRODUCTOS) {
          return guardarImagen(req, res, 'products');
        }

        // Subida de imágenes generadas por GeneradorProductos / GeneradorBanners.
        if (url.pathname === RUTA_API_GENERADOS) {
          const destino = normalizarDestino(req.headers['x-destino']);
          return guardarImagen(req, res, destino);
        }

        // Servir las imágenes guardadas en src/assets/<destino>.
        const resultado = servirImagen(url, res);
        if (resultado.servida) return;

        next();
      });
    },

    closeBundle() {
      if (!esCompilacion) return;

      Object.entries(rutas).forEach(([clave, ruta]) => {
        if (!fs.existsSync(ruta.carpeta)) return;

        const salida = path.resolve(raizProyecto, directorioSalida, 'assets', clave);
        fs.mkdirSync(salida, { recursive: true });
        fs.cpSync(ruta.carpeta, salida, { recursive: true });
      });
    }
  };
}
