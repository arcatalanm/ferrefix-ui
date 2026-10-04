function BannerPromocional({ 
  imagen, 
  alt = 'Banner promocional', 
  enlace = '', 
  target = '_self' 
}) {
  const contenido = (
    <div className="banner-tira-wrapper position-relative mx-auto">
      <img
        src={imagen}
        alt={alt}
        className="banner-tira-img d-block w-100"
        loading="lazy"
      />
    </div>
  );

  return (
    <section className="banner-tira-seccion py-3 py-md-4">
      <div className="container">
        {enlace ? (
          <a
            href={enlace}
            target={target}
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
            className="d-block text-decoration-none banner-tira-link"
          >
            {contenido}
          </a>
        ) : (
          contenido
        )}
      </div>
    </section>
  );
}

export default BannerPromocional;