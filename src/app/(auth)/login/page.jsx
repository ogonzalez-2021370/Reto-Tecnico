// Aca va la pagina de login, con el formulario y la logica para autenticarse
"use client";
import { useState, useTransition } from "react";

// Aca defino el componente de la pagina de login
export default function LoginPage() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  // Aca va la funcion que maneja el submit del formulario
  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Error de autenticación");
        return;
      }
      // Aca redirijo al dashboard
      window.location.href = "/dashboard";
    } catch {
      setError("Error de red");
    }
  }

  // Aca va el formulario de login
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 border p-6 rounded-xl"
      >
        <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
        <div>
          <label className="block text-sm mb-1">Usuario</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={username}
            onChange={(e) => setU(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Contraseña</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setP(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={pending}
          className="w-full bg-black text-white py-2 rounded"
        >
          {pending ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
