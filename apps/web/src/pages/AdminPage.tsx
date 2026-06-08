import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import PageIntro from '../components/PageIntro'
import { bumpDataVersion } from '../lib/dataRefresh'
import './AdminPage.css'

type Photo = {
  id: string
  // URL pública devuelta por el backend (ej: "/uploads/archivo.jpg").
  // Se usa para renderizar la imagen y como identificador lógico para la portada.
  url: string
  alt: string
  order: number
}

type Project = {
  id: string
  title: string
  body: string
  thumbnail?: string
  photos: Photo[]
}

type PhotoDraft = {
  url: string
  alt: string
  order: string
  cover: boolean
}

type AuthState = 'checking' | 'signed-out' | 'signed-in'

type AdminNotice = {
  type: 'success' | 'danger'
  message: string
}

const NOTICE_AUTO_HIDE_MS = 4000
const TOKEN_TTL_MS = 30 * 60 * 1000
const TOKEN_KEY = 'admin_token'
const TOKEN_EXPIRES_KEY = 'admin_token_expires'
const MAX_TITLE_LENGTH = 160
const MAX_BODY_LENGTH = 5000
const MAX_ALT_LENGTH = 200
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const ALLOWED_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_UPLOAD_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

function createProjectDraft(project: Project) {
  return {
    title: project.title,
    body: project.body,
    thumbnail: project.thumbnail || ''
  }
}

function sanitizeText(value: string, maxLength: number) {
  // Normaliza texto para que el frontend no envie strings enormes o vacias.
  return value.trim().slice(0, maxLength)
}

