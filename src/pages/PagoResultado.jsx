import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import BoletaCompra from '../components/BoletaCompra';
import { obtenerOrden } from '../data/ordenes';
import { useSesion } from '../data/auth';

const MENSAJES = {
  'Pago rechazado': {
    icono: 'bi-x-circle', clase: 'text-danger', titulo: 'Pago rechazado',
    texto: 'Tu banco o Webpay rechazó el pago. No se realizó ningún cargo y tu carrito sigue guardado para que lo intentes de nuevo.',
  },
  'Pago anulado': {
    icono: 'bi-slash-circle', clase: 'text-secondary', titulo: 'Pago cancelado',
    texto: 'Cancelaste el pago o se agotó el tiempo en Webpay. No se realizó ningún cargo y tu carrito sigue guardado.',
  },
  'Pendiente de pago': {
    icono: 'bi-hourglass-split', clase: 'text-warning', titulo: 'Estamos confirmando tu pago',
    texto: 'Aún no recibimos la confirmación de Webpay. Espera unos minutos y actualiza el estado. Si el cargo aparece en tu cuenta y el pedido sigue pendiente, contáctanos indicando tu número de orden.',
  },
};

function Tarjeta({ icono, clase, titulo, texto, children }) {
  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-6">
        <div className="bg-white border rounded-1 shadow-sm p-4 p-md-5 marca-centro">
          <i className={`bi ${icono} ${clase} display-4 d-block mb-3`} aria-hidden="true" />
          <h1 className="marca-titulo marca-tam-4 mb-2">{titulo}</h1>
          <p className="marca-nota mb-4">{texto}</p>
          <div className="d-flex flex-wrap gap-2 justify-content-center">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function PagoResultado() {
  const [params] = useSearchParams();
  const location = useLocation();
  const pedido = params.get('pedido');
  const sesion = useSesion();
  const volverAqui = `/login?volver=${encodeURIComponent(`${location.pathname}${location.search}`)}`;
  const [intento, setIntento] = useState(0);
  const [carga, setCarga] = useState({ cargando: Boolean(pedido), orden: null });

  useEffect(() => {
    if (!pedido) return undefined;
    let activo = true;
    obtenerOrden(pedido).then((r) => {
      if (activo) setCarga({ cargando: false, orden: r.ok ? r.orden : null });
    });
    return () => { activo = false; };
  }, [pedido, sesion, intento]);

  const actualizar = () => { setCarga((c) => ({ ...c, cargando: true })); setIntento((n) => n + 1); };
  const { cargando, orden } = carga;

  return (
    <div className="carrito-page py-4 py-lg-5">
      <div className="container">
        {cargando && <p role="status">Verificando tu pago…</p>}

        {!cargando && orden?.estado === 'Pagado' && (
          <BoletaCompra orden={orden} titulo="Pago procesado" />
        )}

        {!cargando && orden && MENSAJES[orden.estado] && (
          <Tarjeta {...MENSAJES[orden.estado]}>
            <p className="marca-fino w-100 mb-2">
              Número de orden: <span className="marca-mono">{orden.idOrden}</span>
            </p>
            {orden.estado === 'Pendiente de pago'
              ? <button type="button" className="btn btn-dark btn-sm rounded-1 px-4" onClick={actualizar}>Actualizar estado</button>
              : <Link to="/carrito" className="btn btn-ambar btn-sm marca-strong rounded-1 px-4">Volver al carrito</Link>}
            <Link to="/catalogo" className="btn btn-outline-dark btn-sm rounded-1 px-4">Seguir comprando</Link>
          </Tarjeta>
        )}

        {!cargando && !orden && (
          <Tarjeta icono="bi-exclamation-triangle" clase="text-warning" titulo="No pudimos mostrar tu pedido"
            texto="No logramos confirmar el resultado de tu pago en esta pantalla. Si iniciaste sesión, vuelve a ingresar y revisa el estado en «Mi cuenta». Si no, contáctanos con los datos de tu compra.">
            <Link to={sesion ? '/cuenta' : volverAqui} className="btn btn-dark btn-sm rounded-1 px-4">
              {sesion ? 'Ir a mi cuenta' : 'Iniciar sesión y ver pedido'}
            </Link>
            <Link to="/catalogo" className="btn btn-outline-dark btn-sm rounded-1 px-4">Seguir comprando</Link>
          </Tarjeta>
        )}
      </div>
    </div>
  );
}