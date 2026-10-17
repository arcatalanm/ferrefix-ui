import fs from 'node:fs';
import path from 'node:path';

/**
 * Plugin de Vite que habilita la subida de imágenes de productos.
 *
 * - Expone un endpoint POST /api/productos/imagen (cuerpo binario) que guarda
 *   el archivo recibido dentro de la carpeta `src/assets/products`.
 * - Sirve esas imágenes en desarrollo bajo la URL pública `/assets/products/<archivo>`
 *   para que la referencia guardada en la base local (localStorage) funcione igual
 *   en desarrollo, en `vite preview` y en la compilación de producción.
 * - Al compilar (`vite build`) copia la carpeta `src/assets/products` al directorio
 *   de salida (`dist/assets/products`) para que las imágenes también queden publicadas.
 */

const CARPETA_ORIGEN = ['src', 'assets', 'products'];
const RUTA_PUBLICA = '/assets/products';
const RUTA_API = '/api/productos/imagen';
const TAMANO_MAXIMO_BYTES = 6 * 1024 * 1024; // 6 MB

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
        reject(new Error('La imagen supera el tamaño máximo permitido (6 MB).'));
        req.destroy();
        return;
      }
      partes.push(fragmento);
    });
    req.on('end', () => resolve(Buffer.concat(partes)));
    req.on('error', reject);
  });

/** Normaliza el nombre del archivo recibido a un nombre seguro y único. */
const construirNombreArchivo = (nombreOriginal, carpetaDestino) => {
  const base = path
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
    extension = '.webp';
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

export default function productosUpload() {
  let raizProyecto = process.cwd();
  let carpetaDestino = path.resolve(raizProyecto, ...CARPETA_ORIGEN);
  let directorioSalida = 'dist';
  let esCompilacion = false;

  return {
    name: 'ferrefix-productos-upload',

    configResolved(config) {
      raizProyecto = config.root;
      carpetaDestino = path.resolve(raizProyecto, ...CARPETA_ORIGEN);
      directorioSalida = config.build.outDir;
      esCompilacion = config.command === 'build';
    },

    configureServer(server) {
      if (!fs.existsSync(carpetaDestino)) {
        fs.mkdirSync(carpetaDestino, { recursive: true });
      }

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');

        // ------------------- Subida de imagen -------------------
        if (url.pathname === RUTA_API) {
          if (req.method !== 'POST') {
            return responderJson(res, 405, { ok: false, error: 'Método no permitido.' });
          }

          const tipo = String(req.headers['content-type'] || '');
          if (!tipo.startsWith('image/')) {
            return responderJson(res, 415, { ok: false, error: 'El archivo debe ser una imagen.' });
          }

          const nombreCabecera = String(req.headers['x-file-name'] || 'imagen');
          let nombreOriginal;
          try {
            nombreOriginal = decodeURIComponent(nombreCabecera);
          } catch {
            nombreOriginal = nombreCabecera;
          }

          try {
            const buffer = await leerCuerpo(req, TAMANO_MAXIMO_BYTES);
            if (!buffer.length) {
              return responderJson(res, 400, { ok: false, error: 'No se recibió ningún archivo.' });
            }

            fs.mkdirSync(carpetaDestino, { recursive: true });
            const nombreArchivo = construirNombreArchivo(nombreOriginal, carpetaDestino);
            fs.writeFileSync(path.join(carpetaDestino, nombreArchivo), buffer);

            return responderJson(res, 200, {
              ok: true,
              archivo: nombreArchivo,
              url: `${RUTA_PUBLICA}/${nombreArchivo}`
            });
          } catch (error) {
            return responderJson(res, 400, { ok: false, error: error.message });
          }
        }

        // ------------------- Servir imágenes guardadas -------------------
        if (url.pathname.startsWith(`${RUTA_PUBLICA}/`)) {
          const nombreArchivo = path.basename(url.pathname);
          const rutaArchivo = path.join(carpetaDestino, nombreArchivo);

          if (rutaArchivo.startsWith(carpetaDestino) && fs.existsSync(rutaArchivo) && fs.statSync(rutaArchivo).isFile()) {
            res.statusCode = 200;
            res.setHeader('Content-Type', TIPOS_MIME[path.extname(nombreArchivo).toLowerCase()] || 'application/octet-stream');
            res.setHeader('Cache-Control', 'no-cache');
            fs.createReadStream(rutaArchivo).pipe(res);
            return;
          }
        }

        next();
      });
    },

    closeBundle() {
      if (!esCompilacion || !fs.existsSync(carpetaDestino)) return;

      const salida = path.resolve(raizProyecto, directorioSalida, 'assets', 'products');
      fs.mkdirSync(salida, { recursive: true });
      fs.cpSync(carpetaDestino, salida, { recursive: true });
    }
  };
}
