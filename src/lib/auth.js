// Aca voy a usar jose para manejar JWTs
import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();
const secret = () => encoder.encode(process.env.JWT_SECRET || "dev_secret");
const MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || "3600", 10); // Este es el tiempoo de vida del token en segundos

// En el payload no guardo datos sensibles
export async function signSession(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

// Aca verifico el token
export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null; // Aca devuelvo null si el token no es valido
  }
}

// Aca genero la cookie
export function sessionCookie(token) {
  const maxAge = MAX_AGE;
  const isProd = process.env.NODE_ENV === "production";
  return [
    `session=${token}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${maxAge}`,
    isProd ? `Secure` : null,
  ]
    .filter(Boolean)
    .join("; ");
}
