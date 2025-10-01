import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { verifySession } from "@/lib/auth";

// Aca obtengo un documento por su ID, validando que el usuario autenticado sea el propietario del mismo
export async function GET(req, { params }) {
  const token = req.cookies.get("session")?.value || "";
  const session = await verifySession(token);
  if (!session)
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  // Aca valido que el ID sea un numero
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ message: "ID no valido" }, { status: 400 });
  }

  // Aca obtengo el documento de la base de datos
  const db = getDB();
  // Aca valido pertenencia (anti-IDOR)
  const doc = db
    .prepare(
      "SELECT id, user_id, title, description, created_at FROM documents WHERE id = ?"
    )
    .get(id);

  // Si no existe o no es del usuario autenticado, devuelvo 403
  if (!doc || doc.user_id !== session.uid) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Aca devuelvo el documento
  return NextResponse.json({
    id: doc.id,
    title: doc.title,
    description: doc.description,
    created_at: doc.created_at,
  });
}
