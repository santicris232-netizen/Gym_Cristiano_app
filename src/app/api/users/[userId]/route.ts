import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, withApiErrors, jsonError } from "@/lib/api-helpers";

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
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        weightUnit: user.weightUnit,
        createdAt: user.createdAt.toISOString(),
      },
    });
  });
}
