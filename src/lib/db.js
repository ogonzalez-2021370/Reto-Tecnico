// Aca se maneja la conexión a la base de datos SQLite, usando better-sqlite3
import Database from "better-sqlite3";
import path from "path";

let _db = null;

export function getDB() {
  if (_db) return _db;

  // Aca va la lógica para abrir la DB según entorno
  const url = process.env.DATABASE_URL || "file:./data/app.db";
  let filePath = url.startsWith("file:") ? url.slice(5) : url;

  // Aca se resuelve la ruta absoluta si es relativa
  if (filePath.startsWith("./") || filePath.startsWith("../")) {
    filePath = path.join(process.cwd(), filePath);
  }

  const isProd = process.env.NODE_ENV === "production";

  //  En producción (Netlify) abrir en SOLO LECTURA y exigir que exista
  const openOpts = isProd
    ? { readonly: true, fileMustExist: true }
    : { fileMustExist: false };

  _db = new Database(filePath, openOpts);

  // Claves foráneas siempre; WAL y ajustes de rendimiento solo en dev
  _db.pragma("foreign_keys = ON");
  if (!isProd) {
    // Aca voy a evitar en producción: cambia/crea archivos en FS (Netlify = read-only)
    _db.pragma("journal_mode = WAL");
    _db.pragma("synchronous = NORMAL");
  }

  return _db;
}
