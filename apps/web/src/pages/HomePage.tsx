import { Link } from 'react-router-dom'
import heroIllustration from '../assets/hero-solar.svg'
import './HomePage.css'

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

  return (
    <div>
      {/* 1) HERO: imagen + título + subtítulo + botones (como en la plantilla) */}
      <section className="hero" aria-label="Sección principal">
        <div className="heroInner">
          <div className="heroMedia">
            {/* Imagen local (placeholder libre) para que no dependas de links externos */}
            <img src={heroIllustration} alt="Ilustración de paneles solares" />
          </div>

          <div className="heroContent">
            <h1 className="heroTitle">
              Energía <strong>Solar</strong> para un Futuro <strong>Sostenible</strong>
            </h1>
            <p className="heroSubtitle">
              Ahorra energía y cuida el planeta con soluciones solares pensadas para hogares y empresas.
            </p>

            <div className="heroActions">
              {/* CTA principal -> contacto (lead) */}
              <Link to="/contacto" className="btn btnPrimary">
                Solicitar Asesoría
              </Link>

              {/* CTA secundaria -> servicios */}
              <Link to="/servicios" className="btn btnGhost">
                Ver Más
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2) SERVICIOS: 3 cards */}
      <section className="section" aria-label="Servicios destacados">
        <div className="cardGrid">
          <article className="featureCard">
            <div className="iconBubble" aria-hidden="true">
              <IconWrench />
            </div>
            <h3>Instalación Profesional</h3>
            <p className="muted">Montaje seguro y eficiente de paneles solares.</p>
          </article>

          <article className="featureCard">
            <div className="iconBubble" aria-hidden="true">
              <IconShield />
            </div>
            <h3>Mantenimiento</h3>
            <p className="muted">Soporte y cuidado para tu sistema solar.</p>
          </article>

          <article className="featureCard">
            <div className="iconBubble" aria-hidden="true">
              <IconPiggy />
            </div>
            <h3>Ahorro Energético</h3>
            <p className="muted">Reduce tu factura y mejora tu eficiencia.</p>
          </article>
        </div>
      </section>

      {/* 3) BENEFICIOS: título + 3 cards */}
      <section className="section" aria-label="Beneficios">
        <h2 className="sectionTitle">Nuestros Beneficios</h2>
        <p className="sectionSubtitle">Energía limpia y renovable</p>

        <div className="cardGrid">
          <article className="featureCard">
            <div className="iconBubble" aria-hidden="true">
              <IconLeaf />
            </div>
            <h3>Ecológico y Limpio</h3>
            <p className="muted">Energía 100% verde.</p>
          </article>

          <article className="featureCard">
            <div className="iconBubble" aria-hidden="true">
              <IconSun />
            </div>
            <h3>Ahorra Dinero</h3>
            <p className="muted">Reduce tus costos de luz.</p>
          </article>

          <article className="featureCard">
            <div className="iconBubble" aria-hidden="true">
              <IconChart />
            </div>
            <h3>Aumenta tu Valor</h3>
            <p className="muted">Incrementa el valor de tu propiedad.</p>
          </article>
        </div>
      </section>

      {/* 4) CTA final */}
      <section className="cta" aria-label="Llamado a la acción">
        <h2 className="sectionTitle">Confía en los Expertos</h2>
        <p>Más de 10 años brindando soluciones solares de calidad.</p>
        <Link to="/nosotros" className="btn btnPrimary">
          Conócenos
        </Link>
      </section>
    </div>
  )
}
