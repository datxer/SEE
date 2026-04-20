# Proyecto Web CEDAI

Este repo tiene **2 apps**: un **frontend** (React + Vite) y un **backend** (Rust + Rocket).

## Estructura

- `apps/web/` → Frontend (sitio web)
  - `public/` → assets estáticos (imágenes, logos). Se acceden como `/<archivo>`.
  - `src/main.tsx` → punto de entrada de React (monta el router y la app).
  - `src/App.tsx` → definición de rutas con React Router.
  - `src/components/Layout.tsx` + `src/components/Layout.css` → header/nav + contenedor principal + footer.
  - `src/pages/` → páginas (Inicio/Servicios/Nosotros/Proyectos).
  - `src/styles/global.css` → variables de tema (claro/oscuro), botones y estilos globales.
  - `src/lib/api.ts` → funciones para llamar al backend (fetch).
  - `vite.config.ts` → config de Vite; incluye proxy `/api` → `http://localhost:8000` en DEV.

- `apps/api/` → Backend (API)
  - `src/main.rs` → entrypoint de Rocket (monta `/api` + CORS).
  - `src/routes/` → endpoints (por ahora `health`).
  - `src/cors.rs` → middleware de CORS (headers para permitir requests desde el frontend).

## Cómo correr en desarrollo

### 1) Backend (Rocket)

En una terminal:

```bash
cd apps/api
cargo run
```

Luego prueba:
- `GET http://localhost:8000/api/health` → debería responder `{ "status": "ok" }`

### 2) Frontend (Vite)

En otra terminal:

```bash
cd apps/web
npm run dev
```

- Abre la URL que te muestre Vite (normalmente `http://localhost:5173`).
- En DEV, cualquier `fetch('/api/...')` se proxyea al backend por `vite.config.ts`.

## Slideshow (caja de la foto del Home)

- Se implementa en `apps/web/src/pages/HomePage.tsx`.
- Estilos del fade + botones en `apps/web/src/pages/HomePage.css`.
- Para cambiar imágenes/promos:
  1) copia tus imágenes a `apps/web/public/`
  2) actualiza la constante `HERO_SLIDES` con tus rutas (ej. `'/promo-01.jpg'`).

## Nota sobre comentarios

El código está comentado por secciones para explicar qué hace cada parte.
Cuando hagamos cambios nuevos, la idea es **dejar el código tocado comentado** (qué hace y por qué existe).
