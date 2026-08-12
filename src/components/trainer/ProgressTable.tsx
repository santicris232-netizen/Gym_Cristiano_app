import { DAY_NAMES } from "@/lib/constants";
import { formatWeight } from "@/lib/units";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { SessionSummaryDTO, SetLogDTO } from "@/types";
import type { WeightUnit } from "@/generated/prisma/client";

function formatDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ProgressTable({
  sessions,
  weightUnit,
}: {
  sessions: SessionSummaryDTO[];
  weightUnit: WeightUnit;
}) {
  return (
    <div>
      <h3 className="mb-3 font-display text-lg tracking-wide text-cream">
        Historial de entrenos
      </h3>
      <div className="space-y-3">
        {sessions.map((s) => {
          const byExercise = new Map<string, SetLogDTO[]>();
          for (const sl of s.setLogs) {
            if (!byExercise.has(sl.exerciseId)) byExercise.set(sl.exerciseId, []);
            byExercise.get(sl.exerciseId)!.push(sl);
          }
          return (
            <Card key={s.id} className="p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-counter text-lg tracking-wide text-neon-blue">
                    {formatDateKey(s.dateKey)}
                  </span>
                  <Badge tone="neutral">{DAY_NAMES[s.dayOfWeek]}</Badge>
                </div>
                {s.setLogs.length === 0 && (
                  <Badge tone="red">Sin series registradas</Badge>
                )}
              </div>
              <ul className="space-y-1.5">
                {Array.from(byExercise.entries()).map(([exerciseId, sets]) => (
                  <li
                    key={exerciseId}
                    className="flex flex-wrap items-baseline gap-x-2 text-sm"
                  >
                    <span className="font-semibold text-cream">
                      {sets[0].exerciseName}
                    </span>
                    <span className="font-mono text-xs text-cream-dim">
                      {sets
                        .map(
                          (set) =>
                            `${formatWeight(set.weightKg, weightUnit, { withUnit: false })}×${set.reps}`,
                        )
                        .join(" · ")}{" "}
                      {weightUnit.toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
