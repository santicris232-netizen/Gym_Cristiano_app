import { useEffect, useMemo, useState } from "react";
import { formatWeight } from "../../lib/units";
import { api } from "../../lib/api";
import type { ProgressPointOut, WeightUnit } from "../../types";

/** Solo necesitamos id+nombre para el selector — así ProgressPanel puede
 *  ofrecer tanto los ejercicios del plan actual como los que aparecen en
 *  el historial aunque ya no estén asignados (ver ProgressPanel). */
export interface ProgressExerciseOption {
  id: string;
  name: string;
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

function displayWeight(weightKg: number, unit: WeightUnit): number {
  return Number(formatWeight(weightKg, unit, { withUnit: false }));
}

export function ProgressChart({
  userId,
  weightUnit,
  exercises,
}: {
  userId: string;
  weightUnit: WeightUnit;
  exercises: ProgressExerciseOption[];
}) {
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? "");
  const [points, setPoints] = useState<ProgressPointOut[] | null>(null);

  function handleExerciseChange(id: string) {
    setExerciseId(id);
    setPoints(null);
  }

  useEffect(() => {
    if (!exerciseId) return;
    let active = true;
    api.get<ProgressPointOut[]>(`/users/${userId}/progress/${exerciseId}`).then((data) => {
      if (active) setPoints(data);
    });
    return () => {
      active = false;
    };
  }, [userId, exerciseId]);

  const chart = useMemo(() => {
    if (!points || points.length === 0) return null;
    const width = 640;
    const height = 220;
    const padding = { top: 20, right: 20, bottom: 30, left: 36 };
    const weights = points.map((p) => displayWeight(p.max_weight_kg, weightUnit));
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const range = Math.max(1, maxW - minW);
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const coords = points.map((p, i) => {
      const x =
        padding.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
      const w = displayWeight(p.max_weight_kg, weightUnit);
      const y = padding.top + innerH - ((w - minW) / range) * innerH;
      return { x, y, point: p };
    });

    const path = coords
      .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
      .join(" ");

    return { width, height, padding, coords, path, minW, maxW };
  }, [points, weightUnit]);

  if (exercises.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-cream-dim">
        Este alumno todavía no tiene ejercicios en el plan ni en el historial.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg tracking-wide text-cream">Progreso de peso</h3>
        <select
          value={exerciseId}
          onChange={(e) => handleExerciseChange(e.target.value)}
          className="rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-cream outline-none focus:border-neon-blue"
        >
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-surface-2/50 p-4">
        {!points ? (
          <div className="flex h-[220px] items-center justify-center text-cream-dim">
            Cargando...
          </div>
        ) : points.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-center text-sm text-cream-dim">
            Sin registros todavía para este ejercicio.
          </div>
        ) : chart ? (
          <svg
            viewBox={`0 0 ${chart.width} ${chart.height}`}
            className="w-full min-w-[420px]"
            role="img"
            aria-label="Progreso de peso en el tiempo"
          >
            <line
              x1={chart.padding.left}
              y1={chart.height - chart.padding.bottom}
              x2={chart.width - chart.padding.right}
              y2={chart.height - chart.padding.bottom}
              stroke="var(--color-line)"
            />
            <path d={chart.path} fill="none" stroke="var(--color-neon-blue)" strokeWidth={2.5} />
            {chart.coords.map((c, i) => (
              <g key={i}>
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={4}
                  fill="var(--color-ink)"
                  stroke="var(--color-neon-blue)"
                  strokeWidth={2}
                >
                  <title>{`${formatDateShort(c.point.date)}: ${formatWeight(c.point.max_weight_kg, weightUnit)}`}</title>
                </circle>
                <text
                  x={c.x}
                  y={chart.height - chart.padding.bottom + 16}
                  textAnchor="middle"
                  className="fill-cream-dim"
                  fontSize={10}
                >
                  {formatDateShort(c.point.date)}
                </text>
              </g>
            ))}
            <text
              x={chart.padding.left - 6}
              y={chart.padding.top + 4}
              textAnchor="end"
              className="fill-cream-dim"
              fontSize={10}
            >
              {Math.round(chart.maxW)}
            </text>
            <text
              x={chart.padding.left - 6}
              y={chart.height - chart.padding.bottom}
              textAnchor="end"
              className="fill-cream-dim"
              fontSize={10}
            >
              {Math.round(chart.minW)}
            </text>
          </svg>
        ) : null}
      </div>
    </div>
  );
}
