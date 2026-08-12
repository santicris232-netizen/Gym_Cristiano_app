import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, withApiErrors, jsonError } from "@/lib/api-helpers";
import type { SessionSummaryDTO } from "@/types";

/** Historial de sesiones de entrenamiento del alumno: qué días entrenó
 *  y con qué peso/reps en cada serie de cada ejercicio. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  return withApiErrors(async () => {
    await requireRole("TRAINER");
    const { userId } = await params;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "USER") {
      return jsonError("Alumno no encontrado.", 404);
    }

    const sessions = await prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      include: {
        setLogs: {
          include: { exercise: true },
          orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
        },
      },
    });

    const result: SessionSummaryDTO[] = sessions.map((s) => ({
      id: s.id,
      dateKey: s.dateKey,
      dayOfWeek: s.dayOfWeek,
      completed: s.completed,
      setLogs: s.setLogs.map((sl) => ({
        id: sl.id,
        exerciseId: sl.exerciseId,
        exerciseName: sl.exercise.name,
        setNumber: sl.setNumber,
        weightKg: sl.weightKg,
        reps: sl.reps,
      })),
    }));

    return NextResponse.json({ sessions: result });
  });
}
