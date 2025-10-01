// Aca manejo el login de usuarios
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDB } from "@/lib/db";
import { signSession, sessionCookie } from "@/lib/auth";

// Aca cree un Dummy hash para igualar tiempos  y evitar ataques de usuario inexistente
const DUMMY_HASH = "/abcdefghijklmno12345";

// Aca defino el endpoint POST /api/auth/login
export async function POST(request) {
  const { username, password } = await request.json().catch(() => ({}));

  if (!username || !password) {
    return NextResponse.json(
      { message: "Credenciales inválidas" },
      { status: 400 }
    );
  }

  // Aca busco el usuario en la base de datos
  const db = getDB();
  const user = db
    .prepare("SELECT id, username, password FROM users WHERE username = ?")
    .get(username);

  // Aca hago una comparación en tiempo constante
  const hash = user?.password || DUMMY_HASH;
  const ok = await bcrypt.compare(password, hash);

  // Aca envio un mensaje genérico, en el cual no revelo si el usuario existe o no
  if (!user || !ok) {
    return NextResponse.json(
      { message: "Usuario o contraseña incorrectos" },
      { status: 401 }
    );
  }

  // Aca genero el token y la cookie de sesión
  const token = await signSession({ uid: user.id, un: user.username });
  const res = NextResponse.json({ message: "ok" });
  res.headers.set("Set-Cookie", sessionCookie(token));
  return res;
}
