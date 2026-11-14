import { Link } from 'react-router-dom';

const formatearCLP = (valor) => new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
}).format(valor || 0);

export default function BoletaCompra({ orden, titulo }) {
  // Los precios finales ya incluyen IVA: desglosarlo no cambia el total cobrado.
  const total = Number(orden.total || 0);
  const neto = Math.round(total / 1.19);
  const iva = total - neto;

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-7">
        <div className="boleta-compra bg-white border rounded-1 shadow-sm p-4 p-md-5">

          <div className="marca-centro pb-4 border-bottom mb-4">
            <h1 className="marca-titulo marca-tam-4 mb-1">{titulo}</h1>
          </div>

          <div className="mb-4 marca-fino">
            <h2 className="marca-titulo marca-tam-5 mb-3">Detalle de la boleta</h2>
            <div className="row g-2">
              <div className="col-12 mb-2">
                <strong className="d-block marca-muted">Número de orden:</strong>
                <span className="boleta-numero marca-mono">{orden.idOrden}</span>
              </div>
              <div className="col-sm-6">
                <strong className="d-block marca-muted">Cliente:</strong>
                <span className="marca-strong">{orden.cliente.nombre}</span>
              </div>
              <div className="col-sm-6">
                <strong className="d-block marca-muted">RUT:</strong>
                <span className="marca-oscuro">{orden.cliente.rut}</span>
              </div>
              <div className="col-sm-6 mt-2">
                <strong className="d-block marca-muted">Correo:</strong>
                <span className="marca-oscuro">{orden.cliente.email}</span>
              </div>
              <div className="col-12 mt-2">
                <strong className="d-block marca-muted">Dirección de Entrega:</strong>
                <span className="marca-oscuro">{orden.cliente.direccion}</span>
              </div>
              <div className="col-sm-6 mt-2">
                <strong className="d-block marca-muted">Fecha del pedido:</strong>
                <span className="marca-oscuro">{orden.fecha}</span>
              </div>
              <div className="col-sm-6 mt-2">
                <strong className="d-block marca-muted">Método de Pago:</strong>
                <span className="marca-oscuro">{orden.metodoPago}</span>
              </div>
            </div>
          </div>

          <div className="table-responsive border rounded-1 mb-4">
            <table className="table table-sm align-middle mb-0 marca-fino">
              <thead className="table-light">
                <tr>
                  <th>Producto</th>
                  <th className="marca-centro">Cant.</th>
                  <th className="marca-derecha">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orden.items.map((it, idx) => (
                  <tr key={idx}>
                    <td>{it.nombre}</td>
                    <td className="marca-centro">{it.cantidad}</td>
                    <td className="marca-derecha marca-mono">{formatearCLP(it.precioUnitario * it.cantidad)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="boleta-importes p-3 bg-platino border rounded-1 mb-4">
            <dl className="mb-0">
              <div className="boleta-importe marca-fino">
                <dt>Productos (IVA incluido)</dt>
                <dd>{formatearCLP(orden.subtotal)}</dd>
              </div>
              <div className="boleta-importe marca-fino mb-3">
                <dt>Despacho (IVA incluido)</dt>
                <dd>{Number(orden.despacho) === 0 ? 'Gratis' : formatearCLP(orden.despacho)}</dd>
              </div>
              <div className="boleta-importe marca-fino border-top pt-3">
                <dt>Monto neto</dt>
                <dd>{formatearCLP(neto)}</dd>
              </div>
              <div className="boleta-importe marca-fino">
                <dt>IVA (19%)</dt>
                <dd>{formatearCLP(iva)}</dd>
              </div>
              <div className="boleta-importe border-top pt-3 mt-3">
                <dt className="marca-bold marca-tam-5">Total</dt>
                <dd className="marca-total">{formatearCLP(total)}</dd>
              </div>
            </dl>
          </div>

          <div className="d-flex flex-wrap gap-2 justify-content-center">
            <Link to="/catalogo" className="btn btn-ambar btn-sm marca-strong rounded-1 px-4">
              Volver al Catálogo
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}