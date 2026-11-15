// Descripciones enriquecidas de maquinaria.
// El servicio de arriendos todavía no tiene un campo para esto, así que por ahora se guardan
// en el navegador (localStorage). Cuando el backend lo tenga, solo hay que reescribir estas dos
// funciones para que llamen a la API; el editor y las páginas no cambian.

const CLAVE = 'ferrefix:descripciones_maquina';
export const EVENTO_DESCRIPCIONES_MAQUINA = 'ferrefix:descripciones_maquina_actualizadas';

function leerTodas() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE) || '{}');
    return datos && typeof datos === 'object' && !Array.isArray(datos) ? datos : {};
  } catch {
    return {};
  }
}

export const obtenerDescripcionMaquina = (idMaquina) => leerTodas()[idMaquina] || '';

export function guardarDescripcionMaquina(idMaquina, html) {
  const todas = leerTodas();
  if (html) todas[idMaquina] = html; else delete todas[idMaquina];
  try {
    localStorage.setItem(CLAVE, JSON.stringify(todas));
  } catch {
    throw new Error('No se pudo guardar en este navegador (almacenamiento lleno o bloqueado).');
  }
  window.dispatchEvent(new CustomEvent(EVENTO_DESCRIPCIONES_MAQUINA));
}
