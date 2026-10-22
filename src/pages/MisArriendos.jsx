import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  obtenerSesionActiva,
  EVENTO_SESION_ACTUALIZADA
} from '../data/auth';
import {
  obtenerContratosArriendo,
  calcularEstadoContrato,
  EVENTO_MAQUINARIAS_ACTUALIZADAS
} from '../data/maquinarias';

const formatearCLP = (valor) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(valor || 0);

const claseEstado = (estado) => {
  if (estado === 'Atrasada') return 'text-bg-danger';
  if (estado === 'Por vencer') return 'text-bg-warning';
  if (estado === 'Devuelto') return 'text-bg-secondary';
  return 'text-bg-success';
};

function MisArriendos() {
  const [sesion, setSesion] = useState(obtenerSesionActiva);
  const [contratos, setContratos] = useState(obtenerContratosArriendo);

  useEffect(() => {
    const handleSesion = () => setSesion(obtenerSesionActiva());
    const handleArriendos = () => setContratos(obtenerContratosArriendo());

    window.addEventListener(EVENTO_SESION_ACTUALIZADA, handleSesion);
    window.addEventListener(EVENTO_MAQUINARIAS_ACTUALIZADAS, handleArriendos);

    return () => {
      window.removeEventListener(EVENTO_SESION_ACTUALIZADA, handleSesion);
      window.removeEventListener(EVENTO_MAQUINARIAS_ACTUALIZADAS, handleArriendos);
    };
  }, []);

  const misContratos = useMemo(() => {
    if (!sesion) return [];

    const email = String(sesion.email || '').toLowerCase().trim();
    const rut = String(sesion.rut || '').replace(/\./g, '').toLowerCase().trim();

    return contratos.filter((contrato) => {
      const mismoUsuario = Boolean(
        contrato.idUsuario &&
        sesion.idUsuario &&
        contrato.idUsuario === sesion.idUsuario
      );
      const mismoEmail = Boolean(
        email &&
        String(contrato.usuario?.email || '').toLowerCase().trim() === email
      );
      const mismoRut = Boolean(
        rut &&
        String(contrato.usuario?.rut || '').replace(/\./g, '').toLowerCase().trim() === rut
      );

      return mismoUsuario || mismoEmail || mismoRut;
    });
  }, [contratos, sesion]);

  return (
    <div className="info-page py-4 py-lg-5">
      <div className="container">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb info-breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Mis arriendos</li>
          </ol>
        </nav>

        <div className="brand-hero rounded-1 p-4 p-md-5 mb-4">
          <h1 className="brand-hero-title mb-2">Mis Arriendos</h1>
          <p className="brand-hero-text mb-0">
            Revisa las máquinas que has arrendado, sus fechas de entrega y devolución, y el estado de cada contrato.
          </p>
        </div>

        {!sesion ? (
          <div className="info-card shadow-sm p-4 p-md-5 text-center">
            <i className="bi bi-person-lock info-mini-icon mb-3 d-block"></i>
            <h2 className="info-section-title mb-2">Inicia sesión para ver tus arriendos</h2>
            <p className="info-text mb-4">
              Los arriendos quedan asociados a tu cuenta de cliente. Ingresa para revisar tus contratos.
            </p>
            <Link to="/login" state={{ from: '/mis-arriendos' }} className="btn btn-ambar rounded-1 px-4">
              Iniciar sesión
            </Link>
          </div>
        ) : misContratos.length === 0 ? (
          <div className="info-card shadow-sm p-4 p-md-5 text-center">
            <i className="bi bi-tools info-mini-icon mb-3 d-block"></i>
            <h2 className="info-section-title mb-2">Aún no tienes arriendos registrados</h2>
            <p className="info-text mb-4">
              Explora las máquinas disponibles y arrienda el equipo que necesitas para tu próxima faena.
            </p>
            <Link to="/arriendos" className="btn btn-ambar rounded-1 px-4">
              Ver maquinaria disponible
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {misContratos.map((contrato) => {
              const estado = calcularEstadoContrato(contrato);

              return (
                <div className="col-12 col-lg-6" key={contrato.idContrato}>
                  <div className="info-card shadow-sm h-100 overflow-hidden">
                    <div className="p-4">
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <div>
                          <h2 className="info-subtitle mb-1">{contrato.nombreMaquina}</h2>
                          <div className="arriendos-section-sub">
                            Contrato #{contrato.idContrato} · {contrato.marcaMaquina}
                          </div>
                        </div>
                        <span className={`badge ${claseEstado(estado)}`}>{estado}</span>
                      </div>

                      <div className="row g-2 marca-fino mt-3">
                        <div className="col-6">
                          <span className="marca-muted d-block">Fecha de inicio</span>
                          <strong>{contrato.fechaInicio}</strong>
                        </div>
                        <div className="col-6">
                          <span className="marca-muted d-block">Fecha de devolución</span>
                          <strong>{contrato.fechaDevolucion}</strong>
                        </div>
                        <div className="col-6">
                          <span className="marca-muted d-block">Días contratados</span>
                          <strong>{contrato.diasArriendo} días</strong>
                        </div>
                        <div className="col-6">
                          <span className="marca-muted d-block">Total arriendo</span>
                          <strong>{formatearCLP(contrato.totalPagar)}</strong>
                        </div>
                        <div className="col-12">
                          <span className="marca-muted d-block">Faena</span>
                          <strong>
                            {contrato.usuario?.direccion}
                            {contrato.usuario?.comuna ? `, ${contrato.usuario.comuna}` : ''}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 d-flex flex-wrap gap-2">
          <Link to="/arriendos" className="btn btn-outline-dark btn-sm rounded-1">
            Arrendar otra máquina
          </Link>
          <Link to="/historial-compras" className="btn btn-outline-dark btn-sm rounded-1">
            Ver historial de compras
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MisArriendos;
