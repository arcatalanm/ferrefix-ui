/*
  Espacio reservado para una imagen con tamaño limitado y controlado desde CSS.

  - Si se entrega `src`, muestra la imagen recortada (object-fit: cover) dentro
    del marco definido.
  - Si no hay imagen, muestra un marcador discreto indicando dónde colocarla.
  - `proporcion` admite: 'banner' | '16x9' | '4x3' | '3x2' | '1x1'.
*/
function EspacioImagen({
  src,
  alt = '',
  proporcion = '16x9',
  etiqueta = 'Espacio para imagen',
  icono = 'bi-image',
  className = ''
}) {
  const clases = ['espacio-imagen', `espacio-imagen--${proporcion}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <figure className={clases}>
      {src ? (
        <img src={src} alt={alt} className="espacio-imagen-img" loading="lazy" />
      ) : (
        <div className="espacio-imagen-vacio" role="img" aria-label={etiqueta}>
          <i className={`bi ${icono}`} aria-hidden="true"></i>
          <span>{etiqueta}</span>
        </div>
      )}
    </figure>
  );
}

export default EspacioImagen;
