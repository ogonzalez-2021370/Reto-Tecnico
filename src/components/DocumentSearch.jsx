// Aca esta el componente de búsqueda de documentos por título
"use client";
import { useEffect, useMemo, useState } from "react";

// Aca uso un hook de debounce para no hacer muchas peticiones
export default function DocumentSearch({ onResults }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  // Aca memorizo el valor de q con debounce
  const debouncedQ = useDebounce(q, 300);

  // Aca hago la peticion a la API cada vez que cambia debouncedQ
  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      try {
        const res = await fetch(
          "/api/documents/search?q=" + encodeURIComponent(debouncedQ)
        );
        const data = await res.json();
        if (active) onResults(Array.isArray(data) ? data : []);
      } catch {
        if (active) onResults([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [debouncedQ, onResults]);

  // Aca renderizo el input de busqueda y el estado de loading
  return (
    <div className="mb-4">
      <label className="block text-sm mb-1">Buscar por título</label>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ej. Pasaporte, Recibo, DPI…"
        className="w-full border rounded px-3 py-2"
        aria-label="Buscar documentos por título"
      />
      {loading && <p className="text-xs text-gray-500 mt-1">Buscando…</p>}
    </div>
  );
}

// Aca va el hook de debounce, para retrasar la actualizacion del valor
function useDebounce(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
