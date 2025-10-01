import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// 1) Asegurar carpeta ./data
const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

// 2) Abrir DB y aplicar schema SQL
const dbPath = path.join(dataDir, "app.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const schemaPath = path.join(process.cwd(), "db", "schema.sql");
const schemaSQL = fs.readFileSync(schemaPath, "utf8");
db.exec(schemaSQL);

// 3) Limpiar datos (IDs consecutivos para pruebas)
db.exec("DELETE FROM documents; DELETE FROM users;");

const now = new Date().toISOString();

// 4) Helpers
const genPassword = () => crypto.randomBytes(12).toString("base64url"); // fuerte/aleatoria
const hash = (pw) => bcrypt.hashSync(pw, bcrypt.genSaltSync(12));

// 5) Usuarios (desde env o generados al vuelo) — sin contraseñas en el repo
const u1 = {
  username: process.env.TEST_USER1_USERNAME || "juan.perez",
  password: process.env.TEST_USER1_PASSWORD || genPassword(),
};
const u2 = {
  username: process.env.TEST_USER2_USERNAME || "maria.garcia",
  password: process.env.TEST_USER2_PASSWORD || genPassword(),
};

const insertUser = db.prepare(
  "INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)"
);
const insertDoc = db.prepare(
  "INSERT INTO documents (user_id, title, description, created_at) VALUES (?, ?, ?, ?)"
);

// 6) Insertar usuarios y guardar IDs
const userIds = [];
for (const u of [u1, u2]) {
  const res = insertUser.run(u.username, hash(u.password), now);
  userIds.push(res.lastInsertRowid);
}

// 7) Documentos de ejemplo
const docsByUser = [
  [
    { title: "DPI escaneado",        description: "Documento personal con firma digital." },
    { title: "Recibo de agua julio", description: "Comprobante de domicilio para trámite." },
    { title: "Constancia laboral",   description: "Carta emitida por RRHH." },
  ],
  [
    { title: "Pasaporte",            description: "Vigencia hasta 2028." },
    { title: "Recibo de agua",       description: "Pendiente de pago." },
    { title: "Seguro médico",        description: "Póliza individual plan oro." },
  ],
];

docsByUser.forEach((docs, idx) => {
  const userId = userIds[idx];
  docs.forEach((d) => insertDoc.run(userId, d.title, d.description, now));
});

// 8) Mostrar credenciales generadas (si no las definiste por env)
console.log("✅ Seed completado.");
console.log("DB:", dbPath);
const generated = [];
if (!process.env.TEST_USER1_PASSWORD) generated.push({ username: u1.username, password: u1.password });
if (!process.env.TEST_USER2_PASSWORD) generated.push({ username: u2.username, password: u2.password });
if (generated.length) {
  console.log("Credenciales de prueba (generadas ahora):");
  console.table(generated);
} else {
  console.log("Credenciales de prueba tomadas de variables de entorno.");
}

db.close();
