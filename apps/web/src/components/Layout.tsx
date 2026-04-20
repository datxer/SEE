import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import './Layout.css'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'see:theme'

function getInitialTheme(): Theme {
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
  return prefersDark ? 'dark' : 'light'
}

export default function Layout() {
  /*
    Layout = estructura común a todas las páginas
    - Header fijo con navegación
    - Main con el contenido de la ruta actual (Outlet)

    Mantener esto separado ayuda a una arquitectura limpia:
    las páginas no se preocupan por el header.
  */
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme())
  const [logoFailed, setLogoFailed] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const nextThemeLabel = theme === 'dark' ? 'Modo oscuro' : 'Modo claro'
  const logoSrc = logoFailed ? '/logo.svg' : '/logo.jpg'

  return (
    <div className="layout">
      <header className="siteHeader">
        <div className="headerInner">
          {/* Marca: en la plantilla hay un logo + nombre. Aquí usamos un "mark" simple (sin assets externos). */}
          <Link to="/" className="brand" aria-label="Ir al inicio">
            <img
              className="brandLogo"
              src={logoSrc}
              alt="Soluciones Energéticamente Eficientes"
              onError={() => setLogoFailed(true)}
            />
            <span className="brandName">Soluciones Energéticamente Eficientes</span>
          </Link>

          {/* Navegación principal (rutas) */}
          <nav className="navLinks" aria-label="Navegación principal">
            <Link to="/">Inicio</Link>
            <Link to="/servicios">Servicios</Link>
            <Link to="/nosotros">Nosotros</Link>
            <Link to="/proyectos">Proyectos</Link>

            <button
              type="button"
              className="btn btnGhost btnSmall themeToggle"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              aria-label={nextThemeLabel}
              aria-pressed={theme === 'dark'}
              title={nextThemeLabel}
            >
              {nextThemeLabel}
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="siteFooter" aria-label="Pie de página">
        <div className="footerInner">
          <section id="contacto" className="contactBox" aria-label="Contacto">
            <h2 className="contactBoxTitle">Contacto</h2>
            <div className="contactItems">
              <div className="muted">Email: contacto@tudominio.com</div>
              <div className="muted">Teléfono: +00 000 000 000</div>
              <div className="muted">Ubicación: (tu ciudad)</div>
            </div>
          </section>

          <div className="footerNote">
            <span>Soluciones Energéticamente Eficientes</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
