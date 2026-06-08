// Generador de IDs unicos para proyectos y fotos.
import { v4 as uuidv4 } from 'uuid'
// Utilidades de lectura/escritura del JSON de proyectos.
import { readProjects, writeProjects } from '../utils/fileUtils.js'
// Middleware de autenticacion del panel admin.
import { assertAdminAuth } from '../middleware/auth.js'
// FS sin promesas para leer/escribir estadisticas de forma simple.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { z } from 'zod'

// Resolvemos la ruta real del modulo para ubicar el JSON.
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// En runtime este archivo vive en: apps/api/data/statistics.json
// Ojo: este módulo está en apps/api/src/routes, así que hay que subir 2 niveles.
// Ruta absoluta al archivo de estadisticas.
const statisticsPath = path.join(__dirname, '../../data/statistics.json')

// Claves peligrosas que se deben descartar para evitar prototype pollution.
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

// Esquemas Zod para validar payloads entrantes.
const booleanishSchema = z
  .union([z.boolean(), z.literal('true'), z.literal('false'), z.literal(1), z.literal(0)])
  .transform((value) => value === true || value === 'true' || value === 1)

const projectCreateSchema = z
  .object({
    title: z.string().min(1).max(160),
    body: z.string().min(1).max(5000),
    thumbnail: z.string().max(2000).nullable().optional()
  })
  .passthrough()

const projectPatchSchema = z
  .object({
    title: z.string().min(1).max(160).optional(),
    body: z.string().min(1).max(5000).optional(),
    thumbnail: z.string().max(2000).nullable().optional()
  })
  .passthrough()

const addPhotoSchema = z.object({
  url: z.string().min(1).max(2000),
  alt: z.string().max(200).optional(),
  cover: booleanishSchema.optional()
})

const updatePhotoSchema = z.object({
  url: z.string().min(1).max(2000).optional(),
  alt: z.string().max(200).optional(),
  order: z.coerce.number().int().nonnegative().optional(),
  cover: booleanishSchema.optional()
})

const statisticsPatchSchema = z.object({
  fv_instalados: z.coerce.number().finite().optional(),
  revisiones_energeticas: z.coerce.number().finite().optional(),
  estaciones_carga: z.coerce.number().finite().optional(),
  ahorro_estimado_anual: z.coerce.number().finite().optional()
})

function sanitizeObject(input) {
  // Solo aceptamos objetos planos para evitar mutaciones inesperadas.
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {}
  }

  const safe = {}

  for (const [key, value] of Object.entries(input)) {
    if (UNSAFE_KEYS.has(key)) {
      continue
    }

    safe[key] = value
  }

  return safe
}

function sanitizeText(value, maxLength) {
  // Recorta strings para evitar payloads enormes en el JSON.
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim().slice(0, maxLength)
}

