const pasos = [
  ['carrito', 'Carro de compras', 'Revisa tus productos'],
  ['sesion', 'Inicio de sesión', 'Ingresa a tu cuenta'],
  ['entrega', 'Entrega', 'Elige dónde recibir tu compra'],
  ['pago', 'Pago', 'Elige cómo vas a pagar'],
  ['exito', '¡Listo!', 'Revisa el detalle de tu compra'],
];

export default function ProgresoCompra({ pasoActual, onVolver, bloqueado = false }) {
  const actual = pasos.findIndex(([id]) => id === pasoActual);
  return (
    <nav className="compra-progreso" aria-label="Progreso de la compra">
      <ol>
        {pasos.map(([id, titulo, descripcion], indice) => (
          <li key={id} className={indice === actual ? 'es-actual' : indice < actual ? 'es-completo' : ''}
            aria-current={indice === actual ? 'step' : undefined}>
            <button type="button" disabled={bloqueado || !onVolver || indice >= actual}
              onClick={() => onVolver(id)}>
              <span className="compra-paso-numero" aria-hidden="true">
                {indice < actual ? <i className="bi bi-check-lg" /> : indice + 1}
              </span>
              <span className="compra-paso-titulo">{titulo}</span>
              <span className="compra-paso-descripcion">{descripcion}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
