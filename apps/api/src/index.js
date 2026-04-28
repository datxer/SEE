import express from 'express'
import { assertAdminAuth } from './middleware/auth.js'
import projectRoutes from './routes/projects.js'
import uploadRoutes from './routes/uploads.js'

// Creamos la aplicación Express.
const app = express()
const PORT = process.env.PORT || 8000

// JSON parser para que la API entienda cuerpos tipo application/json.
app.use(express.json())

/*
  Respuesta a preflight OPTIONS.

  Cuando el navegador sospecha que un request puede ser "especial",
  primero pregunta si la API acepta ese método y esos headers.
*/
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

// Rutas públicas: el frontend puede leer proyectos sin autenticarse.
app.get('/api/projects', projectRoutes.listProjects)

// Verificación ligera del panel de administración.
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

// Subida de imágenes.
app.post('/api/uploads', uploadRoutes.uploadFile)

// Health check para probar si la API está viva.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`✓ API corriendo en http://localhost:${PORT}`)
  console.log(`✓ Endpoints: /api/projects, /api/projects/:id/photos, /api/uploads, /api/health`)
  console.log(`✓ Protegidos con header: x-admin-token`)
})
