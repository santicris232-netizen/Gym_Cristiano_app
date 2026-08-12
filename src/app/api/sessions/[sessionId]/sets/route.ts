import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, withApiErrors, jsonError } from "@/lib/api-helpers";
import { toCanonicalKg } from "@/lib/units";

/** Registra (o actualiza) el peso y las repeticiones de una serie
 *  concreta de un ejercicio dentro de una sesión. El peso llega en la
 *  unidad preferida del usuario y se convierte a kg (canónico) antes
 *  de guardarse. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  return withApiErrors(async () => {
    const user = await requireUser();
    const { sessionId } = await params;
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.userId !== user.id) {
      return jsonError("Sesión no encontrada.", 404);
    }

    const body = await request.json().catch(() => null);
    const exerciseId = typeof body?.exerciseId === "string" ? body.exerciseId : "";
    const setNumber = Number(body?.setNumber);
    const weight = Number(body?.weight);
    const reps = Number(body?.reps);

    if (!exerciseId) return jsonError("exerciseId es obligatorio.", 400);
    if (!Number.isInteger(setNumber) || setNumber < 1) {
      return jsonError("setNumber inválido.", 400);
    }
    if (!Number.isFinite(weight) || weight < 0) {
      return jsonError("weight inválido.", 400);
    }
    if (!Number.isInteger(reps) || reps < 0) {
      return jsonError("reps inválido.", 400);
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });
    if (!exercise) return jsonError("Ejercicio no encontrado.", 404);

    const weightKg = toCanonicalKg(weight, user.weightUnit);

    const setLog = await prisma.setLog.upsert({
      where: {
        sessionId_exerciseId_setNumber: { sessionId, exerciseId, setNumber },
      },
      create: { sessionId, exerciseId, setNumber, weightKg, reps },
      update: { weightKg, reps },
    });

    await prisma.workoutSession.update({
      where: { id: sessionId },
      data: { completed: true },
    });

    return NextResponse.json({
      setLog: {
        id: setLog.id,
        exerciseId,
        setNumber,
        weightKg,
        reps,
      },
    });
  });
}
