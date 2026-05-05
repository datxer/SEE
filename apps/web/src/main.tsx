// React core y DOM renderer.
import React from 'react'
import ReactDOM from 'react-dom/client'
// Router para manejar rutas en el navegador.
import { BrowserRouter } from 'react-router-dom'
// Componente raiz con las rutas declaradas.
import App from './App'
// Estilos base de Bootstrap y estilos globales del proyecto.
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'

/*
  Entrada del FRONTEND (React)

  Qué pasa aquí:
  1) Se crea el "root" de React sobre el div #root (en index.html)
  2) Se envuelve la app con BrowserRouter para habilitar navegación por rutas
  3) Se importan estilos globales (variables de tema, botones, reset)

  Nota: React.StrictMode en desarrollo ayuda a detectar efectos secundarios.
*/

// Este es el punto de arranque de toda la interfaz.
// Si piensas en la app como una casa, este archivo es la puerta principal.
// Creamos el root de React y renderizamos toda la app.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* BrowserRouter habilita <Link>, <Routes> y la navegacion por URL. */}
    <BrowserRouter>
      {/* App contiene el layout y las paginas. */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
