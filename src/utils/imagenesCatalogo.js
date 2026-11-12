
const archivos = [
  "arnes-seguridad.webp",
  "casco-construccion.webp",
  "cemento-biobio.webp",
  "chaleco-reflectante.webp",
  "cubierta-melamina.webp",
  "esmalte-ceresita.webp",
  "esmeril-angular.webp",
  "generador-electrico.webp",
  "guantes-nitrilo.webp",
  "lentes-proteccion.webp",
  "llave-monomando.webp",
  "osb-multiplac.webp",
  "set-brocas.webp",
  "sierra-circular.webp",
  "taladro-percutor.webp",
  "terciado-estructural.webp",
  "terciado-ranurado.webp",
  "tornillos-drywall.webp"
];
const base = (import.meta.env.VITE_MEDIA_URL || '/media').replace(/\/$/, '');

const urlImagenCatalogo = (archivo) => `${base}/productos/${encodeURIComponent(archivo)}`;

export function migrarImagenCatalogo(imagen) {
  if (typeof imagen !== 'string'
      || !/^\/?(?:src\/assets\/products\/|assets\/|media\/productos\/)/.test(imagen)) return imagen;
  const nombre = imagen.split(/[?#]/)[0].split('/').pop();
  const archivo = archivos.find((item) => {
    const stem = item.slice(0, -5);
    return nombre === item || (nombre.startsWith(`${stem}-`) && nombre.endsWith('.webp'));
  });
  return archivo ? urlImagenCatalogo(archivo) : imagen;
}
