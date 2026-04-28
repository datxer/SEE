# API de Administración (Express.js)

API simple para gestionar proyectos, fotos y datos de la galería.

## Setup

```bash
# Instalar dependencias (desde la raíz del proyecto)
npm install

# Configurar token de administrador
cp apps/api/.env.example apps/api/.env
# Edita apps/api/.env y pon una contraseña segura en ADMIN_TOKEN
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

### Protegidos (requieren header `x-admin-token`)

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

1. Login con contraseña (la que pusiste en ADMIN_TOKEN)
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
