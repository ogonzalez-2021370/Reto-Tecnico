// Aca inicializo la base de datos con usuarios y documentos de ejemplo
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Aca configuro la ruta de la base de datos
// === 1) Asegurar carpeta ./data ===
const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

// Ruta de la BD (coincide con DATABASE_URL=file:./data/app.db)
const dbPath = path.join(dataDir, "app.db");
const db = new Database(dbPath);

// Aca configuro pragmas para mejor performance y seguridad
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const now = new Date().toISOString();

// Aca creo las tablas si no existen y limpio los datos viejos
db.exec(`
BEGIN;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
DELETE FROM documents;
DELETE FROM users;
COMMIT;
`);

// Aca preparo las sentencias para insertar usuarios y documentos
const insertUser = db.prepare(
  "INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)" // Aca inserto un usuario con placeholders
);
const insertDoc = db.prepare(
  "INSERT INTO documents (user_id, title, description, created_at) VALUES (?, ?, ?, ?)"
);

// Aca hasheo la contraseña con bcrypt
function hash(pw) {
  const salt = bcrypt.genSaltSync(12);
  return bcrypt.hashSync(pw, salt);
}

const users = [
  { username: "juan.perez", password: "SecurePass123!" },
  { username: "maria.garcia", password: "SecurePass456!" },
];

const userIds = [];
for (const u of users) {
  const res = insertUser.run(u.username, hash(u.password), now);
  userIds.push(res.lastInsertRowid);
}

// Aca creo documentos de ejemplo para cada usuario
const docsByUser = [
  [
    {
      title: "DPI escaneado",
      description: "Documento personal con firma digital.",
    },
    {
      title: "Recibo de agua julio",
      description: "Comprobante de domicilio para trámite.",
    },
    { title: "Constancia laboral", description: "Carta emitida por RRHH." },
  ],
  [
    { title: "Pasaporte", description: "Vigencia hasta 2028." },
    { title: "Recibo de agua", description: "Pendiente de pago." },
    { title: "Seguro médico", description: "Póliza individual plan oro." },
  ],
];

// Aca inserto los documentos en la base de datos
docsByUser.forEach((docs, idx) => {
  const userId = userIds[idx];
  docs.forEach((d) => insertDoc.run(userId, d.title, d.description, now));
});

console.log("Usuarios y documentos creados exitosamente.");
db.close();
