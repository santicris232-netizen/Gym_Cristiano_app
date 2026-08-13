import { formatWeight } from "../../lib/units";
import type { WeightUnit } from "../../types";

interface LoggedSet {
  set_number: number;
  weight_kg: number;
  reps: number;
}

export function SetLogList({ sets, weightUnit }: { sets: LoggedSet[]; weightUnit: WeightUnit }) {
  if (sets.length === 0) return null;
  const sorted = [...sets].sort((a, b) => a.set_number - b.set_number);
  return (
    <ul className="mt-6 w-full max-w-xs space-y-1.5">
      {sorted.map((s) => (
        <li
          key={s.set_number}
          className="flex items-center justify-between rounded-md border border-line bg-surface-2/60 px-3 py-2 text-sm"
        >
          <span className="font-mono text-cream-dim">Serie {s.set_number}</span>
          <span className="font-semibold text-neon-blue">
            {formatWeight(s.weight_kg, weightUnit)} × {s.reps} reps
          </span>
        </li>
      ))}
    </ul>
  );
}
