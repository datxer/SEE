// Punto de entrada de la API (Rocket)
//
// Ideas clave:
// - "mount" define el prefijo base de nuestras rutas (aquí: /api)
// - El fairing de CORS agrega headers necesarios cuando el frontend corre en otro origen
//   (por ejemplo Vite en http://localhost:5173)
//
// Nota: Rocket por defecto levanta en 127.0.0.1:8000 (modo debug).
// Puedes cambiarlo con variables de entorno ROCKET_ADDRESS / ROCKET_PORT.

#[macro_use]
extern crate rocket;

mod cors;
mod routes;

#[launch]
fn rocket() -> _ {
    rocket::build()
        // CORS: permite que el navegador acepte respuestas de esta API desde el frontend.
        .attach(cors::Cors)
        // Rutas bajo /api (ej: GET /api/health)
        .mount("/api", routes::routes())
}
