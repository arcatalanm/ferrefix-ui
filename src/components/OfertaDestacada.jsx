import { Link } from 'react-router-dom';
import { useState } from 'react';

function TarjetaOferta({ oferta, posicion }) {
  const [usarRespaldo, setUsarRespaldo] = useState(false);
  return (
    <Link to={usarRespaldo ? oferta.linkRespaldo || oferta.link : oferta.link} className="oferta-link">
      <img
        src={usarRespaldo ? oferta.imgRespaldo : oferta.img}
        alt={(usarRespaldo ? oferta.altRespaldo : oferta.alt) || 'Oferta destacada'}
        className={`oferta-img oferta-img-${posicion}`}
        onError={() => {
          if (oferta.imgRespaldo && !usarRespaldo) setUsarRespaldo(true);
        }}
      />
    </Link>
  );
}

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
              <TarjetaOferta key={oferta.img} oferta={oferta} posicion={posicion} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default OfertaDestacada;
