import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, withApiErrors, jsonError } from "@/lib/api-helpers";

export async function PATCH(request: Request) {
  return withApiErrors(async () => {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const weightUnit = body?.weightUnit;
    if (weightUnit !== "KG" && weightUnit !== "LB") {
      return jsonError("weightUnit debe ser KG o LB.", 400);
    }
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { weightUnit },
    });
    return NextResponse.json({ weightUnit: updated.weightUnit });
  });
}
