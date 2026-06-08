/*
  Autenticación del panel admin con contraseña hasheada + JWT.

  Flujo:
  1. El admin hace login enviando su contraseña.
  2. El backend valida con bcrypt y emite un JWT con expiración.
  3. Las rutas protegidas validan el JWT en cada request.
*/

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Hash bcrypt de la contraseña del admin.
const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim()
// Clave secreta para firmar JWT (obligatoria).
const jwtSecret = process.env.ADMIN_JWT_SECRET?.trim()
// TTL del token en segundos (por defecto 30 min).
const tokenTtlSeconds = Number(process.env.ADMIN_JWT_TTL_SECONDS) || 1800

function getTokenFromRequest(req) {
  // Permitimos token por Authorization: Bearer o por header x-admin-token.
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim()
  }

  const legacyToken = req.headers['x-admin-token']
  return typeof legacyToken === 'string' ? legacyToken.trim() : ''
}

function isConfigReady() {
  return Boolean(passwordHash && jwtSecret)
}

export function loginAdmin(req, res) {
  if (!isConfigReady()) {
    res.status(500).json({ error: 'Configuración de autenticación incompleta' })
    return
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  if (!password) {
    res.status(400).json({ error: 'La contraseña es obligatoria' })
    return
  }

  const isValid = bcrypt.compareSync(password, passwordHash)

  if (!isValid) {
    res.status(401).json({ error: 'Credenciales inválidas' })
    return
  }

  const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: tokenTtlSeconds })
  res.json({ token, expiresInSeconds: tokenTtlSeconds })
}

export function assertAdminAuth(req, res) {
  if (!isConfigReady()) {
    res.status(500).json({ error: 'Configuración de autenticación incompleta' })
    return false
  }

  const token = getTokenFromRequest(req)

  if (!token) {
    res.status(401).json({ error: 'Token de administrador ausente' })
    return false
  }

  try {
    jwt.verify(token, jwtSecret)
    return true
  } catch {
    res.status(401).json({ error: 'Token de administrador inválido o expirado' })
    return false
  }
}

/*
  Cambia la contraseña del administrador:
  - Genera un hash bcrypt y colócalo en ADMIN_PASSWORD_HASH.
  - Define ADMIN_JWT_SECRET con un valor aleatorio y largo.
*/
