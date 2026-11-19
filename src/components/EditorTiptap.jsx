import { useEffect, useRef, useState } from 'react';
import { EditorContent, Extension, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

const Alineacion = Extension.create({
  name: 'alineacion',
  addGlobalAttributes() {
    return [{ types: ['heading', 'paragraph'], attributes: { textAlign: {
      default: null,
      parseHTML: element => ['left', 'center', 'right', 'justify'].includes(element.style.textAlign) ? element.style.textAlign : null,
      renderHTML: attributes => attributes.textAlign ? { style: `text-align: ${attributes.textAlign}` } : {},
    } } }];
  },
});

export default function EditorTiptap({ value = '', onChange, onSubirImagen, nombreImagen = 'Contenido', onOcupadoChange, disabled = false }) {
  const input = useRef(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const editor = useEditor({
    extensions: [StarterKit.configure({ link: { openOnClick: false } }), Alineacion, Image.configure({ HTMLAttributes: { class: 'img-fluid' } })],
    content: value,
    editable: !disabled,
    editorProps: { attributes: { role: 'textbox', 'aria-label': 'Descripción detallada y ficha técnica', 'aria-multiline': 'true' } },
    onUpdate: ({ editor: e }) => onChange?.(e.isEmpty ? '' : e.getHTML()),
  });
  useEditorState({ editor, selector: ({ editor: e }) => e ? { marks: e.state.storedMarks, selection: e.state.selection, doc: e.state.doc } : null });
  useEffect(() => { if (editor && value !== editor.getHTML()) editor.commands.setContent(value || '', { emitUpdate: false }); }, [editor, value]);
  useEffect(() => { editor?.setEditable(!disabled && !subiendo); }, [disabled, subiendo, editor]);
  const c = () => editor?.chain().focus();
  const bloqueado = disabled || subiendo || !editor;
  const seleccionarImagen = () => input.current?.click();
  const enlace = () => {
    const url = window.prompt('URL del enlace:', editor?.getAttributes('link').href || '');
    if (url === null) return;
    if (!url.trim()) c()?.extendMarkRange('link').unsetLink().run();
    else c()?.extendMarkRange('link').setLink({ href: url.trim() }).run();
  };
  const imagen = async event => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || !onSubirImagen) return;
    setSubiendo(true); onOcupadoChange?.(true); setError('');
    try { const url = await onSubirImagen(file); if (url) c()?.setImage({ src: url, alt: nombreImagen }).run(); }
    catch (err) { setError(err.response?.data?.mensaje || err.message || 'No se pudo subir la imagen.'); }
    finally { setSubiendo(false); onOcupadoChange?.(false); }
  };
  const boton = (label, icon, action, active = false, disponible = true) => <button key={label} type="button" className={`editor-tool ${active ? 'is-active' : ''}`} aria-label={label} title={label} aria-pressed={active} disabled={bloqueado || !disponible} onMouseDown={e => e.preventDefault()} onClick={action}><i className={`bi bi-${icon}`} aria-hidden="true" /></button>;
  return <div className="editor-rico">
    <div className="tiptap-toolbar" role="toolbar" aria-label="Formato del texto">
      <select className="editor-block-select" aria-label="Formato de párrafo" disabled={bloqueado} value={editor?.isActive('heading', { level: 2 }) ? 'h2' : editor?.isActive('heading', { level: 3 }) ? 'h3' : 'p'} onChange={e => e.target.value === 'p' ? c()?.setParagraph().run() : c()?.setHeading({ level: Number(e.target.value.slice(1)) }).run()}><option value="p">Texto</option><option value="h2">Título</option><option value="h3">Subtítulo</option></select>
      {boton('Negrita', 'type-bold', () => c()?.toggleBold().run(), editor?.isActive('bold'))}
      {boton('Cursiva', 'type-italic', () => c()?.toggleItalic().run(), editor?.isActive('italic'))}
      {boton('Tachado', 'type-strikethrough', () => c()?.toggleStrike().run(), editor?.isActive('strike'))}
      {boton('Subrayado', 'type-underline', () => c()?.toggleUnderline().run(), editor?.isActive('underline'))}
      <span className="editor-separator" />
      {boton('Lista', 'list-ul', () => c()?.toggleBulletList().run(), editor?.isActive('bulletList'))}
      {boton('Lista numerada', 'list-ol', () => c()?.toggleOrderedList().run(), editor?.isActive('orderedList'))}
      {boton('Reducir sangría', 'text-indent-left', () => c()?.liftListItem('listItem').run(), false, editor?.can().liftListItem('listItem'))}
      {boton('Aumentar sangría', 'text-indent-right', () => c()?.sinkListItem('listItem').run(), false, editor?.can().sinkListItem('listItem'))}
      <span className="editor-separator" />
      {['left', 'center', 'right', 'justify'].map((align, i) => boton(['Alinear a la izquierda', 'Centrar', 'Alinear a la derecha', 'Justificar'][i], `text-${align}`, () => c()?.updateAttributes('paragraph', { textAlign: align }).updateAttributes('heading', { textAlign: align }).run(), editor?.isActive({ textAlign: align }) || (align === 'left' && !editor?.getAttributes('paragraph').textAlign && !editor?.getAttributes('heading').textAlign)))}
      <span className="editor-separator" />
      {boton('Enlace', 'link-45deg', enlace, editor?.isActive('link'))}
      {boton('Limpiar formato', 'eraser', () => c()?.unsetAllMarks().clearNodes().run())}
      {onSubirImagen && <button type="button" className="editor-tool" aria-label="Imagen" title="Imagen" disabled={bloqueado} onMouseDown={e => e.preventDefault()} onClick={seleccionarImagen}><i className="bi bi-image" aria-hidden="true" /></button>}
      <span className="editor-separator" />
      {boton('Deshacer', 'arrow-counterclockwise', () => c()?.undo().run(), false, editor?.can().undo())}
      {boton('Rehacer', 'arrow-clockwise', () => c()?.redo().run(), false, editor?.can().redo())}
      {onSubirImagen && <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={imagen} />}
    </div>
    <EditorContent editor={editor} className="tiptap-wrapper" />
    {subiendo && <div className="editor-status" role="status">Subiendo imagen…</div>}
    {error && <div className="alert alert-danger m-2 py-2" role="alert">{error}</div>}
  </div>;
}
