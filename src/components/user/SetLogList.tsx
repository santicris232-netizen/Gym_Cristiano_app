import { formatWeight } from "@/lib/units";
import type { WeightUnit } from "@/generated/prisma/client";

interface LoggedSet {
  setNumber: number;
  weightKg: number;
  reps: number;
}

export function SetLogList({
  sets,
  weightUnit,
}: {
  sets: LoggedSet[];
  weightUnit: WeightUnit;
}) {
  if (sets.length === 0) return null;
  const sorted = [...sets].sort((a, b) => a.setNumber - b.setNumber);
  return (
    <ul className="mt-6 w-full max-w-xs space-y-1.5">
      {sorted.map((s) => (
        <li
          key={s.setNumber}
          className="flex items-center justify-between rounded-md border border-line bg-surface-2/60 px-3 py-2 text-sm"
        >
          <span className="font-mono text-cream-dim">Serie {s.setNumber}</span>
          <span className="font-semibold text-neon-blue">
            {formatWeight(s.weightKg, weightUnit)} × {s.reps} reps
          </span>
        </li>
      ))}
    </ul>
  );
}
