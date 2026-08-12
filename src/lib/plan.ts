import { prisma } from "@/lib/prisma";
import { toExerciseSummary } from "@/lib/dto";
import type { PlanDayDTO } from "@/types";

/** Plan semanal completo (7 días, 0=Lunes..6=Domingo) de un usuario. */
export async function getWeeklyPlan(userId: string): Promise<PlanDayDTO[]> {
  const entries = await prisma.planEntry.findMany({
    where: { userId },
    include: { exercise: true },
    orderBy: [{ dayOfWeek: "asc" }, { order: "asc" }],
  });

  const days: PlanDayDTO[] = Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    entries: [],
  }));

  for (const entry of entries) {
    days[entry.dayOfWeek].entries.push({
      id: entry.id,
      order: entry.order,
      sets: entry.sets,
      reps: entry.reps,
      notes: entry.notes,
      exercise: toExerciseSummary(entry.exercise),
    });
  }

  return days;
}
