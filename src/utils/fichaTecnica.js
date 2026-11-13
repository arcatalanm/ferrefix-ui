export const MAX_DETALLES_TECNICOS = 30;

export function validarFichaTecnica(filas) {
  const errores = {};
  const nombres = new Map();
  for (const fila of filas) {
    const atributo = fila.atributo.trim();
    const valor = fila.valor.trim();
    if (!atributo && !valor) continue;
    const error = {};
    if (!atributo) error.atributo = 'Escribe el nombre del atributo.';
    else if (atributo.length > 120) error.atributo = 'Usa hasta 120 caracteres.';
    if (!valor) error.valor = 'Escribe el valor de este atributo.';
    else if (valor.length > 500) error.valor = 'Usa hasta 500 caracteres.';
    if (atributo) {
      const nombre = atributo.normalize('NFC').toLocaleLowerCase('es');
      if (nombres.has(nombre)) {
        error.atributo = 'Este atributo está repetido.';
        const anterior = nombres.get(nombre);
        errores[anterior] = { ...errores[anterior], atributo: error.atributo };
      } else nombres.set(nombre, fila.id);
    }
    if (Object.keys(error).length) errores[fila.id] = error;
  }
  return errores;
}

export function convertirFichaTecnica(filas) {
  return Object.fromEntries(filas
    .filter(fila => fila.atributo.trim() && fila.valor.trim())
    .map(fila => [fila.atributo.trim(), fila.valor.trim()]));
}
