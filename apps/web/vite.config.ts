import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      /*
        Proxy en desarrollo:
        - Cuando el frontend hace fetch('/api/...'), Vite lo redirige al backend Rocket.
        - Esto evita problemas de CORS en el navegador durante DEV.
        - Backend por defecto (Rocket debug): http://localhost:8000
      */
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
