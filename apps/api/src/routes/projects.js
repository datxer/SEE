import { v4 as uuidv4 } from 'uuid'
import { readProjects, writeProjects } from '../utils/fileUtils.js'
import { assertAdminAuth } from '../middleware/auth.js'

function resequencePhotos(photos) {
  return photos
    .slice()
    .sort((leftPhoto, rightPhoto) => leftPhoto.order - rightPhoto.order)
    .map((photo, index) => ({
      ...photo,
      order: index
    }))
}

function getNextThumbnail(currentProject, previousUrl, nextUrl, shouldCover) {
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
    const projects = await readProjects()
    res.json(projects)
  } catch (err) {
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
    const payload = req.body ?? {}
    const { title, body, thumbnail, photos, id, ...extraFields } = payload

    if (!title || !body) {
      return res.status(400).json({ error: 'Título y descripción requeridos' })
    }

    const projects = await readProjects()
    const newProject = {
      id: uuidv4(),
      title,
      body,
      thumbnail: typeof thumbnail === 'string' && thumbnail.trim() ? thumbnail : null,
      photos: Array.isArray(photos) ? photos : [],
      ...extraFields
    }

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
    const payload = req.body ?? {}

    // No dejamos que el cliente cambie el id ni sobrescriba las fotos aquí.
    const { id: ignoredId, photos: ignoredPhotos, ...patch } = payload

    const projects = await readProjects()
    const index = projects.findIndex((project) => project.id === id)

    if (index === -1) {
      return res.status(404).json({ error: 'Proyecto no encontrado' })
    }

    const currentProject = projects[index]
    const nextProject = {
      ...currentProject,
      ...patch,
      id: currentProject.id,
      photos: currentProject.photos
    }

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
    const payload = req.body ?? {}
    const { url, alt = '', cover = false } = payload

    if (!url) {
      return res.status(400).json({ error: 'La URL de la foto es obligatoria' })
    }

    const projects = await readProjects()
    const index = projects.findIndex((project) => project.id === id)

    if (index === -1) {
      return res.status(404).json({ error: 'Proyecto no encontrado' })
    }

    const currentProject = projects[index]
    const nextPhoto = {
      id: uuidv4(),
      url,
      alt,
      order: currentProject.photos.length
    }

    const nextPhotos = resequencePhotos([...currentProject.photos, nextPhoto])

    const nextProject = {
      ...currentProject,
      photos: nextPhotos,
      // Si el admin marca la foto como portada, la guardamos como thumbnail.
      // Si no había miniatura, usamos la primera foto subida como portada.
      thumbnail: cover || !currentProject.thumbnail ? url : currentProject.thumbnail
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
    const payload = req.body ?? {}
    const { url, alt, order, cover = false } = payload

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
    const nextUrl = typeof url === 'string' && url.trim() ? url.trim() : currentPhoto.url
    const nextAlt = typeof alt === 'string' ? alt : currentPhoto.alt ?? ''
    const parsedOrder = Number(order)
    const nextOrder = Number.isFinite(parsedOrder) ? parsedOrder : currentPhoto.order

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
      thumbnail: getNextThumbnail(currentProject, currentPhoto.url, nextUrl, cover)
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

    await writeProjects(filtered)
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Error al borrar proyecto' })
  }
}

export default {
  listProjects,
  createProject,
  updateProject,
  addProjectPhoto,
  updateProjectPhoto,
  deleteProjectPhoto,
  deleteProject
}
