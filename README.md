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
- 🔎 **Búsqueda** `/api/documents/search?q=` (parametrizada y *case-insensitive*).
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
- ***Usuario 1***: juan.perez / SecurePass123!
- ***Usuario 2***: maria.garcia / SecurePass456!
  
---