function isSafeUrl(value) {
  // Permitimos URLs relativas (/uploads/...) o absolutas http/https.
  if (typeof value !== 'string') {
    return false
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return false
  }

  if (trimmed.startsWith('/')) {
    return true
  }

  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function resequencePhotos(photos) {
  // Ordena las fotos por su order y reasigna un indice limpio.
  return photos
    .slice()
    .sort((leftPhoto, rightPhoto) => leftPhoto.order - rightPhoto.order)
    .map((photo, index) => ({
      ...photo,
      order: index
    }))
}

function getNextThumbnail(currentProject, previousUrl, nextUrl, shouldCover) {
  // Calcula la nueva miniatura cuando se edita una foto.
  if (shouldCover) {
    return nextUrl
  }

  if (currentProject.thumbnail === previousUrl) {
    return nextUrl
  }

  return currentProject.thumbnail
}

/*
  GET /api/projects

  Devuelve el catálogo público de proyectos para la web.
  Esta ruta no pide token porque el frontend necesita leerla sin fricción.
*/
export async function listProjects(req, res) {
  try {
    // Leemos el JSON normalizado y lo devolvemos tal cual.
    const projects = await readProjects()
    // Evita respuestas cacheadas (ETag / disco / proxy) cuando el admin actualiza contenido.
    res.set('Cache-Control', 'no-store')
    res.json(projects)
  } catch (err) {
    // Si falla el disco o el JSON, avisamos con 500.
    res.status(500).json({ error: 'Error al leer proyectos' })
  }
}

/*
  POST /api/projects

  Crea un proyecto nuevo dentro del JSON.
  El admin puede mandar campos extra y el backend los conserva, así luego
  podemos agregar nuevos datos sin cambiar el esquema desde cero.
*/
export async function createProject(req, res) {
  if (!assertAdminAuth(req, res)) {
    return
  }

  try {
    // Tomamos el body que envia el admin (titulo, body, etc.).
    const payload = sanitizeObject(req.body ?? {})
    const { title, body, thumbnail, photos, id, ...extraFields } = payload
    const safeTitle = sanitizeText(title, 160)
    const safeBody = sanitizeText(body, 5000)
    const safeThumbnail = typeof thumbnail === 'string' && thumbnail.trim() ? thumbnail.trim() : null

    if (!safeTitle || !safeBody) {
      return res.status(400).json({ error: 'Título y descripción requeridos' })
    }

    const validation = projectCreateSchema.safeParse({
      title: safeTitle,
      body: safeBody,
      thumbnail: safeThumbnail,
      ...extraFields
    })

    if (!validation.success) {
      return res.status(400).json({ error: 'Datos inválidos en el proyecto' })
    }

    const projects = await readProjects()
    const newProject = {
      id: uuidv4(),
      title: validation.data.title,
      body: validation.data.body,
      thumbnail: validation.data.thumbnail ?? null,
      photos: Array.isArray(photos) ? photos : [],
      ...validation.data
    }

    // Guardamos el nuevo proyecto al final de la lista.
    projects.push(newProject)
    await writeProjects(projects)

    res.status(201).json(newProject)
  } catch (err) {
    res.status(500).json({ error: 'Error al crear proyecto' })
  }
}

/*
  PATCH /api/projects/:id

  Actualiza campos puntuales de un proyecto.
  Esto es ideal para editar título, texto, números o cualquier dato pequeño
  sin reenviar la estructura completa desde el frontend.
*/
export async function updateProject(req, res) {
  if (!assertAdminAuth(req, res)) {
    return
  }

  try {
    const { id } = req.params
    const payload = sanitizeObject(req.body ?? {})

    // No dejamos que el cliente cambie el id ni sobrescriba las fotos aquí.
    const { id: ignoredId, photos: ignoredPhotos, ...patch } = payload

    if (Object.prototype.hasOwnProperty.call(patch, 'title')) {
      patch.title = sanitizeText(patch.title, 160)
    }

    if (Object.prototype.hasOwnProperty.call(patch, 'body')) {
      patch.body = sanitizeText(patch.body, 5000)
    }

    if (Object.prototype.hasOwnProperty.call(patch, 'thumbnail')) {
      patch.thumbnail = typeof patch.thumbnail === 'string' && patch.thumbnail.trim()
        ? patch.thumbnail.trim()
        : null
    }

    if (!Object.keys(patch).length) {
      return res.status(400).json({ error: 'No hay cambios válidos para aplicar' })
    }

    const patchValidation = projectPatchSchema.safeParse(patch)

    if (!patchValidation.success) {
      return res.status(400).json({ error: 'Datos inválidos al actualizar el proyecto' })
    }

    const projects = await readProjects()
    const index = projects.findIndex((project) => project.id === id)

    if (index === -1) {
      return res.status(404).json({ error: 'Proyecto no encontrado' })
    }

    const currentProject = projects[index]
    const nextProject = {
      ...currentProject,
      ...patchValidation.data,
      id: currentProject.id,
      photos: currentProject.photos
    }

    // Reemplazamos el proyecto actualizado en su misma posicion.
    projects[index] = nextProject
    await writeProjects(projects)

    res.json(nextProject)
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar proyecto' })
  }
}

/*
  POST /api/projects/:id/photos

  Agrega una foto a la galería de un proyecto.

  Flujo recomendado del admin:
  1. Sube la imagen a /api/uploads.
  2. La API devuelve una URL pública como /uploads/archivo.jpg.
  3. Con esa URL llamamos a este endpoint para anexarla al proyecto.
*/
export async function addProjectPhoto(req, res) {
  if (!assertAdminAuth(req, res)) {
    return
  }

  try {
    const { id } = req.params
    const payload = sanitizeObject(req.body ?? {})
    const validation = addPhotoSchema.safeParse(payload)

    if (!validation.success) {
      return res.status(400).json({ error: 'Datos inválidos al agregar foto' })
    }

    const { url, alt = '', cover } = validation.data
    const coverFlag = cover === true
    const safeUrl = typeof url === 'string' ? url.trim() : ''
    const safeAlt = sanitizeText(alt, 200)

    if (!safeUrl) {
      return res.status(400).json({ error: 'La URL de la foto es obligatoria' })
    }

    if (!isSafeUrl(safeUrl)) {
      return res.status(400).json({ error: 'La URL de la foto no es válida' })
    }

    const projects = await readProjects()
    const index = projects.findIndex((project) => project.id === id)

    if (index === -1) {
      return res.status(404).json({ error: 'Proyecto no encontrado' })
    }

    const currentProject = projects[index]
    const nextPhoto = {
      id: uuidv4(),
      url: safeUrl,
      alt: safeAlt,
      order: currentProject.photos.length
    }

    // Reordenamos para mantener indices consecutivos.
    const nextPhotos = resequencePhotos([...currentProject.photos, nextPhoto])

    const nextProject = {
      ...currentProject,
      photos: nextPhotos,
      // Si el admin marca la foto como portada, la guardamos como thumbnail.
      // Si no había miniatura, usamos la primera foto subida como portada.
      thumbnail: coverFlag || !currentProject.thumbnail ? safeUrl : currentProject.thumbnail
    }

    projects[index] = nextProject
    await writeProjects(projects)

    res.status(201).json(nextProject)
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar foto al proyecto' })
  }
}

/*
  PATCH /api/projects/:id/photos/:photoId

  Actualiza una foto de la galería sin tocar el resto del proyecto.
  Esto permite editar URL, texto alternativo, orden y portada.
*/
export async function updateProjectPhoto(req, res) {
  if (!assertAdminAuth(req, res)) {
    return
  }

  try {
    const { id, photoId } = req.params
    const payload = sanitizeObject(req.body ?? {})
    const validation = updatePhotoSchema.safeParse(payload)

    if (!validation.success) {
      return res.status(400).json({ error: 'Datos inválidos al actualizar la foto' })
    }

    const { url, alt, order, cover } = validation.data
    const coverFlag = cover === true

    const projects = await readProjects()
    const projectIndex = projects.findIndex((project) => project.id === id)

    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Proyecto no encontrado' })
    }

    const currentProject = projects[projectIndex]
    const photoIndex = currentProject.photos.findIndex((photo) => photo.id === photoId)

    if (photoIndex === -1) {
      return res.status(404).json({ error: 'Foto no encontrada' })
    }

    const currentPhoto = currentProject.photos[photoIndex]
    const nextUrlCandidate = typeof url === 'string' && url.trim() ? url.trim() : currentPhoto.url
    const nextUrl = isSafeUrl(nextUrlCandidate) ? nextUrlCandidate : currentPhoto.url
    const nextAlt = typeof alt === 'string' ? sanitizeText(alt, 200) : currentPhoto.alt ?? ''
    const nextOrder = Number.isFinite(order) ? order : currentPhoto.order

    // Aplicamos el patch a la foto indicada.
    const nextPhotos = currentProject.photos.map((photo) => {
      if (photo.id !== photoId) {
        return photo
      }

      return {
        ...photo,
        url: nextUrl,
        alt: nextAlt,
        order: nextOrder
      }
    })

    const normalizedPhotos = resequencePhotos(nextPhotos)
    const nextProject = {
      ...currentProject,
      photos: normalizedPhotos,
      thumbnail: getNextThumbnail(currentProject, currentPhoto.url, nextUrl, coverFlag)
    }

    projects[projectIndex] = nextProject
    await writeProjects(projects)

    res.json(nextProject)
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar foto del proyecto' })
  }
}

