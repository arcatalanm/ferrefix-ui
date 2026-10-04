function ArriendoMaquinaria() {
  return (
    <section className="py-5 bg-white">
      <div className="container">

        {/* Encabezado */}
        <div className="text-center mb-4 mb-lg-5">
          <h2 className="display-5 fw-bold text-dark mb-2">
            Arriendo de Maquinaria
          </h2>
          <p className="text-secondary lead mx-auto col-lg-8 mb-0"> 
            En Ferrefix ofrecemos servicios de arriendo de máquinas para que puedas terminar tu obra sin tener que hacer una inversión inicial enorme. Contamos con equipos en buen estado, listos para trabajar y a un precio conveniente. Tú eliges cuánto tiempo los necesitas y nosotros nos encargamos del resto. Es una forma práctica y económica de avanzar en tu proyecto sin comprar maquinaria. Cotiza con nosotros y arrienda lo que necesitas cuando lo necesitas.
          </p>
        </div>

        {/* Mosaico Responsivo */}
        <div className="row g-2 g-md-3">
          <div className="col-12 col-lg-6">
            <a href="#" className="arriendo-card d-block h-100 overflow-hidden">
              <img
                src=""
                alt="Maquinaria 1"
                className="w-100 h-100 object-fit-cover arriendo-img"
              />
            </a>
          </div>

          <div className="col-6 col-lg-3">
            <a href="#" className="arriendo-card d-block h-100 overflow-hidden">
              <img
                src=""
                alt="Maquinaria 2"
                className="w-100 h-100 object-fit-cover arriendo-img"
              />
            </a>
          </div>

          <div className="col-6 col-lg-3">
            <a href="#" className="arriendo-card d-block h-100 overflow-hidden">
              <img
                src=""
                alt="Maquinaria 3"
                className="w-100 h-100 object-fit-cover arriendo-img"
              />
            </a>
          </div>

          <div className="col-12 col-lg-6 order-lg-3">
            <a href="#" className="arriendo-card d-block h-100 overflow-hidden">
              <img
                src=""
                alt="Maquinaria 4"
                className="w-100 h-100 object-fit-cover arriendo-img"
              />
            </a>
          </div>

          <div className="col-6 col-lg-3 order-lg-1">
            <a href="#" className="arriendo-card d-block h-100 overflow-hidden">
              <img
                src=""
                alt="Maquinaria 5"
                className="w-100 h-100 object-fit-cover arriendo-img"
              />
            </a>
          </div>

          <div className="col-6 col-lg-3 order-lg-2">
            <a href="#" className="arriendo-card d-block h-100 overflow-hidden">
              <img
                src=""
                alt="Maquinaria 6"
                className="w-100 h-100 object-fit-cover arriendo-img"
              />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

export default ArriendoMaquinaria;