export const nombreCompleto = (usuario) =>
  [usuario?.nombre, usuario?.segNombre, usuario?.apellidoPaterno, usuario?.apellidoMaterno]
    .map((parte) => String(parte || '').trim()).filter(Boolean).join(' ');
