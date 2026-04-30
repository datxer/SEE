// Utilidades de filesystem en modo promesas.
import fs from 'fs/promises'
// Helpers de rutas para resolver el JSON en disco.
import path from 'path'
// Convierte import.meta.url en un path real del sistema.
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Ruta absoluta del archivo actual y su carpeta.
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Archivo único donde se guardan los proyectos.
// El backend lee y escribe este JSON para evitar tocar el código cuando el
// administrador cambia textos, fotos o campos editables.
const PROJECT_FILE = path.join(__dirname, '../../data/projects.json')

/*
  Normaliza una foto para que siempre tenga la misma forma.

  Así evitamos que una foto guardada por una versión vieja del panel rompa
  la lectura cuando luego leemos el JSON.
*/
function normalizePhoto(photo, fallbackOrder = 0) {
  // Convertimos tipos y completamos campos faltantes para evitar errores en UI.
  const orderValue = Number(photo?.order)

  return {
    ...photo,
    id: typeof photo?.id === 'string' && photo.id.trim() ? photo.id : `photo-${fallbackOrder}`,
    url: typeof photo?.url === 'string' ? photo.url : '',
    alt: typeof photo?.alt === 'string' ? photo.alt : '',
    order: Number.isFinite(orderValue) ? orderValue : fallbackOrder
  }
}

/*
  Normaliza un proyecto completo.

  Guardamos los campos básicos y dejamos pasar campos extra para que luego
  puedas agregar números, etiquetas o cualquier dato adicional sin rehacer
  el modelo desde cero.
*/
function normalizeProject(project) {
  // Ordenamos las fotos para que siempre tengan un orden consistente.
  const normalizedPhotos = Array.isArray(project?.photos)
    ? project.photos.map((photo, index) => normalizePhoto(photo, index)).sort((a, b) => a.order - b.order)
    : []

  return {
    ...project,
    id: typeof project?.id === 'string' ? project.id : '',
    title: typeof project?.title === 'string' ? project.title : '',
    body: typeof project?.body === 'string' ? project.body : '',
    thumbnail: typeof project?.thumbnail === 'string' && project.thumbnail.trim() ? project.thumbnail : null,
    photos: normalizedPhotos
  }
}

/*
  Garantiza que el directorio y el archivo JSON existan.

  Si es la primera vez que corre el backend, aquí se crea todo lo necesario
  para que la API arranque sin errores.
*/
async function ensureFile() {
  // Si el directorio o el archivo no existen, los creamos.
  const dir = path.dirname(PROJECT_FILE)
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }

  try {
    await fs.access(PROJECT_FILE)
  } catch {
    await fs.writeFile(PROJECT_FILE, '[]', 'utf-8')
  }
}

// Lee el JSON, lo normaliza y devuelve siempre una lista válida de proyectos.
export async function readProjects() {
  // Lee y normaliza el JSON; si hay error, devolvemos un array vacio.
  try {
    await ensureFile()
    const data = await fs.readFile(PROJECT_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed.map(normalizeProject) : []
  } catch (err) {
    console.error('Error leyendo proyectos:', err)
    return []
  }
}

/*
  Escribe la lista completa de proyectos.

  Usamos un archivo temporal antes de reemplazar el definitivo para reducir
  el riesgo de dejar el JSON corrupto si el proceso se interrumpe a mitad.
*/
export async function writeProjects(projects) {
  // Persistimos los proyectos asegurando consistencia y evitando corrupcion de archivos.
  try {
    await ensureFile()
    const tempFile = PROJECT_FILE + '.tmp'
    const normalizedProjects = Array.isArray(projects) ? projects.map(normalizeProject) : []

    // Escribimos primero en un archivo temporal.
    await fs.writeFile(tempFile, JSON.stringify(normalizedProjects, null, 2), 'utf-8')

    // Luego lo renombramos al archivo real.
    await fs.rename(tempFile, PROJECT_FILE)
  } catch (err) {
    console.error('Error escribiendo proyectos:', err)
    throw err
  }
}
