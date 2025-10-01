"use client";

// Aca va el boton de logout que hace POST a /api/auth/logout y redirige a /login
export default function LogoutButton() {
  async function onLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }

  // Aca renderizo el boton
  return (
    <button
      onClick={onLogout}
      className="px-3 py-2 rounded bg-gray-900 text-white text-sm"
      aria-label="Cerrar sesión"
    >
      Cerrar sesión
    </button>
  );
}
