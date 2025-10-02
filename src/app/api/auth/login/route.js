// Aca se maneja el login, genera JWT y cookie HttpOnly
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDB } from "@/lib/db";
import { signSession, sessionCookie } from "@/lib/auth";

// Aca se usa un hash dummy para evitar filtrar info por timing attacks
const DUMMY_HASH =
  "$2b$12$2u3i6O3xg1Lw4t8N1cQ3mO1s9x0t1pX8cL6bQxQkqvYxg7m9oQk3a";

export async function POST(request) {
  try {
    // Aca va la lógica del login
    const { username, password } = await request.json().catch(() => ({}));

    if (!username || !password) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 400 }
      );
    }

    // Aca va la lógica para buscar el usuario en la DB
    const db = getDB();
    const user = db
      .prepare("SELECT id, username, password FROM users WHERE username = ?")
      .get(username);

    // Aca va la lógica para comparar la password con bcrypt
    const hash = user?.password || DUMMY_HASH;
    const ok = await bcrypt.compare(password, hash);

    // Aca va la lógica para responder según resultado
    if (!user || !ok) {
      return NextResponse.json(
        { message: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    // Aca va la lógica para generar JWT y cookie
    const token = await signSession({ uid: user.id, un: user.username });
    const res = NextResponse.json({ message: "ok" });
    res.headers.set("Set-Cookie", sessionCookie(token));
    return res;
  } catch (e) {
    // Aca va la lógica para manejar errores inesperados
    console.error("LOGIN ERROR:", e);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
