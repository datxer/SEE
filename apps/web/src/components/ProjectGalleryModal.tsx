// Hooks para manejar estado y efectos del modal.
import { useEffect, useState } from 'react'
import './ProjectGalleryModal.css'

type ProjectGalleryModalProps = {
  // El título del proyecto que aparece arriba del modal
  projectTitle: string
  // Array de URLs de fotos del proyecto
  photos: string[]
  // Función que se llama cuando cierra el modal (para limpiar el estado en la página)
  onClose: () => void
}

export default function ProjectGalleryModal({ projectTitle, photos, onClose }: ProjectGalleryModalProps) {
  // Este componente es un modal (ventana emergente) que muestra fotos de un proyecto.
  // Se abre cuando haces clic en una tarjeta de proyecto.
  
  // State para saber cuál es la foto actual (empieza en 0)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  // Función para ir a la foto siguiente
  const goToNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  // Función para ir a la foto anterior
  const goToPreviousPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  // Efecto: si presionas las flechas del teclado, navega las fotos
  useEffect(() => {
    // Registramos un listener de teclado mientras el modal esta abierto.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNextPhoto()
      if (e.key === 'ArrowLeft') goToPreviousPhoto()
      // Si presionas Escape, cierras el modal
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    // Cleanup: quitamos el listener al cerrar el modal.
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [photos.length])

  // Si haces clic fuera de la imagen (en el fondo oscuro), se cierra
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Solo cerramos si el click ocurre en el fondo, no en la imagen.
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      {/* Fondo oscuro semi-transparente detrás del modal */}
      <div
        className="modal-backdrop fade show"
        onClick={handleBackdropClick}
        style={{ opacity: 0.5 }}
      />

      {/* El modal en sí (la caja con las fotos) */}
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            {/* Header: título del proyecto + botón cerrar */}
            <div className="modal-header">
              <h5 className="modal-title">{projectTitle}</h5>
              {/* Botón para cerrar el modal (la X) */}
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Cerrar galería"
              />
            </div>

            {/* Cuerpo: la foto grande + botones de navegación */}
            <div className="modal-body">
              {/* Contenedor de la foto: posición relativa para que los botones de navegación se posicionen correctamente */}
              <div className="galleryImageContainer">
                {/* La foto actual que se muestra en pantalla */}
                <img
                  src={photos[currentPhotoIndex]}
                  alt={`Foto ${currentPhotoIndex + 1} de ${projectTitle}`}
                  className="galleryImage"
                />

                {/* Botón para ir a la foto anterior (lado izquierdo) */}
                <button
                  type="button"
                  className="btn btn-light galleryNavButton prev"
                  onClick={goToPreviousPhoto}
                  aria-label="Foto anterior"
                  title="Anterior (flecha izquierda)"
                >
                  ‹
                </button>

                {/* Botón para ir a la foto siguiente (lado derecho) */}
                <button
                  type="button"
                  className="btn btn-light galleryNavButton next"
                  onClick={goToNextPhoto}
                  aria-label="Foto siguiente"
                  title="Siguiente (flecha derecha)"
                >
                  ›
                </button>
              </div>

              {/* Contador: te dice en qué foto estás (ej: "Foto 1 de 5") */}
              <div className="galleryCounter text-center mt-2 text-muted small">
                Foto {currentPhotoIndex + 1} de {photos.length}
              </div>
            </div>

            {/* Footer: botones de acción (cierre) */}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
