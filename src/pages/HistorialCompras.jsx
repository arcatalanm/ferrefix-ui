import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  obtenerSesionActiva,
  EVENTO_SESION_ACTUALIZADA
} from '../data/auth';
import { obtenerOrdenes, EVENTO_ORDENES_ACTUALIZADAS } from '../data/ordenes';

const formatearCLP = (valor) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(valor || 0);

function HistorialCompras() {
  const [sesion, setSesion] = useState(obtenerSesionActiva);
  const [ordenes, setOrdenes] = useState(obtenerOrdenes);

  useEffect(() => {
    const handleSesion = () => setSesion(obtenerSesionActiva());
    const handleOrdenes = () => setOrdenes(obtenerOrdenes());

    window.addEventListener(EVENTO_SESION_ACTUALIZADA, handleSesion);
    window.addEventListener(EVENTO_ORDENES_ACTUALIZADAS, handleOrdenes);

    return () => {
      window.removeEventListener(EVENTO_SESION_ACTUALIZADA, handleSesion);
      window.removeEventListener(EVENTO_ORDENES_ACTUALIZADAS, handleOrdenes);
    };
  }, []);

  const misCompras = useMemo(() => {
    if (!sesion) return [];

    const email = String(sesion.email || '').toLowerCase().trim();

    return ordenes.filter((orden) => {
      const mismoUsuario = Boolean(
        orden.idUsuario &&
        sesion.idUsuario &&
        orden.idUsuario === sesion.idUsuario
      );
      const mismoEmail = Boolean(
        email &&
        String(orden.cliente?.email || '').toLowerCase().trim() === email
      );

      return mismoUsuario || mismoEmail;
    });
  }, [ordenes, sesion]);

  return (
    <div className="info-page py-4 py-lg-5">
      <div className="container">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb info-breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Historial de compras</li>
          </ol>
        </nav>

        <div className="brand-hero rounded-1 p-4 p-md-5 mb-4">
          <h1 className="brand-hero-title mb-2">Historial de Compras</h1>
          <p className="brand-hero-text mb-0">
            Consulta los productos que compraste anteriormente, sus montos y el estado de cada pedido.
          </p>
        </div>

        {!sesion ? (
          <div className="info-card shadow-sm p-4 p-md-5 text-center">
            <i className="bi bi-person-lock info-mini-icon mb-3 d-block"></i>
            <h2 className="info-section-title mb-2">Inicia sesión para ver tus compras</h2>
            <p className="info-text mb-4">
              Tus pedidos quedan asociados a tu cuenta. Ingresa para revisar tu historial.
            </p>
            <Link to="/login" state={{ from: '/historial-compras' }} className="btn btn-ambar rounded-1 px-4">
              Iniciar sesión
            </Link>
          </div>
        ) : misCompras.length === 0 ? (
          <div className="info-card shadow-sm p-4 p-md-5 text-center">
            <i className="bi bi-bag info-mini-icon mb-3 d-block"></i>
            <h2 className="info-section-title mb-2">Aún no registras compras</h2>
            <p className="info-text mb-4">
              Cuando realices tu primera compra, aparecerá aquí con todos sus detalles.
            </p>
            <Link to="/catalogo" className="btn btn-ambar rounded-1 px-4">
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {misCompras.map((orden) => (
              <div className="col-12" key={orden.idOrden}>
                <div className="info-card shadow-sm p-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 border-bottom pb-3 mb-3">
                    <div>
                      <h2 className="info-subtitle mb-1">Pedido #{orden.idOrden}</h2>
                      <span className="arriendos-section-sub">{orden.fecha}</span>
                    </div>
                    <div className="text-md-end">
                      <span className="badge text-bg-success mb-1">{orden.estado}</span>
                      <div className="marca-total">{formatearCLP(orden.total)}</div>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-3">
                      <thead className="table-light">
                        <tr>
                          <th>Producto</th>
                          <th className="text-center">Cantidad</th>
                          <th className="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(orden.items || []).map((item, indice) => (
                          <tr key={`${orden.idOrden}-${item.idProducto}-${indice}`}>
                            <td>{item.nombre}</td>
                            <td className="text-center">{item.cantidad}</td>
                            <td className="text-end marca-mono">
                              {formatearCLP((item.precioUnitario || 0) * (item.cantidad || 0))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="row g-2 marca-fino">
                    <div className="col-12 col-md-6">
                      <span className="marca-muted d-block">Método de pago</span>
                      <strong>{orden.metodoPago}</strong>
                    </div>
                    <div className="col-12 col-md-6">
                      <span className="marca-muted d-block">Dirección de entrega</span>
                      <strong>{orden.cliente?.direccion || '—'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 d-flex flex-wrap gap-2">
          <Link to="/catalogo" className="btn btn-outline-dark btn-sm rounded-1">
            Seguir comprando
          </Link>
          <Link to="/mis-arriendos" className="btn btn-outline-dark btn-sm rounded-1">
            Ver mis arriendos
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HistorialCompras;