/*
  DELETE /api/projects/:id/photos/:photoId

  Borra una foto puntual de la galería del proyecto.
  Si esa foto era la portada, elegimos otra o dejamos la miniatura vacía.
*/
export async function deleteProjectPhoto(req, res) {
  if (!assertAdminAuth(req, res)) {
    return
  }

  try {
    const { id, photoId } = req.params

    const projects = await readProjects()
    const projectIndex = projects.findIndex((project) => project.id === id)

    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Proyecto no encontrado' })
    }

    const currentProject = projects[projectIndex]
    const photoToDelete = currentProject.photos.find((photo) => photo.id === photoId)

    if (!photoToDelete) {
      return res.status(404).json({ error: 'Foto no encontrada' })
    }

    const remainingPhotos = resequencePhotos(currentProject.photos.filter((photo) => photo.id !== photoId))
    const nextThumbnail = currentProject.thumbnail === photoToDelete.url
      ? remainingPhotos[0]?.url ?? null
      : currentProject.thumbnail

    const nextProject = {
      ...currentProject,
      photos: remainingPhotos,
      thumbnail: nextThumbnail
    }

    projects[projectIndex] = nextProject
    await writeProjects(projects)

    res.json(nextProject)
  } catch (err) {
    res.status(500).json({ error: 'Error al borrar foto del proyecto' })
  }
}

