import { useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import DescripcionProducto from './DescripcionProducto';
import { esHtml } from '../utils/descripcionRica';
import { actualizarProducto, subirImagenProducto } from '../data/productos';
import { obtenerMensajeApi } from '../services/crearClienteApi';

// Límite actual del backend (descripcionLarga). Si el equipo lo amplía, subir este valor.
export const LIMITE_DESCRIPCION = 4000;

const aHtmlInicial = (texto) => {
  if (!texto) return '';
  if (esHtml(texto)) return texto;
  return texto.split(/\n{2,}/).map(p => `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`).join('');
};

function Boton({ activo, onClick, titulo, children, disabled }) {
  return (
    <button type="button" title={titulo} aria-label={titulo} disabled={disabled}
      className={`btn btn-sm ${activo ? 'btn-dark' : 'btn-outline-secondary'}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Toolbar({ editor, onImagen, subiendo }) {
  if (!editor) return null;
  const c = () => editor.chain().focus();
  const enlace = () => {
    const previo = editor.getAttributes('link').href || '';
    const url = window.prompt('URL del enlace (vacío para quitarlo):', previo);
    if (url === null) return;
    if (url === '') return c().extendMarkRange('link').unsetLink().run();
    c().extendMarkRange('link').setLink({ href: url }).run();
  };
  return (
    <div className="tiptap-toolbar d-flex flex-wrap gap-1 p-2 border-bottom bg-light">
      <Boton titulo="Negrita" activo={editor.isActive('bold')} onClick={() => c().toggleBold().run()}><i className="bi bi-type-bold" /></Boton>
      <Boton titulo="Cursiva" activo={editor.isActive('italic')} onClick={() => c().toggleItalic().run()}><i className="bi bi-type-italic" /></Boton>
      <Boton titulo="Título 1" activo={editor.isActive('heading', { level: 1 })} onClick={() => c().toggleHeading({ level: 1 }).run()}>H1</Boton>
      <Boton titulo="Título 2" activo={editor.isActive('heading', { level: 2 })} onClick={() => c().toggleHeading({ level: 2 }).run()}>H2</Boton>
      <Boton titulo="Título 3" activo={editor.isActive('heading', { level: 3 })} onClick={() => c().toggleHeading({ level: 3 }).run()}>H3</Boton>
      <Boton titulo="Lista con viñetas" activo={editor.isActive('bulletList')} onClick={() => c().toggleBulletList().run()}><i className="bi bi-list-ul" /></Boton>
      <Boton titulo="Lista numerada" activo={editor.isActive('orderedList')} onClick={() => c().toggleOrderedList().run()}><i className="bi bi-list-ol" /></Boton>
      <Boton titulo="Enlace" activo={editor.isActive('link')} onClick={enlace}><i className="bi bi-link-45deg" /></Boton>
      <Boton titulo="Insertar imagen" disabled={subiendo} onClick={onImagen}>
        <i className={`bi ${subiendo ? 'bi-hourglass-split' : 'bi-image'}`} />
      </Boton>
      <Boton titulo="Deshacer" disabled={!editor.can().undo()} onClick={() => c().undo().run()}><i className="bi bi-arrow-counterclockwise" /></Boton>
      <Boton titulo="Rehacer" disabled={!editor.can().redo()} onClick={() => c().redo().run()}><i className="bi bi-arrow-clockwise" /></Boton>
    </div>
  );
}

export default function EditorDescripcionProducto({ productos, onNotificar }) {
  const [busqueda, setBusqueda] = useState('');
  const [seleccionadoId, setSeleccionadoId] = useState(null);
  const [html, setHtml] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const inputImagen = useRef(null);

  const seleccionado = useMemo(
    () => productos.find(p => p.idProducto === seleccionadoId) || null,
    [productos, seleccionadoId]
  );
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return productos.filter(p => !q || `${p.nombre} ${p.marca} ${p.idProducto}`.toLowerCase().includes(q));
  }, [productos, busqueda]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ HTMLAttributes: { class: 'img-fluid' } }),
    ],
    content: '',
    onUpdate: ({ editor: e }) => setHtml(e.isEmpty ? '' : e.getHTML()),
  });

  const seleccionar = (id) => {
    const prod = productos.find(p => p.idProducto === id);
    const inicial = aHtmlInicial(prod?.descripcionLarga || '');
    editor?.commands.setContent(inicial, { emitUpdate: false });
    setSeleccionadoId(id);
    setHtml(inicial);
    setError('');
  };

  const excedido = html.length > LIMITE_DESCRIPCION;
  const sinCambios = seleccionado && html === aHtmlInicial(seleccionado.descripcionLarga || '');

  const elegirImagen = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo || !editor) return;
    setSubiendo(true); setError('');
    try {
      const url = await subirImagenProducto(archivo);
      editor.chain().focus().setImage({ src: url, alt: seleccionado?.nombre || '' }).run();
    } catch (err) {
      setError(obtenerMensajeApi(err) || err.message || 'No se pudo subir la imagen.');
    } finally {
      setSubiendo(false);
    }
  };

  const guardar = async () => {
    if (!seleccionado || excedido) return;
    setGuardando(true); setError('');
    try {
      await actualizarProducto(seleccionado.idProducto, { ...seleccionado, descripcionLarga: html });
      onNotificar?.('Descripción guardada correctamente.');
    } catch (err) {
      setError(obtenerMensajeApi(err) || 'No se pudo guardar la descripción.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section aria-labelledby="desc-titulo">
      <div className="mb-3">
        <h2 id="desc-titulo" className="h5 mb-1">Descripciones enriquecidas</h2>
        <p className="text-muted small mb-0">Selecciona un producto y edita su descripción con formato (Tiptap). Se muestra en la página de detalle.</p>
      </div>
      <div className="row g-3">
        <div className="col-lg-3">
          <input type="search" className="form-control form-control-sm mb-2" placeholder="Buscar producto..."
            aria-label="Buscar producto" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          <div className="list-group desc-lista">
            {filtrados.map(p => (
              <button key={p.idProducto} type="button"
                className={`list-group-item list-group-item-action py-2 ${p.idProducto === seleccionadoId ? 'active' : ''}`}
                onClick={() => seleccionar(p.idProducto)}>
                <div className="fw-semibold small">{p.nombre}</div>
                <div className="small opacity-75">{p.marca} · {p.idProducto}</div>
              </button>
            ))}
            {filtrados.length === 0 && <div className="list-group-item small text-muted">Sin resultados.</div>}
          </div>
        </div>

        <div className="col-lg-9">
          {!seleccionado ? (
            <div className="border rounded p-5 text-center text-muted">Elige un producto de la lista para editar su descripción.</div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                <strong>{seleccionado.nombre}</strong>
                <span className={`small ${excedido ? 'text-danger fw-bold' : 'text-muted'}`}>
                  {html.length} / {LIMITE_DESCRIPCION} caracteres
                </span>
              </div>
              <div className="border rounded bg-white">
                <Toolbar editor={editor} subiendo={subiendo} onImagen={() => inputImagen.current?.click()} />
                <EditorContent editor={editor} className="tiptap-wrapper" />
              </div>
              <input ref={inputImagen} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={elegirImagen} />
              {excedido && <div className="alert alert-warning py-2 small mt-2 mb-0">La descripción supera el límite actual del servidor ({LIMITE_DESCRIPCION}). Reduce el contenido.</div>}
              {error && <div className="alert alert-danger py-2 small mt-2 mb-0" role="alert">{error}</div>}
              <div className="d-flex gap-2 mt-3">
                <button type="button" className="btn btn-dark btn-sm" disabled={guardando || excedido || sinCambios} onClick={guardar}>
                  {guardando ? 'Guardando...' : 'Guardar descripción'}
                </button>
              </div>
              <h3 className="h6 mt-4">Vista previa (como la ve el cliente)</h3>
              <div className="border rounded p-3 bg-white">
                <DescripcionProducto texto={html} vacio="Sin contenido todavía." />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
