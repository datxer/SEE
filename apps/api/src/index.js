// Express es el servidor HTTP que expone la API del proyecto.
import express from 'express'
// Middleware simple para validar el token del admin.
import { assertAdminAuth } from './middleware/auth.js'
// Endpoints de proyectos y estadisticas (GET/POST/PATCH/DELETE).
import projectRoutes from './routes/projects.js'
// Endpoint de subida de imagenes con multer.
import uploadRoutes from './routes/uploads.js'

// Creamos la aplicacion Express (el servidor en memoria).
const app = express()
// Puerto configurable; por defecto usamos 8000.
const PORT = process.env.PORT || 8000

// Parseador JSON para que Express entienda cuerpos application/json.
app.use(express.json())

/*
  Respuesta a preflight OPTIONS.

  Cuando el navegador sospecha que un request puede ser "especial",
  primero pregunta si la API acepta ese método y esos headers.
*/
// CORS: respuesta basica a preflight (OPTIONS) para habilitar peticiones desde el frontend.
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,x-admin-token')
  res.sendStatus(200)
})

// Inyectamos CORS en todas las respuestas para evitar bloqueos del navegador.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,x-admin-token')
  next()
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

// Rutas protegidas: solo el admin puede crear o cambiar contenido.
app.post('/api/projects', projectRoutes.createProject)
app.patch('/api/projects/:id', projectRoutes.updateProject)
app.post('/api/projects/:id/photos', projectRoutes.addProjectPhoto)
app.patch('/api/projects/:id/photos/:photoId', projectRoutes.updateProjectPhoto)
app.delete('/api/projects/:id/photos/:photoId', projectRoutes.deleteProjectPhoto)
app.delete('/api/projects/:id', projectRoutes.deleteProject)

// Subida de imagenes.
app.post('/api/uploads', uploadRoutes.uploadFile)

// Health check para probar si la API esta viva.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Arrancamos el servidor en el puerto definido.
app.listen(PORT, () => {
  console.log(`✓ API corriendo en http://localhost:${PORT}`)
  console.log(`✓ Endpoints: /api/projects, /api/statistics, /api/projects/:id/photos, /api/uploads, /api/health`)
  console.log(`✓ Protegidos con header: x-admin-token`)
})
