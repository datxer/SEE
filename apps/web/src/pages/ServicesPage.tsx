import { Link } from 'react-router-dom'
import CallToAction from '../components/CallToAction'
import PageIntro from '../components/PageIntro'

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
      {/*
        Repetición eliminada: mismo esqueleto, distinto contenido.
        Así el código queda más corto y más fácil de cambiar después.
      */}
      <PageIntro
        ariaLabel="Encabezado de Servicios"
        badges={['Ingeniería', 'Proyectos', 'Soporte']}
        title="Servicios"
        description="Catálogo de servicios organizado según la presentación de SEE: desde sistemas fotovoltaicos y eficiencia energética, hasta automatización, tratamiento de agua y carga para vehículos eléctricos."
        metrics={[
          { value: 'Diagnóstico', label: 'Revisiones y auditorías energéticas' },
          { value: 'Implementación', label: 'Diseño, montaje y puesta en marcha' },
          { value: 'Soporte', label: 'Mantenimiento preventivo y correctivo' },
        ]}
      />

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

      <CallToAction
        title="¿Quieres una cotización rápida?"
        description="Escríbenos y te respondemos con los siguientes pasos."
        primaryAction={{ label: 'Contactar', to: '#contacto' }}
        secondaryAction={{ label: 'Ver proyectos', to: '/proyectos' }}
      />
    </div>
  )
}
