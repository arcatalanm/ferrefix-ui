import { Link } from 'react-router-dom';

function OfertaDestacada({
  titulo,
  img2, link2,
  img3, link3,
  img4, link4,
  img5, link5,
  img6, link6,
  img7, link7,
}) {
  return (
    <section className="oferta-destacada container my-4">
      <div className="row g-3 oferta-fila">
        <div className="oferta-titulo">
            <h2 className="oferta-titulo-texto">{titulo}</h2>
            <span className="oferta-titulo-barra"></span>
        </div>

        <div className="col-6 col-md-3 oferta-col oferta-col-2">
          <Link to={link2} className="oferta-link">
            <img src={img2} alt="Oferta 2" className="oferta-img oferta-img-2" />
          </Link>
        </div>

        <div className="col-6 col-md-3 oferta-col oferta-col-3">
          <Link to={link3} className="oferta-link">
            <img src={img3} alt="Oferta 3" className="oferta-img oferta-img-3" />
          </Link>
        </div>

        <div className="col-12 col-md-6 oferta-col oferta-col-4">
          <Link to={link4} className="oferta-link">
            <img src={img4} alt="Oferta 4" className="oferta-img oferta-img-4" />
          </Link>
        </div>

        <div className="col-12 col-md-6 oferta-col oferta-col-5">
          <Link to={link5} className="oferta-link">
            <img src={img5} alt="Oferta 5" className="oferta-img oferta-img-5" />
          </Link>
        </div>

        <div className="col-6 col-md-3 oferta-col oferta-col-6">
          <Link to={link6} className="oferta-link">
            <img src={img6} alt="Oferta 6" className="oferta-img oferta-img-6" />
          </Link>
        </div>

        <div className="col-6 col-md-3 oferta-col oferta-col-7">
          <Link to={link7} className="oferta-link">
            <img src={img7} alt="Oferta 7" className="oferta-img oferta-img-7" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OfertaDestacada;