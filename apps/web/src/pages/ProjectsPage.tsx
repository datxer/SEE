// Link para navegacion interna y hooks de React.
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import CallToAction from '../components/CallToAction'
import PageIntro from '../components/PageIntro'
import ProjectGalleryModal from '../components/ProjectGalleryModal'
import './ProjectsPage.css'

export default function ProjectsPage() {
  // Renderiza el portafolio y su modal de galeria.
  /*
    Página: /proyectos

    Propósito:
    - Portafolio / casos de éxito.

    Cambios recientes:
    - Cada proyecto ahora tiene múltiples fotos en un array.
    - Al hacer clic en una tarjeta, se abre un modal con slider de fotos.
  */
  // Este state guarda cuál proyecto tiene su galería abierta (null si ninguno).
  // Así sabemos a quién mostrar el modal.
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null)
  /*
    Nota sobre imágenes:
    - Reutilizo assets que ya existen en /public para que se vea bien hoy.
    - Cuando tengas fotos reales de proyectos, solo cambia los src.
  */
  // Los proyectos se cargan desde la API pública en /api/projects
  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    // Cargamos proyectos desde la API publica.
    let mounted = true
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => {
        if (mounted) setItems(d)
      })
      .catch(() => {
        // Si falla la petición, dejamos un array vacío y mostramos mensaje en UI
        if (mounted) setItems([])
      })
    return () => {
      mounted = false
    }
  }, [])

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
              {/*
                Ahora cada tarjeta es clickeable. Al hacer clic, guardamos su índice
                y abrimos el modal con sus fotos.
              */}
              <article
                className="card h-100 shadow-sm overflow-hidden projectCard"
                role="button"
                tabIndex={0}
                onClick={() => setSelectedProjectIndex(items.indexOf(it))}
                onKeyDown={(e) => {
                  // Si presionas Enter o Espacio sobre la tarjeta, también abre la galería.
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedProjectIndex(items.indexOf(it))
                  }
                }}
                aria-label={`Ver galería de ${it.title}`}
              >
                {/* La foto de portada (thumbnail) de la tarjeta */}
                <img
                  className="card-img-top"
                  src={it.thumbnail || (it.photos && it.photos[0] ? (typeof it.photos[0] === 'string' ? it.photos[0] : it.photos[0].url) : '/home_1.png')}
                  alt={it.thumbnailAlt || (it.photos && it.photos[0] ? (typeof it.photos[0] === 'string' ? '' : it.photos[0].alt || '') : it.title)}
                  loading="lazy"
                />
                <div className="card-body">
                  <h3 className="h6">{it.title}</h3>
                  <p className="text-body-secondary">{it.body}</p>
                  {/* Pequeño indicador para que el usuario sepa que es clickeable */}
                  <div className="d-flex flex-wrap gap-2 align-items-center" aria-label="Etiquetas y acciones">
                    <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                      Solar
                    </span>
                    <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                      Eficiencia
                    </span>
                    <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                      Calidad
                    </span>
                    {/* Pequeño indicador visual de que hay fotos (ej: "📷 3 fotos") */}
                    <small className="text-muted ms-auto">
                      📷 {Array.isArray(it.photos) ? it.photos.length : 0}
                    </small>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>

      {/*
        Si algún proyecto está seleccionado (selectedProjectIndex no es null),
        mostramos el modal con sus fotos.
      */}
      {selectedProjectIndex !== null && (
        <ProjectGalleryModal
          projectTitle={items[selectedProjectIndex].title}
          photos={Array.isArray(items[selectedProjectIndex].photos) ? items[selectedProjectIndex].photos.map((p: any) => (typeof p === 'string' ? p : p.url)) : []}
          onClose={() => setSelectedProjectIndex(null)}
        />
      )}

      <CallToAction
        title="¿Quieres que tu proyecto sea el próximo?"
        description="Te ayudamos a elegir la mejor configuración según tu consumo."
        primaryAction={{ label: 'Hablar con un asesor', to: 'https://wa.me/5352798676', external: true }}
        secondaryAction={{ label: 'Ver servicios', to: '/servicios' }}
      />
    </div>
  )
}
