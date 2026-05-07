// Estilos locales del encabezado de pagina.
import './PageIntro.css'

// Metrica mostrada en tarjetas (valor + etiqueta).
type PageIntroMetric = {
  value: string
  label: string
}

// Props del componente PageIntro.
type PageIntroProps = {
  ariaLabel: string
  badges: string[]
  title: string
  description: string
  metrics?: PageIntroMetric[]
}

export default function PageIntro({ ariaLabel, badges, title, description, metrics = [] }: PageIntroProps) {
  // Desestructuramos props para simplificar el JSX.
  // Este componente junta la parte que se repite arriba en varias páginas.
  // Así cambias el contenido una sola vez por página, pero no repites el mismo HTML.
  // Piensa en él como una “caja” que ya trae la forma lista.
  return (
    <header className="pageIntro p-4 p-lg-5 rounded-4 border bg-body-tertiary shadow-sm" aria-label={ariaLabel} data-reveal>
      {/* Las badges son pequeñas etiquetas que resumen de qué trata la página */}
      <div className="d-inline-flex gap-2 flex-wrap" aria-label="Etiquetas">
        {badges.map((badge) => (
          <span key={badge} className="badge bg-success-subtle text-success-emphasis border border-success-subtle">
            {badge}
          </span>
        ))}
      </div>

      {/* Título principal de la página */}
      <h1 className="display-6 fw-bold mt-3 mb-2">{title}</h1>
      {/* Texto que explica rápido de qué va la página */}
      <p className="text-body-secondary mb-0 pageIntroDescription">
        {description}
      </p>

      {metrics.length > 0 ? (
        // Si hay métricas, las mostramos en tarjetas para que el bloque se vea más completo.
        // Si no hay métricas, esta parte simplemente no aparece.
        <div className="row g-3 mt-3" aria-label="Indicadores">
          {metrics.map((metric) => (
            <div key={`${metric.value}-${metric.label}`} className="col-12 col-md-4">
              {/* Cada métrica vive dentro de una card para que se lea como un dato importante */}
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <div className="fw-bold">{metric.value}</div>
                  <div className="text-body-secondary small mt-1">{metric.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </header>
  )
}