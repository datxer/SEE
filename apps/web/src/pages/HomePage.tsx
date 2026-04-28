import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './HomePage.css'

type HeroSlide = {
  src: string
  alt: string
}

/*
  HERO (slider con transiciones)

  Aclaración (lo que se cambió respecto a antes):
  - Se ELIMINÓ la dependencia de la “presentación” en PDF/PNG numerados.
  - Se MANTIENE el efecto de transición (fade) y los botones de navegación.
  - Las imágenes ahora se agregan manualmente en la lista `HERO_SLIDES`.

  Cómo usarlo (manual):
  1) Copia tus imágenes a `apps/web/public/`
  2) Agrega aquí las rutas, por ejemplo:
     { src: '/promo-01.jpg', alt: 'Promo 1' }
     { src: '/promo-02.jpg', alt: 'Promo 2' }

  Nota (Vite): lo que está en /public se sirve desde la raíz: `/<archivo>`.
*/
const HERO_SLIDES: HeroSlide[] = [
  {
    /*
      Home: imágenes manuales en /public

      Importante:
      - Aquí SOLO referenciamos imágenes (png/jpg/webp). Los PDFs NO se usan en el slider.
      - Los botones del slider solo aparecen al pasar el mouse por encima (hover)
        y al enfocar/tocar (para que sea usable sin mouse).
    */
    src: '/home_1.png',
    alt: 'Home — imagen 1',
  },
  {
    src: '/home_2.png',
    alt: 'Home — imagen 2',
  }
  // Agrega más slides aquí…
]

function IconWrench() {
  // Icono inline (SVG) para evitar dependencias y mantener el template autocontenido.
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.7 6.3a4.5 4.5 0 0 0-6.2 5.9L3.4 17.3a1.2 1.2 0 0 0 0 1.7l1.6 1.6a1.2 1.2 0 0 0 1.7 0l5.1-5.1a4.5 4.5 0 0 0 5.9-6.2l-2.3 2.3-2.1-.5-.5-2.1 2.3-2.3Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2 20 5v7c0 5.2-3.3 9.7-8 10-4.7-.3-8-4.8-8-10V5l8-3Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="m9 12 2 2 4-5"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconPiggy() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 11a7 7 0 0 0-13-3H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h.6A7 7 0 0 0 19 16h1a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-.2Z"
        fill="currentColor"
        opacity="0.9"
      />
      <circle cx="15" cy="11" r="1" fill="#fff" />
      <path d="M8 18v2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 18v2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconLeaf() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 4c-7.5 0-13 4.5-13 12 0 2.2 1.8 4 4 4 7.5 0 12-5.5 12-13 0-.6-.4-1-1-1h-2Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path d="M8 20c1-5 5-9 10-12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconSun() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.9" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9">
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
        <path d="M4.2 4.2l2.1 2.1" />
        <path d="M17.7 17.7l2.1 2.1" />
        <path d="M19.8 4.2l-2.1 2.1" />
        <path d="M6.3 17.7l-2.1 2.1" />
      </g>
    </svg>
  )
}

function IconChart() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <path d="M6 17V11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      <path d="M12 17V7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      <path d="M18 17v-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
    </svg>
  )
}

