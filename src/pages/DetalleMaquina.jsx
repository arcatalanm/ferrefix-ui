import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EspacioImagen from '../components/EspacioImagen';
import DescripcionProducto from '../components/DescripcionProducto';
import { obtenerDescripcionMaquina } from '../data/descripcionesMaquina';
import { obtenerMaquinarias, EVENTO_MAQUINARIAS_ACTUALIZADAS, useEstadoArriendos } from '../data/maquinarias';

const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

function DetalleMaquina() {
  const { id } = useParams();
  const navigate = useNavigate();
  const estado = useEstadoArriendos();
  const [maquinas, setMaquinas] = useState(obtenerMaquinarias);

  useEffect(() => {
    const actualizar = () => setMaquinas(obtenerMaquinarias());
    window.addEventListener(EVENTO_MAQUINARIAS_ACTUALIZADAS, actualizar);
    return () => window.removeEventListener(EVENTO_MAQUINARIAS_ACTUALIZADAS, actualizar);
  }, []);

  const maquina = maquinas.find((m) => m.idMaquina === id);
  // "Cargando" hasta que termine la primera carga, para no mostrar "no encontrada" por un instante
  const [vioCarga, setVioCarga] = useState(false);
  if (estado.cargandoMaquinas && !vioCarga) setVioCarga(true);
  const cargando = maquinas.length === 0 && !estado.errorMaquinas && (!vioCarga || estado.cargandoMaquinas);

  if (!maquina) {
    return (
      <div className="arriendos-page py-5">
        <div className="container text-center">
          <h1 className="h3 mb-3">{cargando ? 'Cargando maquinaria…' : 'No encontramos esta maquinaria'}</h1>
          {!cargando && <Link to="/arriendos" className="btn btn-ambar">Volver a arriendos</Link>}
        </div>
      </div>
    );
  }

  const disponible = maquina.estado === 'Disponible';
  const especificaciones = Object.entries(maquina.especificaciones || {});
  const descripcion = maquina.descripcionDetalle || obtenerDescripcionMaquina(maquina.idMaquina);
  const incluye = (maquina.incluye || '').split(/,\s*|\sy\s/).map((t) => t.trim()).filter(Boolean);

  return (
    <div className="arriendos-page py-4 py-lg-5">
      <div className="container">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb arriendos-breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
            <li className="breadcrumb-item"><Link to="/arriendos">Arriendo de Maquinaria</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{maquina.nombre}</li>
          </ol>
        </nav>

        <div className="row g-4">
          <div className="col-12 col-md-6">
            <EspacioImagen src={maquina.imagen} alt={`${maquina.nombre} - ${maquina.marca}`} proporcion="4x3"
              icono="bi-tools" etiqueta="Imagen no disponible" className="maq-detalle-imagen" />
          </div>

          <div className="col-12 col-md-6">
            <h1 className="maq-detalle-titulo">{maquina.nombre}</h1>
            <p className="maq-fila-marca">{maquina.marca}</p>

            <div className="maq-detalle-tarifa">
              <span className="maq-fila-tarifa-label">Tarifa por día</span>
              <span className="maq-fila-tarifa-valor">{CLP.format(maquina.tarifaDia || 0)}</span>
              {!disponible && <span className="maq-fila-estado">{maquina.estado}</span>}
            </div>

            <div className="d-flex flex-wrap gap-2 mt-3">
              <button type="button" className={`btn ${disponible ? 'btn-ambar' : 'btn-outline-secondary'} px-4`} disabled={!disponible}
                onClick={() => navigate('/arriendos', { state: { arrendar: maquina.idMaquina } })}>
                {disponible ? 'Arrendar' : 'No disponible'}
              </button>
              <Link to="/arriendos" className="btn btn-outline-dark">Volver al listado</Link>
            </div>

            {incluye.length > 0 && (
              <section className="mt-4">
                <h2 className="maq-detalle-subtitulo">Incluye</h2>
                <ul className="maq-detalle-incluye">{incluye.map((t) => <li key={t}>{t}</li>)}</ul>
              </section>
            )}
          </div>
        </div>

        {descripcion && (
          <section className="maq-detalle-seccion mt-4" aria-labelledby="maq-descripcion-titulo">
            <h2 id="maq-descripcion-titulo" className="maq-detalle-subtitulo">Descripción</h2>
            <DescripcionProducto texto={descripcion} />
          </section>
        )}

        {especificaciones.length > 0 && (
          <section className="maq-detalle-seccion mt-4">
            <h2 className="maq-detalle-subtitulo">Ficha técnica</h2>
            <table className="table maq-detalle-tabla mb-0">
              <tbody>
                {especificaciones.map(([clave, valor]) => (
                  <tr key={clave}><th scope="row">{clave}</th><td>{valor}</td></tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}

export default DetalleMaquina;
