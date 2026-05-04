const DATA_VERSION_KEY = 'see:dataVersion'
const DATA_UPDATED_EVENT = 'see:data-updated'

type Unsubscribe = () => void

export function bumpDataVersion() {
  const nextVersion = String(Date.now())
  try {
    localStorage.setItem(DATA_VERSION_KEY, nextVersion)
  } catch {
    // ignore (private mode / storage disabled)
  }

  // Nota: el evento `storage` NO se dispara en la misma pestaña,
  // por eso emitimos también un evento local.
  window.dispatchEvent(new CustomEvent(DATA_UPDATED_EVENT, { detail: { version: nextVersion } }))
}

export function subscribeToDataUpdates(onUpdate: () => void): Unsubscribe {
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== DATA_VERSION_KEY) return
    onUpdate()
  }

  const handleLocalEvent = (event: Event) => {
    if (event.type !== DATA_UPDATED_EVENT) return
    onUpdate()
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener(DATA_UPDATED_EVENT, handleLocalEvent)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(DATA_UPDATED_EVENT, handleLocalEvent)
  }
}
