import { Link } from 'react-router-dom'

export default function ServicesPage() {
  /*
    Página: /servicios

    Propósito:
    - Mostrar el catálogo de servicios (instalación, mantenimiento, asesoría, etc.).

    Estado actual:
    - Placeholder simple.
    - En el futuro aquí podrías:
      - usar cards / secciones por servicio,
      - agregar CTA a contacto,
      - o incluso cargar servicios desde la API.
  */
  return (
    <div className="vstack gap-5">
      <header
        className="p-4 p-lg-5 rounded-4 border bg-body-tertiary shadow-sm"
        aria-label="Encabezado de Servicios"
        data-reveal
      >
        <div className="d-inline-flex gap-2 flex-wrap" aria-label="Etiquetas">
          <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle">Instalación</span>
          <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle">Mantenimiento</span>
          <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle">Asesoría</span>
        </div>

        <h1 className="display-6 fw-bold mt-3 mb-2">Servicios</h1>
        <p className="text-body-secondary mb-0" style={{ maxWidth: 820 }}>
          Soluciones claras, instaladas con criterio técnico y pensadas para que el sistema te rinda bien por años.
          Aquí tienes un resumen de lo que hacemos.
        </p>

        <div className="row g-3 mt-3" aria-label="Indicadores">
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="fw-bold">Diagnóstico</div>
                <div className="text-body-secondary small mt-1">Evaluación inicial del sitio</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="fw-bold">Instalación</div>
                <div className="text-body-secondary small mt-1">Montaje y puesta en marcha</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="fw-bold">Soporte</div>
                <div className="text-body-secondary small mt-1">Mantenimiento y seguimiento</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section aria-label="Catálogo de servicios" data-reveal>
        <h2 className="h3 mb-3">Qué podemos hacer por ti</h2>

        <div className="row g-3">
          <div className="col-12 col-md-4">
            <article className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h6">Instalación de paneles solares</h3>
                <p className="text-body-secondary">
                  Diseño e instalación del sistema, priorizando seguridad, rendimiento y una terminación prolija.
                </p>
                <div className="d-flex flex-wrap gap-2" aria-label="Incluye">
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                    Visita técnica
                  </span>
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                    Instalación
                  </span>
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                    Puesta en marcha
                  </span>
                </div>
              </div>
            </article>
          </div>

          <div className="col-12 col-md-4">
            <article className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h6">Mantenimiento y soporte</h3>
                <p className="text-body-secondary">
                  Revisión preventiva, limpieza, diagnóstico y corrección de fallas para mantener el rendimiento.
                </p>
                <div className="d-flex flex-wrap gap-2" aria-label="Incluye">
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                    Preventivo
                  </span>
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                    Correctivo
                  </span>
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                    Reporte
                  </span>
                </div>
              </div>
            </article>
          </div>

          <div className="col-12 col-md-4">
            <article className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h6">Asesoría energética</h3>
                <p className="text-body-secondary">
                  Te ayudamos a elegir la solución adecuada según consumo, presupuesto y objetivos de ahorro.
                </p>
                <div className="d-flex flex-wrap gap-2" aria-label="Incluye">
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                    Ahorro estimado
                  </span>
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                    Recomendación
                  </span>
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                    Plan de acción
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
        <h2 className="h3 m-0">¿Quieres una cotización rápida?</h2>
        <p className="text-body-secondary mt-2 mb-4">Escríbenos y te respondemos con los siguientes pasos.</p>
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <a className="btn btn-success btn-lg" href="#contacto">
            Contactar
          </a>
          <Link className="btn btn-outline-success btn-lg" to="/proyectos">
            Ver proyectos
          </Link>
        </div>
      </section>
    </div>
  )
}
