import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, withApiErrors } from "@/lib/api-helpers";
import { toExerciseSummary } from "@/lib/dto";

/** Búsqueda paginada de ejercicios del dataset (1324 registros): usada
 *  por el combobox del entrenador y por la biblioteca del alumno.
 *  Query params: q, bodyPart, equipment, page, pageSize. */
export async function GET(request: Request) {
  return withApiErrors(async () => {
    await requireUser();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
    const bodyPart = searchParams.get("bodyPart") || undefined;
    const equipment = searchParams.get("equipment") || undefined;
    const page = Math.max(1, Math.trunc(Number(searchParams.get("page")) || 1));
    const pageSize = Math.min(
      50,
      Math.max(1, Math.trunc(Number(searchParams.get("pageSize")) || 20)),
    );

    const where = {
      ...(q ? { searchName: { contains: q } } : {}),
      ...(bodyPart ? { bodyPart } : {}),
      ...(equipment ? { equipment } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.exercise.count({ where }),
    ]);

    return NextResponse.json({
      items: items.map(toExerciseSummary),
      total,
      page,
      pageSize,
    });
  });
}
