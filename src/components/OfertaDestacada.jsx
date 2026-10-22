import { Link } from 'react-router-dom';

/**
 * Grilla de ofertas destacadas.
 *
 * Acepta cualquier cantidad de ofertas: en escritorio se acomodan de a 4 por
 * fila (col-md-3) y en móvil de a 2 (col-6), por lo que una quinta oferta o
 * posteriores bajan automáticamente a la fila siguiente.
 */
function OfertaDestacada({ ofertas = [] }) {
  if (!ofertas.length) return null;

  return (
    <section className="oferta-destacada container my-4">
      <div className="row g-3 oferta-fila">
        {ofertas.map((oferta, indice) => {
          const posicion = (indice % 4) + 1;

          return (
            <div
              key={`${oferta.link}-${indice}`}
              className={`col-6 col-md-3 oferta-col oferta-col-${posicion}`}
            >
              <Link to={oferta.link} className="oferta-link">
                <img
                  src={oferta.img}
                  alt={oferta.alt || `Oferta destacada ${indice + 1}`}
                  className={`oferta-img oferta-img-${posicion}`}
                />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default OfertaDestacada;
