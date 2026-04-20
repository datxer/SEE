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
          Soluciones Energéticamente Eficientes (SEE) es una mediana empresa que ofrece servicios especializados en
          soluciones sostenibles y sustentables. Nos enfocamos en ingeniería, elaboración de proyectos técnicos y
          ejecutivos, asistencia técnica y consultoría en eficiencia energética y energías renovables.
        </p>

        {/*
          KPIs (texto corto) ayudan a dar confianza.
          Son placeholders: cambia números por tus datos reales cuando quieras.
        */}
        <div className="row g-3 mt-3" aria-label="Indicadores">
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="fw-bold">2400 kWp</div>
                <div className="text-body-secondary small mt-1">FV instalados</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="fw-bold">298</div>
                <div className="text-body-secondary small mt-1">Revisiones energéticas</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="fw-bold">3.7 GWh/año</div>
                <div className="text-body-secondary small mt-1">Ahorro estimado</div>
              </div>
            </div>
          </div>
        </div>
      </header>

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
