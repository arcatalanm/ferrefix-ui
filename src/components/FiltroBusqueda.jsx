import { useState } from 'react';

const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

// Cada sección es opcional: la página solo pasa las que tiene (ver Catálogo y Arriendos).
//   busqueda:       { valor, onChange, placeholder, etiqueta }
//   categorias:     { opciones: [{valor, cantidad}], seleccionada, onChange, titulo }
//   precio:         { min, max, valorMin, valorMax, onChange(min, max), titulo }
//   marcas:         { opciones: [{valor, cantidad}], seleccionadas, onChange, titulo }
//   disponibilidad: { activo, onChange, etiqueta }
function FiltroBusqueda({ titulo = 'Filtros de búsqueda', busqueda, categorias, precio, marcas, disponibilidad, hayFiltros, onLimpiar }) {
  const [abierto, setAbierto] = useState(false);
  const [minLocal, setMinLocal] = useState(precio?.valorMin ?? '');
  const [maxLocal, setMaxLocal] = useState(precio?.valorMax ?? '');
  // Si los filtros cambian desde fuera (por ejemplo "Limpiar todo"), los campos se sincronizan.
  const [previo, setPrevio] = useState([precio?.valorMin, precio?.valorMax]);
  if (previo[0] !== precio?.valorMin || previo[1] !== precio?.valorMax) {
    setPrevio([precio?.valorMin, precio?.valorMax]);
    setMinLocal(precio?.valorMin ?? '');
    setMaxLocal(precio?.valorMax ?? '');
  }

  const aplicarPrecio = (e) => {
    e.preventDefault();
    const min = minLocal === '' ? null : Math.max(0, Number(minLocal));
    const max = maxLocal === '' ? null : Math.max(0, Number(maxLocal));
    precio.onChange(min, max !== null && min !== null && max < min ? min : max);
  };

  const alternarMarca = (valor) => {
    const actuales = marcas.seleccionadas;
    marcas.onChange(actuales.includes(valor) ? actuales.filter((m) => m !== valor) : [...actuales, valor]);
  };

  return (
    <aside className="filtro-busqueda" aria-label={titulo}>
      <button type="button" className="filtro-toggle btn btn-outline-dark w-100 d-lg-none mb-2"
        aria-expanded={abierto} aria-controls="filtro-contenido" onClick={() => setAbierto(!abierto)}>
        <i className="bi bi-funnel me-2" aria-hidden="true"></i>{abierto ? 'Ocultar filtros' : 'Mostrar filtros'}
      </button>

      <div id="filtro-contenido" className={`filtro-panel ${abierto ? 'filtro-panel--abierto' : ''}`}>
        <div className="filtro-cabecera d-flex justify-content-between align-items-center">
          <h2 className="filtro-titulo mb-0"><i className="bi bi-funnel me-2" aria-hidden="true"></i>{titulo}</h2>
          {hayFiltros && <button type="button" className="filtro-limpiar" onClick={onLimpiar}>Limpiar todo</button>}
        </div>

        {busqueda && (
          <section className="filtro-seccion">
            <label htmlFor="filtro-buscar" className="filtro-etiqueta">{busqueda.etiqueta || 'Buscar'}</label>
            <div className="filtro-buscar">
              <i className="bi bi-search" aria-hidden="true"></i>
              <input id="filtro-buscar" type="search" className="form-control" value={busqueda.valor}
                placeholder={busqueda.placeholder} onChange={(e) => busqueda.onChange(e.target.value)} />
            </div>
          </section>
        )}

        {categorias && categorias.opciones.length > 0 && (
          <section className="filtro-seccion">
            <h3 className="filtro-etiqueta">{categorias.titulo || 'Categorías'}</h3>
            <ul className="filtro-lista list-unstyled mb-0">
              {categorias.opciones.map(({ valor, cantidad }) => {
                const activa = categorias.seleccionada.toLowerCase() === valor.toLowerCase();
                return (
                  <li key={valor}>
                    <button type="button" aria-pressed={activa}
                      className={`filtro-categoria ${activa ? 'filtro-categoria--activa' : ''}`}
                      onClick={() => categorias.onChange(activa ? '' : valor)}>
                      <span>{valor}</span>
                      {cantidad !== undefined && <span className="filtro-cantidad">{cantidad}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {disponibilidad && (
          <section className="filtro-seccion">
            <h3 className="filtro-etiqueta">Disponibilidad</h3>
            <div className="form-check">
              <input id="filtro-disp" type="checkbox" className="form-check-input" checked={disponibilidad.activo}
                onChange={(e) => disponibilidad.onChange(e.target.checked)} />
              <label htmlFor="filtro-disp" className="form-check-label">{disponibilidad.etiqueta || 'Solo disponibles'}</label>
            </div>
          </section>
        )}

        {precio && precio.max > 0 && (
          <section className="filtro-seccion">
            <h3 className="filtro-etiqueta">{precio.titulo || 'Precio'}</h3>
            <p className="filtro-ayuda mb-2">Entre {CLP.format(precio.min)} y {CLP.format(precio.max)}</p>
            <form className="filtro-precio" onSubmit={aplicarPrecio}>
              <input type="number" min="0" inputMode="numeric" className="form-control form-control-sm" aria-label="Precio mínimo"
                placeholder="Mín." value={minLocal} onChange={(e) => setMinLocal(e.target.value)} />
              <span aria-hidden="true">a</span>
              <input type="number" min="0" inputMode="numeric" className="form-control form-control-sm" aria-label="Precio máximo"
                placeholder="Máx." value={maxLocal} onChange={(e) => setMaxLocal(e.target.value)} />
              <button type="submit" className="btn btn-dark btn-sm">OK</button>
            </form>
          </section>
        )}

        {marcas && marcas.opciones.length > 0 && (
          <section className="filtro-seccion">
            <h3 className="filtro-etiqueta">{marcas.titulo || 'Marcas'}</h3>
            <ul className="filtro-lista list-unstyled mb-0">
              {marcas.opciones.map(({ valor, cantidad }) => (
                <li key={valor} className="form-check d-flex justify-content-between align-items-center">
                  <span>
                    <input id={`filtro-marca-${valor}`} type="checkbox" className="form-check-input"
                      checked={marcas.seleccionadas.includes(valor)} onChange={() => alternarMarca(valor)} />
                    <label htmlFor={`filtro-marca-${valor}`} className="form-check-label ms-1">{valor}</label>
                  </span>
                  <span className="filtro-cantidad">{cantidad}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </aside>
  );
}

export default FiltroBusqueda;
