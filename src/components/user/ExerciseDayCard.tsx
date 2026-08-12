import Link from "next/link";
import { ExerciseThumb } from "@/components/ui/ExerciseThumb";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { bodyPartLabel } from "@/lib/constants";
import type { PlanEntryDTO } from "@/types";

export function ExerciseDayCard({
  entry,
  dayOfWeek,
}: {
  entry: PlanEntryDTO;
  dayOfWeek: number;
}) {
  const href = `/dashboard/exercise/${entry.exercise.id}?day=${dayOfWeek}&sets=${entry.sets}&reps=${entry.reps}`;
  return (
    <Link href={href}>
      <Card className="flex items-center gap-3 p-3 transition hover:border-neon-blue/50 hover:shadow-neon">
        <ExerciseThumb src={entry.exercise.image} alt="" size={56} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-cream">
            {entry.exercise.name}
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge tone="blue">
              {entry.sets} × {entry.reps}
            </Badge>
            <Badge tone="neutral">{bodyPartLabel(entry.exercise.bodyPart)}</Badge>
          </div>
          {entry.notes && (
            <p className="mt-1 text-xs text-cream-dim">{entry.notes}</p>
          )}
        </div>
      </Card>
    </Link>
  );
}
