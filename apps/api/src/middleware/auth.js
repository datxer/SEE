/*
  Validador simple para el panel de administración.

  Este proyecto usa un solo token compartido porque el objetivo es
  administrar contenido público no sensible. Más adelante, si quieres,
  esto se puede cambiar por usuarios, roles o JWT.
*/

// Token esperado para el panel admin (modo simple, sin usuarios).
// Cambiar aqui si se necesita otra contrasena.
const expectedToken = '12345678'

export function assertAdminAuth(req, res) {
  // Leemos el header que el frontend envia con la clave.
  const token = req.headers['x-admin-token']

  if (!expectedToken) {
    // Si el token esperado no existe, es un error de configuración del servidor.
    // Respondemos y devolvemos false para que la ruta NO siga ejecutándose.
    res.status(500).json({ error: 'ADMIN_TOKEN no está configurada en el servidor' })
    return false
  }

  if (token !== expectedToken) {
    // Si el token no coincide, devolvemos 401 y detenemos la ejecución.
    res.status(401).json({ error: 'Token de administrador inválido o ausente' })
    return false
  }

  // Si todo esta bien, la ruta puede continuar.
  return true
}

/*
  Cambia la contraseña del administrador (modo simple):
  - Edita la constante `expectedToken` en este archivo.
  - Reinicia el servidor para aplicar los cambios.

  Nota: si más adelante quieres usar variables de entorno (.env), se puede
  reemplazar `expectedToken` por `process.env.ADMIN_TOKEN` y documentarlo.
*/
