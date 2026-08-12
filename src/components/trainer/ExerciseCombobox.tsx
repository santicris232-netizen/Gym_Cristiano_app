"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ExerciseThumb } from "@/components/ui/ExerciseThumb";
import { BODY_PARTS, bodyPartLabel } from "@/lib/constants";
import type { ExerciseSummary } from "@/types";

const PAGE_SIZE = 12;

export function ExerciseCombobox({
  onSelect,
  onClose,
  excludeIds = [],
}: {
  onSelect: (exercise: ExerciseSummary) => void;
  onClose: () => void;
  excludeIds?: string[];
}) {
  const [query, setQuery] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const [items, setItems] = useState<ExerciseSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleBodyPartChange(value: string) {
    setBodyPart(value);
    setPage(1);
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (query.trim()) params.set("q", query.trim());
      if (bodyPart) params.set("bodyPart", bodyPart);

      fetch(`/api/exercises?${params.toString()}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          setItems(data.items ?? []);
          setTotal(data.total ?? 0);
        })
        .catch((err) => {
          if ((err as Error).name !== "AbortError") console.error(err);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(handle);
  }, [query, bodyPart, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="rounded-lg border border-line bg-surface-2/70 p-3">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <Input
          autoFocus
          placeholder="Buscar ejercicio (ej. press banca, sentadilla...)"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
        />
        <select
          value={bodyPart}
          onChange={(e) => handleBodyPartChange(e.target.value)}
          className="rounded-md border border-line bg-surface-2 px-3 py-2.5 text-sm text-cream outline-none focus:border-neon-blue"
        >
          <option value="">Todos los grupos</option>
          {BODY_PARTS.map((bp) => (
            <option key={bp} value={bp}>
              {bodyPartLabel(bp)}
            </option>
          ))}
        </select>
        <Button variant="ghost" size="sm" type="button" onClick={onClose}>
          Cerrar
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-cream-dim">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-cream-dim">
          Sin resultados.
        </p>
      ) : (
        <ul className="grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">
          {items.map((ex) => {
            const disabled = excludeIds.includes(ex.id);
            return (
              <li key={ex.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(ex)}
                  className={`flex w-full items-center gap-2.5 rounded-md border p-2 text-left transition ${
                    disabled
                      ? "cursor-not-allowed border-line/50 opacity-40"
                      : "border-line hover:border-neon-blue/50 hover:bg-surface"
                  }`}
                >
                  <ExerciseThumb src={ex.image} alt="" size={40} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-cream">
                      {ex.name}
                    </p>
                    <p className="truncate font-mono text-[10px] text-cream-dim uppercase">
                      {bodyPartLabel(ex.bodyPart)} · {ex.equipment}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-center gap-3 font-mono text-xs text-cream-dim">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="disabled:opacity-30"
          >
            ← Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="disabled:opacity-30"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
