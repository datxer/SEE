/*
  Reveal on scroll (aparición de contenido al hacer scroll)

  Objetivo:
  - Dar sensación moderna (contenido “entra” suavemente).
  - Sin dependencias externas.
  - Respeta accesibilidad: si el usuario prefiere menos movimiento, NO animamos.

  Cómo se usa:
  - En tu markup, agrega el atributo: data-reveal
    Ejemplo: <section data-reveal>...</section>
  - En Layout, llamamos a setupRevealOnScroll() en cada cambio de ruta.
*/

// Firma de la funcion de limpieza (se usa en useEffect).
export type RevealCleanup = () => void

export function setupRevealOnScroll(): RevealCleanup {
  // Esta funcion inicializa el observer y devuelve un cleanup para desconectarlo.
  // Si el navegador no soporta IntersectionObserver, mostramos todo sin animación.
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      el.classList.add('reveal', 'is-revealed')
    })
    return () => {}
  }

  // Accesibilidad: si el usuario prefiere menos movimiento, mostramos todo sin animación.
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  if (prefersReducedMotion) {
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      el.classList.add('reveal', 'is-revealed')
    })
    return () => {}
  }

  // Tomamos todos los nodos marcados. El atributo evita “clases mágicas” por todos lados.
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))

  /*
    Importante para UX:
    - Si un elemento ya está visible (arriba del fold), lo revelamos inmediatamente
      para evitar un “parpadeo” al aplicar la clase .reveal.
    - Si está fuera de pantalla, sí lo dejamos en estado inicial para animarlo al entrar.
  */
  const toObserve: HTMLElement[] = []
  for (const el of targets) {
    el.classList.add('reveal')

    const rect = el.getBoundingClientRect()
    const isAlreadyInView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0
    if (isAlreadyInView) {
      el.classList.add('is-revealed')
      continue
    }

    toObserve.push(el)
  }

  const observer = new IntersectionObserver(
    (entries) => {
      // Cada vez que un bloque entra en pantalla, le marcamos que ya se puede mostrar.
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target as HTMLElement
        el.classList.add('is-revealed')
        observer.unobserve(el)
      }
    },
    {
      // Un umbral bajo hace que se vea “natural” al entrar en viewport.
      threshold: 0.12,
      // Margen inferior negativo: revela un poquito antes de que llegue al centro.
      rootMargin: '0px 0px -8% 0px',
    }
  )

  toObserve.forEach((el) => observer.observe(el))

  return () => observer.disconnect()
}
