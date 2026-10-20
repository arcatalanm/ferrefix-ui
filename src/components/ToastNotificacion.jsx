import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const EVENTO_TOAST = 'ferrefix:mostrar_toast';

/**
 * Función global para disparar una notificación flotante en la esquina inferior derecha
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

export default function ToastNotificacion() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleNuevoToast = (e) => {
      const nuevo = e.detail;
      setToasts((prev) => [...prev.slice(-2), nuevo]); // Máximo 3 visibles a la vez

      setTimeout(() => {
        setToasts((actuales) => actuales.filter((t) => t.id !== nuevo.id));
      }, nuevo.duracion || 4500);
    };

    window.addEventListener(EVENTO_TOAST, handleNuevoToast);
    return () => window.removeEventListener(EVENTO_TOAST, handleNuevoToast);
  }, []);

  const cerrarToast = (id) => {
    setToasts((actuales) => actuales.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-ferrefix-contenedor" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => {
        const esExito = toast.tipo === 'success';
        const esPeligro = toast.tipo === 'danger';
        const esAlerta = toast.tipo === 'warning';

        let colorBorde = '#ffb703'; // Ámbar por defecto de Ferrefix
        if (esExito) colorBorde = '#198754';
        if (esPeligro) colorBorde = '#dc3545';
        if (esAlerta) colorBorde = '#fd7e14';

        return (
          <div
            key={toast.id}
            className="toast-ferrefix-tarjeta rounded-1 shadow-lg bg-white border"
            style={{ borderLeft: `4px solid ${colorBorde}` }}
            role="status"
          >
            <div className="d-flex align-items-start gap-3 p-3">
              {/* Imagen de producto o Icono de estado */}
              {toast.imagen ? (
                <div className="toast-ferrefix-img-wrapper border rounded-1 overflow-hidden flex-shrink-0">
                  <img
                    src={toast.imagen}
                    alt=""
                    className="toast-ferrefix-img"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div
                  className="toast-ferrefix-icono rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    backgroundColor: esExito
                      ? '#e8f5e9'
                      : esPeligro
                      ? '#ffebee'
                      : '#fff8e1',
                    color: colorBorde,
                    width: 38,
                    height: 38
                  }}
                >
                  <i
                    className={`bi ${
                      esExito
                        ? 'bi-check2-circle fs-5'
                        : esPeligro
                        ? 'bi-exclamation-triangle-fill fs-5'
                        : 'bi-info-circle-fill fs-5'
                    }`}
                  ></i>
                </div>
              )}

              {/* Contenido textual */}
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <strong className="toast-ferrefix-titulo text-dark small fw-bold text-truncate">
                    {toast.titulo || (esExito ? '¡Operación Exitosa!' : 'Aviso')}
                  </strong>
                  <button
                    type="button"
                    className="btn-close btn-close-sm ms-2"
                    aria-label="Cerrar"
                    onClick={() => cerrarToast(toast.id)}
                    style={{ fontSize: '0.7rem' }}
                  ></button>
                </div>

                <p className="toast-ferrefix-mensaje text-secondary small mb-2 lh-sm">
                  {toast.mensaje}
                </p>

                {/* Botón de acción opcional (ej: Ver Carrito) */}
                {toast.link && (
                  <Link
                    to={toast.link}
                    onClick={() => cerrarToast(toast.id)}
                    className="btn btn-dark btn-sm rounded-1 px-3 py-1 text-warning fw-semibold font-monospace"
                    style={{ fontSize: '0.75rem' }}
                  >
                    {toast.linkTexto || 'Ver detalles'} →
                  </Link>
                )}
              </div>
            </div>

            {/* Barra de progreso de autodestrucción */}
            <div
              className="toast-ferrefix-progreso"
              style={{
                backgroundColor: colorBorde,
                animationDuration: `${toast.duracion || 4500}ms`
              }}
            ></div>
          </div>
        );
      })}
    </div>
  );
}
