function Topbar() {
  return (
    <div className="topbar-section py-2 border-bottom d-none d-lg-block bg-ambar">
      <div className="topbar-container container">
        <div className="topbar-row row align-items-center">

          <div className="topbar-info-col col-lg-8 col-xl-9 d-flex align-items-center gap-3 topbar-nowrap">
            <span className="topbar-schedule-item d-inline-flex align-items-center">
              <i className="topbar-schedule-icon bi bi-clock me-1"></i>
              Lun - Sáb: 08:30 a 13:00 / 14:30 a 19:30 hrs | Dom: 08:30 a 13:00 hrs
            </span>

            <span className="topbar-sep">|</span>

            <a
              href="https://maps.app.goo.gl/SScoFNhnuidG1PweA"
              target="_blank"
              rel="noopener noreferrer"
              className="topbar-location-link d-inline-flex align-items-center"
            >
              <i className="topbar-location-icon bi bi-geo-alt me-1"></i>
              Antonio Varas 666, Providencia
            </a>
          </div>

          <div className="topbar-contact-col col-lg-4 col-xl-3 d-flex justify-content-end align-items-center gap-3 topbar-nowrap">

            <a
              href="tel:+56993456575"
              className="topbar-phone-link d-flex align-items-center"
            >
              <i className="topbar-phone-icon bi bi-telephone me-1"></i>
              +56 9 9345 6575
            </a>

            <span className="topbar-sep">|</span>

            <a
              href="https://wa.me/56993456575"
              target="_blank"
              rel="noopener noreferrer"
              className="topbar-whatsapp-link d-flex align-items-center"
            >
              <i className="bi bi-whatsapp me-1"></i>
              WhatsApp
            </a>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
