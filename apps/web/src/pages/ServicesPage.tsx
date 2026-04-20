import { Link } from 'react-router-dom'

export default function ServicesPage() {
  /*
    Página: /servicios

    Propósito:
    - Mostrar el catálogo de servicios (instalación, mantenimiento, asesoría, etc.).

    Fuente de contenido:
    - Esta página se organizó siguiendo el contenido de la presentación (PDF) de la empresa.

    Nota:
    - No dependemos del PDF en runtime (para evitar “PDF en la web”).
    - El texto se dejó aquí “hardcoded” para que sea fácil de ajustar.
  */

  /*
    Lista de servicios según la presentación.
    La idea es mantener descripciones cortas y claras (tipo catálogo).
  */
  const services = [
    {
      title: 'Sistemas fotovoltaicos (FV)',
      body: 'Diseño, suministro, montaje y puesta en marcha (conectados a red, aislados o híbridos).',
      tags: ['Diseño', 'Montaje', 'Puesta en marcha'],
    },
    {
      title: 'Tratamiento de agua',
      body: 'Diseño personalizado, montaje y mantenimiento preventivo y correctivo de sistemas de tratamiento de agua.',
      tags: ['Diseño', 'Mantenimiento', 'Correctivo'],
    },
    {
      title: 'Estaciones de carga para vehículos eléctricos',
      body: 'Estudios técnicos, instalación y puesta en marcha de estaciones de carga (con integración eléctrica segura).',
      tags: ['Estudio', 'Instalación', 'Seguridad'],
    },
    {
      title: 'Climatización (HVAC)',
      body: 'Suministro e instalación de sistemas de climatización eficientes para entornos residenciales y corporativos.',
      tags: ['Suministro', 'Instalación', 'Eficiencia'],
    },
    {
      title: 'SCADA y automatización',
      body: 'Diseño, instalación y programación para monitoreo/control de procesos y reducción del consumo energético.',
      tags: ['Monitoreo', 'Control', 'Optimización'],
    },
    {
      title: 'Revisiones y auditorías energéticas',
      body: 'Diagnóstico del consumo y propuestas de mejora para aumentar la eficiencia y disminuir costos.',
      tags: ['Diagnóstico', 'Ahorro', 'Recomendación'],
    },
    {
      title: 'Alumbrado inteligente y sustitución tecnológica',
      body: 'Modernización de alumbrado para reducir consumo, mejorar control y elevar la calidad del servicio.',
      tags: ['Modernización', 'Control', 'Ahorro'],
    },
    {
      title: 'Grupos electrógenos',
      body: 'Asistencia técnica, mantenimiento e integración en soluciones energéticas de respaldo.',
      tags: ['Asistencia', 'Mantenimiento', 'Respaldo'],
    },
  ]

  return (
    <div className="vstack gap-5">
      <header
        className="p-4 p-lg-5 rounded-4 border bg-body-tertiary shadow-sm"
        aria-label="Encabezado de Servicios"
        data-reveal
      >
        <div className="d-inline-flex gap-2 flex-wrap" aria-label="Etiquetas">
          <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle">Ingeniería</span>
          <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle">Proyectos</span>
          <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle">Soporte</span>
        </div>

        <h1 className="display-6 fw-bold mt-3 mb-2">Servicios</h1>
        <p className="text-body-secondary mb-0" style={{ maxWidth: 820 }}>
          Catálogo de servicios organizado según la presentación de SEE: desde sistemas fotovoltaicos y eficiencia
          energética, hasta automatización, tratamiento de agua y carga para vehículos eléctricos.
        </p>

        <div className="row g-3 mt-3" aria-label="Indicadores">
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="fw-bold">Diagnóstico</div>
                <div className="text-body-secondary small mt-1">Revisiones y auditorías energéticas</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="fw-bold">Implementación</div>
                <div className="text-body-secondary small mt-1">Diseño, montaje y puesta en marcha</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="fw-bold">Soporte</div>
                <div className="text-body-secondary small mt-1">Mantenimiento preventivo y correctivo</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section aria-label="Catálogo de servicios" data-reveal>
        <h2 className="h3 mb-3">Qué podemos hacer por ti</h2>

        <div className="row g-3">
          {services.map((service) => (
            <div key={service.title} className="col-12 col-md-4">
              <article className="card h-100 shadow-sm">
                <div className="card-body">
                  <h3 className="h6">{service.title}</h3>
                  <p className="text-body-secondary">{service.body}</p>
                  <div className="d-flex flex-wrap gap-2" aria-label="Incluye">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </div>
          ))}
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
