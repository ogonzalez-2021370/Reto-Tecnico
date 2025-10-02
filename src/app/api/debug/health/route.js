import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const url = process.env.DATABASE_URL || "file:./data/app.db";
    let filePath = url.startsWith("file:") ? url.slice(5) : url;
    if (filePath.startsWith("./") || filePath.startsWith("../")) {
      filePath = path.join(process.cwd(), filePath);
    }
    const exists = fs.existsSync(filePath);

    const db = getDB();
    const row = db.prepare("SELECT COUNT(*) AS n FROM users").get();

    return NextResponse.json({
      ok: true,
      dbPath: filePath,
      fileExists: exists,
      users: row?.n ?? 0,
      node: process.version,
    });
  } catch (e) {
    console.error("HEALTH ERROR:", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
