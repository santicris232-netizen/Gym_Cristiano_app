import { DAY_NAMES } from "../../lib/constants";
import { formatWeight } from "../../lib/units";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import type { SessionSummaryOut, SetLogOut, WeightUnit } from "../../types";

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
  sessions: SessionSummaryOut[];
  weightUnit: WeightUnit;
}) {
  return (
    <div>
      <h3 className="mb-3 font-display text-lg tracking-wide text-cream">Historial de entrenos</h3>
      <div className="space-y-3">
        {sessions.map((s) => {
          const byExercise = new Map<string, SetLogOut[]>();
          for (const sl of s.set_logs) {
            if (!byExercise.has(sl.exercise_id)) byExercise.set(sl.exercise_id, []);
            byExercise.get(sl.exercise_id)!.push(sl);
          }
          return (
            <Card key={s.id} className="p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-counter text-lg tracking-wide text-neon-blue">
                    {formatDateKey(s.date_key)}
                  </span>
                  <Badge tone="neutral">{DAY_NAMES[s.day_of_week]}</Badge>
                </div>
                {s.set_logs.length === 0 && <Badge tone="red">Sin series registradas</Badge>}
              </div>
              <ul className="space-y-1.5">
                {Array.from(byExercise.entries()).map(([exerciseId, sets]) => (
                  <li key={exerciseId} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="font-semibold text-cream">{sets[0].exercise_name}</span>
                    <span className="font-mono text-xs text-cream-dim">
                      {sets
                        .map(
                          (set) =>
                            `${formatWeight(set.weight_kg, weightUnit, { withUnit: false })}×${set.reps}`,
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
