import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, withApiErrors, jsonError } from "@/lib/api-helpers";
import type { ProgressPointDTO } from "@/types";

/** Serie temporal del peso usado por el alumno en un ejercicio, una
 *  entrada por sesión en la que lo entrenó, ordenada por fecha. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string; exerciseId: string }> },
) {
  return withApiErrors(async () => {
    await requireRole("TRAINER");
    const { userId, exerciseId } = await params;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "USER") {
      return jsonError("Alumno no encontrado.", 404);
    }

    const setLogs = await prisma.setLog.findMany({
      where: { exerciseId, session: { userId } },
      include: { session: true },
      orderBy: { session: { date: "asc" } },
    });

    const bySession = new Map<string, ProgressPointDTO>();
    for (const sl of setLogs) {
      let point = bySession.get(sl.sessionId);
      if (!point) {
        point = {
          sessionId: sl.sessionId,
          date: sl.session.date.toISOString(),
          dateKey: sl.session.dateKey,
          maxWeightKg: 0,
          sets: [],
        };
        bySession.set(sl.sessionId, point);
      }
      point.sets.push({
        setNumber: sl.setNumber,
        weightKg: sl.weightKg,
        reps: sl.reps,
      });
      point.maxWeightKg = Math.max(point.maxWeightKg, sl.weightKg);
    }

    const points = Array.from(bySession.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    return NextResponse.json({ points });
  });
}
