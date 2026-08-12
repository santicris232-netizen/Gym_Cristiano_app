import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, withApiErrors, jsonError } from "@/lib/api-helpers";
import { toExerciseDetail } from "@/lib/dto";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ exerciseId: string }> },
) {
  return withApiErrors(async () => {
    await requireUser();
    const { exerciseId } = await params;
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });
    if (!exercise) return jsonError("Ejercicio no encontrado.", 404);
    return NextResponse.json({ exercise: toExerciseDetail(exercise) });
  });
}
