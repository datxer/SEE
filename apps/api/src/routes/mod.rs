use rocket::Route;

// Módulo de rutas (endpoints) de la API.
//
// Ventaja de esta estructura:
// - main.rs solo monta "routes()" y no crece con cada endpoint.
// - cada archivo en routes/* se encarga de un tema (health, contacto, etc.)

mod health;

pub fn routes() -> Vec<Route> {
    // Registramos las rutas declaradas con macros de Rocket.
    // - health: endpoint de prueba
    // - preflight: OPTIONS para CORS
    routes![health::health, health::preflight]
}
