import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, withApiErrors, jsonError } from "@/lib/api-helpers";
import { getWeeklyPlan } from "@/lib/plan";

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
    const days = await getWeeklyPlan(userId);
    return NextResponse.json({ days });
  });
}