function isSafeUrl(value: string) {
  // Permitimos URLs relativas (/uploads/...) o absolutas http/https.
  const trimmed = value.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('/')) return true

  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function createPhotoDraftMap(project: Project) {
  return Object.fromEntries(
    project.photos.map((photo) => [
      photo.id,
      {
        url: photo.url,
        alt: photo.alt || '',
        order: String(photo.order),
        cover: (project.thumbnail || '') === photo.url
      }
    ])
  ) as Record<string, PhotoDraft>
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(() => {
    // Cargamos el token solo desde sessionStorage (sesion actual).
    const sessionToken = sessionStorage.getItem(TOKEN_KEY)
    const sessionExpires = Number(sessionStorage.getItem(TOKEN_EXPIRES_KEY) || 0)
    if (sessionToken && sessionExpires > Date.now()) {
      return sessionToken
    }

    return null
  })
  const [password, setPassword] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [drafts, setDrafts] = useState<Record<string, { title: string; body: string; thumbnail: string }>>({})
  const [photoDrafts, setPhotoDrafts] = useState<Record<string, Record<string, PhotoDraft>>>({})
  const [newPhotoDrafts, setNewPhotoDrafts] = useState<Record<string, { url: string; alt: string; cover: boolean }>>({})
  const [loading, setLoading] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [authState, setAuthState] = useState<AuthState>(() => (token ? 'checking' : 'signed-out'))
  const [authError, setAuthError] = useState('')

  const [notice, setNotice] = useState<AdminNotice | null>(null)

  useEffect(() => {
    if (!notice) return
    const timeoutId = window.setTimeout(() => setNotice(null), NOTICE_AUTO_HIDE_MS)
    return () => window.clearTimeout(timeoutId)
  }, [notice])

  useEffect(() => {
    // Limpiamos tokens expirados automaticamente cada 30 segundos.
    const intervalId = window.setInterval(() => {
      const now = Date.now()
      const sessionExpires = Number(sessionStorage.getItem(TOKEN_EXPIRES_KEY) || 0)

      if (sessionExpires && sessionExpires <= now) {
        sessionStorage.removeItem(TOKEN_KEY)
        sessionStorage.removeItem(TOKEN_EXPIRES_KEY)
        setToken(null)
        setAuthState('signed-out')
        setNotice({ type: 'danger', message: 'La sesión expiró. Inicia sesión de nuevo.' })
      }
    }, 30000)

    return () => window.clearInterval(intervalId)
  }, [])

  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // --- Estadísticas (editable por admin) ---
  // Usamos strings en los inputs para permitir escribir/editar sin que React “rebote”
  // el valor a 0 cuando el campo queda temporalmente vacío.
  const [statisticsDraft, setStatisticsDraft] = useState({
    fv_instalados: '0',
    revisiones_energeticas: '0',
    estaciones_carga: '0',
    ahorro_estimado_anual: '0'
  })
  const [statisticsError, setStatisticsError] = useState('')
  const [statisticsLoading, setStatisticsLoading] = useState(false)

  function applyStatisticsToDraft(nextStatistics: {
    fv_instalados?: number
    revisiones_energeticas?: number
    estaciones_carga?: number
    ahorro_estimado_anual?: number
  }) {
    setStatisticsDraft({
      fv_instalados: String(nextStatistics.fv_instalados ?? 0),
      revisiones_energeticas: String(nextStatistics.revisiones_energeticas ?? 0),
      estaciones_carga: String(nextStatistics.estaciones_carga ?? 0),
      ahorro_estimado_anual: String(nextStatistics.ahorro_estimado_anual ?? 0)
    })
  }

  async function fetchStatistics() {
    setStatisticsError('')
    setStatisticsLoading(true)

    try {
      const res = await fetch('/api/statistics', { cache: 'no-store' })
      const bodyText = await res.text()
      const data = bodyText ? JSON.parse(bodyText) : {}

      if (!res.ok) {
        const message = typeof data?.error === 'string' ? data.error : `Error HTTP ${res.status}`
        setStatisticsError(message)
        return
      }

      applyStatisticsToDraft(data)
    } catch (err) {
      console.error('Error fetching statistics:', err)
      setStatisticsError('Error al cargar las estadísticas.')
    } finally {
      setStatisticsLoading(false)
    }
  }

  function parseStatisticsDraft() {
    const keys = ['fv_instalados', 'revisiones_energeticas', 'estaciones_carga', 'ahorro_estimado_anual'] as const
    const parsed = {} as Record<(typeof keys)[number], number>

    for (const key of keys) {
      const value = statisticsDraft[key]
      const trimmed = value.trim()
      const asNumber = trimmed === '' ? 0 : Number(trimmed)

      if (!Number.isFinite(asNumber)) {
        return { ok: false as const, error: `El campo "${key}" no es un número válido.` }
      }

      parsed[key] = asNumber
    }

    return { ok: true as const, value: parsed }
  }

  async function updateStatistics() {
    setStatisticsError('')
    setNotice(null)

    const parsed = parseStatisticsDraft()
    if (!parsed.ok) {
      setStatisticsError(parsed.error)
      return
    }

    try {
      const res = await fetch('/api/statistics', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Usamos el token del estado (es el que valida el panel).
          'x-admin-token': token || ''
        },
        body: JSON.stringify(parsed.value)
      })

      const bodyText = await res.text()
      const data = bodyText ? JSON.parse(bodyText) : {}

      if (!res.ok) {
        const message = typeof data?.error === 'string' ? data.error : `Error HTTP ${res.status}`
        setStatisticsError(message)
        console.error('Error updating statistics:', { status: res.status, data })
        return
      }

      applyStatisticsToDraft(data)
      bumpDataVersion()
      setNotice({ type: 'success', message: 'Estadísticas actualizadas correctamente.' })
    } catch (err) {
      console.error('Error updating statistics:', err)
      setStatisticsError('Error al actualizar las estadísticas.')
    }
  }

  useEffect(() => {
    let cancelled = false

    async function verifyStoredToken() {
      if (!token) {
        setAuthState('signed-out')
        setProjects([])
        setDrafts({})
        setPhotoDrafts({})
        return
      }

      setAuthState('checking')

      try {
        const res = await fetch('/api/admin/verify', {
          headers: {
            'x-admin-token': token
          }
        })

        if (!res.ok) {
          if (!cancelled) {
            sessionStorage.removeItem(TOKEN_KEY)
            sessionStorage.removeItem(TOKEN_EXPIRES_KEY)
            setToken(null)
            setAuthError('La sesión no es válida o expiró.')
            setAuthState('signed-out')
            setProjects([])
            setDrafts({})
            setPhotoDrafts({})
          }
          return
        }

        if (!cancelled) {
          setAuthError('')
          setAuthState('signed-in')
          await fetchProjects()
          await fetchStatistics()
        }
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setAuthError('No se pudo verificar el acceso al panel.')
          setAuthState('signed-out')
        }
      }
    }

    void verifyStoredToken()

    return () => {
      cancelled = true
    }
  }, [token])

  async function fetchProjects() {
    setLoading(true)
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' })
      const data = await res.json()
      setProjects(data)
      // Creamos un borrador editable por proyecto para no escribir sobre el estado original.
      setDrafts(
        Object.fromEntries(
          data.map((project: Project) => [project.id, createProjectDraft(project)])
        )
      )
      setPhotoDrafts(
        Object.fromEntries(
          data.map((project: Project) => [project.id, createPhotoDraftMap(project)])
        )
      )
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    })

    const bodyText = await res.text()
    const data = bodyText ? JSON.parse(bodyText) : {}

    if (!res.ok) {
      setAuthError(data?.error || 'Contraseña incorrecta. El acceso fue rechazado.')
      setPassword('')
      setAuthState('signed-out')
      return
    }

    const nextToken = typeof data?.token === 'string' ? data.token : ''
    const expiresInSeconds = Number(data?.expiresInSeconds || 0)
    const expiresAt = Date.now() + (expiresInSeconds ? expiresInSeconds * 1000 : TOKEN_TTL_MS)

    if (!nextToken) {
      setAuthError('No se recibió un token válido desde el servidor.')
      setAuthState('signed-out')
      return
    }

    // Guardamos el JWT solo en sessionStorage con expiracion.
    sessionStorage.setItem(TOKEN_KEY, nextToken)
    sessionStorage.setItem(TOKEN_EXPIRES_KEY, String(expiresAt))
    setToken(nextToken)
    setPassword('')
    setAuthState('signed-in')
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_EXPIRES_KEY)
    setToken(null)
    setProjects([])
    setDrafts({})
    setPhotoDrafts({})
    setAuthError('')
    setAuthState('signed-out')
  }

  function updatePhotoDraft(projectId: string, photoId: string, patch: Partial<PhotoDraft>) {
    setPhotoDrafts((currentDrafts) => {
      const projectDrafts = currentDrafts[projectId] ?? {}
      const currentPhotoDraft = projectDrafts[photoId] ?? {
        url: '',
        alt: '',
        order: '0',
        cover: false
      }

      return {
        ...currentDrafts,
        [projectId]: {
          ...projectDrafts,
          [photoId]: {
            ...currentPhotoDraft,
            ...patch
          }
        }
      }
    })
  }

  function updateNewPhotoDraft(projectId: string, patch: Partial<{ url: string; alt: string; cover: boolean }>) {
    setNewPhotoDrafts((current) => {
      const base = current[projectId] ?? { url: '', alt: '', cover: false }
      return {
        ...current,
        [projectId]: {
          ...base,
          ...patch
        }
      }
    })
  }

  function resetNewPhotoDraft(projectId: string) {
    setNewPhotoDrafts((current) => ({
      ...current,
      [projectId]: { url: '', alt: '', cover: false }
    }))
  }

  async function createProject() {
    const title = sanitizeText(newTitle, MAX_TITLE_LENGTH)
    const body = sanitizeText(newBody, MAX_BODY_LENGTH)

    if (!title || !body) {
      setNotice({ type: 'danger', message: 'Completa título y descripción antes de crear.' })
      return
    }

    setNotice(null)
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || ''
      },
      body: JSON.stringify({ title, body })
    })
    if (res.ok) {
      const p = await res.json()
      setProjects((currentProjects) => [p, ...currentProjects])
      setDrafts((currentDrafts) => ({
        ...currentDrafts,
        [p.id]: createProjectDraft(p)
      }))
      setPhotoDrafts((currentDrafts) => ({
        ...currentDrafts,
        [p.id]: createPhotoDraftMap(p)
      }))
      setNewTitle('')
      setNewBody('')
      bumpDataVersion()
      setNotice({ type: 'success', message: 'Proyecto creado correctamente.' })
    } else {
      setNotice({ type: 'danger', message: 'No se pudo crear el proyecto.' })
    }
  }

  async function uploadFile(file: File) {
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()

    if (!ALLOWED_UPLOAD_TYPES.includes(file.type) || !ALLOWED_UPLOAD_EXTENSIONS.includes(extension)) {
      throw new Error('Formato de imagen no permitido')
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error('El archivo supera el limite de 10 MB')
    }

    const t = token || ''
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/uploads', {
      method: 'POST',
      headers: {
        'x-admin-token': t
      },
      body: formData
    })
    if (!res.ok) throw new Error('upload failed')
    return res.json()
  }

  async function saveProject(projectId: string) {
    const draft = drafts[projectId]
    if (!draft) return

    const title = sanitizeText(draft.title, MAX_TITLE_LENGTH)
    const body = sanitizeText(draft.body, MAX_BODY_LENGTH)

    if (!title || !body) {
      setNotice({ type: 'danger', message: 'El título y la descripción son obligatorios.' })
      return
    }

    setNotice(null)

    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || ''
      },
      body: JSON.stringify({
        title,
        body,
        thumbnail: draft.thumbnail || null
      })
    })

    if (!res.ok) {
      setNotice({ type: 'danger', message: 'No se pudo guardar el proyecto.' })
      return
    }

    const updatedProject = await res.json()
    setProjects((currentProjects) => currentProjects.map((project) => (project.id === updatedProject.id ? updatedProject : project)))
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [updatedProject.id]: createProjectDraft(updatedProject)
    }))
    setPhotoDrafts((currentDrafts) => ({
      ...currentDrafts,
      [updatedProject.id]: createPhotoDraftMap(updatedProject)
    }))

    bumpDataVersion()
    setNotice({ type: 'success', message: 'Proyecto guardado correctamente.' })
  }

  async function addPhotoToProject(projectId: string, file: File) {
    try {
      setNotice(null)
      const r = await uploadFile(file)
      const url = r.url
      // La foto se agrega por backend para que el JSON siempre quede consistente.
      const res = await fetch(`/api/projects/${projectId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token || '' },
        body: JSON.stringify({
          url,
          alt: file.name,
          cover: false
        })
      })
      if (res.ok) {
        const updatedProject = await res.json()
        setProjects((currentProjects) => currentProjects.map((project) => (project.id === updatedProject.id ? updatedProject : project)))
        setDrafts((currentDrafts) => ({
          ...currentDrafts,
          [updatedProject.id]: createProjectDraft(updatedProject)
        }))
        setPhotoDrafts((currentDrafts) => ({
          ...currentDrafts,
          [updatedProject.id]: createPhotoDraftMap(updatedProject)
        }))

        bumpDataVersion()
        setNotice({ type: 'success', message: 'Foto añadida correctamente.' })
      } else {
        setNotice({ type: 'danger', message: 'No se pudo añadir la foto.' })
      }
    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Error subiendo archivo.'
      setNotice({ type: 'danger', message })
    }
  }

  async function addPhotoFromUrl(projectId: string) {
    const draft = newPhotoDrafts[projectId] ?? { url: '', alt: '', cover: false }
    const url = draft.url.trim()

    if (!url) return

    if (!isSafeUrl(url)) {
      setNotice({ type: 'danger', message: 'La URL no es valida. Usa http/https o /uploads/...' })
      return
    }

    setNotice(null)

    const res = await fetch(`/api/projects/${projectId}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || ''
      },
      body: JSON.stringify({
        url,
        alt: sanitizeText(draft.alt, MAX_ALT_LENGTH),
        cover: draft.cover
      })
    })

    if (!res.ok) {
      setNotice({ type: 'danger', message: 'No se pudo añadir la foto desde URL.' })
      return
    }

    const updatedProject = await res.json()
    setProjects((currentProjects) => currentProjects.map((project) => (project.id === updatedProject.id ? updatedProject : project)))
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [updatedProject.id]: createProjectDraft(updatedProject)
    }))
    setPhotoDrafts((currentDrafts) => ({
      ...currentDrafts,
      [updatedProject.id]: createPhotoDraftMap(updatedProject)
    }))

    resetNewPhotoDraft(projectId)
    bumpDataVersion()
    setNotice({ type: 'success', message: 'Foto añadida correctamente.' })
  }

  async function savePhoto(projectId: string, photoId: string) {
    const draft = photoDrafts[projectId]?.[photoId]
    if (!draft) return

    if (!isSafeUrl(draft.url)) {
      setNotice({ type: 'danger', message: 'La URL de la foto no es valida.' })
      return
    }

    setNotice(null)

    const res = await fetch(`/api/projects/${projectId}/photos/${photoId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || ''
      },
      body: JSON.stringify({
        url: draft.url.trim(),
        alt: sanitizeText(draft.alt, MAX_ALT_LENGTH),
        order: Number(draft.order),
        cover: draft.cover
      })
    })

    if (!res.ok) {
      setNotice({ type: 'danger', message: 'No se pudo guardar la foto.' })
      return
    }

    const updatedProject = await res.json()
    setProjects((currentProjects) => currentProjects.map((project) => (project.id === updatedProject.id ? updatedProject : project)))
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [updatedProject.id]: createProjectDraft(updatedProject)
    }))
    setPhotoDrafts((currentDrafts) => ({
      ...currentDrafts,
      [updatedProject.id]: createPhotoDraftMap(updatedProject)
    }))

    bumpDataVersion()
    setNotice({ type: 'success', message: 'Foto guardada correctamente.' })
  }

  async function deletePhoto(projectId: string, photoId: string) {
    setNotice(null)
    const res = await fetch(`/api/projects/${projectId}/photos/${photoId}`, {
      method: 'DELETE',
      headers: {
        'x-admin-token': token || ''
      }
    })

    if (!res.ok) {
      setNotice({ type: 'danger', message: 'No se pudo borrar la foto.' })
      return
    }

    const updatedProject = await res.json()
    setProjects((currentProjects) => currentProjects.map((project) => (project.id === updatedProject.id ? updatedProject : project)))
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [updatedProject.id]: createProjectDraft(updatedProject)
    }))
    setPhotoDrafts((currentDrafts) => ({
      ...currentDrafts,
      [updatedProject.id]: createPhotoDraftMap(updatedProject)
    }))

    bumpDataVersion()
    setNotice({ type: 'success', message: 'Foto eliminada correctamente.' })
  }

  const toggleProjectPhotos = (projectId: string) => {
    setExpandedProjectId((current) => (current === projectId ? null : projectId));
  };

  if (authState === 'checking') {
    return (
      <div className="vstack gap-4">
        <PageIntro
          ariaLabel="Panel de administración"
          badges={['Acceso interno', 'Contenido editable']}
          title="Panel de administración"
          description="Verificando credenciales del administrador..."
        />
        <section className="card shadow-sm border-0">
          <div className="card-body p-4 p-md-5">Verificando acceso...</div>
        </section>
      </div>
    )
  }

  return (
    <div className="vstack gap-4">
      <PageIntro
        ariaLabel="Panel de administración"
        badges={['Acceso interno', 'Contenido editable']}
        title="Panel de administración"
        description="Desde aquí el administrador puede crear secciones de la galería, editar textos y miniaturas, y subir fotos sin tocar el código."
      />

      {!token ? (
        <section className="card shadow-sm border-0">
          <div className="card-body p-4 p-md-5">
            <h2 className="h5 mb-3">Entrar al panel</h2>
            {authError ? <div className="alert alert-danger">{authError}</div> : null}
            <form onSubmit={login}>
              <div className="mb-3">
                <label className="form-label">Contraseña de administrador</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" type="submit">Entrar</button>
            </form>
          </div>
        </section>
      ) : (
        <div className="vstack gap-4">
          {notice && typeof document !== 'undefined'
            ? createPortal(
                <div className="position-fixed top-0 end-0 p-3 adminToastContainer" aria-live="polite" aria-atomic="true">
                  <div
                    className={`toast show ${notice.type === 'success' ? 'text-bg-success' : 'text-bg-danger'} border-0`}
                    role="status"
                  >
                    <div className="d-flex">
                      <div className="toast-body">{notice.message}</div>
                      <button
                        type="button"
                        className="btn-close btn-close-white me-2 m-auto"
                        aria-label="Cerrar"
                        onClick={() => setNotice(null)}
                      />
                    </div>
                  </div>
                </div>,
                document.body,
              )
            : null}

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <button className="btn btn-danger me-2" onClick={logout}>Cerrar sesión</button>
            </div>
          </div>

          {/*
            El flujo real del admin es este:
            1. Crear un proyecto base.
            2. Editar título, texto o miniatura.
            3. Subir fotos al proyecto.
          */}
          <section className="card shadow-sm border-0">
            <div className="card-body p-4 p-md-5">
              <h2 className="h5">Crear sección de galería</h2>
              <p className="text-body-secondary small mb-3">
                Cada proyecto nuevo se convierte en una sección visible de la galería pública.
              </p>
              <div className="mb-2">
                <input
                  className="form-control mb-2"
                  placeholder="Título"
                  maxLength={MAX_TITLE_LENGTH}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <textarea
                  className="form-control"
                  placeholder="Descripción"
                  maxLength={MAX_BODY_LENGTH}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                />
              </div>
              <button className="btn btn-success" onClick={createProject}>Crear</button>
            </div>
          </section>

          <section>
            <h2 className="h5">Proyectos</h2>
            {loading ? <div>Cargando...</div> : null}
            <div className="row g-3">
              {projects.map((project) => (
                <div key={project.id} className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 p-3 h-100">
                    <div className="card-body p-0">
                      <h3 className="h6 mb-3">{project.title}</h3>
                      <button
                        className="btn btn-outline-primary mb-3"
                        onClick={() => toggleProjectPhotos(project.id)}
                      >
                        {expandedProjectId === project.id ? 'Ocultar fotos' : 'Editar fotos'}
                      </button>

                      {expandedProjectId === project.id && (
                        <div className="vstack gap-3">
                          <p className="text-body-secondary small mb-3">
                            <strong>Descripción:</strong> {project.body}
                          </p>

                          <div className="border rounded-3 p-3 bg-body-tertiary">
                            <h4 className="h6 mb-3">Añadir foto</h4>

                            <div className="vstack gap-3">
                              <div>
                                <label className="form-label">Subir desde tu PC</label>
                                <input
                                  type="file"
                                  className="form-control"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.currentTarget.files?.[0]
                                    if (file) {
                                      void addPhotoToProject(project.id, file)
                                    }
                                    // Permite volver a seleccionar el mismo archivo.
                                    e.currentTarget.value = ''
                                  }}
                                />
                                <div className="form-text">Se sube al servidor y queda disponible como /uploads/...</div>
                              </div>

                              <div>
                                <label className="form-label">URL de internet (o /uploads/...)</label>
                                <input
                                  className="form-control"
                                  placeholder="https://..."
                                  maxLength={2000}
                                  value={(newPhotoDrafts[project.id]?.url ?? '')}
                                  onChange={(e) => updateNewPhotoDraft(project.id, { url: e.target.value })}
                                />
                              </div>

                              <div>
                                <label className="form-label">Texto alternativo</label>
                                <input
                                  className="form-control"
                                  maxLength={MAX_ALT_LENGTH}
                                  value={(newPhotoDrafts[project.id]?.alt ?? '')}
                                  onChange={(e) => updateNewPhotoDraft(project.id, { alt: e.target.value })}
                                />
                              </div>

                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`new-cover-${project.id}`}
                                  checked={Boolean(newPhotoDrafts[project.id]?.cover)}
                                  onChange={(e) => updateNewPhotoDraft(project.id, { cover: e.target.checked })}
                                />
                                <label className="form-check-label" htmlFor={`new-cover-${project.id}`}>
                                  Usar como portada
                                </label>
                              </div>

                              <div className="d-flex gap-2 flex-wrap">
                                <button
                                  type="button"
                                  className="btn btn-success btn-sm"
                                  onClick={() => void addPhotoFromUrl(project.id)}
                                  disabled={!(newPhotoDrafts[project.id]?.url ?? '').trim()}
                                >
                                  Añadir desde URL
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => resetNewPhotoDraft(project.id)}
                                >
                                  Limpiar
                                </button>
                              </div>
                            </div>
                          </div>

                          {project.photos
                            .slice()
                            .sort((leftPhoto, rightPhoto) => leftPhoto.order - rightPhoto.order)
                            .map((photo) => {
                              // Tomamos el borrador para que el admin pueda escribir sin que el input “rebote”.
                              // Si por algún motivo no existe el borrador (caso borde), armamos uno con la foto actual.
                              const draft = photoDrafts[project.id]?.[photo.id] ?? {
                                url: photo.url,
                                alt: photo.alt || '',
                                order: String(photo.order),
                                cover: (project.thumbnail || '') === photo.url
                              }

                              return (
                                <div key={photo.id} className="border rounded-3 p-3">
                                <div className="d-flex gap-3 align-items-start flex-wrap flex-md-nowrap">
                                  <img
                                    className="adminPhotoPreview"
                                    src={draft.url}
                                    alt={draft.alt || project.title}
                                  />

                                  <div className="flex-grow-1 vstack gap-2">
                                    <div>
                                      <label className="form-label">URL</label>
                                      <input
                                        className="form-control"
                                        value={draft.url}
                                        maxLength={2000}
                                        onChange={(e) => updatePhotoDraft(project.id, photo.id, { url: e.target.value })}
                                      />
                                    </div>

                                    <div>
                                      <label className="form-label">Texto alternativo</label>
                                      <input
                                        className="form-control"
                                        value={draft.alt}
                                        maxLength={MAX_ALT_LENGTH}
                                        onChange={(e) => updatePhotoDraft(project.id, photo.id, { alt: e.target.value })}
                                      />
                                    </div>

                                    <div>
                                      <label className="form-label">Orden</label>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={draft.order}
                                        onChange={(e) => updatePhotoDraft(project.id, photo.id, { order: e.target.value })}
                                      />
                                    </div>

                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`cover-${project.id}-${photo.id}`}
                                        checked={draft.cover}
                                        onChange={(e) => updatePhotoDraft(project.id, photo.id, { cover: e.target.checked })}
                                      />
                                      <label className="form-check-label" htmlFor={`cover-${project.id}-${photo.id}`}>
                                        Marcar como portada
                                      </label>
                                    </div>

                                    <div className="d-flex gap-2 flex-wrap">
                                      <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => void savePhoto(project.id, photo.id)}>
                                        Guardar foto
                                      </button>
                                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => void deletePhoto(project.id, photo.id)}>
                                        Eliminar foto
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              )
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card shadow-sm border-0">
            <div className="card-body p-4 p-md-5">
              <h2 className="h5">Editar estadísticas</h2>

              {statisticsLoading ? (
                <div className="text-body-secondary small mb-2">Cargando estadísticas...</div>
              ) : null}
              {statisticsError ? (
                <div className="alert alert-danger mb-3">{statisticsError}</div>
              ) : null}

              <div className="mb-3">
                <label className="form-label">FV Instalados</label>
                <input
                  type="number"
                  className="form-control"
                  value={statisticsDraft.fv_instalados}
                  onChange={(e) => setStatisticsDraft({ ...statisticsDraft, fv_instalados: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Revisiones Energéticas</label>
                <input
                  type="number"
                  className="form-control"
                  value={statisticsDraft.revisiones_energeticas}
                  onChange={(e) => setStatisticsDraft({ ...statisticsDraft, revisiones_energeticas: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Estaciones de Carga</label>
                <input
                  type="number"
                  className="form-control"
                  value={statisticsDraft.estaciones_carga}
                  onChange={(e) => setStatisticsDraft({ ...statisticsDraft, estaciones_carga: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Ahorro Estimado Anual</label>
                <input
                  type="number"
                  className="form-control"
                  value={statisticsDraft.ahorro_estimado_anual}
                  onChange={(e) => setStatisticsDraft({ ...statisticsDraft, ahorro_estimado_anual: e.target.value })}
                />
              </div>
              <button className="btn btn-primary" onClick={updateStatistics}>Guardar cambios</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
