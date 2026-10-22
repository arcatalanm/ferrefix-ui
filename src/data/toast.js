export const EVENTO_TOAST = 'ferrefix:mostrar_toast';

/**
 * Función global para disparar una notificación flotante en la esquina
 * inferior derecha. Se mantiene separada del componente para que
 * ToastNotificacion.jsx solo exporte el componente (Fast Refresh).
 */
export const mostrarToast = ({
  titulo,
  mensaje,
  tipo = 'success',
  imagen = '',
  link = '',
  linkTexto = '',
  duracion = 4500
}) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(EVENTO_TOAST, {
        detail: {
          id: Date.now() + Math.random(),
          titulo,
          mensaje,
          tipo,
          imagen,
          link,
          linkTexto,
          duracion
        }
      })
    );
  }
};
