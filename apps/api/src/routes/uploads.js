// Multer maneja uploads multipart/form-data.
import multer from 'multer'
// Helpers de rutas para ubicar la carpeta de uploads.
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { dirname } from 'path'
// Protegemos el upload para que solo el admin suba archivos.
import { assertAdminAuth } from '../middleware/auth.js'

// Ruta real del archivo actual y su carpeta.
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Los archivos subidos terminan dentro del frontend público.
// Así Vite puede servirlos directamente como /uploads/archivo.jpg.
const uploadsDir = path.join(__dirname, '../../web/public/uploads')

/*
  Configuración de multer.

  Multer se encarga de recibir archivos multipart/form-data y guardarlos
  en disco. Aquí definimos dónde se guardan y cómo se nombran.
*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Creamos la carpeta solo si todavía no existe.
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    // Generamos un nombre único para evitar colisiones entre archivos.
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    const ext = path.extname(file.originalname)
    const name = `${timestamp}-${random}${ext}`
    cb(null, name)
  }
})

// Solo aceptamos imágenes comunes.
const fileFilter = (req, file, cb) => {
  // Lista blanca de tipos permitidos para evitar archivos peligrosos.
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, WebP, GIF)'))
  }
}

// El límite evita que alguien suba archivos enormes por error.
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
})

/*
  POST /api/uploads

  Sube una imagen y devuelve su URL pública.
  Este endpoint no modifica proyectos; solo deja lista la imagen para que el
  admin la asocie después a la galería correspondiente.
*/
export function uploadFile(req, res) {
  if (!assertAdminAuth(req, res)) {
    return
  }

  // Multer procesa el archivo y, cuando termina, nosotros devolvemos la URL.
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Error al subir archivo' })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' })
    }

    // La URL publica queda disponible desde /uploads/...
    const url = `/uploads/${req.file.filename}`
    res.json({ url })
  })
}

export default {
  uploadFile
}
