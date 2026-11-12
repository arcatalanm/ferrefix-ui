
export const convertirCanvasAWebp = (canvas, calidad = 0.92) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) return resolve(blob);
      canvas.toBlob(respaldo => {
        if (respaldo) resolve(respaldo);
        else reject(new Error('No se pudo convertir el canvas a WebP.'));
      }, 'image/png');
    }, 'image/webp', calidad);
  });

export const formatearBytes = bytes => {
  const valor = Number(bytes) || 0;
  if (valor < 1024) return `${valor} B`;
  if (valor < 1024 * 1024) return `${(valor / 1024).toFixed(1)} KB`;
  return `${(valor / (1024 * 1024)).toFixed(2)} MB`;
};
