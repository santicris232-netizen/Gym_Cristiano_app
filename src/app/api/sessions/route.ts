import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, withApiErrors, jsonError } from "@/lib/api-helpers";
import { jsDayToPlanDay, todayDateKey } from "@/lib/constants";

/** Obtiene (o crea) la sesión de entrenamiento del usuario para hoy. */
export async function POST(request: Request) {
  return withApiErrors(async () => {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}) as Record<string, unknown>);
    const now = new Date();
    const dayOfWeek = Number.isInteger(body?.dayOfWeek)
      ? (body.dayOfWeek as number)
      : jsDayToPlanDay(now.getDay());

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return jsonError("Día de la semana inválido.", 400);
    }

    const dateKey = todayDateKey(now);
    const session = await prisma.workoutSession.upsert({
      where: { userId_dateKey: { userId: user.id, dateKey } },
      create: { userId: user.id, dayOfWeek, dateKey, date: now },
      update: {},
    });

    return NextResponse.json({
      sessionId: session.id,
      dateKey: session.dateKey,
      dayOfWeek: session.dayOfWeek,
    });
  });
}
