import { useState } from 'react';

export default function SelectorCantidad({ id, cantidad, maximo, onChange, disabled = false, etiqueta = 'Cantidad', describedBy }) {
  const [edicion, setEdicion] = useState(null);
  const limite = Math.max(1, Number(maximo) || 1);
  const valor = edicion?.base === cantidad ? edicion.valor : String(cantidad);
  const normalizar = valor => Math.min(limite, Math.max(1, Number(valor) || 1));
  const confirmar = valor => {
    const nuevaCantidad = normalizar(valor);
    setEdicion(null);
    if (nuevaCantidad !== cantidad) onChange(nuevaCantidad);
  };

  return (
    <div className="selector-cantidad" style={{ '--cantidad-digitos': Math.max(3, String(limite).length, valor.length) }}>
      <button type="button" aria-label="Restar una unidad" disabled={disabled || cantidad <= 1}
        onClick={() => confirmar(cantidad - 1)}>−</button>
      <input id={id} type="text" inputMode="numeric" pattern="[0-9]*"
        aria-label={etiqueta} aria-describedby={describedBy}
        value={valor} disabled={disabled} autoComplete="off"
        onChange={event => {
          if (/^\d*$/.test(event.target.value)) setEdicion({ base: cantidad, valor: event.target.value });
        }}
        onBlur={() => confirmar(valor)}
        onKeyDown={event => {
          if (event.key === 'Enter') { event.preventDefault(); confirmar(valor); }
          if (event.key === 'Escape') setEdicion(null);
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            confirmar(normalizar(valor) + (event.key === 'ArrowUp' ? 1 : -1));
          }
        }} />
      <button type="button" aria-label="Sumar una unidad" disabled={disabled || cantidad >= limite}
        onClick={() => confirmar(cantidad + 1)}>+</button>
    </div>
  );
}
