import { Link } from 'react-router-dom'
import CallToAction from '../components/CallToAction'
import PageIntro from '../components/PageIntro'

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
      title: 'TABACUBA',
      body: 'Sistemas fotovoltaicos e iniciativas de eficiencia energética para instalaciones productivas.',
      src: '/home_1.png',
      alt: 'Proyecto TABACUBA (imagen de referencia)',
    },
    {
      title: 'FAO',
      body: 'Implementaciones en energías renovables y soporte técnico asociado.',
      src: '/home_2.png',
      alt: 'Proyecto FAO (imagen de referencia)',
    },
    {
      title: 'CEDAI / 3xE',
      body: 'Proyectos de energía renovable y eficiencia energética (casos de referencia).',
      src: '/logo.jpg',
      alt: 'Proyecto CEDAI / 3xE (imagen de referencia)',
    },
    {
      title: 'Desalinizadora Las Mangas',
      body: 'Soluciones vinculadas a tratamiento de agua y soporte técnico.',
      src: '/logo.svg',
      alt: 'Proyecto Desalinizadora Las Mangas (imagen de referencia)',
    },
    {
      title: 'Aguas de La Habana',
      body: 'Asistencia técnica y proyectos asociados a operación eficiente.',
      src: '/home_1.png',
      alt: 'Proyecto Aguas de La Habana (imagen de referencia)',
    },
    {
      title: 'TRANSTUR Comunicaciones',
      body: 'Servicios técnicos e integración eléctrica según requerimientos del cliente.',
      src: '/home_2.png',
      alt: 'Proyecto TRANSTUR Comunicaciones (imagen de referencia)',
    },
  ]

  return (
    <div className="vstack gap-5">
      {/*
        Misma idea: el contenido cambia, la estructura se reutiliza.
        Eso reduce repetición y hace más fácil mantener el diseño.
      */}
      <PageIntro
        ariaLabel="Encabezado de Proyectos"
        badges={['Portafolio', 'Residencial', 'Comercial']}
        title="Proyectos"
        description="Casos y referencias mencionadas en la presentación de SEE. Puedes reemplazar cada imagen por una foto real del proyecto cuando quieras."
        metrics={[
          { value: 'Residencial', label: 'Hogares y pequeñas instalaciones' },
          { value: 'Comercial', label: 'Negocios y oficinas' },
          { value: 'Soporte', label: 'Mantenimiento y optimización' },
        ]}
      />

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

      <CallToAction
        title="¿Quieres que tu proyecto sea el próximo?"
        description="Te ayudamos a elegir la mejor configuración según tu consumo."
        primaryAction={{ label: 'Hablar con un asesor', to: 'https://wa.me/5352798676', external: true }}
        secondaryAction={{ label: 'Ver servicios', to: '/servicios' }}
      />
    </div>
  )
}
