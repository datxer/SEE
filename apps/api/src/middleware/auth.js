/*
  Validador simple para el panel de administración.

  Este proyecto usa un solo token compartido porque el objetivo es
  administrar contenido público no sensible. Más adelante, si quieres,
  esto se puede cambiar por usuarios, roles o JWT.
*/

// Cambiamos el token esperado a '12345678' para este ejemplo.
const expectedToken = '12345678'; // Cambiar aquí si se necesita otra contraseña.

export function assertAdminAuth(req, res) {
  const token = req.headers['x-admin-token']

  if (!expectedToken) {
    return res.status(500).json({ error: 'ADMIN_TOKEN no está configurada en el servidor' })
  }

  if (token !== expectedToken) {
    return res.status(401).json({ error: 'Token de administrador inválido o ausente' })
  }

  return true
}

/*
  Cambia la contraseña del administrador:
  - Ve al archivo .env en el servidor.
  - Busca o agrega la línea: ADMIN_TOKEN=12345678
  - Reinicia el servidor para aplicar los cambios.
*/
