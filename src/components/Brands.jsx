function Brands() {
  return (
    <section className="py-5">
      <div className="container">

        {/* Encabezado */}
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-1">
            Marcas destacadas
          </h2>
          <p className="mb-0">
            Todo lo que necesitas para tus proyectos con las mejores marcas.
          </p>
        </div>

        {/* Contenedor Marcas */}
        <div className="marcas-banner-capsula rounded-5 bg-platino py-4 px-3 px-lg-4">
          <div className="row row-cols-3 row-cols-md-5 row-cols-xl-auto justify-content-center justify-content-xl-between flex-xl-nowrap g-3 g-xl-2 align-items-start">

            {/* 1. Marca */}
            <div className="col">
              <a href="#" className="marca-item-enlace text-decoration-none text-center d-block">
                <div className="marca-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src="" alt="Marca 1" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="marca-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                  <span className="marca-texto-label fw-medium d-block text-truncate">Marca 1</span>
                </div>
              </a>
            </div>

            {/* 2. Marca */}
            <div className="col">
              <a href="#" className="marca-item-enlace text-decoration-none text-center d-block">
                <div className="marca-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src="" alt="Marca 2" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="marca-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                  <span className="marca-texto-label fw-medium d-block text-truncate">Marca 2</span>
                </div>
              </a>
            </div>

            {/* 3. Marca */}
            <div className="col">
              <a href="#" className="marca-item-enlace text-decoration-none text-center d-block">
                <div className="marca-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src="" alt="Marca 3" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="marca-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                  <span className="marca-texto-label fw-medium d-block text-truncate">Marca 3</span>
                </div>
              </a>
            </div>

            {/* 4. Marca */}
            <div className="col">
              <a href="#" className="marca-item-enlace text-decoration-none text-center d-block">
                <div className="marca-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src="" alt="Marca 4" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="marca-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                  <span className="marca-texto-label fw-medium d-block text-truncate">Marca 4</span>
                </div>
              </a>
            </div>

            {/* 5. Marca */}
            <div className="col">
              <a href="#" className="marca-item-enlace text-decoration-none text-center d-block">
                <div className="marca-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src="" alt="Marca 5" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="marca-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                  <span className="marca-texto-label fw-medium d-block text-truncate">Marca 5</span>
                </div>
              </a>
            </div>

            {/* 6. Marca */}
            <div className="col">
              <a href="#" className="marca-item-enlace text-decoration-none text-center d-block">
                <div className="marca-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src="" alt="Marca 6" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="marca-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                  <span className="marca-texto-label fw-medium d-block text-truncate">Marca 6</span>
                </div>
              </a>
            </div>

            {/* 7. Marca */}
            <div className="col">
              <a href="#" className="marca-item-enlace text-decoration-none text-center d-block">
                <div className="marca-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src="" alt="Marca 7" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="marca-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                  <span className="marca-texto-label fw-medium d-block text-truncate">Marca 7</span>
                </div>
              </a>
            </div>

            {/* 8. Marca */}
            <div className="col">
              <a href="#" className="marca-item-enlace text-decoration-none text-center d-block">
                <div className="marca-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src="" alt="Marca 8" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="marca-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                  <span className="marca-texto-label fw-medium d-block text-truncate">Marca 8</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Brands;