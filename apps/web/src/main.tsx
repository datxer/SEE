import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'

/*
  Entrada del FRONTEND (React)

  Qué pasa aquí:
  1) Se crea el "root" de React sobre el div #root (en index.html)
  2) Se envuelve la app con BrowserRouter para habilitar navegación por rutas
  3) Se importan estilos globales (variables de tema, botones, reset)

  Nota: React.StrictMode en desarrollo ayuda a detectar efectos secundarios.
*/

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
