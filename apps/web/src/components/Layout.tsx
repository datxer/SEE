import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import './Layout.css'
import { setupRevealOnScroll } from '../lib/reveal'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'see:theme'

function getInitialTheme(): Theme {
  // Primero miramos si el usuario ya eligió un tema antes.
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved

  // Si nunca eligió, usamos la preferencia del sistema operativo.
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
  const [isNavOpen, setIsNavOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    /*
      Tema (claro/oscuro)
      - data-theme: lo seguimos usando para tus variables propias.
      - data-bs-theme: Bootstrap 5.3 lo usa para adaptar colores internos.
    */
    // Cada vez que cambia el tema, lo guardamos en el documento y en localStorage.
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.bsTheme = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    /*
      Cuando cambia la ruta, hacemos dos cosas:
      1) mandamos la vista arriba del todo
      2) reactivamos las animaciones reveal para el contenido nuevo

      Esto evita que, al navegar desde el footer u otra zona baja,
      la nueva página aparezca “a media altura” y confunda al usuario.

      Nota: usamos requestAnimationFrame para garantizar que el scroll ocurra
      DESPUÉS de que React haya renderizado todo el contenido nuevo.
      Esto evita que a veces la página aparezca a media altura.
    */
    requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      // También cierro el menú si estaba abierto, para mejor UX
      setIsNavOpen(false)
    })

    /*
      Animaciones de aparición (reveal)
      - Se re-ejecuta en cada cambio de ruta porque el contenido del <Outlet /> cambia.
      - No rompe accesibilidad: si el usuario prefiere menos movimiento, se desactiva.
    */
    const cleanup = setupRevealOnScroll()
    return cleanup
  }, [location.pathname])

  // Texto del botón = acción que ocurrirá al hacer click (no el estado actual).
  const nextThemeLabel = theme === 'dark' ? 'Modo claro' : 'Modo oscuro'
  const logoSrc = '/logo.jpg'

  return (
    <div className="layout d-flex flex-column min-vh-100">
      {/*
        Accesibilidad:
        - "Skip link" para saltar la navegación e ir directo al contenido.
        - Es invisible hasta que lo enfocas con teclado.
      */}
      <a className="skipLink" href="#main">
        Saltar al contenido
      </a>

      <header className="siteHeader sticky-top border-bottom">
        <nav className="navbar navbar-expand-lg">
          <div className="container-xxl py-3">
            {/* Marca: logo + nombre. Sirve para volver al inicio desde cualquier parte. */}
            <Link to="/" className="navbar-brand brand" aria-label="Ir al inicio" onClick={() => setIsNavOpen(false)}>
              <img
                className="brandLogo"
                src={logoSrc}
                alt="Soluciones Energéticamente Eficientes"
                onError={() => setLogoFailed(true)}
              />
              <span className="brandName">Soluciones Energéticamente Eficientes</span>
            </Link>

            {/*
              Menú responsive (sin depender del JS de Bootstrap)
              - Bootstrap aporta estilos del “collapse”, pero el estado lo manejamos nosotros.
            */}
            <button
              type="button"
              className="navbar-toggler"
              aria-controls="siteNav"
              aria-expanded={isNavOpen}
              aria-label="Mostrar u ocultar navegación"
              onClick={() => setIsNavOpen((v) => !v)}
            >
              <span className="navbar-toggler-icon" aria-hidden="true" />
            </button>

            <div id="siteNav" className={isNavOpen ? 'collapse navbar-collapse show' : 'collapse navbar-collapse'}>
              <div className="navbar-nav ms-auto gap-1 navPills" aria-label="Navegación principal">
                {/* Cada NavLink cambia su estilo solo si la ruta está activa */}
                <NavLink
                  to="/"
                  end
                  onClick={() => setIsNavOpen(false)}
                  className={({ isActive }) => (isActive ? 'nav-link navPill active' : 'nav-link navPill')}
                >
                  Inicio
                </NavLink>
                <NavLink
                  to="/servicios"
                  onClick={() => setIsNavOpen(false)}
                  className={({ isActive }) => (isActive ? 'nav-link navPill active' : 'nav-link navPill')}
                >
                  Servicios
                </NavLink>
                <NavLink
                  to="/nosotros"
                  onClick={() => setIsNavOpen(false)}
                  className={({ isActive }) => (isActive ? 'nav-link navPill active' : 'nav-link navPill')}
                >
                  Nosotros
                </NavLink>
                <NavLink
                  to="/proyectos"
                  onClick={() => setIsNavOpen(false)}
                  className={({ isActive }) => (isActive ? 'nav-link navPill active' : 'nav-link navPill')}
                >
                  Proyectos
                </NavLink>

                {/* CTA a contacto (patrón común de templates informativos) */}
                <a
                  href="#contacto"
                  className="btn btn-success btn-sm navCtaBtn"
                  onClick={() => setIsNavOpen(false)}
                >
                  Contacto
                </a>

                <button
                  type="button"
                  className="btn btn-outline-success btn-sm themeToggle"
                  onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                  aria-label={nextThemeLabel}
                  aria-pressed={theme === 'dark'}
                  title={nextThemeLabel}
                >
                  {nextThemeLabel}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main id="main" className="main container-xxl flex-fill py-5">
        {/* Outlet = el hueco donde React Router coloca la página actual */}
        <Outlet />
      </main>

      <footer className="siteFooter border-top bg-body-tertiary" aria-label="Pie de página">
        <div className="container-xxl py-4 d-grid gap-3">
          <section id="contacto" className="contactBox card shadow-sm" aria-label="Contacto">
            <div className="card-body">
              <h2 className="contactBoxTitle h6 m-0">Contacto</h2>
              <div className="contactItems mt-2 d-grid gap-2">
              {/*
                Enlaces clicables:
                - mailto/tel son un estándar en webs actuales (móvil-friendly).
                - Datos tomados de la presentación de la empresa.
              */}
                {/* Email: abre el cliente de correo del usuario */}
                <a className="text-body-secondary" href="mailto:ismaray@cedai.com.cu">
                  Email: ismaray@cedai.com.cu
                </a>
                {/* WhatsApp del director general */}
                <a className="text-body-secondary" href="https://wa.me/5352798676"
                   target="_blank" 
                   rel="noopener noreferrer">
                  Director general: +53 52798676
                </a>
                {/* WhatsApp del director comercial */}
                <a className="text-body-secondary" href="https://wa.me/5352797280"
                   target="_blank" 
                  rel="noopener noreferrer">
                  Director comercial: +53 52797280
                </a>
                {/* Dirección física de la empresa */}
                <div className="text-body-secondary">
                  Ubicación: Calle G No. 302, esq. 13, Vedado, Plaza de la Revolución, La Habana, Cuba
                </div>
              </div>
            </div>
          </section>

          <div className="footerNote d-flex justify-content-between gap-2 flex-wrap text-body-secondary fw-semibold">
            <span>Soluciones Energéticamente Eficientes</span>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <a className="text-body-secondary small fw-semibold" href="/admin">
                Área interna
              </a>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
