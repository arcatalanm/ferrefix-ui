import { useMemo, useState } from 'react';
import EditorTiptap from './EditorTiptap';
import DescripcionProducto from './DescripcionProducto';
import { esHtml } from '../utils/descripcionRica';
import { actualizarProducto, subirImagenProducto } from '../data/productos';
import { obtenerMensajeApi } from '../services/crearClienteApi';

export const LIMITE_DESCRIPCION = 100000;

const aHtmlInicial = texto => {
  if (!texto) return '';
  if (esHtml(texto)) return texto;
  return texto.split(/\n{2,}/).map(parrafo => `<p>${parrafo.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`).join('');
};

export default function EditorDescripcionProducto({ productos, onNotificar }) {
  const [busqueda, setBusqueda] = useState('');
  const [seleccionadoId, setSeleccionadoId] = useState(null);
  const [html, setHtml] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const seleccionado = useMemo(() => productos.find(p => p.idProducto === seleccionadoId) || null, [productos, seleccionadoId]);
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return productos.filter(p => !q || `${p.nombre} ${p.marca} ${p.idProducto}`.toLowerCase().includes(q));
  }, [productos, busqueda]);
  const seleccionar = id => {
    const producto = productos.find(p => p.idProducto === id);
    const inicial = aHtmlInicial(producto?.descripcionDetalle || '');
    setSeleccionadoId(id); setHtml(inicial); setError('');
  };
  const excedido = html.length > LIMITE_DESCRIPCION;
  const sinCambios = seleccionado && html === aHtmlInicial(seleccionado.descripcionDetalle || '');
  const subirImagen = async archivo => {
    setSubiendo(true); setError('');
    try { return await subirImagenProducto(archivo); }
    catch (err) { setError(obtenerMensajeApi(err) || err.message || 'No se pudo subir la imagen.'); return null; }
    finally { setSubiendo(false); }
  };
  const guardar = async () => {
    if (!seleccionado || excedido) return;
    setGuardando(true); setError('');
    try {
      await actualizarProducto(seleccionado.idProducto, { ...seleccionado, descripcionDetalle: html });
      onNotificar?.('Descripción guardada correctamente.');
    } catch (err) { setError(obtenerMensajeApi(err) || 'No se pudo guardar la descripción.'); }
    finally { setGuardando(false); }
  };

  return <section aria-labelledby="desc-titulo">
    <div className="mb-3"><h2 id="desc-titulo" className="h5 mb-1">Descripciones enriquecidas</h2><p className="text-muted small mb-0">Edita descripción y ficha técnica con Tiptap.</p></div>
    <div className="row g-3">
      <div className="col-lg-3"><input type="search" className="form-control form-control-sm mb-2" placeholder="Buscar producto..." aria-label="Buscar producto" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        <div className="list-group desc-lista">{filtrados.map(p => <button key={p.idProducto} type="button" className={`list-group-item list-group-item-action py-2 ${p.idProducto === seleccionadoId ? 'active' : ''}`} onClick={() => seleccionar(p.idProducto)}><div className="fw-semibold small">{p.nombre}</div><div className="small opacity-75">{p.marca} · {p.idProducto}</div></button>)}{filtrados.length === 0 && <div className="list-group-item small text-muted">Sin resultados.</div>}</div>
      </div>
      <div className="col-lg-9">{!seleccionado ? <div className="border rounded p-5 text-center text-muted">Elige un producto para editar su descripción.</div> : <>
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2"><strong>{seleccionado.nombre}</strong><span className={`small ${excedido ? 'text-danger fw-bold' : 'text-muted'}`}>{html.length} / {LIMITE_DESCRIPCION} caracteres</span></div>
        <EditorTiptap value={html} onChange={setHtml} onSubirImagen={subirImagen} nombreImagen={seleccionado.nombre} disabled={subiendo || guardando} />
        {excedido && <div className="alert alert-warning py-2 small mt-2 mb-0">La descripción supera el límite del servidor ({LIMITE_DESCRIPCION}).</div>}
        {error && <div className="alert alert-danger py-2 small mt-2 mb-0" role="alert">{error}</div>}
        <button type="button" className="btn btn-dark btn-sm mt-3" disabled={guardando || subiendo || excedido || sinCambios} onClick={guardar}>{guardando ? 'Guardando…' : 'Guardar descripción'}</button>
        <h3 className="h6 mt-4">Vista previa</h3><div className="border rounded p-3 bg-white"><DescripcionProducto texto={html} vacio="Sin contenido todavía." /></div>
      </>}</div>
    </div>
  </section>;
}
