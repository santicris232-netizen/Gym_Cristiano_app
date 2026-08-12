import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { withApiErrors, jsonError } from "@/lib/api-helpers";
import type { WeightUnit } from "@/generated/prisma/client";

// Autoregistro abierto: cualquiera puede crear su cuenta de alumno
// (rol USER automático). El entrenador también puede dar de alta
// alumnos manualmente desde /api/users.
export async function POST(request: Request) {
  return withApiErrors(async () => {
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

    await createSession({ userId: user.id, role: user.role, name: user.name });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          weightUnit: user.weightUnit,
        },
      },
      { status: 201 },
    );
  });
}