/*
  DELETE /api/projects/:id

  Borra un proyecto completo junto con sus datos en el JSON.
  Las imágenes físicas no se borran aquí; eso se podría agregar después.
*/
export async function deleteProject(req, res) {
  if (!assertAdminAuth(req, res)) {
    return
  }

  try {
    const { id } = req.params

    const projects = await readProjects()
    const filtered = projects.filter((project) => project.id !== id)

    if (filtered.length === projects.length) {
      return res.status(404).json({ error: 'Proyecto no encontrado' })
    }

    // Persistimos la lista sin el proyecto eliminado.
    await writeProjects(filtered)
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Error al borrar proyecto' })
  }
}

/*
  GET /api/statistics

  Devuelve las estadísticas actuales.
*/
export async function getStatistics(req, res) {
  try {
    // Leemos y devolvemos el JSON de estadisticas.
    const data = fs.readFileSync(statisticsPath, 'utf-8')
    const statistics = JSON.parse(data)
    res.set('Cache-Control', 'no-store')
    res.json(statistics)
  } catch (err) {
    res.status(500).json({ error: 'Error al leer las estadísticas' })
  }
}

/*
  PATCH /api/statistics

  Permite al administrador actualizar las estadísticas.
*/
export async function updateStatistics(req, res) {
  if (!assertAdminAuth(req, res)) {
    return
  }

  try {
    // Mezclamos los cambios con los valores actuales del JSON.
    const updates = sanitizeObject(req.body ?? {})
    const validation = statisticsPatchSchema.safeParse(updates)

    if (!validation.success) {
      return res.status(400).json({ error: 'Datos inválidos en las estadísticas' })
    }

    const safeUpdates = validation.data

    if (!Object.keys(safeUpdates).length) {
      return res.status(400).json({ error: 'No hay cambios válidos para aplicar' })
    }
    const data = fs.readFileSync(statisticsPath, 'utf-8')
    const statistics = JSON.parse(data)

    const updatedStatistics = { ...statistics, ...safeUpdates }
    fs.writeFileSync(statisticsPath, JSON.stringify(updatedStatistics, null, 2))

    res.json(updatedStatistics)
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar las estadísticas' })
  }
}

export default {
  listProjects,
  createProject,
  updateProject,
  addProjectPhoto,
  updateProjectPhoto,
  deleteProjectPhoto,
  deleteProject,
  getStatistics,
  updateStatistics
}
