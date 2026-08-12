import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { withApiErrors, jsonError } from "@/lib/api-helpers";

export async function POST(request: Request) {
  return withApiErrors(async () => {
    const body = await request.json().catch(() => null);
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return jsonError("Email y contraseña son obligatorios.", 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return jsonError("Credenciales inválidas.", 401);

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return jsonError("Credenciales inválidas.", 401);

    await createSession({ userId: user.id, role: user.role, name: user.name });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        weightUnit: user.weightUnit,
      },
    });
  });
}
