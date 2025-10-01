import { NextResponse } from "next/server";

// Aca hago el logout, limpiando la cookie de session
function clearCookie() {
  const isProd = process.env.NODE_ENV === "production";
  return [
    "session=",
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    isProd ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ");
}

// Aca defino el endpoint POST para logout
export async function POST() {
  const res = NextResponse.json({ message: "logged_out" });
  res.headers.set("Set-Cookie", clearCookie());
  return res;
}
