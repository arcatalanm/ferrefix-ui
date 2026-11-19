import { useState } from 'react';
import EditorTiptap from './EditorTiptap';
import { guardarMaquinaria } from '../data/maquinarias';
import { subirImagenProducto } from '../data/productos';
import DescripcionProducto from './DescripcionProducto';
import ImagenProductoUploader from './ImagenProductoUploader';

const NUEVA = { nombre: '', marca: '', categoria: '', tarifaDia: '', imagen: '', incluye: '', estado: 'DISPONIBLE', descripcionDetalle: '' };

export default function EditorMaquinaria({ maquina, onNotificar, onCancelar }) {
  const id = maquina?.idMaquina; 
  const [form, setForm] = useState(() => maquina ? { ...NUEVA, ...maquina, estado: maquina.estado === 'Mantención' ? 'MANTENCION' : 'DISPONIBLE' } : { ...NUEVA });
  const [subiendo, setSubiendo] = useState(false);
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const cambiar = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));
  const guardar = async e => {
    e.preventDefault();
    if (guardando || subiendo) return;
    setError('');
    if (!form.descripcionDetalle?.trim()) { setError('Completa la descripción detallada y la ficha técnica.'); return; }
    setGuardando(true);
    try {
      let imagen = form.imagen || null;
      if (imagenArchivo) {
        imagen = await subirImagenProducto(imagenArchivo);
        cambiar('imagen', imagen);
        setImagenArchivo(null);
      }
      await guardarMaquinaria(id || null, { ...form, tarifaDia: Number(form.tarifaDia), imagen });
      onNotificar?.('Maquinaria guardada.');
    } catch (err) { setError(err.response?.data?.mensaje || err.message || 'No se pudo guardar la maquinaria.'); }
    finally { setGuardando(false); }
  };
  return <div className="pt-3">
    <form onSubmit={guardar} className="row g-3"><fieldset disabled={guardando || subiendo} className="row g-3 m-0 p-0 border-0">
      {[['nombre','Nombre'],['marca','Marca'],['categoria','Categoría'],['tarifaDia','Tarifa diaria'],['incluye','Elementos incluidos']].map(([key,label]) => <div className="col-md-6" key={key}><label className="form-label" htmlFor={`maq-${key}`}>{label}</label><input id={`maq-${key}`} className="form-control" value={form[key]} onChange={e => cambiar(key,e.target.value)} required={['nombre','marca','categoria','tarifaDia'].includes(key)} min={key === 'tarifaDia' ? 1 : undefined} step={key === 'tarifaDia' ? 1 : undefined} type={key === 'tarifaDia' ? 'number' : 'text'} /></div>)}
      <div className="col-md-6"><label className="form-label" htmlFor="maq-estado">Estado</label><select id="maq-estado" className="form-select" value={form.estado} onChange={e => cambiar('estado',e.target.value)}><option value="DISPONIBLE">Disponible</option><option value="MANTENCION">Mantención</option></select></div>
      <div className="col-12">
        <div className="form-label admin-label mb-1">Imagen de la maquinaria</div>
        <ImagenProductoUploader archivo={imagenArchivo} onSeleccionar={setImagenArchivo} onQuitar={() => setImagenArchivo(null)} imagenActual={form.imagen} nombre="la maquinaria" disabled={guardando || subiendo} />
      </div>
      <div className="col-12"><label className="form-label">Descripción detallada y ficha técnica</label><EditorTiptap value={form.descripcionDetalle} onChange={descripcionDetalle => cambiar('descripcionDetalle', descripcionDetalle)} nombreImagen={form.nombre} onSubirImagen={subirImagenProducto} onOcupadoChange={setSubiendo} disabled={guardando || subiendo} /></div>
      <div className="col-12"><h3 className="h6">Vista previa</h3><DescripcionProducto texto={form.descripcionDetalle} vacio="Escribe la descripción del equipo." /></div>
      {error && <div className="col-12"><div className="alert alert-danger">{error}</div></div>}
      <div className="col-12 d-flex justify-content-end gap-2"><button type="button" className="btn btn-outline-secondary btn-sm" disabled={guardando || subiendo} onClick={onCancelar}>Cancelar</button><button className="btn btn-ambar btn-sm" disabled={guardando || subiendo}>{guardando ? 'Guardando…' : id ? 'Guardar cambios' : 'Crear maquinaria'}</button></div>
    </fieldset></form>
  </div>;
}
