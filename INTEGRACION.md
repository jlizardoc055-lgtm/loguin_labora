# Integración rápida — módulo reutilizable de registro y login

## 1. Mover los 3 archivos existentes
Crea `public/` en la raíz del repositorio y mueve, sin reescribirlos:
- `index.html` → `public/index.html`
- `style.css` → `public/style.css`
- `script.js` → `public/script.js`

## 2. Copiar los archivos nuevos
Copia `public/auth/`, `config/`, `controllers/`, `middleware/`, `models/`, `routes/`, `server.js`, `package.json`, `.env.example`, `.gitignore` y `render.yaml` respetando exactamente la estructura de `ESTRUCTURA_DESTINO.txt`.

## 3. Únicos cambios obligatorios en archivos existentes
Solo se modifica `public/index.html`. No hay cambios obligatorios en `public/style.css` ni `public/script.js`.

En `<head>`, después del enlace a `style.css`:
```html
<link rel="stylesheet" href="/auth/auth.css">
```

En `<body>`, donde deban aparecer los controles:
```html
<nav data-auth-actions></nav>
```

Antes de `</body>`, después del script existente que carga `script.js`:
```html
<script src="/auth/auth.js"></script>
```

No dupliques el `<script src="/script.js">` que ya tenga tu página.

## 4. Variables de entorno
Copia `.env.example` como `.env` y completa `MONGODB_URI` y `JWT_SECRET`. Nunca subas `.env` a GitHub.

## 5. Ejecutar
`npm install` y `npm start`. El servidor publica todo `public/` y expone la API REST.

Endpoints: `POST /api/auth/registro`, `POST /api/auth/login`, `GET /api/auth/perfil` (Bearer JWT), `GET /api/health`. La colección de MongoDB se fuerza al nombre exacto `usuario`.
