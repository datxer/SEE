// Router de la app y helpers para navegar.
import { Navigate, Route, Routes } from 'react-router-dom'
// Layout compartido (header/footer) y paginas principales.
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import ProjectsPage from './pages/ProjectsPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  // Router de la app (React Router)
  // - Una sola vez declaramos las rutas
  // - Layout envuelve y da consistencia visual (header/main)
  // Este componente no dibuja contenido “bonito” por sí mismo.
  // Su trabajo es decidir qué página se muestra según la URL.
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Página de inicio: esta es la que ve el usuario al entrar a la web */}
        <Route path="/" element={<HomePage />} />
        {/* Página de servicios: lista lo que ofrece la empresa */}
        <Route path="/servicios" element={<ServicesPage />} />
        {/* Página de nosotros: cuenta quién es la empresa */}
        <Route path="/nosotros" element={<AboutPage />} />
        {/* Página de proyectos: muestra ejemplos o casos */}
        <Route path="/proyectos" element={<ProjectsPage />} />

        {/* Panel de administración (protegido con contraseña) */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Fallback: si no existe la ruta, volvemos al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
