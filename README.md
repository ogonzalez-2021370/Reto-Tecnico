# 📁 Sistema de Gestión de Documentos — Next.js + SQLite

App de demostración enfocada en **seguridad** y buenas prácticas:

- Autenticación con **JWT** en **cookie HttpOnly**
- Hash de contraseñas con **bcrypt**
- Protección **IDOR** y **SQL Injection**
- Rutas protegidas con **middleware**
- Búsqueda por título **case-insensitive**

---

## ✨ Características principales

- 🔐 **Login seguro** con JWT (cookie HttpOnly + expiración).
- 🗂️ **Dashboard** con documentos del **usuario autenticado**.
- 🚫 **Anti-IDOR** en `/api/documents/[id]` (solo puedes ver lo tuyo).
- 🔎 **Búsqueda** `/api/documents/search?q=` (parametrizada y _case-insensitive_).
- 🚪 **Logout** (invalida cookie).
- 🧪 **Seed**: 2 usuarios y 3+ documentos por usuario.

---

## 🧱 Stack / Tecnologías

**Frontend / Fullstack**

- Next.js 14/15 (App Router)
- React 18
- Tailwind CSS

**Backend **

- SQLite con `better-sqlite3`
- JWT con `jose`
- Hash con `bcryptjs`

---

## 🧩 Requisitos

- Node.js LTS (18+ recomendado)
- npm / pnpm / yarn
- Windows, macOS o Linux

---

## ⚙️ Instalación

```bash
# 1) Instalar dependencias
npm install

# 2) Variables de entorno
cp .env.example .env.local
# Edita .env.local y define:
# - JWT_SECRET (cadena aleatoria 32+ bytes)
# - SESSION_MAX_AGE (p. ej. 3600)
# - DATABASE_URL (default: file:./data/app.db)
# *Nota: Para generar el JWT_SECRET ingresa en consola: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

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
npm run dev      # servidor de desarrollo
npm run build    # build de producción
npm run start    # servir build de producción
npm run seed     # crea/limpia tablas y carga datos de prueba
npm run lint     # ESLint
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