export default function HomePage() {
  /*
    Esta página está pensada como Landing (información / presentación).
    Por eso NO llamamos a la API al cargar:
    - Evitamos que el Home muestre errores si el backend aún no está corriendo.
    - El backend lo usaremos después para cosas reales (p.ej. formulario de contacto).
  */

  /*
    Slideshow del HERO
    - Fade controlado por CSS (opacity + transition).
    - Rotación automática cada X segundos.
    - Si una imagen falla (archivo no existe), la marcamos como fallida y se omite.
      Esto te ayuda cuando estés cargando imágenes manualmente y te equivoques en el nombre.
  */
  const [failedSlideSrcs, setFailedSlideSrcs] = useState<Record<string, true>>({})

  const availableSlides = useMemo(() => {
    return HERO_SLIDES.filter((s) => !failedSlideSrcs[s.src])
  }, [failedSlideSrcs])

  const [activeSlideIndex, setActiveSlideIndex] = useState(0)

  // Bandera para animar también el copy cuando cambia la imagen.
  const [isHeroSwapping, setIsHeroSwapping] = useState(false)

  const goToPrevSlide = () => {
    if (availableSlides.length === 0) return
    setActiveSlideIndex((i) => (i - 1 + availableSlides.length) % availableSlides.length)
  }

  const goToNextSlide = () => {
    if (availableSlides.length === 0) return
    setActiveSlideIndex((i) => (i + 1) % availableSlides.length)
  }

  useEffect(() => {
    // Si cambia el set de slides disponibles (por errores), ajustamos el índice.
    if (activeSlideIndex >= availableSlides.length) setActiveSlideIndex(0)
  }, [activeSlideIndex, availableSlides.length])

  useEffect(() => {
    // Dispara una animación corta al cambiar de imagen.
    // Respeta accesibilidad: si el usuario prefiere menos movimiento, no animamos.
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (prefersReducedMotion) return

    setIsHeroSwapping(true)
    const timeoutId = window.setTimeout(() => setIsHeroSwapping(false), 850)
    return () => window.clearTimeout(timeoutId)
  }, [activeSlideIndex])

  useEffect(() => {
    // Si solo hay 0/1 slide, no hay nada que rotar.
    if (availableSlides.length < 2) return

    // Respeta accesibilidad: si el usuario prefiere menos movimiento, no auto-rotamos.
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (prefersReducedMotion) return

    const intervalId = window.setInterval(() => {
      setActiveSlideIndex((i) => (i + 1) % availableSlides.length)
    }, 7000)

    return () => window.clearInterval(intervalId)
  }, [availableSlides.length])

  return (
    <div className="vstack gap-5">
      {/*
        1) HERO
        - Layout moderno tipo landing actual: media grande + copy + CTA.
        - Usamos Bootstrap para grid y spacing, y CSS local para el slider/gradientes.
      */}
      <section className="hero" aria-label="Sección principal" data-reveal>
        <div className={isHeroSwapping ? 'heroInner row g-0 isSwapping' : 'heroInner row g-0'}>
          <div className="heroMedia col-lg-6">
            {/*
              Slider con transición.
              - Renderizamos todas las imágenes “apiladas” y con CSS hacemos el fade.
              - `alt` solo en la slide activa para que lectores de pantalla no “lean” todas.
            */}
            <div className="heroSlider" aria-label="Galería de fotos y promociones" role="region">
              {availableSlides.length === 0 ? (
                // Fallback simple si no hay slides (o todas fallaron).
                <div className="heroSliderFallback" aria-label="Sin imágenes disponibles" />
              ) : (
                availableSlides.map((slide, index) => (
                  <img
                    key={slide.src}
                    className={index === activeSlideIndex ? 'heroSlide isActive' : 'heroSlide'}
                    src={slide.src}
                    alt={index === activeSlideIndex ? slide.alt : ''}
                    aria-hidden={index !== activeSlideIndex}
                    draggable={false}
                    onError={() =>
                      setFailedSlideSrcs((prev) => {
                        if (prev[slide.src]) return prev
                        return { ...prev, [slide.src]: true }
                      })
                    }
                  />
                ))
              )}

              {/*
                Controles manuales del slider.
                - Botones semi transparentes encima de la imagen.
                - Se muestran al pasar el mouse por encima (hover) o con foco (teclado).
              */}
              {availableSlides.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="btn btn-light heroNavBtn heroNavPrev"
                    onClick={goToPrevSlide}
                    aria-label="Imagen anterior"
                    title="Anterior"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="btn btn-light heroNavBtn heroNavNext"
                    onClick={goToNextSlide}
                    aria-label="Imagen siguiente"
                    title="Siguiente"
                  >
                    ›
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="heroContent col-lg-6">
            <div className="p-4 p-lg-5">
              <div className="d-inline-flex align-items-center gap-2 badgeRow" aria-label="Etiquetas">
                <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle">
                  Ingeniería
                </span>
                <span className="badge text-bg-secondary">Eficiencia energética</span>
                <span className="badge text-bg-secondary">Energías renovables</span>
              </div>

              <h1 className="heroTitle display-5 fw-bold mt-3 mb-2">
                Soluciones <span className="text-success">Sostenibles</span> y <span className="text-success">Eficientes</span>
              </h1>
              <p className="heroSubtitle text-body-secondary mb-4">
                Soluciones Energéticamente Eficientes (SEE) ofrece servicios especializados en ingeniería, elaboración de
                proyectos técnicos y ejecutivos, asistencia técnica y consultoría en eficiencia energética y energías
                renovables.
              </p>

              <div className="d-flex gap-2 flex-wrap">
                {/* CTA principal -> contacto (lead) */}
                <a href="https://wa.me/5352797280"
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="btn btn-success btn-lg" >
                  Solicitar Asesoría
                </a>

                {/* CTA secundaria -> servicios */}
                <Link to="/servicios" className="btn btn-outline-success btn-lg">
                  Ver servicios
                </Link>
              </div>

              {/*
                Mini “stats bar” (patrón típico en templates modernos).
                Son texto placeholder: ajusta a tus datos reales cuando quieras.
              */}
              <div className="heroStats row g-2 mt-4" aria-label="Indicadores">
                <div className="col-12 col-sm-4">
                  <div className="statBox">
                    <div className="statValue">2400 kWp</div>
                    <div className="statLabel">FV instalados en el país</div>
                  </div>
                </div>
                <div className="col-12 col-sm-4">
                  <div className="statBox">
                    <div className="statValue">298</div>
                    <div className="statLabel">Revisiones energéticas</div>
                  </div>
                </div>
                <div className="col-12 col-sm-4">
                  <div className="statBox">
                    <div className="statValue">9</div>
                    <div className="statLabel">Estaciones de carga VE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2) SERVICIOS: cards */}
      <section aria-label="Servicios destacados" data-reveal>
        <div className="d-flex align-items-end justify-content-between gap-3 flex-wrap">
          <div>
            <h2 className="h3 m-0">Servicios</h2>
            <p className="text-body-secondary m-0 mt-2">De la asesoría a la instalación, con soporte.</p>
          </div>
          <Link to="/servicios" className="btn btn-outline-success">
            Ver catálogo
          </Link>
        </div>

        <div className="row g-4 mt-3">
          <div className="col-12 col-md-4">
            <article className="featureCard card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="iconBubble" aria-hidden="true">
              <IconWrench />
                </div>
                <h3 className="h5 mt-3">Sistemas fotovoltaicos</h3>
                <p className="text-body-secondary mb-0">Diseño, suministro, montaje y puesta en marcha (red, aislado o híbrido).</p>
              </div>
            </article>
          </div>

          <div className="col-12 col-md-4">
            <article className="featureCard card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="iconBubble" aria-hidden="true">
              <IconShield />
                </div>
                <h3 className="h5 mt-3">Tratamiento de agua</h3>
                <p className="text-body-secondary mb-0">Diseño personalizado, montaje y mantenimiento preventivo/correctivo.</p>
              </div>
            </article>
          </div>

          <div className="col-12 col-md-4">
            <article className="featureCard card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="iconBubble" aria-hidden="true">
              <IconPiggy />
                </div>
                <h3 className="h5 mt-3">SCADA y automatización</h3>
                <p className="text-body-secondary mb-0">Monitoreo y control para optimizar procesos y reducir consumo energético.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 3) BENEFICIOS */}
      <section aria-label="Beneficios" data-reveal>
        <div className="text-center">
          <h2 className="h3 m-0">Lo mejor es el proceso</h2>
          <p className="text-body-secondary m-0 mt-2">Acompañamiento real desde el diseño hasta el postventa</p>
        </div>

        <div className="row g-4 mt-3">
          <div className="col-12 col-md-4">
            <article className="featureCard card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="iconBubble" aria-hidden="true">
              <IconLeaf />
                </div>
                <h3 className="h5 mt-3">Acompañamiento continuo</h3>
                <p className="text-body-secondary mb-0">Desde la planificación hasta la puesta en marcha y el soporte postventa.</p>
              </div>
            </article>
          </div>

          <div className="col-12 col-md-4">
            <article className="featureCard card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="iconBubble" aria-hidden="true">
              <IconSun />
                </div>
                <h3 className="h5 mt-3">Propuestas atractivas</h3>
                <p className="text-body-secondary mb-0">Soluciones que equilibran calidad y costo para una inversión eficiente.</p>
              </div>
            </article>
          </div>

          <div className="col-12 col-md-4">
            <article className="featureCard card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="iconBubble" aria-hidden="true">
              <IconChart />
                </div>
                <h3 className="h5 mt-3">Colaboración desde el diseño</h3>
                <p className="text-body-secondary mb-0">Optimizamos el proyecto desde el inicio junto a fabricantes y especialistas.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 4) CTA final */}
      <section className="cta" aria-label="Llamado a la acción" data-reveal>
        <div className="text-center p-4 p-lg-5">
          <h2 className="h3 m-0">¿Hablamos de tu proyecto?</h2>
          <p className="text-body-secondary mt-2 mb-4">
            Escríbenos y te orientamos con la solución adecuada (fotovoltaica, tratamiento de agua, automatización y más).
          </p>
          <Link to="/nosotros" className="btn btn-success btn-lg">
            Conócenos
          </Link>
        </div>
      </section>
    </div>
  )
}
