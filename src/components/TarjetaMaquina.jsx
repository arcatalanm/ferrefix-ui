import { Link } from 'react-router-dom';
import EspacioImagen from './EspacioImagen';

const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

// Tarjeta en fila para el listado de arriendos: imagen, datos y tarifa con acciones.
function TarjetaMaquina({ maquina, onArrendar }) {
  const disponible = maquina.estado === 'Disponible';
  const especificaciones = Object.entries(maquina.especificaciones || {}).slice(0, 3);
  const ruta = `/arriendos/${encodeURIComponent(maquina.idMaquina)}`;

  return (
    <article className={`maq-fila ${disponible ? '' : 'maq-fila--no-disponible'}`}>
      <Link to={ruta} className="maq-fila-imagen" aria-label={`Ver ficha técnica de ${maquina.nombre}`}>
        <EspacioImagen src={maquina.imagen} alt={`${maquina.nombre} - ${maquina.marca}`} proporcion="4x3"
          icono="bi-tools" etiqueta="Imagen no disponible" />
      </Link>

      <div className="maq-fila-datos">
        <div className="maq-fila-meta">
          <span className="maq-fila-categoria">{maquina.categoria}</span>
          <span className="maq-fila-codigo">cód: {maquina.idMaquina}</span>
        </div>
        <h3 className="maq-fila-nombre"><Link to={ruta}>{maquina.nombre}</Link></h3>
        <p className="maq-fila-marca">{maquina.marca}</p>
        {maquina.incluye && <p className="maq-fila-incluye"><strong>Incluye:</strong> {maquina.incluye}</p>}
        {especificaciones.length > 0 && (
          <dl className="maq-fila-specs">
            {especificaciones.map(([clave, valor]) => (
              <div key={clave}><dt>{clave}</dt><dd>{valor}</dd></div>
            ))}
          </dl>
        )}
      </div>

      <div className="maq-fila-tarifa">
        <span className="maq-fila-tarifa-label">Tarifa por día</span>
        <span className="maq-fila-tarifa-valor">{CLP.format(maquina.tarifaDia || 0)}</span>
        {!disponible && <span className="maq-fila-estado">{maquina.estado}</span>}
        <button type="button" className={`btn ${disponible ? 'btn-ambar' : 'btn-outline-secondary'} w-100`}
          disabled={!disponible} onClick={() => onArrendar(maquina)}>
          {disponible ? 'Arrendar' : 'No disponible'}
        </button>
        <Link to={ruta} className="btn btn-outline-dark w-100">Ver ficha técnica</Link>
      </div>
    </article>
  );
}

export default TarjetaMaquina;
