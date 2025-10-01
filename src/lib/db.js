// Aca configuro y obtengo la instancia de la base de datos SQLite usando better-sqlite3
import Database from "better-sqlite3";

let db = null;

// Aca inicializo la base de datos si no existe y la configuro
export function getDB() {
  if (!db) {
    const url = process.env.DATABASE_URL || "file:./data/app.db";
    const filePath = url.startsWith("file:") ? url.replace("file:", "") : url;

    // Aca abro la base de datos (se crea si no existe)
    db = new Database(filePath, { fileMustExist: false });
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = NORMAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}
