import { Link } from 'react-router-dom';

const precio = valor => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(valor);

export default function ResumenCompra({ items, totales, inicial = false, children }) {
  return (
    <aside className="compra-resumen" aria-labelledby="resumen-compra-titulo">
      <h2 id="resumen-compra-titulo" className="marca-titulo marca-tam-3 mb-3">Resumen de la compra</h2>
      <div className="compra-resumen-card">
        <div className="compra-resumen-importes">
          <details className="compra-resumen-productos">
            <summary><span>Productos ({totales.totalArticulos})</span><strong>{precio(totales.subtotal)}</strong><i className="bi bi-chevron-down" aria-hidden="true" /></summary>
            <ul>{items.map(item => <li key={item.idProducto}><span>{item.cantidad} × {item.nombre}</span><span>{precio(item.precioVenta * item.cantidad)}</span></li>)}</ul>
          </details>
          <div className="compra-resumen-linea"><span>Envío estimado</span><strong>{totales.despacho === 0 ? 'Gratis' : precio(totales.despacho)}</strong></div>
          <div className="compra-resumen-linea compra-resumen-total"><span>Total estimado</span><strong>{precio(totales.total)}</strong></div>
          <p className="marca-nota mb-0">Precios con IVA incluido.</p>
        </div>
        <div className="compra-resumen-acciones">
          {children}
          <p className="compra-envio-nota"><i className="bi bi-info-circle" aria-hidden="true" />{inicial ? 'Revisa los datos de entrega en el siguiente paso. El envío se confirmará al registrar el pedido.' : 'El total definitivo se confirma al registrar tu pedido.'}</p>
          <Link to="/catalogo" className="compra-seguir">Seguir comprando</Link>
        </div>
      </div>
    </aside>
  );
}
