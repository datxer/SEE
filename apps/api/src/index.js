// Carga variables desde .env para entornos locales.
import 'dotenv/config'
// Express es el servidor HTTP que expone la API del proyecto.
import express from 'express'
// Helmet agrega headers de seguridad comunes.
import helmet from 'helmet'
// Rate limit para frenar abusos de la API.
import rateLimit from 'express-rate-limit'
// CORS controlado para permitir solo orígenes confiables.
import cors from 'cors'
// Middleware simple para validar el token del admin.
import { assertAdminAuth, loginAdmin } from './middleware/auth.js'
// Endpoints de proyectos y estadisticas (GET/POST/PATCH/DELETE).
import projectRoutes from './routes/projects.js'
// Endpoint de subida de imagenes con multer.
import uploadRoutes from './routes/uploads.js'

// Creamos la aplicacion Express (el servidor en memoria).
const app = express()
// Puerto configurable; por defecto usamos 8000.
const PORT = process.env.PORT || 8000

// Reduce superficie de ataque en respuestas por defecto.
app.disable('x-powered-by')

// Si se despliega detrás de un proxy, se puede activar con TRUST_PROXY=1.
if (process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1)
}

// Parseador JSON con límite para evitar payloads enormes.
app.use(express.json({ limit: '1mb' }))

// Headers de seguridad básicos para la API.
app.use(helmet())

// Orígenes permitidos para CORS (coma separada en CORS_ORIGIN).
const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173']
const allowedOrigins = configuredOrigins.length ? configuredOrigins : defaultOrigins

const corsOptions = {
  origin: (origin, callback) => {
    // Sin origin significa request no-browser (Postman/cURL), lo permitimos.
    if (!origin) {
      return callback(null, true)
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('CORS bloqueado'))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-token', 'Authorization'],
  maxAge: 600
}

// CORS global y respuesta a preflight.
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// Rate limit global para limitar abusos generales.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta más tarde' }
})

// Rate limit más estricto para uploads.
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas subidas, intenta más tarde' }
})

app.use('/api', generalLimiter)

// Respuesta 403 amigable cuando CORS bloquea un origen no permitido.
app.use((err, req, res, next) => {
  if (err?.message === 'CORS bloqueado') {
    return res.status(403).json({ error: 'Origen no permitido por CORS' })
  }

  return next(err)
})

// Rutas publicas: el frontend puede leer proyectos sin autenticarse.
app.get('/api/projects', projectRoutes.listProjects)

// Estadisticas: lectura publica (para mostrar numeros en la web) y edicion protegida (admin).
app.get('/api/statistics', projectRoutes.getStatistics)
app.patch('/api/statistics', projectRoutes.updateStatistics)

// Verificacion ligera del panel de administracion.
app.get('/api/admin/verify', (req, res) => {
  if (!assertAdminAuth(req, res)) {
    return
  }

  res.json({ ok: true })
})

// Login del panel admin (retorna JWT).
app.post('/api/admin/login', loginAdmin)

// Rutas protegidas: solo el admin puede crear o cambiar contenido.
app.post('/api/projects', projectRoutes.createProject)
app.patch('/api/projects/:id', projectRoutes.updateProject)
app.post('/api/projects/:id/photos', projectRoutes.addProjectPhoto)
app.patch('/api/projects/:id/photos/:photoId', projectRoutes.updateProjectPhoto)
app.delete('/api/projects/:id/photos/:photoId', projectRoutes.deleteProjectPhoto)
app.delete('/api/projects/:id', projectRoutes.deleteProject)

// Subida de imagenes con rate limit dedicado.
app.post('/api/uploads', uploadLimiter, uploadRoutes.uploadFile)

// Health check para probar si la API esta viva.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Handler final de errores para evitar filtrar detalles internos.
app.use((err, req, res, next) => {
  console.error('Error inesperado:', err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

// Arrancamos el servidor en el puerto definido.
app.listen(PORT, () => {
  console.log(`✓ API corriendo en http://localhost:${PORT}`)
  console.log(`✓ Endpoints: /api/projects, /api/statistics, /api/projects/:id/photos, /api/uploads, /api/health`)
  console.log(`✓ Protegidos con header: x-admin-token`)
})
