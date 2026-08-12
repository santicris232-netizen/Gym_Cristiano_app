import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import type { Role, User } from "@/generated/prisma/client";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Lanza ApiError(401) si no hay sesión; devuelve el usuario logueado. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "No has iniciado sesión.");
  return user;
}

/** Lanza ApiError(401/403) si no hay sesión o el rol no coincide. */
export async function requireRole(role: Role): Promise<User> {
  const user = await requireUser();
  if (user.role !== role) {
    throw new ApiError(403, "No tienes permiso para acceder a este recurso.");
  }
  return user;
}

/** Envuelve la lógica de un route handler y convierte ApiError / errores
 *  inesperados en respuestas JSON consistentes. */
export async function withApiErrors(
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (err) {
    if (err instanceof ApiError) return jsonError(err.message, err.status);
    console.error(err);
    return jsonError("Error interno del servidor.", 500);
  }
}
