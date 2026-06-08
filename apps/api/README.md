# API de Administración (Express.js)

API simple para gestionar proyectos, fotos y datos de la galería.

## Setup

```bash
# Instalar dependencias (desde la raíz del proyecto)
npm install

# Configurar autenticación del admin y CORS
cp apps/api/.env.example apps/api/.env
# Edita apps/api/.env y pon un hash bcrypt en ADMIN_PASSWORD_HASH
# También define ADMIN_JWT_SECRET (cadena larga aleatoria)
# Si vas a usar un dominio real, agrega CORS_ORIGIN con tu URL
```

## Desarrollo

```bash
# Desde la raíz del proyecto
npm run dev

# La API corre en http://localhost:8000
# El frontend corre en http://localhost:5173
```

## Endpoints

### Públicos

- **GET /api/projects** - Listar todos los proyectos
- **GET /api/health** - Health check
- **POST /api/admin/login** - Login admin (retorna JWT)

### Protegidos (requieren header `x-admin-token` con JWT)

- **POST /api/projects** - Crear proyecto
  ```json
  { "title": "Mi Proyecto", "body": "Descripción..." }
  ```

- **PUT /api/projects/:id** - Actualizar proyecto
  ```json
  { "id": "uuid", "title": "...", "body": "...", "thumbnail": "...", "photos": [...] }
  ```

- **DELETE /api/projects/:id** - Borrar proyecto

- **POST /api/uploads** - Subir imagen
  ```
  Content-Type: multipart/form-data
  Field: file (archivo)
  Retorna: { "url": "/uploads/2024-01-01-12345.jpg" }
  ```

## Uso desde el Frontend Admin

El panel `/admin` maneja todo automáticamente:

1. Login con contraseña (se valida contra ADMIN_PASSWORD_HASH)
2. Crear/editar/borrar proyectos
3. Subir fotos (drag & drop)

## Archivos

- `src/index.js` - Servidor Express principal
- `src/routes/projects.js` - CRUD de proyectos
- `src/routes/uploads.js` - Subida de archivos con multer
- `src/middleware/auth.js` - Validación de token
- `src/utils/fileUtils.js` - Lectura/escritura de JSON
- `data/projects.json` - Datos persistidos (generado automáticamente)

## Notas

- Las imágenes se guardan en `apps/web/public/uploads/`
- Los proyectos se guardan en `apps/api/data/projects.json`
- Máximo 10 MB por archivo
- Solo se permiten: JPEG, PNG, WebP, GIF
- CORS por defecto permite `http://localhost:5173` y `http://127.0.0.1:5173`
- Si usas proxy (Nginx/Cloudflare), activa `TRUST_PROXY=1`
