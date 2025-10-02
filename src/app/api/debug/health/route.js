import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

function resolveDbPath() {
  const url = process.env.DATABASE_URL || "file:./data/app.db";
  let p = url.startsWith("file:") ? url.slice(5) : url;
  if (p.startsWith("./") || p.startsWith("../")) {
    p = path.join(process.cwd(), p);
  }
  return p;
}

export async function GET() {
  try {
    const dbPath = resolveDbPath();
    const fileExists = fs.existsSync(dbPath);

    // No intentes abrir si no existe, retorna diagnóstico
    if (!fileExists) {
      return NextResponse.json(
        {
          ok: false,
          step: "exists-check",
          dbPath,
          cwd: process.cwd(),
          env: {
            NODE_ENV: process.env.NODE_ENV,
            DATABASE_URL: process.env.DATABASE_URL,
          },
          message: "DB file not found at resolved path",
        },
        { status: 200 }
      );
    }

    // Abre explícitamente en solo lectura (igual que prod)
    const db = new Database(dbPath, { readonly: true, fileMustExist: true });
    const row = db.prepare("SELECT COUNT(*) AS n FROM users").get();

    return NextResponse.json({
      ok: true,
      step: "query",
      dbPath,
      cwd: process.cwd(),
      users: row?.n ?? 0,
      node: process.version,
    });
  } catch (e) {
    console.error("HEALTH ERROR:", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
