import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireRole, withApiErrors, jsonError } from "@/lib/api-helpers";
import type { WeightUnit } from "@/generated/prisma/client";
import type { UserSummaryDTO } from "@/types";

/** Lista de alumnos del entrenador, con la fecha de su último entrenamiento. */
export async function GET() {
  return withApiErrors(async () => {
    await requireRole("TRAINER");
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      orderBy: { name: "asc" },
      include: {
        sessions: { orderBy: { date: "desc" }, take: 1, select: { date: true } },
      },
    });

    const result: UserSummaryDTO[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt.toISOString(),
      lastTrainedAt: u.sessions[0]?.date.toISOString() ?? null,
    }));

    return NextResponse.json({ users: result });
  });
}

/** Alta manual de un alumno por el entrenador. */
export async function POST(request: Request) {
  return withApiErrors(async () => {
    await requireRole("TRAINER");
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const weightUnit: WeightUnit = body?.weightUnit === "LB" ? "LB" : "KG";

    if (!name || !email || !password) {
      return jsonError("Nombre, email y contraseña son obligatorios.", 400);
    }
    if (password.length < 8) {
      return jsonError("La contraseña debe tener al menos 8 caracteres.", 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return jsonError("Ya existe una cuenta con ese email.", 409);

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "USER", weightUnit },
    });

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 },
    );
  });
}
