use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::Header;
use rocket::{Request, Response};

// Fairing (middleware) de CORS.
//
// ¿Por qué existe?
// - En desarrollo, el frontend suele correr en otro origen (host/puerto)
//   como http://localhost:5173 (Vite).
// - El navegador bloquea llamadas cross-origin si la API no responde con
//   headers CORS adecuados.
//
// Importante:
// - Si usas el proxy de Vite (/api -> http://localhost:8000), CORS ni siquiera
//   es estrictamente necesario, porque el navegador "cree" que llama al mismo origen.
// - Aun así es útil para cuando pegues a la API directamente desde otro host.
//
// Puedes ajustar el origen permitido con:
//   CORS_ALLOW_ORIGIN="https://tu-dominio.com"
pub struct Cors;

#[rocket::async_trait]
impl Fairing for Cors {
    fn info(&self) -> Info {
        Info {
            name: "CORS",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, _request: &'r Request<'_>, response: &mut Response<'r>) {
        // Por defecto permitimos el origen del frontend local.
        let allow_origin = std::env::var("CORS_ALLOW_ORIGIN")
            .unwrap_or_else(|_| "http://localhost:5173".to_string());

        // Headers típicos de CORS.
        response.set_header(Header::new("Access-Control-Allow-Origin", allow_origin));
        response.set_header(Header::new("Vary", "Origin"));
        response.set_header(Header::new(
            "Access-Control-Allow-Methods",
            "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        ));
        response.set_header(Header::new(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization",
        ));
        response.set_header(Header::new("Access-Control-Max-Age", "86400"));
    }
}
