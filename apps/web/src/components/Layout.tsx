import { Link, Outlet } from 'react-router-dom'
import './Layout.css'

export default function Layout() {
  /*
    Layout = estructura común a todas las páginas
    - Header fijo con navegación
    - Main con el contenido de la ruta actual (Outlet)

    Mantener esto separado ayuda a una arquitectura limpia:
    las páginas no se preocupan por el header.
  */
  return (
    <div>
      <header className="siteHeader">
        <div className="headerInner">
          {/* Marca: en la plantilla hay un logo + nombre. Aquí usamos un "mark" simple (sin assets externos). */}
          <Link to="/" className="brand" aria-label="Ir al inicio">
            <span className="brandMark" aria-hidden="true" />
            <span>Energia Solar</span>
          </Link>

          {/* Navegación principal (rutas) */}
          <nav className="navLinks" aria-label="Navegación principal">
            <Link to="/">Inicio</Link>
            <Link to="/servicios">Servicios</Link>
            <Link to="/nosotros">Nosotros</Link>
            <Link to="/proyectos">Proyectos</Link>

            {/* CTA en la barra como en la plantilla */}
            <span className="navCta">
              <Link to="/contacto" className="btn btnPrimary">
                Contacto
              </Link>
            </span>
          </nav>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
