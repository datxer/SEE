/*
  Validador simple para el panel de administración.

  Este proyecto usa un solo token compartido porque el objetivo es
  administrar contenido público no sensible. Más adelante, si quieres,
  esto se puede cambiar por usuarios, roles o JWT.
*/
export function assertAdminAuth(req, res) {
  const token = req.headers['x-admin-token']
  const expectedToken = process.env.ADMIN_TOKEN

  if (!expectedToken) {
    return res.status(500).json({ error: 'ADMIN_TOKEN no está configurada en el servidor' })
  }

  if (token !== expectedToken) {
    return res.status(401).json({ error: 'Token de administrador inválido o ausente' })
  }

  return true
}
