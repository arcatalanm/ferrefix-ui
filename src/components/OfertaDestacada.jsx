import { Link } from 'react-router-dom';

function OfertaDestacada({
  img1, link1,
  img2, link2,
  img3, link3,
  img4, link4,
}) {
  return (
    <section className="oferta-destacada container my-4">
      <div className="row g-3 oferta-fila">

        <div className="col-6 col-md-3 oferta-col oferta-col-1">
          <Link to={link1} className="oferta-link">
            <img src={img1} alt="Oferta 1" className="oferta-img oferta-img-1" />
          </Link>
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

        <div className="col-6 col-md-3 oferta-col oferta-col-4">
          <Link to={link4} className="oferta-link">
            <img src={img4} alt="Oferta 4" className="oferta-img oferta-img-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OfertaDestacada;
