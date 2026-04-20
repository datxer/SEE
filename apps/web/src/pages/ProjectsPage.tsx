import { Link } from 'react-router-dom'

export default function ProjectsPage() {
  /*
    Página: /proyectos

    Propósito:
    - Portafolio / casos de éxito.

    Estado actual:
    - Placeholder simple.
    - Más adelante puede incluir:
      - galería de proyectos,
      - fichas con fotos + descripción,
      - filtros básicos (si los necesitas),
      - datos que vengan de la API.
  */
  /*
    Nota sobre imágenes:
    - Reutilizo assets que ya existen en /public para que se vea bien hoy.
    - Cuando tengas fotos reales de proyectos, solo cambia los src.
  */
  const items = [
    {
      title: 'Instalación residencial',
      body: 'Sistema solar optimizado para consumo doméstico y ahorro mensual.',
      src: '/photo_2026-04-17_13-55-45.jpg',
      alt: 'Instalación residencial con paneles solares',
    },
    {
      title: 'Solución comercial',
      body: 'Diseño pensado para horarios de operación y eficiencia energética.',
      src: '/logo.jpg',
      alt: 'Proyecto comercial (imagen de referencia)',
    },
    {
      title: 'Mantenimiento preventivo',
      body: 'Revisión y puesta a punto para mantener rendimiento y seguridad.',
      src: '/logo.svg',
      alt: 'Mantenimiento de sistema solar (imagen de referencia)',
    },
  ]

  return (
    <div className="vstack gap-5">
      <header
        className="p-4 p-lg-5 rounded-4 border bg-body-tertiary shadow-sm"
        aria-label="Encabezado de Proyectos"
        data-reveal
      >
        <div className="d-inline-flex gap-2 flex-wrap" aria-label="Etiquetas">
          <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle">Portafolio</span>
          <span className="badge text-bg-secondary">Residencial</span>
          <span className="badge text-bg-secondary">Comercial</span>
        </div>

        <h1 className="display-6 fw-bold mt-3 mb-2">Proyectos</h1>
        <p className="text-body-secondary mb-0" style={{ maxWidth: 820 }}>
          Un vistazo a lo que hacemos. Aquí puedes mostrar casos reales con fotos, ubicación (si aplica) y el impacto
          en ahorro/consumo.
        </p>

        <div className="row g-3 mt-3" aria-label="Indicadores">
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="fw-bold">Residencial</div>
                <div className="text-body-secondary small mt-1">Hogares y pequeñas instalaciones</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="fw-bold">Comercial</div>
                <div className="text-body-secondary small mt-1">Negocios y oficinas</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="fw-bold">Soporte</div>
                <div className="text-body-secondary small mt-1">Mantenimiento y optimización</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section aria-label="Galería de proyectos" data-reveal>
        <div className="d-flex align-items-end justify-content-between gap-3 flex-wrap">
          <div>
            <h2 className="h3 m-0">Galería</h2>
            <p className="text-body-secondary m-0 mt-2">Ejemplos (reemplaza con fotos reales cuando quieras).</p>
          </div>
          <Link to="/servicios" className="btn btn-outline-success">
            Ver servicios
          </Link>
        </div>

        <div className="row g-3 mt-1">
          {items.map((it) => (
            <div key={it.title} className="col-12 col-md-4">
              <article className="card h-100 shadow-sm overflow-hidden">
                <img className="card-img-top" src={it.src} alt={it.alt} loading="lazy" />
                <div className="card-body">
                  <h3 className="h6">{it.title}</h3>
                  <p className="text-body-secondary">{it.body}</p>
                  <div className="d-flex flex-wrap gap-2" aria-label="Etiquetas">
                    <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                      Solar
                    </span>
                    <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                      Eficiencia
                    </span>
                    <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                      Calidad
                    </span>
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
        <h2 className="h3 m-0">¿Quieres que tu proyecto sea el próximo?</h2>
        <p className="text-body-secondary mt-2 mb-4">Te ayudamos a elegir la mejor configuración según tu consumo.</p>
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <a className="btn btn-success btn-lg" href="#contacto">
            Hablar con un asesor
          </a>
          <Link className="btn btn-outline-success btn-lg" to="/servicios">
            Ver servicios
          </Link>
        </div>
      </section>
    </div>
  )
}
