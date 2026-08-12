import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, withApiErrors, jsonError } from "@/lib/api-helpers";
import { getWeeklyPlan } from "@/lib/plan";

interface EntryInput {
  exerciseId: string;
  order?: number;
  sets?: number;
  reps?: number;
  notes?: string;
}

/** Reemplaza por completo las entradas de plan de un alumno para un
 *  día concreto de la semana (0=Lunes..6=Domingo). */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string; dayOfWeek: string }> },
) {
  return withApiErrors(async () => {
    await requireRole("TRAINER");
    const { userId, dayOfWeek: dayOfWeekParam } = await params;
    const dayOfWeek = Number(dayOfWeekParam);
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return jsonError("Día de la semana inválido.", 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "USER") {
      return jsonError("Alumno no encontrado.", 404);
    }

    const body = await request.json().catch(() => null);
    const rawEntries: unknown[] = Array.isArray(body?.entries)
      ? body.entries
      : [];

    const entries: EntryInput[] = [];
    for (const raw of rawEntries) {
      const e = raw as Record<string, unknown>;
      if (typeof e.exerciseId !== "string" || !e.exerciseId) {
        return jsonError("Cada entrada necesita un exerciseId válido.", 400);
      }
      entries.push({
        exerciseId: e.exerciseId,
        order: typeof e.order === "number" ? e.order : undefined,
        sets: typeof e.sets === "number" ? e.sets : undefined,
        reps: typeof e.reps === "number" ? e.reps : undefined,
        notes: typeof e.notes === "string" ? e.notes : undefined,
      });
    }

    const exerciseIds = entries.map((e) => e.exerciseId);
    if (exerciseIds.length > 0) {
      const foundCount = await prisma.exercise.count({
        where: { id: { in: exerciseIds } },
      });
      if (foundCount !== new Set(exerciseIds).size) {
        return jsonError("Uno o más ejercicios no existen.", 400);
      }
    }

    await prisma.$transaction([
      prisma.planEntry.deleteMany({ where: { userId, dayOfWeek } }),
      ...entries.map((e, i) =>
        prisma.planEntry.create({
          data: {
            userId,
            dayOfWeek,
            exerciseId: e.exerciseId,
            order: e.order ?? i,
            sets: Math.max(1, Math.round(e.sets ?? 3)),
            reps: Math.max(1, Math.round(e.reps ?? 10)),
            notes: e.notes?.trim() || null,
          },
        }),
      ),
    ]);

    const days = await getWeeklyPlan(userId);
    return NextResponse.json({ day: days[dayOfWeek] });
  });
}
