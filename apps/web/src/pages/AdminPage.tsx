import { useEffect, useState, type FormEvent } from 'react'
import PageIntro from '../components/PageIntro'

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

function createProjectDraft(project: Project) {
  return {
    title: project.title,
    body: project.body,
    thumbnail: project.thumbnail || ''
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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'))
  const [password, setPassword] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [drafts, setDrafts] = useState<Record<string, { title: string; body: string; thumbnail: string }>>({})
  const [photoDrafts, setPhotoDrafts] = useState<Record<string, Record<string, PhotoDraft>>>({})
  const [loading, setLoading] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [authState, setAuthState] = useState<AuthState>(() => (token ? 'checking' : 'signed-out'))
  const [authError, setAuthError] = useState('')

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
      const res = await fetch('/api/statistics')
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
      setStatisticsError('No se pudieron cargar las estadísticas.')
    } finally {
      setStatisticsLoading(false)
    }
  }

  function parseStatisticsDraft() {
    // Normaliza strings → numbers. Si el campo está vacío, lo tomamos como 0.
    // Si el valor no es un número, devolvemos null y mostramos un error.
    const entries = Object.entries(statisticsDraft) as Array<[keyof typeof statisticsDraft, string]>
    const parsed: Record<string, number> = {}

    for (const [key, value] of entries) {
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
      alert('Estadísticas actualizadas correctamente')
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
            localStorage.removeItem('admin_token')
            setToken(null)
            setAuthError('La contraseña no es válida.')
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
      const res = await fetch('/api/projects')
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

    const res = await fetch('/api/admin/verify', {
      headers: {
        'x-admin-token': password
      }
    })

    if (!res.ok) {
      setAuthError('Contraseña incorrecta. El acceso fue rechazado.')
      setPassword('')
      setAuthState('signed-out')
      return
    }

    // Solo guardamos la clave cuando el backend la valida.
    localStorage.setItem('admin_token', password)
    setToken(password)
    setPassword('')
    setAuthState('signed-in')
  }

  function logout() {
    localStorage.removeItem('admin_token')
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

  async function createProject() {
    if (!newTitle.trim()) return
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || ''
      },
      body: JSON.stringify({ title: newTitle, body: newBody })
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
    } else {
      alert('Error: revisa la consola')
    }
  }

  async function uploadFile(file: File) {
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

    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || ''
      },
      body: JSON.stringify({
        title: draft.title,
        body: draft.body,
        thumbnail: draft.thumbnail || null
      })
    })

    if (!res.ok) {
      alert('No se pudo guardar el proyecto')
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
  }

  async function addPhotoToProject(projectId: string, file: File) {
    try {
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
      } else {
        alert('No se pudo añadir la foto')
      }
    } catch (err) {
      console.error(err)
      alert('Error subiendo archivo')
    }
  }

  async function savePhoto(projectId: string, photoId: string) {
    const draft = photoDrafts[projectId]?.[photoId]
    if (!draft) return

    const res = await fetch(`/api/projects/${projectId}/photos/${photoId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || ''
      },
      body: JSON.stringify({
        url: draft.url,
        alt: draft.alt,
        order: Number(draft.order),
        cover: draft.cover
      })
    })

    if (!res.ok) {
      alert('No se pudo guardar la foto')
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
  }

  async function deletePhoto(projectId: string, photoId: string) {
    const res = await fetch(`/api/projects/${projectId}/photos/${photoId}`, {
      method: 'DELETE',
      headers: {
        'x-admin-token': token || ''
      }
    })

    if (!res.ok) {
      alert('No se pudo borrar la foto')
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
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" type="submit">Entrar</button>
            </form>
          </div>
        </section>
      ) : (
        <div className="vstack gap-4">
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
                <input className="form-control mb-2" placeholder="Título" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                <textarea className="form-control" placeholder="Descripción" value={newBody} onChange={(e) => setNewBody(e.target.value)} />
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
                                    src={draft.url}
                                    alt={draft.alt || project.title}
                                    style={{ width: 120, height: 90, objectFit: 'cover', flexShrink: 0 }}
                                  />

                                  <div className="flex-grow-1 vstack gap-2">
                                    <div>
                                      <label className="form-label">URL</label>
                                      <input
                                        className="form-control"
                                        value={draft.url}
                                        onChange={(e) => updatePhotoDraft(project.id, photo.id, { url: e.target.value })}
                                      />
                                    </div>

                                    <div>
                                      <label className="form-label">Texto alternativo</label>
                                      <input
                                        className="form-control"
                                        value={draft.alt}
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
