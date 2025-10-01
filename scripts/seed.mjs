import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Aca aseguro carpeta ./data
const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

// Aca abro la DB y aplicar schema SQL
const dbPath = path.join(dataDir, "app.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const schemaPath = path.join(process.cwd(), "db", "schema.sql");
const schemaSQL = fs.readFileSync(schemaPath, "utf8");
db.exec(schemaSQL);

// Aca se Limpian los datos (IDs consecutivos para pruebas)
db.exec("DELETE FROM documents; DELETE FROM users;");

const now = new Date().toISOString();

// Aca estan las funciones para generar/hashear contraseñas
const genPassword = () => crypto.randomBytes(12).toString("base64url"); // fuerte/aleatoria
const hash = (pw) => bcrypt.hashSync(pw, bcrypt.genSaltSync(12));

// Aca defino dos usuarios de prueba
// Si no estan en env, se generan aleatoriamente
const u1 = {
  username: process.env.TEST_USER1_USERNAME || "juan.perez",
  password: process.env.TEST_USER1_PASSWORD || genPassword(),
};
const u2 = {
  username: process.env.TEST_USER2_USERNAME || "maria.garcia",
  password: process.env.TEST_USER2_PASSWORD || genPassword(),
};

// Aca preparo las consultas de inserción
const insertUser = db.prepare(
  "INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)"
);
const insertDoc = db.prepare(
  "INSERT INTO documents (user_id, title, description, created_at) VALUES (?, ?, ?, ?)"
);

// Aca inserto los usuarios y guardo sus IDs
const userIds = [];
for (const u of [u1, u2]) {
  const res = insertUser.run(u.username, hash(u.password), now);
  userIds.push(res.lastInsertRowid);
}

// Aca inserto 3 documentos por usuario
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

docsByUser.forEach((docs, idx) => {
  const userId = userIds[idx];
  docs.forEach((d) => insertDoc.run(userId, d.title, d.description, now));
});

// Aca miestro las credenciales generadas (si no se definieron por env)
console.log("Seed completado.");
console.log("DB:", dbPath);
const generated = [];
if (!process.env.TEST_USER1_PASSWORD)
  generated.push({ username: u1.username, password: u1.password });
if (!process.env.TEST_USER2_PASSWORD)
  generated.push({ username: u2.username, password: u2.password });
if (generated.length) {
  console.log("Credenciales de prueba (generadas ahora):");
  console.table(generated);
} else {
  console.log("Credenciales de prueba tomadas de variables de entorno.");
}

db.close();
