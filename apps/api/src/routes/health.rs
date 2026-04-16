use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::serde::Serialize;

// Respuesta JSON simple.
// Se usa como endpoint "health" para comprobar que la API está viva.
#[derive(Serialize)]
#[serde(crate = "rocket::serde")]
pub struct HealthResponse {
    status: String,
}

// GET /api/health
// Útil para:
// - verificar que el backend corre
// - monitoreo básico
#[get("/health")]
pub fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
    })
}

// OPTIONS /api/<cualquier_ruta>
// Preflight CORS:
// - algunos requests (por ejemplo POST con JSON) disparan una petición OPTIONS primero.
// - responder 204 ayuda a que el navegador permita el request real.
#[options("/<_path..>")]
pub fn preflight(_path: std::path::PathBuf) -> Status {
    Status::NoContent
}
