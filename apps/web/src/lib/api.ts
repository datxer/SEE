export type HealthResponse = {
  // Estructura de la respuesta del endpoint GET /api/health.
  // Mantener esto tipado evita errores (TypeScript valida el shape esperado).
  status: string
}

export async function fetchHealth(): Promise<HealthResponse> {
  /*
    Llamada simple a la API.

    Importante:
    - Usamos '/api/...' (ruta relativa) para que en DEV Vite lo proxyee al backend
      Express (ver vite.config.ts), y en PROD puedas configurar el servidor para servir
      frontend y backend bajo el mismo dominio.
  */
  const res = await fetch('/api/health', {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  })

  if (!res.ok) {
    // Si el backend responde con error, levantamos excepción para que el caller decida qué hacer.
    throw new Error(`API error: ${res.status}`)
  }

  // Parseo explícito a JSON y casteo al tipo esperado.
  // Aquí solo hacemos la llamada; mostrar el dato en pantalla lo hace otro componente.
  return (await res.json()) as HealthResponse
}
