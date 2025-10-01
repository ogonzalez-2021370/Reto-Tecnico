// Aca voy a proteger las rutas que necesiten autenticacion
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

// Aca defino las rutas protegidas
const PROTECTED_PATHS = [/^\/dashboard(\/|$)/, /^\/api\/documents(\/|$)/];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Si el usuario ya esta logueado y visita /login, le redirijo al dashboard
  if (pathname === "/login") {
    const cookie = req.cookies.get("session")?.value || "";
    const payload = await verifySession(cookie);
    if (payload) {
      const url = new URL("/dashboard", req.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Rutas protegidas, las cuales necesitan autenticacion
  const needsAuth = PROTECTED_PATHS.some((re) => re.test(pathname));
  if (!needsAuth) return NextResponse.next();

  const cookie = req.cookies.get("session")?.value || "";
  const payload = await verifySession(cookie);
  if (!payload) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// Aca defino las rutas que van a usar este middleware
export const config = {
  matcher: ["/login", "/dashboard/:path*", "/api/documents/:path*"],
};
