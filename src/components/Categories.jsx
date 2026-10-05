function Categories() {
  return (
    <section className="py-1">
      <div className="container">

        {/* Encabezado */}
        <div className="text-center mb-4">
          <h2 className="cat-title fw-bold mb-1">
            Categorías destacadas
          </h2>
          <p className="mb-0">
            Todo lo que necesitas para tus proyectos, obras y reparaciones.
          </p>
        </div>

        {/* Contenedor Categorías */}
        <div className="categorias-banner-capsula rounded-5 bg-platino py-4 px-3 px-lg-4">
          <div className="row row-cols-3 row-cols-md-5 row-cols-xl-auto justify-content-center justify-content-xl-between flex-xl-nowrap g-3 g-xl-2 align-items-start">

            {/* 1. Categoría: Construcción */}
            <div className="col">
              <a href="#" className="categoria-item-enlace text-decoration-none text-center d-block">
                <div className="categoria-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src="../src/assets/categories/construccion.webp" alt="Construcción" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="categoria-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                  <span className="categoria-texto-label fw-medium d-block text-truncate">Construcción</span>
                </div>
              </a>
            </div>

            {/* 2. Categoría: Maderas */}
            <div className="col">
              <a href="#" className="categoria-item-enlace text-decoration-none text-center d-block">
                <div className="categoria-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src="../src/assets/categories/maderas.webp" alt="Maderas" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="categoria-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                  <span className="categoria-texto-label fw-medium d-block text-truncate">Maderas</span>
                </div>
              </a>
            </div>

            {/* 3. Categoría: Herramientas */}
            <div className="col">
              <a href="#" className="categoria-item-enlace text-decoration-none text-center d-block">
                <div className="categoria-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src="../src/assets/categories/herramientas.webp" alt="Herramientas" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="categoria-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                  <span className="categoria-texto-label fw-medium d-block text-truncate">Herramientas</span>
                </div>
              </a>
            </div>

            {/* 4. Categoría: Fijaciones */}
            <div className="col">
              <a href="#" className="categoria-item-enlace text-decoration-none text-center d-block">
                <div className="categoria-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src="../src/assets/categories/fijaciones.webp" alt="Fijaciones" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="categoria-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                  <span className="categoria-texto-label fw-medium d-block text-truncate">Fijaciones</span>
                </div>
              </a>
            </div>

            {/* 5. Categoría: Gasfitería */}
            <div className="col">
              <a href="#" className="categoria-item-enlace text-decoration-none text-center d-block">
                <div className="categoria-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src="../src/assets/categories/gasfiteria.webp" alt="Gasfitería" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="categoria-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                  <span className="categoria-texto-label fw-medium d-block text-truncate">Gasfitería</span>
                </div>
              </a>
            </div>

            {/* 6. Categoría: Electricidad */}
            <div className="col">
              <a href="#" className="categoria-item-enlace text-decoration-none text-center d-block">
                <div className="categoria-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src="../src/assets/categories/electricidad.webp" alt="Electricidad" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="categoria-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                  <span className="categoria-texto-label fw-medium d-block text-truncate">Electricidad</span>
                </div>
              </a>
            </div>

            {/* 7. Categoría: Pinturas */}
            <div className="col">
              <a href="#" className="categoria-item-enlace text-decoration-none text-center d-block">
                <div className="categoria-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src="../src/assets/categories/pinturas.webp" alt="Pinturas" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="categoria-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                  <span className="categoria-texto-label fw-medium d-block text-truncate">Pinturas</span>
                </div>
              </a>
            </div>

            {/* 8. Categoría: Cerámicas */}
            <div className="col">
              <a href="#" className="categoria-item-enlace text-decoration-none text-center d-block">
                <div className="categoria-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src="../src/assets/categories/ceramicas.webp" alt="Cerámicas" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="categoria-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                  <span className="categoria-texto-label fw-medium d-block text-truncate">Cerámicas</span>
                </div>
              </a>
            </div>

            {/* 9. Categoría: Seguridad */}
            <div className="col">
              <a href="#" className="categoria-item-enlace text-decoration-none text-center d-block">
                <div className="categoria-circulo-wrapper ratio ratio-1x1 rounded-circle overflow-hidden mx-auto shadow-sm">
                  <img src="../src/assets/categories/seguridad.webp" alt="Seguridad" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="categoria-badge-pill rounded-pill shadow-sm py-2 px-2 mt-2 mx-auto">
                  <span className="categoria-texto-label fw-medium d-block text-truncate">Seguridad</span>
                </div>
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default Categories;