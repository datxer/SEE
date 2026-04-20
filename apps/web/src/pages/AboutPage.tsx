import { Link } from 'react-router-dom'

export default function AboutPage() {
  /*
    Página: /nosotros

    Propósito:
    - Presentación de la empresa (misión, visión, valores, equipo, historia, etc.)

    Estado actual:
    - Placeholder simple para que puedas reemplazar el contenido luego.
    - Usamos estilos inline mínimos para no crear CSS extra sin necesidad.
  */
  return (
    <div className="vstack gap-5">
      <header
        className="p-4 p-lg-5 rounded-4 border bg-body-tertiary shadow-sm"
        aria-label="Encabezado de Nosotros"
        data-reveal
      >
        <div className="d-inline-flex gap-2 flex-wrap" aria-label="Etiquetas">
          <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle">SEE</span>
          <span className="badge text-bg-secondary">Energía renovable</span>
          <span className="badge text-bg-secondary">Calidad</span>
        </div>

        <h1 className="display-6 fw-bold mt-3 mb-2">Nosotros</h1>
        <p className="text-body-secondary mb-0" style={{ maxWidth: 820 }}>
          Soluciones Energéticamente Eficientes (SEE) nace para llevar energía solar a hogares y empresas con una
          implementación profesional, segura y con acompañamiento real.
        </p>

        {/*
          KPIs (texto corto) ayudan a dar confianza.
          Son placeholders: cambia números por tus datos reales cuando quieras.
        */}
        <div className="row g-3 mt-3" aria-label="Indicadores">
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="fw-bold">10+ años</div>
                <div className="text-body-secondary small mt-1">Experiencia acumulada</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="fw-bold">Instalación segura</div>
                <div className="text-body-secondary small mt-1">Normas y buenas prácticas</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="fw-bold">Soporte cercano</div>
                <div className="text-body-secondary small mt-1">Antes, durante y después</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section aria-label="Misión, visión y valores" data-reveal>
        <h2 className="h3 mb-3">Nuestra forma de trabajar</h2>

        <div className="row g-3">
          <div className="col-12 col-md-4">
            <article className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h6">Misión</h3>
                <p className="text-body-secondary mb-0">
                  Diseñar e instalar soluciones solares que reduzcan el costo energético y aumenten la independencia
                  eléctrica de nuestros clientes.
                </p>
              </div>
            </article>
          </div>

          <div className="col-12 col-md-4">
            <article className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h6">Visión</h3>
                <p className="text-body-secondary mb-0">
                  Ser un referente local en energía renovable con proyectos confiables, medibles y sostenibles en el
                  tiempo.
                </p>
              </div>
            </article>
          </div>

          <div className="col-12 col-md-4">
            <article className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h6">Valores</h3>
                <p className="text-body-secondary">Calidad, transparencia, seguridad y acompañamiento.</p>
                <div className="d-flex flex-wrap gap-2" aria-label="Valores clave">
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                    Transparencia
                  </span>
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                    Calidad
                  </span>
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                    Seguridad
                  </span>
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                    Sostenibilidad
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section
        className="p-4 p-lg-5 rounded-4 border bg-body-tertiary text-center"
        aria-label="Llamado a la acción"
        data-reveal
      >
        <h2 className="h3 m-0">¿Listo para dar el siguiente paso?</h2>
        <p className="text-body-secondary mt-2 mb-4">Cuéntanos tu caso y te orientamos con una asesoría inicial.</p>
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <a className="btn btn-success btn-lg" href="#contacto">
            Solicitar asesoría
          </a>
          <Link className="btn btn-outline-success btn-lg" to="/servicios">
            Ver servicios
          </Link>
        </div>
      </section>
    </div>
  )
}
