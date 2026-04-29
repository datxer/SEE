import CallToAction from '../components/CallToAction'
import PageIntro from '../components/PageIntro'

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
      {/*
        Este bloque se repite en otras páginas, así que lo convertimos en un componente.
        La página solo le pasa texto y métricas; el componente se encarga de pintarlo.
      */}
      <PageIntro
        ariaLabel="Encabezado de Nosotros"
        badges={['SEE', 'Energía renovable', 'Calidad']}
        title="Nosotros"
        description="Soluciones Energéticamente Eficientes (SEE) es una mediana empresa que ofrece servicios especializados en soluciones sostenibles y sustentables. Nos enfocamos en ingeniería, elaboración de proyectos técnicos y ejecutivos, asistencia técnica y consultoría en eficiencia energética y energías renovables."
        metrics={[
          { value: '2400 kWp', label: 'FV instalados' },
          { value: '298', label: 'Revisiones energéticas' },
          { value: '3.7 GWh/año', label: 'Ahorro estimado' },
        ]}
      />

      <section aria-label="Misión, visión y valores" data-reveal>
        <h2 className="h3 mb-3">¿Dónde vamos?</h2>

        <div className="row g-3">
          <div className="col-12 col-md-4">
            <article className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h6">Qué hacemos</h3>
                <p className="text-body-secondary mb-0">
                  Integramos tecnologías y servicios para mejorar el rendimiento operativo, reducir costos y promover un
                  uso responsable de los recursos.
                </p>
              </div>
            </article>
          </div>

          <div className="col-12 col-md-4">
            <article className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h6">Visión</h3>
                <p className="text-body-secondary mb-0">
                  Aspiramos a ser el referente corporativo en Cuba para servicios energéticos de ingeniería, proyectos
                  técnicos y ejecutivos, asistencia técnica y consultoría en eficiencia energética y energías renovables.
                </p>
              </div>
            </article>
          </div>

          <div className="col-12 col-md-4">
            <article className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h6">Compromiso</h3>
                <p className="text-body-secondary">
                  Cultura orientada al cliente, innovación, respeto al medio ambiente y un sistema de gestión de calidad.
                </p>
                <div className="d-flex flex-wrap gap-2" aria-label="Valores clave">
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                    Cliente
                  </span>
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                    Innovación
                  </span>
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                    Medio ambiente
                  </span>
                  <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">
                    Calidad
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section aria-label="Calidad y certificación" data-reveal>
        <div className="p-4 p-lg-5 rounded-4 border bg-body-tertiary">
          <h2 className="h4 m-0">Calidad, seguridad y estándares</h2>
          <p className="text-body-secondary mt-2 mb-0" style={{ maxWidth: 920 }}>
            Trabajamos con componentes de marcas reconocidas, altos estándares de seguridad y sistemas adaptables
            (conectados a red, aislados o con almacenamiento). SEE es proveedor registrado de Naciones Unidas.
          </p>
        </div>
      </section>

      <CallToAction
        title="¿Listo para dar el siguiente paso?"
        description="Cuéntanos tu caso y te orientamos con una asesoría inicial."
        // Este CTA lleva directo al chat de WhatsApp del área comercial.
        primaryAction={{ label: 'Solicitar asesoría', to: 'https://wa.me/5352797280', external: true }}
        secondaryAction={{ label: 'Ver servicios', to: '/servicios' }}
      />
    </div>
  )
}
