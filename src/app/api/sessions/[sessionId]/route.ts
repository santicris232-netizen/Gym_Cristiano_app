import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, withApiErrors, jsonError } from "@/lib/api-helpers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  return withApiErrors(async () => {
    const user = await requireUser();
    const { sessionId } = await params;
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
      include: { setLogs: true },
    });
    if (!session || session.userId !== user.id) {
      return jsonError("Sesión no encontrada.", 404);
    }
    return NextResponse.json({
      session: {
        id: session.id,
        dateKey: session.dateKey,
        dayOfWeek: session.dayOfWeek,
        completed: session.completed,
      },
      setLogs: session.setLogs.map((sl) => ({
        id: sl.id,
        exerciseId: sl.exerciseId,
        setNumber: sl.setNumber,
        weightKg: sl.weightKg,
        reps: sl.reps,
      })),
    });
  });
}
