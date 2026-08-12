import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { UserList } from "@/components/trainer/UserList";
import type { UserSummaryDTO } from "@/types";

export const metadata: Metadata = { title: "Tus alumnos — Gym Cristiano" };

export default async function TrainerHomePage() {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { name: "asc" },
    include: {
      sessions: {
        orderBy: { date: "desc" },
        take: 1,
        select: { date: true },
      },
    },
  });

  const initialUsers: UserSummaryDTO[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt.toISOString(),
    lastTrainedAt: u.sessions[0]?.date.toISOString() ?? null,
  }));

  return (
    <div>
      <header className="mb-6">
        <p className="font-mono text-xs tracking-[0.2em] text-neon-blue uppercase">
          Panel del entrenador
        </p>
        <h1 className="font-display text-3xl tracking-wide text-cream">
          Tus alumnos
        </h1>
      </header>
      <UserList initialUsers={initialUsers} />
    </div>
  );
}
