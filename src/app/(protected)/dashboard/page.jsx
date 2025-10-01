import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { getDB } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import ClientDocs from "./ClientDocs";

// Aca va la pagina del dashboard, que muestra los documentos del usuario autenticado
export default async function Dashboard() {
  // Aca obtengo la cookie de session
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value || "";

  // Aca verifico la session
  const session = await verifySession(token);
  const db = getDB();

  // Aca obtengo los documentos del usuario autenticado
  const rawDocs = db
    .prepare(
      "SELECT id, title, description, created_at FROM documents WHERE user_id = ? ORDER BY id ASC"
    )
    .all(session.uid);

  // Aca formateo determinista para que SSR y cliente coincidan
  const fmt = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC",
  });

  // Aca preparo los documentos iniciales con created_at_fmt
  const initialDocs = rawDocs.map((d) => ({
    ...d,
    created_at_fmt: fmt.format(new Date(d.created_at)),
  }));

  // Aca renderizo el dashboard con los documentos y el boton de logout
  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Tus documentos</h1>
        <LogoutButton />
      </div>
      <ClientDocs initialDocs={initialDocs} />
    </main>
  );
}
