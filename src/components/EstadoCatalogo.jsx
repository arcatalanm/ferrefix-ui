import { cargarProductos, useEstadoCatalogo } from '../data/productos';

export default function EstadoCatalogo() {
  const { cargando, error } = useEstadoCatalogo();
  if (cargando) return <div className="container py-3" role="status">Cargando catálogo…</div>;
  if (!error) return null;
  return <div className="container py-3"><div className="alert alert-warning" role="alert">
    No se pudo actualizar el catálogo: {error}
    <button className="btn btn-sm btn-outline-dark ms-3" onClick={() => cargarProductos()}>Reintentar</button>
  </div></div>;
}
