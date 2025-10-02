# 📁 Sistema de Gestión de Documentos — Next.js + SQLite

App de demostración enfocada en **seguridad** y buenas prácticas.

## 🧱 Stack / Tecnologías

**Frontend**

- Next.js 14/15 (App Router)
- React 18
- Tailwind CSS

**Backend**

- SQLite con `better-sqlite3`
- JWT con `jose`
- Hash con `bcryptjs`

---

## 🧩 Requisitos

- Node.js LTS (18+ recomendado)

---

## ⚙️ Instalación

```bash
# 1) Instalar dependencias
npm install

# 2) Variables de entorno
cp .env.example .env.local
#   Crea .env.local y define:
# - JWT_SECRET=(cadena aleatoria 32+ bytes)
# - SESSION_MAX_AGE=3600
# - DATABASE_URL=file:./data/app.db)
# - NODE_ENV=development
# * Nota: Para generar el JWT_SECRET ingresa en consola: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
#   luego pegalo en JWT_SECRET=

# 3) Inicializar base de datos con datos de prueba
$env:TEST_USER1_USERNAME="juan.perez"
$env:TEST_USER1_PASSWORD="SecurePass123!"
$env:TEST_USER2_USERNAME="maria.garcia"
$env:TEST_USER2_PASSWORD="SecurePass456!"
npm run seed

# 4) Ejecutar en desarrollo
npm run dev:login
# Se abrirá: http://localhost:3000/login
```

---

## ⚙️ Comandos

```bash
npm run dev        # Servidor de desarrollo
npm run dev:login  # Te envia directo al login
npm run build      # Build de producción
npm run start      # Servir build de producción
npm run seed       # Crea/limpia tablas y carga datos de prueba
npm run lint       # ESLint
```

---

## ⚙️ Credenciales de prueba

- **_Usuario 1_**: juan.perez / SecurePass123!
- **_Usuario 2_**: maria.garcia / SecurePass456!

---

## ⚙️ Medidas de seguridad implementadas

- **Hash de contraseñas (bcryptjs)**: Contraseñas almacenadas como hashes bcrypt (salt aleatoria, costo 12). Nunca en texto plano.
- **Autenticación con JWT (jose) en cookie HttpOnly**: Token HS256 firmado en el servidor y enviado en cookie HttpOnly (no accesible por JS), SameSite=Lax y Secure en producción. Expiración doble: exp (JWT) + Max-Age (cookie) usando SESSION_MAX_AGE.
- **Login timing-safe (anti user-enumeration)**: Si el usuario no existe, se compara contra un DUMMY_HASH para igualar tiempos y no revelar si la cuenta existe.
- **Rutas protegidas con middleware**: Requiere sesión válida en /dashboard y /api/documents/\*.
  Redirige a /login si no hay sesión y a /dashboard si ya estás autenticado e intentas /login.
- **Anti-IDOR (control de acceso por recurso)**: En GET /api/documents/[id] se valida pertenencia (doc.user_id === session.uid); si no, envia el error 403.
- **Anti-SQL Injection**: Consultas parametrizadas (placeholders ?) en la base de datos.
  La búsqueda usa LIKE ? con COLLATE NOCASE para ser case-insensitive sin concatenar input.
- **Errores genéricos**: En login siempre se responde “Usuario o contraseña incorrectos”, tampoco se revela si la cuenta existe o si el token expiró.
- **Sesiones stateless**: POST /api/auth/logout invalida la cookie (Max-Age=0).
  Rotar JWT_SECRET invalida todas las sesiones activas.
- **Buenas prácticas**: Secretos en .env.local (no versionado) y plantilla pública en .env.example.

---

## ⚙️ Listas de dependencias y versiones

- **bcryptjs**: Versión 3.0.2
- **better-sqlite3**: Versión 12.4.1
- **jose**: Versión 6.1.0
- **next**: Versión 15.5.4
- **react**: Versión 19.1.0
- **react-dom**: Versión 19.1.0

---

## 🧠 Decisiones técnicas importantes

- **Next.js (App Router)**: Para rutas API en un solo proyecto, asi se simplifica el despliegue y la protección de rutas.
- **SQLite + better-sqlite3**: Lo elegí por su rendimiento y simplicidad en entornos pequeños.
- **JWT con jose**: Por compatibilidad ESM/WebCrypto y mantenimiento activo.
- **Sesión en cookie HttpOnly**: Por su expiración doble (JWT exp + cookie Max-Age).
- **bcryptjs**: Para hashear contraseñas.
- **Dummy_hash**: Lo utilice para cuando el usuario no exista evitar ataques de timing (adivinando si el usuario existe midiendo tiempos de respuesta).
- **Anti-SQLi**: Realice consultas parametrizadas usando placeholders (?).
- **Middleware**: Para redirecciones y protección de rutas como /dashboard, /api/documents/\* y tambien para evitar que un usuario vuelva al /login sin antes haber cerrado sesión.
- **Seed seguro**: El script que lee db/schema.sql no guarda contraseñas en el repositorio.
- **Variables de entorno**: El .env.local es privado por lo cual no es enviado a mi repositorio, el .env.examle si lo envio como una plantilla.

---

## 🚧 Limitaciones y mejoras futuras

- **Manejar permisos**: Pueden aparecer perfiles administrativos, los cuales tendran acceso a la información de todos los usuarios.
- **Recuperación de contraseña**: Manejar una opción para que el usuario pueda recuperar su contraseña.
- **Limitar intentos de login**: Si se intenta iniciar sesion con credenciales incorrectas muchas veces, se debe frenar esos intentos.
- **Paginación**: Mejorar el desempeño cuando la cantidad de documentos aumente.
