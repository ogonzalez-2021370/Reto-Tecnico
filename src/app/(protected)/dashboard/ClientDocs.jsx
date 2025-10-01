// Aca va el componente que muestra los documentos del cliente, con busqueda y formato de fechas
"use client";

import { useState, useMemo } from "react";
import DocumentSearch from "@/components/DocumentSearch"; // Componente de busqueda

// Aca defino el componente ClientDocs, que recibe los documentos iniciales como prop
export default function ClientDocs({ initialDocs }) {
  const [docs, setDocs] = useState(initialDocs);

  // Aca esta el formateador consistente (UTC) para cuando NO venga created_at_fmt
  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat("es-ES", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "UTC",
      }),
    []
  );

  // Aca renderizo el buscador y la lista de documentos
  return (
    <>
      <DocumentSearch onResults={setDocs} />
      <ul className="space-y-3">
        {docs.map((d) => {
          const dateText =
            d.created_at_fmt ?? fmt.format(new Date(d.created_at)); // fallback si viene desde /search

          // Aca renderizo cada documento
          return (
            <li key={d.id} className="border rounded p-4">
              <p className="text-sm text-gray-500">
                ID: {String(d.id)} ·{" "}
                <time dateTime={d.created_at} suppressHydrationWarning>
                  {dateText}
                </time>
              </p>
              <h2 className="font-medium">{d.title}</h2>
              <p className="text-sm">{d.description}</p>
            </li>
          );
        })}
        {docs.length === 0 && (
          <li className="text-sm text-gray-500">Sin resultados.</li>
        )}
      </ul>
    </>
  );
}
