import { Link } from 'react-router-dom'

type ActionLink = {
  label: string
  to: string
  external?: boolean
}

type CallToActionProps = {
  title: string
  description: string
  primaryAction: ActionLink
  secondaryAction: ActionLink
}

export default function CallToAction({ title, description, primaryAction, secondaryAction }: CallToActionProps) {
  // Este componente es una “plantilla” de llamado a la acción.
  // Le pasas texto y enlaces, y él se encarga de pintarlo igual en cualquier página.
  const renderAction = (action: ActionLink, className: string) => {
    // Si la acción es externa, abrimos otra pestaña para no sacar al usuario de la web.
    if (action.external) {
      return (
        <a className={className} href={action.to} target="_blank" rel="noopener noreferrer">
          {action.label}
        </a>
      )
    }

    // Si empieza con /, es navegación interna de la app.
    if (action.to.startsWith('/')) {
      return (
        <Link className={className} to={action.to}>
          {action.label}
        </Link>
      )
    }

    // Si no es interna ni marcada como externa, la tratamos como enlace normal o ancla.
    return (
      <a className={className} href={action.to}>
        {action.label}
      </a>
    )
  }

  return (
    <section className="p-4 p-lg-5 rounded-4 border bg-body-tertiary text-center" aria-label="Llamado a la acción" data-reveal>
      {/* Título: le dice al usuario qué queremos que haga o qué va a ganar */}
      <h2 className="h3 m-0">{title}</h2>
      {/* Descripción corta: explica por qué debería hacer clic */}
      <p className="text-body-secondary mt-2 mb-4">{description}</p>
      {/* Dos botones: uno principal y otro secundario para dar opciones */}
      <div className="d-flex gap-2 justify-content-center flex-wrap">
        {renderAction(primaryAction, 'btn btn-success btn-lg')}
        {renderAction(secondaryAction, 'btn btn-outline-success btn-lg')}
      </div>
    </section>
  )
}