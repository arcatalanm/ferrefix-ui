import { MAX_DETALLES_TECNICOS } from '../utils/fichaTecnica';

export default function EditorFichaTecnica({ filas, onChange, errores, disabled }) {
  const actualizar = (id, campo, valor) => onChange(filas.map(fila => fila.id === id ? { ...fila, [campo]: valor } : fila));

  return (
    <fieldset className="admin-ficha-tecnica border-top pt-3" disabled={disabled}>
      <legend className="admin-label float-none w-auto mb-1">Ficha técnica</legend>
      <p className="marca-nota mb-3">Agrega las características propias de este producto, como peso, potencia, medidas o material.</p>
      {filas.length === 0 && <p className="marca-nota">Este producto todavía no tiene detalles técnicos.</p>}
      <div className="d-grid gap-2">
        {filas.map((fila, indice) => (
          <div className="admin-ficha-fila" key={fila.id}>
            <div>
              <label className="form-label admin-label mb-1" htmlFor={`atributo-${fila.id}`}>Atributo {indice + 1}</label>
              <input id={`atributo-${fila.id}`} type="text" maxLength={120} placeholder="Ej.: Peso"
                className={`form-control form-control-sm rounded-1${errores[fila.id]?.atributo ? ' is-invalid' : ''}`}
                value={fila.atributo} onChange={e => actualizar(fila.id, 'atributo', e.target.value)}
                aria-invalid={Boolean(errores[fila.id]?.atributo)} aria-describedby={errores[fila.id]?.atributo ? `error-atributo-${fila.id}` : undefined} />
              {errores[fila.id]?.atributo && <div id={`error-atributo-${fila.id}`} className="invalid-feedback">{errores[fila.id].atributo}</div>}
            </div>
            <div>
              <label className="form-label admin-label mb-1" htmlFor={`valor-${fila.id}`}>Valor {indice + 1}</label>
              <input id={`valor-${fila.id}`} type="text" maxLength={500} placeholder="Ej.: 2,5 kg"
                className={`form-control form-control-sm rounded-1${errores[fila.id]?.valor ? ' is-invalid' : ''}`}
                value={fila.valor} onChange={e => actualizar(fila.id, 'valor', e.target.value)}
                aria-invalid={Boolean(errores[fila.id]?.valor)} aria-describedby={errores[fila.id]?.valor ? `error-valor-${fila.id}` : undefined} />
              {errores[fila.id]?.valor && <div id={`error-valor-${fila.id}`} className="invalid-feedback">{errores[fila.id].valor}</div>}
            </div>
            <button type="button" className="btn btn-sm btn-outline-danger admin-ficha-quitar"
              aria-label={`Quitar detalle ${indice + 1}${fila.atributo ? `: ${fila.atributo}` : ''}`}
              onClick={() => onChange(filas.filter(detalle => detalle.id !== fila.id))}>
              <i className="bi bi-trash3" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <div className="d-flex flex-wrap align-items-center gap-3 mt-3">
        <button type="button" className="btn btn-sm btn-outline-dark rounded-1"
          disabled={filas.length >= MAX_DETALLES_TECNICOS}
          onClick={() => onChange([...filas, { id: crypto.randomUUID(), atributo: '', valor: '' }])}>
          <i className="bi bi-plus-lg me-2" aria-hidden="true" />Agregar detalle técnico
        </button>
        <span className="marca-nota">{filas.length} de {MAX_DETALLES_TECNICOS} detalles</span>
      </div>
    </fieldset>
  );
}
